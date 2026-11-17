import { useMemo, useState } from "react";
import { ACTIVATE_AND_PIP, CONDA_CREATE_CPU, CONDA_CREATE_GPU } from "../../lib/caltVersion";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Boxes, Check, Download, FolderTree, HelpCircle, PackageOpen, Terminal } from "lucide-react";
import { useWizard, hasSelection, customBuildConfig, customTaskIssue } from "../../state/store";
import { customFolderName } from "../../lib/names";
import { useT } from "../../i18n";
import { buildProjectZip, projectFileMap, type ProjectSpec } from "../../lib/zip";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Disclosure } from "../ui/Disclosure";
import { Confetti } from "../ui/Confetti";
import { FileTree } from "../ui/FileTree";
import { CodeBlock } from "../CodeBlock";
import { StepHeader } from "../layout/StepChrome";
import { StepDetails } from "../layout/StepDetails";
import { downloadBlob, toSnakeCase } from "../../lib/utils";

export function StepReview() {
  const { config, prev } = useWizard();
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [showTree, setShowTree] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  // An old session can still hold a custom task name that is no longer allowed.
  const blocked = !!customTaskIssue(config);

  const proj = toSnakeCase(config.projectName) || "my_calt_project";
  const customCfg = customBuildConfig(config);
  // The download is always a full, runnable project (the "Tasks only" option was
  // dropped — the professor found it unnecessary).
  const spec: ProjectSpec = {
    projectName: config.projectName,
    selectedTasks: config.selectedTasks,
    customConfig: customCfg,
    mode: "project",
    settings: {
      numTrain: config.numTrain,
      numTest: config.numTest,
      epochs: config.epochs,
      modelPreset: config.modelPreset,
      posEmbedding: config.posEmbedding,
      modelType: config.modelType,
      useWandb: config.useWandb,
    },
    perTaskSettings: config.perTaskSettings,
  };

  // A blocked custom task is left out of the ZIP, so it is not counted either.
  const taskCount = config.selectedTasks.length + (customCfg && !blocked ? 1 : 0);
  const firstFolder =
    config.selectedTasks[0] ?? (customCfg ? customFolderName(config.custom.name) : "task");

  // Real file list of the ZIP, so the tree shows exactly what gets downloaded.
  const treePaths = useMemo(() => Object.keys(projectFileMap(spec)).sort(), [JSON.stringify(spec)]);

  const download = async () => {
    setBusy(true);
    setFailed(false);
    setDone(false);
    try {
      const { blob, filename } = await buildProjectZip(spec);
      downloadBlob(blob, filename);
      setDone(true);
      // The "saved" message points here, so open it on every successful download.
      setHowOpen(true);
    } catch (err) {
      console.error("Download failed", err);
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  if (!hasSelection(config)) {
    return (
      <div>
        <StepHeader eyebrow={t.review.eyebrow} title={t.review.title} />
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <PackageOpen size={36} className="text-ink-300" />
          <p className="text-sm text-ink-500">{t.review.empty}</p>
          <Button variant="secondary" onClick={prev}>
            <ArrowLeft size={16} /> {t.review.back}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <StepHeader eyebrow={t.review.eyebrow} title={t.review.title} subtitle={t.review.subtitle} />
      <StepDetails text={t.details.finish} />

      <Card className="relative overflow-hidden p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-brand-200/50 to-accent-400/30 blur-2xl" />
        <AnimatePresence>{done && <Confetti />}</AnimatePresence>
        <div className="relative flex flex-wrap items-center gap-2">
          {/* h-auto + wrapping filename: a 40-character project name must not push
              the button past a 320px screen. */}
          <Button size="lg" shimmer loading={busy} disabled={blocked} onClick={download} className="h-auto min-h-12 max-w-full py-2 sm:w-auto">
            {!busy && <Download size={18} className="flex-shrink-0" />}
            <span className="min-w-0">
              {t.review.download} <span className="[overflow-wrap:anywhere]">({proj}.zip)</span>
            </span>
          </Button>
          {/* The file tree is hidden by default and revealed via this "?" button. */}
          <button
            type="button"
            onClick={() => setShowTree((s) => !s)}
            aria-expanded={showTree}
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-ink-600 ring-1 ring-ink-200 outline-none transition hover:text-ink-800 hover:ring-ink-300 focus-visible:ring-2 focus-visible:ring-brand-400/50"
          >
            <HelpCircle size={15} className="text-brand-600" /> {t.review.treeTitle}
          </button>
          <AnimatePresence>
            {done && (
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-500"
              >
                <Check size={15} /> {t.review.saved}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        {(blocked || failed) && (
          <p role="alert" className="relative mt-3 text-sm font-medium text-rose-700 dark:text-rose-300">
            {blocked ? t.review.downloadBlocked : t.review.downloadFailed}
          </p>
        )}
      </Card>

      <div className="mt-5 space-y-4">
        <AnimatePresence initial={false}>
          {showTree && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <Card className="p-5">
                <div className="mb-3 flex items-center gap-2 text-[15px] font-bold text-ink-800">
                  <FolderTree size={17} className="text-brand-600" /> {t.review.treeTitle}
                </div>
                <p className="mb-3 text-sm text-ink-500">{t.review.treeBody}</p>
                <FileTree
                  paths={treePaths}
                  notes={t.review.treeNotes}
                  strongNotes={{ configs: t.review.treeNotes.configs }}
                />
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <Disclosure
          icon={<Terminal size={17} className="text-brand-600" />}
          title={t.review.howToUse}
          open={howOpen}
          onOpenChange={setHowOpen}
        >
          <p className="mb-3 text-sm text-ink-500">{t.review.prereq}</p>
          <ol className="mb-4 space-y-2.5 text-sm text-ink-600">
            {[t.review.howUnzipProject(proj), t.review.howInstall, t.review.howRun].map((line, i) => (
              <li key={i} className="flex gap-2.5 [overflow-wrap:anywhere]">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-700">
                  {i + 1}
                </span>
                {line}
              </li>
            ))}
          </ol>

          <CodeBlock
            language="bash"
            filename="terminal"
            maxHeight="180px"
            code={`conda activate calt-env\ncd ${proj}/${firstFolder}/experiments/toy/scripts\npython generate.py\npython train.py\npython evaluate.py`}
          />

          {/* One-time setup, kept tucked away: the README has the full steps and
              the GPU checks. The no-GPU command is a comment so that pasting the
              whole block cannot run both `conda create` lines (the second would
              replace the first env), and pip is chained after `conda activate`
              so it never runs in the base env when `conda create` failed.
              macOS's zsh runs comment lines as commands unless
              interactivecomments is set, so the setup* strings avoid ( ) ? *
              and pasting them only prints a harmless "command not found". */}
          <div className="mt-3">
            <Disclosure title={t.review.setupLabel}>
              <CodeBlock
                language="bash"
                filename="terminal"
                maxHeight="220px"
                code={[
                  `# ${t.review.setupIntro}`,
                  `# ${t.review.setupGpu}`,
                  CONDA_CREATE_GPU,
                  `# ${t.review.setupCpu}`,
                  `# ${CONDA_CREATE_CPU}`,
                  ACTIVATE_AND_PIP,
                ].join("\n")}
              />
            </Disclosure>
          </div>
        </Disclosure>
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-ink-200/70 pt-6">
        <Button variant="ghost" onClick={prev}>
          <ArrowLeft size={18} /> {t.review.back}
        </Button>
        <div className="flex items-center gap-2 text-sm text-ink-400">
          <Boxes size={15} /> {t.review.taskCount(taskCount)}
        </div>
      </div>
    </div>
  );
}
