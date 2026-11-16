import type { Dict, StatKey, StatText, TaskItemId, TaskItemText, TemplateText, TreeNoteKey } from "./en";
import type { TemplateId } from "../lib/templates";

// Translation rule: Japanese by default; keep a term in English when there is no
// established Japanese translation. Glossary (keep these consistent):
// ジェネレータ, トークナイザ, トークン, 語彙, 未知トークン, 学習データ(の数),
// サンプルタスク (example tasks only), 自分のタスク, エポック数, デフォルト,
// 測定 / 統計, 位置埋め込み, 学習型 / 正弦波 / なし, エンコーダのみ / デコーダのみ,
// エンコーダ・デコーダ, オンライン記録. Kept in English: Standard, Monomial, RoPE,
// BART, Hugging Face, Weights & Biases, file names and code. No space between
// Japanese and Latin words (CALTプロジェクト), except around file names, code and
// character ranges (a–z, 0–9, _).
// "\n" in welcome.subtitle, welcome.how[0].body / [2].body and tasks.subtitle marks hand-picked
// line breaks, shown only on screens wide enough (see components/ui/Lines.tsx).
// Labels quoted inside other strings (e.g. 「小規模」 in examplesInfo) must be
// updated together.

export const ja: Dict = {
  nav: {
    brand: "CALT",
    tagline: "Transformerによる計算機代数ライブラリ",
    startOver: "最初からやり直す",
    confirmReset: "最初からやり直して、現在の選択をすべて消去しますか？",
    github: "GitHub",
    toggleTheme: "ライト／ダークを切り替え",
    language: "言語",
  },
  welcome: {
    // Not a translation of the English heading: a natural Japanese one with the
    // same meaning. Two lines from 640px; on phones the title also breaks at its
    // \u200B (モデル学習用の / CALTプロジェクトを、 / ブラウザで簡単に作成). See StepWelcome.
    title: "モデル学習用の\u200BCALTプロジェクトを、",
    titleHighlight: "ブラウザで簡単に作成",
    titleJoiner: "",
    subtitle:
      "用意されたタスクを選んで設定を少し調整すれば、すぐ実行できる\nプロジェクト一式をダウンロードできます。あとはコマンドを\nコピー＆ペーストするだけで、自分のパソコンで学習を始められます。",
    nameLabel: "プロジェクト名",
    namePlaceholder: "例：My CALT project",
    getStarted: "はじめる",
    nameHelpEmpty: "ダウンロードするプロジェクトのフォルダ名を決めるだけです。あとから変更できます。",
    namedAs: (snake: string) => `プロジェクトのフォルダ名は「${snake}」になります。`,
    nameDropped: "フォルダ名には a–z、0–9、_ だけが使われるため、それ以外の文字は「_」に置き換わるか省かれます。",
    nameErrors: {
      empty: "プロジェクト名を入力してください。",
      invalid: "英字（a–z）か数字（0–9）を1文字以上含めてください。フォルダ名には a–z、0–9、_ だけが使われます。",
      tooLong: "フォルダ名が40文字を超えます。もっと短い名前にしてください。",
    },
    howTitle: "作成の流れ",
    how: [
      { title: "タスクを選ぶ", body: "用意されたサンプルタスクから\n選ぶか、自分でタスクを作ります。" },
      { title: "自分のタスクを作る（任意）", body: "コードを自分で書くか、やりたいことを説明してAIに書いてもらいます。" },
      { title: "ダウンロード", body: "すぐ実行できるプロジェクト一式を\nZIPで受け取ります。" },
    ],
    trustBrowser: "ブラウザ内で完結し、何もアップロードされません",
    trustSetup: "インストール不要、ブラウザだけで使えます",
    trustOpen: "オープンソースのCALTライブラリを使用",
  },
  tasks: {
    eyebrow: "ステップ 1",
    title: "タスクを定義する",
    subtitle:
      "自分でタスクを作るか、用意されたサンプルタスクを追加しましょう（両方でもかまいません）。\nサンプルタスクはどれも完成済みで、そのまま実行できます。",
    chooseReal: "サンプルタスクを追加",
    sageNote:
      "一部のタスクには無料の数学ソフトSageMathが必要です。condaのセットアップに含まれているので、追加のインストールは不要です。",
    selectAll: "すべて選択",
    clearAll: "すべて解除",
    needsSage: "SageMathが必要",
    buildOwnTitle: "自分のタスクを作る",
    buildOwnDesc: "問題と答えを作るコードを自分で書くか、AIに書いてもらいます。",
    includeCustom: "プロジェクトに含める",
    included: (n: number) => `${n}件を選択中`,
    continueLabel: "次へ",
    startFrom: "テンプレートから始める",
    customNameLabel: "タスク名",
    customNamePlaceholder: "例：Add two numbers",
    nameTaken: (folder: string) =>
      `「${folder}」はサンプルタスクか shared/ と同じフォルダ名です。別の名前にしてください。`,
    nameReserved: (folder: string) =>
      `「${folder}」はPython、インストール済みのパッケージ、生成されるスクリプト、OSのいずれかがすでに使っている名前と重なるため、タスクのフォルダ名にできません。別の名前にしてください。`,
    nameTooLong: "フォルダ名が40文字を超えます。もっと短い名前にしてください。",
    nameFallback: "この名前には a–z の英字も 0–9 の数字もないため、タスクのフォルダ名は「my_task」になります。",
    nameFallbackEmpty: "名前が空のため、タスクのフォルダ名は「my_task」になります。",
    folderAs: (folder: string) => `タスクのフォルダ名は「${folder}」になります。`,
    nameDropped: "フォルダ名には a–z、0–9、_ だけが使われるため、それ以外の文字は「_」に置き換わるか省かれます。",
    customNameAlert: (message: string) => `自分のタスク：${message}`,
    measurementsHint: "自分のタスクのデータについて計算する統計です。",
    tabGenerator: "ジェネレータ",
    tabTokenizer: "トークナイザ",
    tabMeasure: "測定",
    sectionTabs: "自分のタスクの設定項目",
    items: {
      parity: {
        name: "置換の偶奇",
        summary: "シャッフルされたリストを元の順に並べ直すのに必要な入れ替えの回数が、偶数か奇数か（パリティ）を判定します。",
        tagline: "2 0 1  →  +1 / -1",
      },
      groebner_basis: {
        name: "グレブナー基底",
        summary: "2つの多項式が生成するイデアルのグレブナー基底を計算します。",
        tagline: "f1 | f2  →  グレブナー基底",
      },
      integer_factorization: {
        name: "素因数の列挙",
        summary: "与えられた整数の素因数を列挙します。",
        tagline: "2310  →  2 | 3 | 5 | 7 | 11",
      },
      gf17_addition: {
        name: "剰余の累積和",
        summary: "数のリストを順に足し、各ステップで17で割った余りをとります（有限体GF(17)の演算）。",
        tagline: "5,9,3,4  →  5,14,0,4",
      },
      eigvec_3x3: {
        name: "主固有ベクトル",
        summary: "3×3の対称行列について、最大固有値に対応する固有ベクトル（主方向）を求めます。データは実数値です。",
        tagline: "3×3行列  →  固有ベクトル",
      },
      polynomial_addition: {
        name: "多項式の加算",
        summary: "多項式の列を順に足し合わせ、累積和を求めます。",
        tagline: "p1 | p2 | …  →  p1 | p1+p2 | …",
      },
    } satisfies Record<TaskItemId, TaskItemText>,
    templates: {
      custom: { name: "ゼロから作る", summary: "問題と答えを作るルールを、一から自分で定義します。" },
      gcd: { name: "最大公約数", summary: "2つの整数から、両方を割り切る最大の数を求めます。" },
      integer_factorization: { name: "素因数分解", summary: "数を、掛け合わせるとその数になる素数に分解します。" },
      pca: { name: "主成分", summary: "平面上の点の集まりから、最も広がっている方向を求めます。" },
    } satisfies Record<TemplateId, TemplateText>,
    needsDeps: (deps: string) => `${deps}が必要`,
    customTabFallback: "自分のタスク",
  },
  data: {
    recipeNote: "__call__(self, seed) が (problem, answer) の文字列のペアを返すクラスの形は、変えずに残してください。",
    editsGenerator: "このコードは、タスクフォルダ内の core/generator.py になります。細かい調整は、あとでそのファイルを直接編集して行えます。",
    editsMetrics: "これらの行は core/metrics.py（instance_stats 関数）に入ります。",
    editsLexer: "この設定は experiments/toy/configs/lexer.yaml に書き込まれます。あとでジェネレータを変更したときは、そのファイルも編集してください。",
    tabWrite: "コードを書く",
    tabAi: "AIに書いてもらう",
    modeLabel: "コードの書き方",
    aiIntro:
      "コードを書かなくても大丈夫です。やりたいことを説明してプロンプトをコピーし、好きなAIアシスタント（ChatGPT、Claude、Geminiなど）に貼り付けてください。返ってきたコードは「コードを書く」タブに貼り付けます。",
    aiDescLabel: "タスクの説明：入力・出力・前提",
    aiDescPlaceholder:
      "入力：1〜100の整数2つをスペース区切り。出力：それらの最大公約数。例：「48 36」→「12」。",
    aiDescHint:
      "入力（数の範囲など）と出力を具体的に書いてください。モデルは、生成されたデータに含まれることしか学べません。また、ここで書いた前提は data.yaml で調整できる設定になります。",
    aiPromptLabel: "そのまま送れるプロンプト",
    copyPrompt: "プロンプトをコピー",
    copied: "コピーしました",
    downloadTxt: ".txt をダウンロード",
    aiPasteHint: "AIから返ってきたコードは「コードを書く」タブに貼り付けてください。",
  },
  insights: {
    measureTitle: "独自の測定を追加",
    measureDescLabel: "測定したい内容を説明してください",
    measureDescPlaceholder: "例：答えに素数がいくつ出てくるか",
    measureCodeNote:
      '測定ごとに1行ずつ書きます。例：stats["my_measure"] = len(str(answer).split())。re、math、_ints(text)（文字列中の整数のリスト）が使えます。',
  },
  review: {
    eyebrow: "ステップ 3",
    title: "プロジェクトをダウンロード",
    subtitle: "中身を確認してから保存します。",
    empty: "まだタスクが選ばれていません。戻って1つ以上追加してください。",
    download: "ダウンロード",
    saved: "保存しました。下の「ダウンロード後の使い方」をご覧ください。",
    downloadBlocked: "自分のタスクの名前が使えません。ステップ 1の「自分のタスクを作る」で、タスク名を変更してください。",
    downloadFailed: "ダウンロードを作成できませんでした。ページを再読み込みしてから、もう一度お試しください。",
    examplesQ: "学習データの数",
    examplesInfoTitle: "学習データの数",
    examplesInfo:
      "学習データが多いほど、一般にモデルはよく学習できますが、データの生成と学習に時間がかかります。まずは「標準」がおすすめです。動作確認だけなら「小規模」、精度を重視するなら「大規模」を選んでください。",
    sizeQuick: "小規模",
    sizeBalanced: "標準",
    sizeThorough: "大規模",
    brainQ: "モデルサイズ",
    brainInfoTitle: "モデルサイズ",
    brainInfo:
      "大きいモデルほど難しいパターンを学べますが、学習は遅くなります。まずは小さいモデルで始めましょう。大きいモデルはあとからいつでも作り直せます。",
    brainSmall: "小",
    brainMedium: "中",
    brainLarge: "大",
    brainNoteSmall: "学習が速く、初めての実行や単純なパターンに向いています。",
    brainNoteMedium: "多くのパターンにうまく対応する、バランスのよい選択です。",
    brainNoteLarge: "最も表現力が高い反面、学習は遅めです。処理能力の高いパソコンでの実行がおすすめです。",
    posEmb: "位置埋め込み",
    posEmbInfoTitle: "位置埋め込み",
    posEmbInfo:
      "トークンの順番（どの記号が1番目、2番目か）をモデルに伝える方法です。デフォルトは「学習型」（学習可能な位置埋め込み）で、ほとんどのタスクはこれで十分です。ほかの選択肢は、それぞれ異なる方法で位置を表します。",
    posEmbLearned: "学習型",
    posEmbSinusoidal: "正弦波",
    posEmbRope: "RoPE",
    posEmbNone: "なし",
    posEmbNoteGeneric: "学習中にモデル自身が位置を学びます。多くのタスクで安定して使えるデフォルトの方式です。",
    posEmbNoteSinusoidal: "固定の正弦波（sin・cos）で位置を表します（最初のTransformer論文の方式）。学習時より長い入力に対応しやすい場合があります。",
    posEmbNoteRope: "回転で位置を表す方式です（Rotary Position Embedding）。学習時より長い入力の扱いに優れることが多いです。",
    posEmbNoteNone: "位置の情報を使いません。トークンの順番がタスクに関係ないときだけ選んでください。",
    arch: "モデルアーキテクチャ",
    archInfoTitle: "モデルアーキテクチャ",
    archInfo:
      "CALTが作るモデルの種類です。「Standard」はデフォルトのエンコーダ・デコーダです。「BART」はHugging Faceの実装です。「エンコーダのみ」はデコーダを外し、偶奇の判定のように答えが1トークンのタスクに使います。「デコーダのみ」は逆にエンコーダを外し、問題に続けて答えをひと続きの列として生成します。「Monomial」は係数と指数を1つの位置にまとめ、多項式の列を大幅に短くします（係数・指数のC/E形式のデータが必要です）。",
    archStandard: "Standard",
    archBart: "BART",
    // \u200B: break hint so a narrow button wraps as エンコーダ / のみ (see Segmented).
    archEncoderOnly: "エンコーダ\u200Bのみ",
    archDecoderOnly: "デコーダ\u200Bのみ",
    archMonomial: "Monomial",
    archNoteGeneric: "デフォルトのエンコーダ・デコーダです。入力の列から出力の列を作るタスク全般に使えます。",
    archNoteBart: "Hugging FaceのBARTです。Standardと同じ形のタスクを、別の実装で扱います。",
    archNoteEncoderClassifier: "デコーダを使わず、1トークンだけを予測します。答えが1つのラベルのときに使います。",
    archNoteDecoderOnly: "問題を読んだあと、その続きとして答えを1トークンずつ生成します（問題と答えをひと続きの列として扱います）。",
    archNoteMonomial: "単項式1つを1つの位置として扱い、多項式の列を大幅に短くします（係数・指数のC/E形式のデータが必要です）。",
    rounds: "エポック数",
    roundsInfoTitle: "エポック数",
    roundsInfo: "学習データ全体を何周学習するかです（1周を1エポックと呼びます）。増やすと、ある程度までは精度が上がることがあります。",
    logging: "オンライン記録",
    loggingInfoTitle: "Weights & Biases",
    loggingInfo: "学習の様子をオンラインで確認できる任意のダッシュボード（Weights & Biases）です。wandbはCALTのインストール時に一緒に入ります。使うには無料アカウントと、一度だけ「wandb login」の実行が必要です。不要ならオフのままでかまいません。",
    on: "オン",
    off: "オフ",
    treeTitle: "含まれるファイル",
    treeBody: "ダウンロードに含まれるファイルです。あとから自由に編集できます。",
    treeNotes: {
      core: "タスク本体のコード（ジェネレータ・評価指標など）",
      configs: "設定の保存先",
      scripts: "実行用：生成・学習・評価",
      shared: "全タスク共通の補助コード",
    } satisfies Record<TreeNoteKey, string>,
    howToUse: "ダウンロード後の使い方",
    prereq: "condaとターミナルが必要です。下のコマンドをコピー＆ペーストするだけです。",
    howUnzipProject: (proj: string) => `${proj}.zip を展開します（すぐ実行できるCALTプロジェクト一式です）。`,
    howInstall: "最初に一度だけcondaでインストールします（コマンドは下の「初回セットアップのコマンド」、詳細は README.md）。",
    howRun: "次にターミナルを開き、タスクごとに以下を実行します：",
    setupLabel: "初回セットアップのコマンド",
    taskCount: (n: number) => `タスク${n}件`,
    back: "戻る",
  },
  lexer: {
    intro:
      "ジェネレータが作るデータに合わせて、トークナイザを設定します。入力や出力に現れる記号は、すべてここに書いてください。ここにない記号は「未知トークン」として扱われます。",
    symbols: "データに含まれる記号",
    symbolsHint: "スペース区切りで、現れる演算子や文字をすべて書いてください。例：+ - * ^ | x y",
    numMin: "最小の整数",
    numMax: "最大の整数",
    digitGroup: "数のトークンへの分け方",
    digitGroupHint:
      "「分けない」＝1つの数を1トークンにします。「1 / 2 / 3」＝数を1〜3桁ずつに区切るので、大きな数も少ない語彙で表せます。",
    whole: "分けない",
    attachSign: "符号を数に含める",
    allowFloat: "小数を許可（例：0.71）",
    symbolsInfo:
      "問題や答えに現れる演算子や文字を、すべて書いてください。数は下で別に設定します。書き忘れた記号は、モデルが読めない「未知トークン」になります。",
    numMinInfo:
      "データに現れる最小の整数です（負の数があれば、そのうち最も小さい値）。ジェネレータが作るすべての値が範囲に入るように設定してください。",
    numMaxInfo:
      "データに現れる最大の整数です。最小の整数と合わせて、モデルが扱う数のトークンの範囲が決まります。",
    digitGroupInfo:
      "「分けない」は、数ごとに1つのトークンを割り当てます（単純ですが、語彙が大きくなります）。1・2・3桁ずつに区切ると、大きな数も少ない語彙で表せますが、列は長くなります。",
    attachSignInfo:
      "オン：先頭のマイナスを数の一部として扱い、「-5」を1トークンにします（符号付きの値向け）。オフ：「-」を引き算などの独立した記号として扱います。",
    allowFloatInfo:
      "数に小数点が含まれる場合（例：0.71）はオンにします。整数だけならオフのままにしてください。",
  },

  settings: {
    eyebrow: "ステップ 2",
    title: "設定",
    subtitle: "タスクごとに学習の設定を調整できます。デフォルトのままでも十分です。",
    appliesNote:
      "ダウンロード時に、各タスクの設定ファイルへ書き込まれます。あとで変えるときは、タスクフォルダ内の experiments/toy/configs/ を編集してください（学習データの数は data.yaml、モデルサイズ・位置埋め込み・モデルアーキテクチャ・エポック数・オンライン記録は train.yaml、トークナイザの語彙は lexer.yaml）。",
    noTasks: "まだタスクが選ばれていません。戻って1つ以上選んでください。",
    continueLabel: "次へ",
    previewLegend: "ここで選んだ設定が、タスクの設定ファイルにこのように書き込まれます。ハイライトされた行が変更される部分で、値が変わるとその行が一瞬光ります。",
    previewFiles: "設定ファイル",
  },
  details: {
    label: "詳細",
    learnMore: "CALTのドキュメントで詳しく見る",
    docsUrl: "https://hiroshikera.github.io/calt/",
    tasks:
      "CALTのタスクは、数学の問題を「翻訳」として扱います。入力の文字列（問題）を、出力の文字列（答え）に対応づけます。シードから (problem, answer) のペアを返すジェネレータを1つ定義します。サンプルタスクは、そのまま追加できる完成済みのジェネレータです。",
    settings:
      "ここでは、学習データの数、モデルサイズ、位置埋め込み、モデルアーキテクチャ、エポック数、オンライン記録を設定します。各設定はタスクの data.yaml / train.yaml に書き込まれ、プレビューにすぐ反映されます。",
    finish:
      "ダウンロードされるのは、そのまま実行できるCALTプロジェクト一式です。タスクごとのフォルダ（ジェネレータ・設定・スクリプト）、共通の補助コード、依存バージョンを固定した pyproject.toml、README が含まれます。流れは「生成 → 学習 → 評価」です。",
  },
  rail: { tasks: "タスク", settings: "設定", finish: "完了" },
  railSub: { tasks: "ジェネレータを定義", settings: "データ・モデル・学習", finish: "ダウンロード" },
  mobileStep: (n: number, total: number) => `ステップ ${n} / ${total}`,
  a11y: {
    decrease: "減らす",
    increase: "増やす",
    whatsThis: "説明を表示",
    settingsTabs: "タスクごとの設定",
    skipToContent: "本文へスキップ",
  },
  code: {
    copy: "コピー",
    copied: "コピーしました",
  },
  errorBoundary: {
    title: "問題が発生しました",
    body: "予期しないエラーが起きました。ダウンロード済みのプロジェクトには影響ありません。ページを再読み込みすると、多くの場合は解決します。",
    reload: "再読み込み",
  },
  stats: {
    input_length: { label: "問題の長さ", desc: "各問題をスペースで区切ったときの要素の数。" },
    output_length: { label: "答えの長さ", desc: "各答えをスペースで区切ったときの要素の数。" },
    input_chars: { label: "問題の文字数", desc: "各問題の文字数。" },
    output_chars: { label: "答えの文字数", desc: "各答えの文字数。" },
    max_abs_value: { label: "最大の絶対値", desc: "各問題に現れる整数の絶対値の最大値（なければ0）。" },
    num_elements: { label: "部分の数", desc: "問題を「|」で区切ったときの部分の数。" },
  } satisfies Record<StatKey, StatText>,
};
