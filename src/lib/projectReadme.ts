import {
  CALT_REQUIREMENT,
  ACTIVATE_AND_PIP,
  CHECK_COMMAND,
  CONDA_CREATE_CPU,
  CONDA_CREATE_GPU,
  PIP_INSTALL,
} from "./caltVersion";
// Generates the README.md placed at the root of a "full project" download.
// Plain, beginner-friendly, English (it sits next to the code).
//
// Installation is conda-based: a single `calt-env` environment that bundles
// SageMath (needed by the polynomial tasks) and PyTorch from conda-forge, with
// calt-x and the small pip extras installed on top. Why PyTorch must come from
// conda, not pip: see caltVersion.ts.

export interface ReadmeOpts {
  projectName: string;
  /** Folder names included in the project (real example tasks + custom). */
  taskFolders: string[];
  /** Subset of taskFolders that require SageMath (informational only). */
  sageTasks: string[];
  /** True when at least one shipped task has W&B progress logging turned on. */
  useWandb: boolean;
}

export function buildProjectReadme(o: ReadmeOpts): string {
  const tasks = o.taskFolders.length ? o.taskFolders : ["<task>"];
  const first = tasks[0];
  const taskList = tasks.map((t) => `- \`${t}/\``).join("\n");

  const sageNote = o.sageTasks.length
    ? `\n> Some tasks here compute their answers with **SageMath** (${o.sageTasks
        .map((t) => `\`${t}\``)
        .join(", ")}). The conda environment above already includes it, so there
> is nothing extra to install.\n`
    : "";

  const wandbNote = o.useWandb
    ? `
> **Progress logging (W&B) is on** for at least one task. Before the first real
> run, log in once with \`wandb login\` (free account at https://wandb.ai). Quick
> tests with \`python train.py --dryrun\` never log to W&B, so they need no login.
`
    : "";

  return `# ${o.projectName}

This project was created with the **CALT Task Builder**. It trains a small
Transformer model to solve a task by learning from many worked examples.
You run it with a few copy-paste commands. No need to write any code yourself.

## 1. Install (just once)

Installation uses **conda** (Miniforge or Anaconda). This is the setup the tasks
were tested with: one environment, called \`calt-env\`, that contains SageMath,
PyTorch and the CALT engine together, so every task works, including the
polynomial ones.

> Don't have conda yet? Install **Miniforge** first:
> https://github.com/conda-forge/miniforge

These steps are for Linux and macOS. On Windows, use WSL2 (Ubuntu) and follow
the Linux steps inside it.

Open a terminal in this folder.

**Step 1.** Create an environment with SageMath and PyTorch (the big download,
~once). Run **only one** of these two commands.

With an NVIDIA GPU (Linux):

\`\`\`bash
${CONDA_CREATE_GPU}
\`\`\`

Without an NVIDIA GPU, or on a Mac:

\`\`\`bash
${CONDA_CREATE_CPU}
\`\`\`

The GPU command needs an NVIDIA driver that \`nvidia-smi\` shows as "CUDA Version"
12.0 or higher (driver 525 or newer). With an older driver it stops with an
error; update the driver, or use the command without a GPU.

> **Older NVIDIA GPU** (Maxwell, Pascal or Volta, e.g. GTX 9xx/10xx, P100, V100)? With a recent
> driver, conda picks a CUDA 13 build that no longer supports these GPUs. Put
> \`CONDA_OVERRIDE_CUDA=12.9\` in front of the GPU command:
> \`CONDA_OVERRIDE_CUDA=12.9 ${CONDA_CREATE_GPU}\`

> **GPU, but conda cannot see it?** On a cluster login node without a GPU, or on
> a machine where \`nvidia-smi\` does not work, the GPU command stops with an
> error that mentions \`__cuda\`, instead of quietly installing a CPU-only PyTorch.
> Put \`CONDA_OVERRIDE_CUDA=<version>\` in front of it, where \`<version>\` is the
> "CUDA Version" that \`nvidia-smi\` prints on the GPU machine (for example
> \`CONDA_OVERRIDE_CUDA=12.9\`; use \`12.9\` for Maxwell, Pascal or Volta GPUs, regardless of
> what it prints).

If step 1 stopped with an error, fix that first: steps 2–3 need the environment.

**Steps 2–3.** Activate it, then install the CALT engine and helpers:

\`\`\`bash
${ACTIVATE_AND_PIP}
\`\`\`

> **Do not install PyTorch with pip** in this environment (no \`pip install torch\`,
> no \`pip install -U torch\`). On many Linux systems, including Ubuntu 22.04, pip's
> GPU build of PyTorch makes \`import calt\` fail with
> \`\`version \`CXXABI_1.3.15' not found\`\`. If that happens, delete the environment
> (\`conda deactivate\`, then \`conda env remove -n calt-env -y\`) and repeat steps 1–3.

> **Note**: install exactly \`${CALT_REQUIREMENT}\`, the version this project was
> tested with. pip also installs the newest \`transformers\`, and calt-x 1.5.0 or
> earlier stops as soon as training starts with
> \`AttributeError: 'TrainingArguments' object has no attribute 'warmup_ratio'\`.
> If you see that error, run \`${PIP_INSTALL}\` in \`calt-env\`.

Check it worked:

\`\`\`bash
${CHECK_COMMAND}
\`\`\`

It prints \`OK\`, the PyTorch version, its CUDA version and whether the GPU can be
used. With an NVIDIA GPU you should see a CUDA version (such as \`CUDA 12.9\`) and
\`GPU True\`.

- **\`CUDA None\` on a GPU machine**: this PyTorch is a CPU-only build. Delete the
  environment and repeat steps 1–3 with the GPU command.
- **A CUDA version but \`GPU False\`**: PyTorch has GPU support but cannot reach the
  GPU right now. Run the check on the machine that has the GPU (not a login
  node), and make sure \`nvidia-smi\` works there. If the check shows
  \`CUDA 13.x\` but \`nvidia-smi\` shows a "CUDA Version" below 13.0 (driver
  older than 580), update the driver or recreate the environment with
  \`CONDA_OVERRIDE_CUDA=12.9\` (see step 1).
- **\`CUDA 13.x\` on a Maxwell, Pascal or Volta GPU**: this build cannot run on your GPU
  (training would stop with "no kernel image is available"). Recreate the
  environment with \`CONDA_OVERRIDE_CUDA=12.9\` (see step 1).
- **Without an NVIDIA GPU, or on a Mac**: \`CUDA None\` and \`GPU False\` are
  expected; training runs on the CPU.
${sageNote}
> **Every time** you open a new terminal to use this project, first run:
> \`conda activate calt-env\`

### Messages you may see

- \`use_return_dict\` is deprecated: a harmless warning from \`transformers\`.
  Training is not affected.
- CALT may warn that **an NVIDIA GPU is present but training runs on the CPU**.
  Run the check above and follow the matching case. If the warning suggests a
  \`conda install\` command, you can instead recreate the environment with the
  GPU command of step 1. Never \`pip install torch\` here (see steps 2–3).

## 2. Run a task

This project includes:

${taskList}

Each task runs in three steps. From this project folder, go into the task's
\`scripts\` folder and run:

\`\`\`bash
conda activate calt-env
cd ${first}/experiments/toy/scripts
python generate.py
python train.py
python evaluate.py
\`\`\`

1. \`generate.py\` creates the training examples.
2. \`train.py\` trains the model.
3. \`evaluate.py\` shows how often it gets the answer right.

Start with \`python train.py --dryrun\`: it trains for just a moment so you can
confirm the whole pipeline works end to end before launching a real run.
${wandbNote}
## What is inside

- \`<task>/core/\` : how the examples are made and how answers are scored.
- \`<task>/experiments/toy/configs/\` : settings (data size, model size, vocabulary).
- \`<task>/experiments/toy/scripts/\` : the generate / train / evaluate commands.
- \`shared/\` : helper code used by every task.

Learn more about CALT: https://github.com/HiroshiKERA/calt
`;
}
