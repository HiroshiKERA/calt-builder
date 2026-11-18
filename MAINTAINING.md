# Maintaining the CALT Task Builder

The site lets people download a ready-to-run CALT project. That download is built
from independent sources that go out of date in different ways. See `AI_CONTEXT.md`
for the full architecture and the multi-repo picture.

## What the download is made of

1. **The engine `calt-x`** is not in the ZIP. The user installs it with conda:
   create a `calt-env` environment with SageMath **and PyTorch** from
   conda-forge (`"pytorch>=2.6=cuda*"` with an NVIDIA GPU, `"pytorch>=2.6"`
   without one), then `pip install calt-x==1.7.0 matplotlib click`
   (omegaconf ships with calt-x, so it is not listed here). The commands live
   in `src/lib/caltVersion.ts`.
   PyTorch must not come from pip: PyPI's CUDA torch makes `import calt` fail
   with `CXXABI_1.3.15 not found` on Ubuntu 22.04 and other systems older than
   GCC 14 (its cuDNN loads the system libstdc++; details in caltVersion.ts).
   The bundled tasks import `calt.io.preprocess`. The generated `README.md` walks
   the user through it. 1.4.0 added the monomial embedding (`model_type: monomial`);
   1.5.0 added the decoder-only model (`model_type: decoder_only`) and the
   embedding normalization fix; 1.6.0 is the first release that trains on
   transformers 5.15 or later; 1.6.1 keeps `--dryrun` off W&B, makes `cosine`
   really cosine and caps generation at the positional capacity; 1.7.0 splits
   numbers by `digit_group` whatever the vocabulary holds and, inside a conda
   env, suggests conda commands in its GPU warning. calt-x leaves
   transformers unbounded, so a fresh install resolves the newest one, and
   1.5.0 and earlier crash at training start on it: do not pin lower.

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
patches `experiments/toy/configs/{data,train}.yaml` by key name (and `no_wandb`
in every `experiments/*/configs/train*.yaml`)
(`num_train_samples`, `num_test_samples`, model dims, `num_train_epochs`,
`use_positional_embedding`, `no_wandb`); a rename makes it silently no-op.

## Adding a new example task (the 6 cards)

1. Create the task folder under **`task-sources/`** (needs `core/generator.py`
   returning `(str, str)`, `core/train.py`, and toy `configs/{data,train,lexer}.yaml`).
   Set `max_sequence_length` in the toy `train.yaml` to at least the longest
   problem and the longest answer, in tokens including BOS/EOS, at the dataset
   sizes the site offers. Generating 1M samples with Sage is slow, so measure
   100k and keep a margin for the tail. calt's generic model allocates twice
   the value and decoder_only needs problem + answer within twice it, so a
   value that is too small can still work there; BART uses it as its exact
   positional limit and stops mid-training with "index out of range" (this
   happened with polynomial_addition at 256; its answers reach 345 tokens at
   1M). Measure with calt's lexer: `calt.io.preprocess`'s private helpers
   `_build_lexer_and_tokenizer` and `_tokenize_to_ids` on the generated data.
2. Re-bundle (above): `npm run bundle`.
3. In `src/lib/tasks.ts` add the id to `ALLOWED_TASK_IDS` and an entry in `META`
   (icon, `needsSage`).
4. Add `tasks.items[id]` (name, summary, tagline) to **both** `src/i18n/en.ts` and
   `ja.ts`; a missing entry in either is a compile error.

## Bumping the calt-x version

The engine is pinned to `calt-x==1.7.0` (PyPI). The version is defined by
`CALT_VERSION` in `src/lib/caltVersion.ts`; `npm run build` refuses to build if
`project-files/pyproject.toml` or the bundle disagrees with it.

1. Read the engine's release notes (Compatibility section) and its diff for
   config changes: renamed or removed keys in `train.yaml` / `lexer.yaml`, new
   validation, new or renamed `model_type` values, changed `requires-python`.
2. Test a task end to end against the new version in a **fresh** environment
   built with the commands copied from a generated README. A fresh env matters:
   calt-x leaves transformers and torch unbounded, so an old env hides what new
   users get. In that env, check that pip keeps conda's PyTorch:
   - `pip install --dry-run calt-x==<new> matplotlib click` would not install torch;
   - `pip list` shows no `nvidia-*` packages;
   - `conda list` shows `pytorch` (and, on GPU builds, `triton`) from conda-forge;
   - `pip show calt-x transformers` for the record.
   If calt-x raises its own `torch>=` floor, raise `TORCH_FLOOR` in
   `caltVersion.ts` to match (and the two commands quoted in README.md). If
   calt-x, transformers or accelerate starts requiring a newer torch than
   conda-forge has, pip installs PyPI's torch and `import calt` breaks again
   (see caltVersion.ts). Then wait for conda-forge, or pin the dependency that
   raised the floor.
3. Edit `CALT_VERSION` in `src/lib/caltVersion.ts`. `projectReadme.ts` and
   `StepReview.tsx` read it and the install commands built from it.
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
   also needs `model.num_variables` and expanded-form data). A type the site
   shows but cannot ship yet goes in `UNAVAILABLE_MODEL_TYPES` (codegen.ts): the
   option is disabled, saved sessions and the ZIP fall back to `generic`.
   `monomial` stays there until the site can pick a C/E lexer for a task and
   write `model.num_variables` (groebner_basis already ships `lexer_expanded.yaml`).

### Changes in calt 1.7.0

Released 2026-11-18 (https://github.com/HiroshiKERA/calt/releases/tag/v1.7.0);
the site pins it. Same dependencies as 1.6.1, no config keys renamed or removed.

- **Lexer change (calt PR #73).** With `attach_sign: false` and
  `digit_group >= 1`, numbers are split every `digit_group` digits from the
  left, whatever the vocabulary has. On 1.6.1 multi-digit vocabulary tokens won.
  - Done before the bump: the "Start from scratch", "Greatest common divisor"
    and "Prime factorization" templates in `src/lib/templates.ts` now default
    to whole numbers (`digit_group: 0`), so they tokenize the same way on 1.6.1
    and 1.7.0. Why: the lexer does not emit a token for spaces, so with digit
    groups space-separated numbers run together ("48 36" -> `4 8 3 6`, the same
    as "4 836"). Measured on calt dev, 10k samples, 30 epochs: GCD 93.8% with
    `digit_group: 1` vs 99.3% whole; prime factorization 99.5% vs 100%.
  - Users can still pick digit groups in the tokenizer editor (`codegen.ts`,
    `lexerYaml`); the editor's hint (en/ja `digitGroupHint`/`digitGroupInfo`)
    warns about the lost boundaries.
  - The integer_factorization preset (`digit_group: 3`, vocabulary 0..1000)
    tokenizes its toy data the same way (calt-x checked all 252 numbers its
    data can contain); `1000` would become `100`, `0`. The other presets use
    `attach_sign: true` and are unaffected.
  - In this mode 1.7.0 also reads `.5` as `0 . 5` with `allow_float: true` and
    no longer takes vocabulary tokens that start with a digit (such as `2x`)
    whole. No preset or template hits this; a user's tokenizer edits can.
    Checked against 1.6.1's lexer: the other modes already matched numbers
    first, so only this mode changed.
  - Projects downloaded before 2026-11-18 may have custom tasks with digit
    groups, so the recovery commands in `README.md` keep `calt-x==1.6.1`.
  - `PRETOK_VERSION` becomes `v2`, so groebner_basis's pre-tokenized caches
    are rebuilt on the next `preprocess.py` run.
- **GPU warning in conda envs (calt PR #75).** When torch is a CPU-only build,
  or built for CUDA 13 with a driver older than 580, calt's "GPU present but
  training on the CPU" warning now suggests
  `conda install -c conda-forge "pytorch>=2.6=cuda*"` (or `cuda12*`) inside a
  conda env, after `pip uninstall torch` if pip installed torch. When a CUDA
  build simply cannot reach the GPU, it suggests no command (check
  `nvidia-smi`, container passthrough). The generated README sends users to its
  check, whose cases cover all three (`projectReadme.ts`, "Messages you may see").
- **Negative number tokens (calt bug, reported 2026-11-19; present in 1.6.1
  and 1.7.0).** calt matches the vocabulary's negative number tokens before the
  `-` symbol: those built from a negative range (`-15`), and `-0`, which it adds
  when `attach_sign` and `allow_float` are both true. Effects:
  - Separate sign, negative range: `-5` stays one token, and an out-of-range
    `-150` silently becomes `-15`, `0` instead of an error.
  - Attached sign, right after a letter or digit (where the number pattern does
    not apply): with -10..10, `x-12` -> `x`, `-1`, `2`, and even in range
    `3-5` -> `3`, `-5` (subtraction lost). With `allow_float`, even a 0..10
    range gives `x-0.5` -> `x`, `-0`, `0`, `.`, `5`.
  - The example tasks do not hit it: gf17_addition and parity have no `-`
    after a digit or letter, eigvec_3x3 puts `-` only first or after `,` `;`,
    and the Sage strings of groebner_basis and polynomial_addition put spaces
    around `-`. The PCA template puts negatives after a space.
  The builder works around the separate-sign case: `normalizeLexerConfig`
  (`codegen.ts`) writes a lower bound of 0 and widens the upper bound, the
  tokenizer editor shows that range, and the "Start from scratch" template
  defaults to 0..100. The attached-sign case needs the calt fix. Drop the
  workaround once calt stops matching negative vocabulary tokens as reserved
  tokens.
- **No `[UNK]` token.** A symbol missing from `lexer.yaml` stops training at the
  first batch that has it (`WordLevel error: Missing [UNK] token`, since the
  builder writes `validate_test_tokens: false`). The generated `lexer.yaml`
  comment and the tokenizer editor's hints say so; calt-x may revisit this
  after 1.7.0.

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
