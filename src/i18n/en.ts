import type { AllowedTaskId } from "../lib/tasks";
import type { TemplateId } from "../lib/templates";

// The keyed maps below are declared on their own so their key sets stay precise:
// ja.ts checks its copies with `satisfies Record<…Key, …>`, so a missing or
// extra key is a compile error. Inside `en` they are widened to string-indexed
// records, which is what the components look them up with.

export interface TaskItemText {
  name: string;
  summary: string;
  /** Short "input → output" hint shown under the name, in monospace. */
  tagline: string;
}
const taskItems = {
  parity: {
    name: "Permutation parity",
    summary: "Decide whether a shuffled list needs an even or odd number of swaps to sort.",
    tagline: "2 0 1  →  +1 / -1",
  },
  groebner_basis: {
    name: "Gröbner basis",
    summary: "Compute the Gröbner basis of a pair of polynomials.",
    tagline: "f1 | f2  →  Gröbner basis",
  },
  integer_factorization: {
    name: "Prime factor listing",
    summary: "List the prime factors of a given integer.",
    tagline: "2310  →  2 | 3 | 5 | 7 | 11",
  },
  gf17_addition: {
    name: "Modular running sums",
    summary: "Add up a list of numbers step by step, wrapping around at 17 (finite-field arithmetic).",
    tagline: "5,9,3,4  →  5,14,0,4",
  },
  eigvec_3x3: {
    name: "Dominant eigenvector",
    summary: "Find the main direction (top eigenvector) of a 3×3 symmetric matrix, on real-valued data.",
    tagline: "3×3 matrix  →  eigenvector",
  },
  polynomial_addition: {
    name: "Polynomial addition",
    summary: "Add a sequence of polynomials step by step (cumulative sums).",
    tagline: "p1 | p2 | …  →  p1 | p1+p2 | …",
  },
} satisfies Record<AllowedTaskId, TaskItemText>;
export type TaskItemId = keyof typeof taskItems;

export interface TemplateText {
  /** Chip label. The task name a template seeds stays ASCII (templates.ts `name`). */
  name: string;
  /** One plain line for non-technical users (no jargon). */
  summary: string;
}
const templateTexts = {
  custom: { name: "Start from scratch", summary: "Define your own problem-and-answer rule from scratch." },
  gcd: {
    name: "Greatest common divisor",
    summary: "Given two whole numbers, find the largest number that divides both.",
  },
  integer_factorization: {
    name: "Prime factorization",
    summary: "Break a number down into the prime numbers that multiply to make it.",
  },
  pca: {
    name: "Principal component",
    summary: "From a small cloud of 2-D points, find the main direction they spread along.",
  },
} satisfies Record<TemplateId, TemplateText>;

const treeNotes = {
  core: "the task logic (generator, metrics)",
  configs: "your settings",
  scripts: "run these: generate, train, evaluate",
  shared: "utilities shared by every task",
};
export type TreeNoteKey = keyof typeof treeNotes;

export interface StatText {
  label: string;
  desc: string;
}
const statTexts = {
  input_length: { label: "Problem length", desc: "How many pieces each problem is made of." },
  output_length: { label: "Answer length", desc: "How many pieces each answer is made of." },
  input_chars: { label: "Problem size", desc: "How many characters long each problem is." },
  output_chars: { label: "Answer size", desc: "How many characters long each answer is." },
  max_abs_value: { label: "Biggest number", desc: "The largest integer in each problem, ignoring its sign (0 if there is none)." },
  num_elements: { label: "Number of parts", desc: "How many parts the problem is split into (by the “|” symbol)." },
};
export type StatKey = keyof typeof statTexts;

export interface HowStep {
  title: string;
  body: string;
}

export const en = {
  nav: {
    brand: "CALT",
    tagline: "A Library for Computer Algebra with Transformer",
    startOver: "Start over",
    confirmReset: "Start over and clear all your current choices?",
    github: "GitHub",
    toggleTheme: "Toggle light / dark",
    language: "Language",
  },
  welcome: {
    title: "Build a CALT project,",
    titleHighlight: "ready to train",
    /** Joins title and titleHighlight where they share a line (phones): a space in English. */
    titleJoiner: " ",
    subtitle:
      "Pick ready-made tasks, adjust a few settings, and download a complete project that's ready to train on your own machine with a few copy-paste commands.",
    nameLabel: "Name your project",
    namePlaceholder: "e.g. My CALT project",
    getStarted: "Get started",
    nameHelpEmpty:
      "This only sets the name of the downloaded project folder. You can rename it anytime.",
    namedAs: (snake: string) => `Your project folder will be named “${snake}”.`,
    nameDropped: "Folder names use only a–z, 0–9 and _, so other characters become _ or are left out.",
    nameErrors: {
      empty: "Please enter a project name.",
      invalid: "Include at least one letter (a–z) or digit (0–9). Folder names keep only a–z, 0–9 and _.",
      tooLong: "The folder name would be over 40 characters. Choose a shorter name.",
    },
    howTitle: "How it works",
    how: [
      {
        title: "Pick tasks",
        body: "Choose from ready-made CALT example tasks, or build your own from scratch.",
      },
      {
        title: "Add your own (optional)",
        body: "Describe your idea and write it, or let an AI write the code for you.",
      },
      {
        title: "Download",
        body: "Get the full project as a ready-to-run ZIP.",
      },
    ] as [HowStep, HowStep, HowStep],
    trustBrowser: "Runs in your browser, nothing uploaded",
    trustSetup: "No technical setup to use the builder",
    trustOpen: "Built on the open-source CALT library",
  },
  tasks: {
    eyebrow: "Step 1",
    title: "Define your task",
    subtitle:
      "Define your own task, add ready-made example tasks, or both. Each example is complete and ready to run.",
    chooseReal: "Add example tasks",
    sageNote:
      "Some tasks need SageMath, a free math toolkit. It comes bundled in the conda setup, so there's nothing extra to install.",
    selectAll: "Select all",
    clearAll: "Clear all",
    needsSage: "needs SageMath",
    buildOwnTitle: "Build your own task",
    buildOwnDesc: "Write your own data recipe, or have an AI write it for you.",
    includeCustom: "Include in project",
    included: (n: number) => `${n} in your project`,
    continueLabel: "Continue",
    startFrom: "Start from a template",
    customNameLabel: "Task name",
    customNamePlaceholder: "e.g. Add two numbers",
    nameTaken: (folder: string) =>
      `“${folder}” is already the folder of an example task or shared/. Choose another name.`,
    nameReserved: (folder: string) =>
      `“${folder}” clashes with a name that Python, an installed package, the generated scripts or the operating system already use, so it can't be a task folder. Choose another name.`,
    nameTooLong: "The folder name would be over 40 characters. Choose a shorter name.",
    nameFallback: "This name has no a–z or 0–9 characters, so the task folder will be named “my_task”.",
    nameFallbackEmpty: "Without a name, the task folder will be named “my_task”.",
    folderAs: (folder: string) => `The task folder will be named “${folder}”.`,
    nameDropped: "Folder names use only a–z, 0–9 and _, so other characters become _ or are left out.",
    customNameAlert: (message: string) => `Your own task: ${message}`,
    measurementsHint: "Statistics computed about your custom task's data.",
    tabGenerator: "Generator",
    tabTokenizer: "Tokenizer",
    tabMeasure: "Stats",
    sectionTabs: "Custom task sections",
    items: taskItems as Record<string, TaskItemText>,
    templates: templateTexts as Record<TemplateId, TemplateText>,
    needsDeps: (deps: string) => `needs ${deps}`,
    /** Settings tab label for a custom task whose name is empty. */
    customTabFallback: "My task",
  },
  data: {
    recipeNote: "Keep a class with __call__(self, seed) that returns a (problem, answer) pair of text.",
    editsGenerator: "This becomes core/generator.py in the task folder. Edit it there later for local tweaks.",
    editsMetrics: "These lines go into core/metrics.py (the instance_stats function).",
    editsLexer: "This becomes experiments/toy/configs/lexer.yaml. Edit it there later if your generator changes.",
    tabWrite: "Write code",
    tabAi: "Ask an AI to write it",
    /** Accessible name of the Write code / Ask an AI toggle. */
    modeLabel: "How to write the code",
    aiIntro:
      "Don't want to write code? Describe your idea, copy the prompt, and paste it into any AI assistant (ChatGPT, Claude, Gemini). Then paste its reply into the “Write code” tab.",
    aiDescLabel: "Describe your task: input, output, and assumptions",
    aiDescPlaceholder:
      "Input: two integers, each from 1 to 100, separated by a space. Output: their greatest common divisor. Example: \"48 36\" → \"12\".",
    aiDescHint:
      "Be specific about the input (and its ranges, e.g. how big the numbers can be) and the exact output. The model can only learn what your examples show, and these assumptions also become tunable settings in data.yaml.",
    aiPromptLabel: "Your ready-to-send prompt",
    copyPrompt: "Copy prompt",
    copied: "Copied!",
    downloadTxt: "Download .txt",
    aiPasteHint: "When the AI replies, paste its code into the “Write code” tab.",
  },
  insights: {
    measureTitle: "Add your own measurement",
    measureDescLabel: "Describe what you want to measure",
    measureDescPlaceholder: "e.g. how many prime numbers appear in the answer",
    measureCodeNote:
      'Add one line per measurement, like stats["my_measure"] = len(str(answer).split()). You can use re, math, and _ints(text), which lists the integers in a string.',
  },
  review: {
    eyebrow: "Step 3",
    title: "Download your project",
    subtitle: "Take a look inside, then save your project.",
    empty: "No tasks selected yet. Go back and add at least one.",
    download: "Download",
    saved: "Saved. See “How to use it” below.",
    downloadBlocked: "Your own task's name can't be used. Go back to Step 1 and rename it.",
    downloadFailed: "The download could not be created. Reload the page and try again.",
    examplesQ: "Number of training examples",
    examplesInfoTitle: "Number of training examples",
    examplesInfo:
      "More examples usually help the model learn better, but take longer to prepare and train. “Balanced” is a good default; use “Quick” to test the pipeline faster, or “Thorough” for the best results.",
    sizeQuick: "Quick",
    sizeBalanced: "Balanced",
    sizeThorough: "Thorough",
    brainQ: "Model size",
    brainInfoTitle: "Model size",
    brainInfo:
      "A bigger model can learn harder patterns but trains more slowly. Start small; you can always rebuild a bigger one.",
    brainSmall: "Small",
    brainMedium: "Medium",
    brainLarge: "Large",
    brainNoteSmall: "Fast to train. Great for a first try and simpler patterns.",
    brainNoteMedium: "A balanced choice that works well for most patterns.",
    brainNoteLarge: "Most capable, but slower. Best run on a powerful computer.",
    posEmb: "Position embedding",
    posEmbInfoTitle: "Position embedding",
    posEmbInfo:
      "How the model knows the order of the tokens (which symbol is 1st, 2nd, and so on). “Learned” is the default and works well for most tasks; the rest are alternative methods.",
    posEmbLearned: "Learned",
    posEmbSinusoidal: "Sinusoidal",
    posEmbRope: "RoPE",
    posEmbNone: "None",
    posEmbNoteGeneric:
      "The model learns the positions by itself during training. A solid default that fits most tasks.",
    posEmbNoteSinusoidal:
      "Fixed wave patterns (the original Transformer recipe). Can help with inputs longer than those seen in training.",
    posEmbNoteRope:
      "Rotary positions. Often the best at handling inputs longer than those seen in training.",
    posEmbNoteNone:
      "No position information at all. Only pick this if the order of the tokens does not matter for your task.",
    arch: "Model architecture",
    archInfoTitle: "Model architecture",
    archInfo:
      "Which model CALT builds. “Standard” is the encoder-decoder used by default. “BART” is the Hugging Face implementation. “Encoder only” drops the decoder and predicts a single token, for targets like a parity bit. “Decoder only” drops the encoder instead: it reads the problem and writes the solution as one continuous sequence. “Monomial” packs a coefficient and its exponents into one sequence position, which shortens polynomial sequences a lot. It needs coefficient/exponent (C/E) tokens and the number of variables (num_variables), which this site can’t set up yet, so it can’t be selected for now.",
    archStandard: "Standard",
    archBart: "BART",
    archEncoderOnly: "Encoder only",
    archDecoderOnly: "Decoder only",
    archMonomial: "Monomial",
    archNoteGeneric:
      "The default encoder-decoder. Works for any sequence-to-sequence task.",
    archNoteBart:
      "Hugging Face BART. Same task shape as Standard, different implementation.",
    archNoteEncoderClassifier:
      "No decoder: predicts one token. Use it when the target is a single label.",
    archNoteDecoderOnly:
      "Reads the problem, then writes the solution as one continuous sequence, one token at a time.",
    archNoteMonomial:
      "Not available yet: needs coefficient/exponent (C/E) tokens and the number of variables (num_variables), which this site can’t set up yet.",
    rounds: "Training rounds",
    roundsInfoTitle: "Training rounds",
    roundsInfo:
      "How many times the model goes through all the training examples (each pass is called an epoch). More rounds can improve accuracy up to a point.",
    logging: "Progress logging",
    loggingInfoTitle: "Weights & Biases",
    loggingInfo:
      "An optional online dashboard for following training as it runs (Weights & Biases). It is already installed with CALT; to use it, you need a free account, and you must run “wandb login” once. Leave it off if you don't need it.",
    on: "On",
    off: "Off",
    treeTitle: "What's inside",
    treeBody: "The files in your download. Edit any of them later for local tweaks.",
    treeNotes: treeNotes as Record<string, string>,
    howToUse: "How to use it",
    prereq: "You'll need conda and a terminal. Just copy-paste the commands below.",
    howUnzipProject: (proj: string) => `Unzip ${proj}.zip (a complete CALT project).`,
    howInstall: "Install everything once with conda (commands under “One-time setup commands” below; full details in README.md).",
    howRun: "Then open a terminal and, for each task, run:",
    setupLabel: "One-time setup commands",
    setupIntro: "One-time setup with conda, full steps and GPU checks in README.md",
    setupGpu: "With an NVIDIA GPU, on Linux:",
    setupCpu: "No NVIDIA GPU, or on a Mac: run the next line without its leading # instead of the one above",
    taskCount: (n: number) => (n === 1 ? "1 task" : `${n} tasks`),
    back: "Back",
  },
  lexer: {
    intro:
      "Set the tokenizer to match the data your generator produces. Every symbol that can appear in the input or output must be listed here; a missing one makes training stop with an error.",
    symbols: "Symbols in your data",
    symbolsHint: "Space-separated. Include every operator/letter that appears, e.g. + - * ^ | x y",
    numMin: "Smallest number",
    numMax: "Largest number",
    numMinSeparateHint:
      "The sign is a separate symbol, so a negative number becomes “-” followed by a number (“-5” is “-” and “5”); keep “-” in the symbols above. A negative value here is turned into 0, and the largest number grows to its absolute value.",
    digitGroup: "How numbers become tokens",
    digitGroupHint:
      "Whole = one token per number. 1 / 2 / 3 = split numbers into digit groups, so large numbers reuse a tiny vocabulary. Spaces are not tokens, so with digit groups (calt 1.7 and later) the boundary between space-separated numbers is lost (“48 36” reads like “4 8 3 6”).",
    whole: "Whole",
    attachSign: "Attach sign to numbers",
    allowFloat: "Allow decimals (e.g. 0.71)",
    symbolsInfo:
      "List every operator or letter that can appear in your problems or answers. Numbers are set separately below. Anything you forget makes training stop with an error.",
    numMinInfo:
      "The smallest (most negative) whole number your data can contain. Set it to cover every value your generator can produce. With the sign not attached, “-” is a separate symbol and this is 0 or more.",
    numMaxInfo:
      "The largest whole number your data can contain. Together with the smallest, this sets the range of number tokens the model knows. With the sign not attached, use the largest absolute value (100 for numbers from -100 to 50).",
    digitGroupInfo:
      "“Whole” gives each number its own token: simple, but every number in your data must be inside the range above. Splitting into 1, 2 or 3-digit groups lets big numbers reuse a tiny vocabulary, at the cost of longer sequences. Spaces are not tokens, so with digit groups (calt 1.7 and later) “48 36” and “4 836” become the same tokens; use “Whole” when your problems or answers list several numbers separated by spaces.",
    attachSignInfo:
      "On: a leading minus is part of the number, so “-5” is a single token (for signed values). Off: “-” is treated as a separate symbol, like a subtraction sign, and a negative number becomes “-” followed by a number (“-5” is “-” then “5”), so the number range needs no negative values.",
    allowFloatInfo:
      "Turn on if your numbers can have a decimal point (e.g. 0.71). Leave it off if your data only uses whole numbers.",
  },

  settings: {
    eyebrow: "Step 2",
    title: "Settings",
    subtitle: "Fine-tune each task's training settings. The defaults already work well.",
    appliesNote:
      "These are saved into each task's config when you download. To change them later, edit the files in experiments/toy/configs/ inside the task folder: data.yaml for the number of training examples, train.yaml for the model size, position embedding, architecture, training rounds and logging, and lexer.yaml for the tokenizer vocabulary. The logging choice is also written into the task's other experiment configs.",
    noTasks: "No tasks selected yet. Go back and pick at least one.",
    continueLabel: "Continue",
    previewLegend: "This is what your settings write into the task's config files. Highlighted lines are the ones the controls edit; a line flashes when it changes.",
    previewFiles: "Config file",
  },
  details: {
    label: "Details",
    learnMore: "Learn more in the CALT docs",
    docsUrl: "https://hiroshikera.github.io/calt/",
    tasks:
      "A CALT task frames a math problem as a translation: an input string (the problem) maps to an output string (the answer). You define one instance generator that returns (problem, answer) pairs from a seed; the example cards are ready-made generators you can add as they are.",
    settings:
      "These controls set the dataset size, the model size and architecture, how token positions are encoded, how many training rounds run, and whether training is logged online. Each one is written into the task's data.yaml / train.yaml and shown live in the preview.",
    finish:
      "Your download is a complete, runnable CALT project: one folder per task (generator, configs, scripts), shared utilities, a pinned pyproject.toml and a README. The workflow is generate → train → evaluate.",
  },
  rail: { tasks: "Tasks", settings: "Settings", finish: "Finish" },
  railSub: { tasks: "Define instance generator", settings: "Data, model & training", finish: "Download" },
  mobileStep: (n: number, total: number) => `Step ${n} of ${total}`,
  a11y: {
    decrease: "Decrease",
    increase: "Increase",
    whatsThis: "What's this?",
    settingsTabs: "Settings for each task",
    skipToContent: "Skip to content",
  },
  code: {
    copy: "Copy",
    copied: "Copied",
  },
  /** Shown by ErrorBoundary, which renders outside the language provider. */
  errorBoundary: {
    title: "Something went wrong",
    body: "The builder hit an unexpected error. Your downloaded projects are unaffected. Reloading the page usually fixes it.",
    reload: "Reload",
  },
  stats: statTexts as Record<string, StatText>,
};

export type Dict = typeof en;
