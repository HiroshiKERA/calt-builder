/**
 * The engine version the site targets, and the install commands built from it.
 *
 * The generated README and the on-screen install command read the constants in
 * this file directly. The same pin is also baked into
 * project-files/pyproject.toml and, through `npm run bundle`, into
 * src/generated/projectFiles.ts (the shipped pyproject.toml and the Engine line
 * of CALT_SNAPSHOT.txt). `npm run build` runs scripts/check-bundle.mjs, which
 * fails if those copies disagree with this constant; zip.ts also rewrites the
 * pin line at download time. To bump, follow "Bumping the calt-x version" in
 * MAINTAINING.md.
 *
 * Do not pin below 1.6.1.
 * - calt-x declares `transformers>=4.49.0` with no upper bound, so a fresh
 *   install resolves the newest transformers. transformers 5.15.0 (2026-08-10)
 *   removed TrainingArguments.warmup_ratio, and calt-x 1.5.0 and earlier crash
 *   at training start on it (`'TrainingArguments' object has no attribute
 *   'warmup_ratio'`, calt #51). 1.6.0 was the first release that trains on
 *   transformers 5.x as well as 4.x (calt PR #54).
 * - 1.6.1 fixes problems the generated projects hit on 1.6.0: `--dryrun`
 *   turned W&B logging on when a task had it enabled (calt #67);
 *   `lr_scheduler_type: cosine` silently ran as linear (#69); the final
 *   generation could exceed the model's positional capacity and print
 *   tracebacks (#70). It also warns when an NVIDIA GPU is present but training
 *   runs on the CPU (#68). No API changes; config files need no changes.
 * - 1.7.0 (pinned, 2026-11-18; same dependencies as 1.6.1, no config keys
 *   renamed or removed): inside a conda env, when torch is CPU-only or too new
 *   for the driver, the GPU warning suggests conda-forge commands instead of
 *   pip ones (calt #75). With
 *   `attach_sign: false` and `digit_group >= 1`, numbers are split every
 *   `digit_group` digits whatever the vocabulary holds (#73); the templates
 *   default to whole numbers (`digit_group: 0`), which tokenize the same way
 *   on 1.6.1 and 1.7.0, and the integer_factorization preset's data was
 *   checked to tokenize the same. Pre-tokenized caches move to v2, so
 *   groebner_basis's `preprocess.py` output from 1.6.x is rebuilt.
 *
 * Earlier floors still apply: 1.5.0 normalizes the token+position sum before
 * the transformer stack (without it coefficient accuracy sits at chance level)
 * and adds the decoder-only model (model_type: decoder_only); 1.4.0 added the
 * monomial embedding (model_type: monomial). 1.6.0 added the monomial
 * decoder-only model (model_type: monomial_decoder_only), which the site does
 * not offer (monomial models need C/E data and model.num_variables; see
 * UNAVAILABLE_MODEL_TYPES in codegen.ts).
 */
export const CALT_VERSION = "1.7.0";

/** `calt-x==<CALT_VERSION>`: the dependency specifier used in pyproject and the README. */
export const CALT_REQUIREMENT = `calt-x==${CALT_VERSION}`;

/**
 * Install commands shown in the generated README and on the Finish step.
 *
 * PyTorch comes from conda-forge, in the same `conda create` as SageMath; pip
 * only adds calt-x and two helpers on top, and keeps conda's torch because
 * calt-x only needs `torch>=2.6.0`. Do NOT pip-install torch into this env.
 * PyPI's CUDA torch pulls in the `nvidia-*` wheels, and libcudnn (RUNPATH
 * $ORIGIN) then loads the system libstdc++. On Ubuntu 22.04 and other systems
 * older than GCC 14 that copy is too old for conda-forge's scipy, matplotlib
 * and sage (`CXXABI_1.3.15 not found`), so `import calt` fails. Agreed with the
 * calt-x maintainers on 2026-11-17; calt adds no in-library workaround.
 *
 * `"pytorch>=2.6=cuda*"` (quotes needed) forces a CUDA build. Without the
 * build part, conda picks a CPU build when it cannot see a GPU (an HPC login
 * node, say) and the env silently trains on the CPU; with it, that solve fails
 * instead. The version floor matches calt-x's `torch>=2.6.0`: with an NVIDIA
 * driver older than 525 (CUDA 11.x), `pytorch=*=cuda*` alone resolves to
 * pytorch 2.5.1 cuda118, and pip would then replace it with PyPI's torch, i.e.
 * the failure above. With the floor that solve fails instead. Keep TORCH_FLOOR
 * in step with calt-x's torch requirement.
 * conda-forge's CUDA builds follow the driver: cuda129 for drivers 525-579,
 * cuda13x for >= 580 (only cuda129 has been tested, on driver 555). CUDA 13
 * drops Maxwell, Pascal and Volta GPUs, hence the README's
 * CONDA_OVERRIDE_CUDA=12.9 note.
 *
 * If calt-x or transformers ever needs a newer torch than conda-forge has, pip
 * would install PyPI's torch and bring the failure back. MAINTAINING.md lists
 * the checks to run when bumping.
 */
/** calt-x's minimum torch (its pyproject says `torch>=2.6.0`). */
export const TORCH_FLOOR = "2.6";
const CONDA_BASE = "conda create -n calt-env --override-channels -c conda-forge sage python=3.12";
/** NVIDIA GPU on Linux. */
export const CONDA_CREATE_GPU = `${CONDA_BASE} "pytorch>=${TORCH_FLOOR}=cuda*" -y`;
/** No NVIDIA GPU, or macOS. */
export const CONDA_CREATE_CPU = `${CONDA_BASE} "pytorch>=${TORCH_FLOOR}" -y`;
/** Run inside the activated env, after one of the conda commands above. */
export const PIP_INSTALL = `pip install ${CALT_REQUIREMENT} matplotlib click`;
/**
 * Activation and pip on one line, joined by `&&`: if `conda create` failed and
 * calt-env does not exist, pip must not run in the base env (it would pull
 * PyPI's torch there).
 */
export const ACTIVATE_AND_PIP = `conda activate calt-env && ${PIP_INSTALL}`;
/** One line that imports the stack in the order that used to fail, and reports the GPU. */
export const CHECK_COMMAND =
  `python -c "import torch, calt, sage.all, matplotlib.pyplot; ` +
  `print('OK', torch.__version__, 'CUDA', torch.version.cuda, 'GPU', torch.cuda.is_available())"`;
