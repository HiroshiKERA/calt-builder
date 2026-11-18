# CALT Task Builder

A beginner-first web app that builds a complete, ready-to-run **CALT project** and
hands it back as a downloadable ZIP. Users name a project, pick ready-made tasks
(or describe their own), adjust a few settings, and download. No machine-learning
code to write, and nothing is uploaded: all generation and ZIP packaging happen in
the browser.

CALT (Computer Algebra with Transformer) is a research framework for training small
Transformer models on algebraic tasks. This app is the friendly front door to it.

- **Static site.** No backend. React + Vite + TypeScript + Tailwind.
- **Light / dark theme** and **English / 日本語**, both switchable in the top bar.
- **Self-contained task content.** The ready-made tasks are vendored into this
  repo under `task-sources/` and baked into the build by re-bundling (see
  *Updating the tasks*). No external repo is needed.

> This is one of the coordinated CALT repos (this site with its vendored task
> code, and **HiroshiKERA/calt** = the `calt-x` engine). For the full picture,
> and the current loose ends, read **[AI_CONTEXT.md](AI_CONTEXT.md)** first.

## How a visitor uses it

1. **Name the project** on the landing screen.
2. **Tasks.** Pick from six ready-made tasks (parity, Gröbner basis, integer
   factorization, GF(17) running sums, 3×3 eigenvector, polynomial running sums),
   and/or open **Build your own task**. The custom builder can write the generator
   via a copy-paste AI prompt or your own code, let you edit the **tokenizer
   (lexer.yaml)**, and add custom measurements.
3. **Settings.** Tune each task: dataset size (10k / 100k / 1M), model size, training
   rounds, **position embedding**, and progress logging — with a **live preview of
   the generated `train.yaml`/`data.yaml`** beside the controls, highlighting the
   lines each control edits.
4. **Finish.** Choose *Full project* or *Tasks only*, peek inside, and download the
   ZIP. A copy-paste run guide (conda install + 3 commands) is included.

The downloaded project installs SageMath and PyTorch with **conda** (conda-forge),
then the engine `calt-x==1.7.0` with `pip`. calt-x 1.7.0 includes the
`calt.io.preprocess` the tasks need, trains on transformers 5.15 or later (which a
fresh `pip` install resolves), keeps `--dryrun` off W&B and really runs the
`cosine` schedule (both since 1.6.1).

> **Downloaded a project whose README's `conda create` line has no `pytorch`** (or
> that pins `calt-x==1.6.0` or older)? Two kinds of problems can show up:
>
> - **Install problems** (caused by pip's PyTorch, not by calt): on Ubuntu 22.04
>   and other Linux systems older than GCC 14, `import calt` fails with
>   ``version `CXXABI_1.3.15' not found``; with recent PyTorch and an NVIDIA
>   driver older than 580, training silently runs on the CPU.
> - **calt 1.6.0 problems**: `python train.py --dryrun` logs to W&B when the task
>   has progress logging on, and `lr_scheduler_type: cosine` runs as linear.
>   (Projects pinned to `calt-x==1.5.0` also stop at training start with
>   `AttributeError: 'TrainingArguments' object has no attribute 'warmup_ratio'`.)
>
> Installing a newer calt-x into the old environment does **not** fix the
> `CXXABI` error. Recreate the environment instead:
>
> ```bash
> conda deactivate
> conda env remove -n calt-env -y
> # with an NVIDIA GPU, on Linux:
> conda create -n calt-env --override-channels -c conda-forge sage python=3.12 "pytorch>=2.6=cuda*" -y
> # or, without an NVIDIA GPU or on a Mac, instead of the line above:
> #   conda create -n calt-env --override-channels -c conda-forge sage python=3.12 "pytorch>=2.6" -y
> conda activate calt-env && pip install calt-x==1.6.1 matplotlib click
> ```
>
> The GPU line needs NVIDIA driver 525 or newer. Older NVIDIA GPUs (Maxwell,
> Pascal, Volta) and cluster login nodes need
> `CONDA_OVERRIDE_CUDA` in front of `conda create`; a newly downloaded project's
> README explains when. If you install from the project's `pyproject.toml` (e.g. with uv), also change
> its `calt-x==` line to `calt-x==1.6.1`. These commands keep `calt-x==1.6.1` on
> purpose: projects downloaded before 2026-11-18 may have a custom task that
> splits numbers into digit groups, and calt-x 1.7.0 splits those differently
> (see MAINTAINING.md, *Changes in calt 1.7.0*). After the update, `cosine` really is a
> cosine schedule, so the same config gives a different training curve than
> before. If you trained with `lexer_expanded.yaml` (groebner_basis), the text
> form of the zero polynomial changed (calt #64): delete the
> `data/processed_*` caches and retrain models trained on the old form.

## Run locally

Requires Node 18+ (on this project's dev box, node lives in a conda env:
`conda activate nodejs`).

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build

```bash
npm run build      # type-checks, then outputs a static site to dist/
npm run preview    # serve the production build locally
```

`base` is `"./"` in `vite.config.ts`, so the build works from any subpath (root
domain or `https://<user>.github.io/<repo>/`).

## Updating the tasks

The ready-made task files are vendored under `task-sources/` and baked into
`src/generated/projectFiles.ts`. Edit a task under `task-sources/`, then re-bundle:

```bash
npm run bundle        # regenerate from task-sources/ (no network, no external repo)
npm run build
```

Then review the diff in `src/generated/projectFiles.ts`, test a task, and commit.
(Optional, while a source repo still exists: `CALT_REPO_URL=<url> npm run sync:tasks`
re-vendors `task-sources/` from that remote, then bundles.)

The engine version is defined in `src/lib/caltVersion.ts` (currently
`calt-x==1.7.0` from PyPI). See **[MAINTAINING.md](MAINTAINING.md)** for how to bump it.

See [MAINTAINING.md](MAINTAINING.md) for the full maintenance workflow and
[AI_CONTEXT.md](AI_CONTEXT.md) for a deep architectural description.

## Deploy to GitHub Pages

Deployment is automated via `.github/workflows/deploy.yml`. Every push to `main`
builds the site and publishes it to GitHub Pages automatically.

**First-time setup:** in the GitHub repo go to Settings > Pages and set the source
to **GitHub Actions** (not "Deploy from a branch").

Because asset paths are relative (`base: "./"` in `vite.config.ts`), the site works
at the repository subpath (`https://<user>.github.io/<repo>/`) without extra config.

## Project layout

```
site/
├── src/
│   ├── components/      steps/, layout/, ui/ + ConfigPreview, ErrorBoundary
│   ├── lib/             codegen, zip, templates, stats, aiPrompt, tasks, projectReadme, utils
│   ├── state/           wizard store (React context) + sessionStorage persistence
│   ├── i18n/            en.ts / ja.ts dictionaries + provider
│   ├── theme/           light/dark provider
│   └── generated/       projectFiles.ts (AUTO-GENERATED snapshot, do not edit)
├── project-files/       site-owned packaging: pyproject.toml (no install scripts)
├── scripts/             bundle-tasks.mjs, sync-tasks.mjs
└── public/              logo.png (favicon), theme-init.js (anti-FOUC)
```
