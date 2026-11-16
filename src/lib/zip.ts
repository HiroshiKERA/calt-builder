import { buildFiles, MODEL_PRESETS, type BuildConfig, type ModelPreset, type ModelType, type PosEmbedding } from "./codegen";
import { CALT_REQUIREMENT } from "./caltVersion";
import { TASK_FILES, COMMON_FILES } from "../generated/projectFiles";
import { getTaskMeta } from "./tasks";
import { buildProjectReadme } from "./projectReadme";
import { toSnakeCase } from "./utils";

/** Global training settings applied to every task in the project. */
export interface ProjectSettings {
  numTrain: number;
  numTest: number;
  epochs: number;
  modelPreset: ModelPreset;
  posEmbedding: PosEmbedding;
  modelType: ModelType;
  useWandb: boolean;
}

export interface ProjectSpec {
  projectName: string;
  /** Real example task folder ids to include (verbatim repo files). */
  selectedTasks: string[];
  /** Generated custom task, or null. */
  customConfig: BuildConfig | null;
  /** "project" = full runnable repo; "tasks" = just the task folders. */
  mode: "project" | "tasks";
  /** Default settings applied to every task (unless overridden per-task). */
  settings: ProjectSettings;
  /** Per-task overrides merged on top of `settings` at download time. */
  perTaskSettings?: Record<string, Partial<ProjectSettings>>;
}

function setYamlInt(content: string, key: string, value: number): string {
  return content.replace(new RegExp(`^(\\s*${key}:\\s*)\\d+`, "m"), `$1${value}`);
}

function setYamlBool(content: string, key: string, value: boolean): string {
  return content.replace(
    new RegExp(`^(\\s*${key}:\\s*)(?:true|false|True|False)`, "m"),
    `$1${value}`,
  );
}

function setYamlStr(content: string, key: string, value: string): string {
  return content.replace(new RegExp(`^(\\s*${key}:\\s*)\\S+`, "m"), `$1${value}`);
}

/**
 * Apply the project-wide settings to an example task's toy config files.
 * Only touches experiments/toy/configs so other experiments keep their own
 * committed settings. Missing keys are left untouched (regex simply no-ops).
 */
function applySettings(path: string, content: string, s: ProjectSettings): string {
  if (path.endsWith("experiments/toy/configs/data.yaml")) {
    content = setYamlInt(content, "num_train_samples", s.numTrain);
    content = setYamlInt(content, "num_test_samples", s.numTest);
  } else if (path.endsWith("experiments/toy/configs/train.yaml")) {
    const m = MODEL_PRESETS[s.modelPreset];
    content = setYamlInt(content, "num_encoder_layers", m.layers);
    content = setYamlInt(content, "num_decoder_layers", m.layers);
    content = setYamlInt(content, "num_encoder_heads", m.heads);
    content = setYamlInt(content, "num_decoder_heads", m.heads);
    content = setYamlInt(content, "d_model", m.d);
    content = setYamlInt(content, "encoder_ffn_dim", m.ffn);
    content = setYamlInt(content, "decoder_ffn_dim", m.ffn);
    content = setYamlInt(content, "num_train_epochs", s.epochs);
    content = setYamlStr(content, "use_positional_embedding", s.posEmbedding);
    content = setYamlStr(content, "model_type", s.modelType);
    content = setYamlBool(content, "no_wandb", !s.useWandb);
  }
  return content;
}

/**
 * Matches a whole `calt-x==<version>` specifier, extras included
 * (`calt-x[kaggle]==1.6.0.post1`), but not a longer name such as `mycalt-x`.
 * The character before the name is captured in group 1 rather than checked
 * with a lookbehind: this runs in the browser, and Safari before 16.4 rejects
 * lookbehind, which would throw while the entry chunk loads and blank the site.
 */
const CALT_PIN_RE = /(^|[^\w.-])calt-x(\[[^\]]*\])?\s*==\s*[^\s"',;]+/g;

/**
 * Rewrite the calt-x pin in the shared pyproject.toml to CALT_REQUIREMENT.
 * pyproject.toml is a shared file, so this runs on COMMON_FILES rather than
 * inside applySettings (which only sees task files). Only the pin outside
 * comments is touched; everything else in the file comes from the bundle, which
 * scripts/check-bundle.mjs (run by `npm run build`) keeps identical to
 * project-files/pyproject.toml and in step with caltVersion.ts.
 */
function withCurrentPin(path: string, content: string): string {
  if (path !== "pyproject.toml") return content;
  return content
    .split("\n")
    .map((line) => {
      const hash = line.indexOf("#");
      const code = hash === -1 ? line : line.slice(0, hash);
      const comment = hash === -1 ? "" : line.slice(hash);
      const pinned = code.replace(
        CALT_PIN_RE,
        (_m, before: string, extras: string | undefined) =>
          before + CALT_REQUIREMENT.replace("calt-x", `calt-x${extras ?? ""}`),
      );
      return pinned + comment;
    })
    .join("\n");
}

/** Build the full set of files (path -> content) the ZIP will contain. */
export function projectFileMap(spec: ProjectSpec): Record<string, string> {
  const proj = toSnakeCase(spec.projectName) || "my_calt_project";
  const prefix = spec.mode === "project" ? `${proj}/` : "";
  const map: Record<string, string> = {};

  for (const id of spec.selectedTasks) {
    const files = TASK_FILES[id];
    const effectiveSettings: ProjectSettings = { ...spec.settings, ...spec.perTaskSettings?.[id] };
    if (files) for (const [p, c] of Object.entries(files)) map[prefix + p] = applySettings(p, c, effectiveSettings);
  }
  if (spec.customConfig) for (const f of buildFiles(spec.customConfig)) map[prefix + f.path] = f.content;

  if (spec.mode === "project") {
    for (const [p, c] of Object.entries(COMMON_FILES)) map[prefix + p] = withCurrentPin(p, c);

    // Note: wandb (optional progress logging) ships as a calt-x dependency, so the
    // conda install already covers it when a task turns logging on.

    // A friendly, project-specific README at the root.
    const taskFolders = [
      ...spec.selectedTasks,
      ...(spec.customConfig ? [toSnakeCase(spec.customConfig.taskName) || "my_task"] : []),
    ];
    const sageTasks = spec.selectedTasks.filter((id) => getTaskMeta(id)?.needsSage);
    map[prefix + "README.md"] = buildProjectReadme({
      projectName: spec.projectName || "My CALT project",
      taskFolders,
      sageTasks,
    });
  }
  return map;
}

export async function buildProjectZip(spec: ProjectSpec): Promise<{ blob: Blob; filename: string }> {
  // Lazy-load JSZip: it is only needed at download time, so it stays out of the
  // initial bundle and is fetched on the first download click.
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  for (const [path, content] of Object.entries(projectFileMap(spec))) {
    zip.file(path, path.endsWith(".sh") ? content.replace(/\r\n/g, "\n") : content);
  }
  const proj = toSnakeCase(spec.projectName) || "my_calt_project";
  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  return { blob, filename: spec.mode === "project" ? `${proj}.zip` : `${proj}_tasks.zip` };
}
