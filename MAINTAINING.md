# Maintaining the CALT Task Builder

The site lets people download a ready-to-run CALT project. That download is built
from independent sources that go out of date in different ways. See `AI_CONTEXT.md`
for the full architecture and the multi-repo picture.

## What the download is made of

1. **The engine `calt-x`** is not in the ZIP. The user installs it with conda:
   create a `calt-env` environment (SageMath from conda-forge) then
   `pip install calt-x==1.6.0 matplotlib click`
   (omegaconf ships with calt-x, so it is not listed here).
   The bundled tasks import `calt.io.preprocess`. The generated `README.md` walks
   the user through it. 1.4.0 added the monomial embedding (`model_type: monomial`);
   1.5.0 added the decoder-only model (`model_type: decoder_only`) and the
   embedding normalization fix; 1.6.0 is the first release that trains on
   transformers 5.15 or later. calt-x leaves transformers unbounded, so a fresh
   install resolves the newest one, and 1.5.0 and earlier crash at training
   start on it: do not pin lower.

2. **The task files** (generators, configs, `shared/`, scripts) are a frozen
   snapshot in `src/generated/projectFiles.ts`, regenerated from the **vendored
   copy in `task-sources/`** (owned by this repo — the site is self-contained and
   no longer depends on any external repo; see `task-sources/README.md`).
   The six shown tasks are: parity, groebner_basis, integer_factorization,
   gf17_addition, eigvec_3x3, polynomial_addition (border_basis is dropped).

3. **Site-owned packaging** (`project-files/pyproject.toml`) carries the calt-x
   pin. **The version is defined in `src/lib/caltVersion.ts`**; the README and
   the review step read it. The same pin is also baked into
   `project-files/pyproject.toml` and the bundle, and `npm run build` fails
   (`scripts/check-bundle.mjs`) if they disagree with the constant. To bump the
   engine, see *Bumping the calt-x version*. No install scripts — install is
   conda-based.

Each project also gets `CALT_SNAPSHOT.txt` (bundle date + the calt-x pin, stamped
from `project-files/pyproject.toml` at bundle time).

## Refreshing the task snapshot (do this deliberately, then test)

Primary path — regenerate from the vendored `task-sources/` (no network, no
external repo):
```bash
npm run bundle        # = node scripts/bundle-tasks.mjs (default source: task-sources/)
npm run build
```
Then review the diff to `src/generated/projectFiles.ts`, test a task, and commit.
To edit a task, edit it under `task-sources/` and re-bundle.

Optional — refresh the vendored copy from a remote (only while that remote still
exists; CALTCode is being deleted):
```bash
CALT_REPO_URL=<url> [CALT_REPO_BRANCH=<branch>] npm run sync:tasks
```
This re-vendors task folders + `shared/` into `task-sources/`, then bundles.

**Safety net:** `bundle-tasks.mjs` refuses to overwrite `projectFiles.ts` if the
source is missing any task that's currently bundled (pass `--force` to override).
So pointing it at an incomplete source (e.g. calt-codebase `main`) aborts loudly
instead of silently dropping tasks.

If upstream renamed YAML keys, re-check `applySettings` in `src/lib/zip.ts` — it
patches `experiments/toy/configs/{data,train}.yaml` by key name
(`num_train_samples`, `num_test_samples`, model dims, `num_train_epochs`,
`use_positional_embedding`, `no_wandb`); a rename makes it silently no-op.

## Adding a new example task (the 6 cards)

1. Create the task folder under **`task-sources/`** (needs `core/generator.py`
   returning `(str, str)`, `core/train.py`, and toy `configs/{data,train,lexer}.yaml`).
2. Re-bundle (above): `npm run bundle`.
3. In `src/lib/tasks.ts` add the id to `ALLOWED_TASK_IDS` and an entry in `META`
   (icon, `needsSage`).
4. Add `tasks.items[id]` (name, summary, tagline) to **both** `src/i18n/en.ts` and
   `ja.ts`; a missing entry in either is a compile error.

## Bumping the calt-x version

The engine is pinned to `calt-x==1.6.0` (PyPI). The version is defined by
`CALT_VERSION` in `src/lib/caltVersion.ts`; `npm run build` refuses to build if
`project-files/pyproject.toml` or the bundle disagrees with it.

1. Read the engine's release notes (Compatibility section) and its diff for
   config changes: renamed or removed keys in `train.yaml` / `lexer.yaml`, new
   validation, new or renamed `model_type` values, changed `requires-python`.
2. Test a task end to end against the new version in a **fresh** environment
   (`pip show calt-x transformers torch`). A fresh env matters: calt-x leaves
   transformers and torch unbounded, so an old env hides what new users get.
3. Edit `CALT_VERSION` in `src/lib/caltVersion.ts`. `projectReadme.ts` and
   `StepReview.tsx` read the constant.
4. Update the pin (and `requires-python`, if the engine's changed) in
   `project-files/pyproject.toml`, then `npm run bundle`. Both are required:
   `npm run build` fails until the bundle's `pyproject.toml` and
   `CALT_SNAPSHOT.txt` match the constant.
5. Re-read the text that explains *why* this version is pinned: the comments in
   `caltVersion.ts` and `project-files/pyproject.toml`, the note in
   `projectReadme.ts` (shipped to users), and the version mentions in
   `README.md`, `MAINTAINING.md` and `AI_CONTEXT.md`. They name versions and
   reasons that a bump can make false.
6. `npm run build`, download a Full project ZIP from `npm run dev`, and check
   that `pyproject.toml`, `README.md` and `CALT_SNAPSHOT.txt` all show the new pin.
7. New `model_type` values are not picked up automatically: add them to
   `ModelType` in `codegen.ts`, the options and notes in `StepSettings.tsx`, and
   the strings in **both** `en.ts` and `ja.ts`. Check the engine's config
   mapping for keys the new type requires: `MODEL_PRESETS`, `trainYaml` and
   `applySettings` only write the encoder/decoder key pairs (e.g. `monomial`
   also needs `model.num_variables` and expanded-form data).

Work on a branch cut from `main` (one per pull request), not on `main` itself:
every push to `main` deploys the site. Pull requests into `main` run the same
`npm run build` (`.github/workflows/pr-check.yml`), so a failing pin check, type
error or build shows up on the PR before it is merged.

> Related: the **Position embedding** "Learned" option writes the value `generic`.
> The engine also accepts `learned` as an alias, so emitting `learned` instead is
> a cosmetic choice.

## Quick check that a task still works

```bash
conda activate calt-env
cd <task>/experiments/toy/scripts
python generate.py && python train.py --dryrun && python evaluate.py
```

## Build / deploy

```bash
conda activate nodejs          # node is in a conda env on the dev box
npm install
npm run build                  # tsc --noEmit && vite build  -> dist/
npm run dev                    # local preview at http://localhost:5173
```
Pushing to `main` triggers the GitHub Pages deploy (`.github/workflows/deploy.yml`).
First-time Pages setup: Settings → Pages → Source = GitHub Actions.
