// Rules for the custom task's folder name.
//
// The custom task becomes a folder at the project root, imported by its own
// scripts as `<folder>.core...`. The scripts put the project root first on
// sys.path, but the task folder has no __init__.py, so it is a namespace
// package: any real module or package with the same name (the standard library,
// an installed package, or generate.py / train.py / evaluate.py next to the
// script) wins the import and the task fails. Those names, the example tasks'
// folders and `shared/` are therefore reserved.

import { BUNDLED_TASKS } from "../generated/projectFiles";
import { toGeneratorClassName, toSnakeCase } from "./utils";

/** Folder used for the custom task. Names with no usable characters fall back to my_task. */
export function customFolderName(name: string): string {
  return toSnakeCase(name) || "my_task";
}

/** True when the name has no usable characters, so the folder falls back to my_task. */
export function usesFallbackFolder(name: string): boolean {
  return !toSnakeCase(name);
}

/** Python 3.12 sys.stdlib_module_names that a snake_case folder name can produce. */
const STDLIB = new Set(
  `
  abc aifc antigravity argparse array ast asyncio atexit audioop base64 bdb binascii bisect
  builtins bz2 calendar cgi cgitb chunk cmath cmd code codecs codeop collections colorsys
  compileall concurrent configparser contextlib contextvars copy copyreg crypt csv ctypes curses
  dataclasses datetime dbm decimal difflib dis doctest email encodings ensurepip enum errno
  faulthandler fcntl filecmp fileinput fnmatch fractions ftplib functools gc genericpath getopt
  getpass gettext glob graphlib grp gzip hashlib heapq hmac html http idlelib imaplib imghdr
  importlib inspect io ipaddress itertools json keyword lib2to3 linecache locale logging lzma
  mailbox mailcap marshal math mimetypes mmap modulefinder msilib msvcrt multiprocessing netrc nis
  nntplib nt ntpath nturl2path numbers opcode operator optparse os ossaudiodev pathlib pdb pickle
  pickletools pipes pkgutil platform plistlib poplib posix posixpath pprint profile pstats pty pwd
  py_compile pyclbr pydoc pydoc_data pyexpat queue quopri random re readline reprlib resource
  rlcompleter runpy sched secrets select selectors shelve shlex shutil signal site smtplib sndhdr
  socket socketserver spwd sqlite3 sre_compile sre_constants sre_parse ssl stat statistics string
  stringprep struct subprocess sunau symtable sys sysconfig syslog tabnanny tarfile telnetlib
  tempfile termios textwrap this threading time timeit tkinter token tokenize tomllib trace
  traceback tracemalloc tty turtle turtledemo types typing unicodedata unittest urllib uu uuid
  venv warnings wave weakref webbrowser winreg winsound wsgiref xdrlib xml xmlrpc zipapp zipfile
  zipimport zlib zoneinfo
  `.split(/\s+/).filter(Boolean),
);

/** Lowercase Python keywords (toSnakeCase lowercases, so False/None/True cannot occur). */
const KEYWORDS = new Set(
  `and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield`.split(" "),
);

/**
 * Top-level modules in calt-env: everything a fresh `pip install calt-x matplotlib
 * click` brings in (listed from a clean Python 3.12 env), everything the README's
 * `conda create -c conda-forge sage python=3.12` env contains (listed from a real
 * one), and a few common extras. Packages a user installs later can still clash; the generated
 * scripts then stop with a message that names the clash (see codegen.ts).
 */
const PACKAGES = new Set(
  `
  accelerate alabaster annotated_doc annotated_types antlr4 anyio argon2 arrow asttokens async_lru
  attr attrs babel backrefs beniget bleach boto3 botocore brotli bs4 cached_property calt certifi
  cffi charset_normalizer click cloudpickle colorama colorlog comm contourpy conway_polynomials
  coreweave_evaluations cvxopt cycler cypari2 cysignals cython datasets dateutil debugpy decorator
  defusedxml distro distutils docstring_parser docutils dotenv exceptiongroup executing
  fastjsonschema filelock fpylll fqdn fsspec functorch future gast ghp_import git gitdb gmpy2
  google griffe h11 h2 hf_xet hjson hpack httpcore httpcore2 httpx httpx2 httpx_sse
  huggingface_hub hyperframe idna imagesize importlib_metadata importlib_resources ipykernel
  ipykernel_launcher ipython ipython_pygments_lexers ipywidgets isoduration isympy jedi jinja2
  jmespath joblib json5 jsonpointer jsonschema jsonschema_specifications jupyter jupyter_client
  jupyter_core jupyter_events jupyter_lsp jupyter_server jupyter_server_terminals jupyterlab
  jupyterlab_pygments jupyterlab_server jupyterlab_widgets kiwisolver libfuturize libpasteurize
  lrcalc markdown markdown_it markdownify markupsafe material materialx matplotlib
  matplotlib_inline mcp mdformat mdurl mdx_math memory_allocator mergedeep mike mistune mkdocs
  mkdocs_autorefs mkdocs_get_deps mkdocs_llmstxt mkdocs_macros mkdocstrings mpmath multipart
  munkres nbclient nbconvert nbformat nest_asyncio networkx notebook notebook_shim numpy nvidia
  omegaconf omp overrides packaging paginate pandas pandocfilters parso past pathspec pexpect
  pickleshare pip pkg_resources pkgconfig pkgutil_resolve_name platformdirs ply ppl primecountpy
  prometheus_client prompt_toolkit psutil ptyprocess pure_eval pycparser pydantic pydantic_core
  pydantic_settings pydevd_plugins pygments pylab pymdownx pyparsing python_multipart
  pythonjsonlogger pythran pytz pyximport referencing regex requests rfc3339_validator
  rfc3986_validator rich roman_numerals rpds rpy2 s3transfer safetensors sage sagetex sagetexparse
  scipy send2trash sentry_sdk setproctitle setuptools shellingham simplegeneric six smmap sniffio
  snowballstemmer socks sockshandler soupsieve sphinx sse_starlette stack_data starlette strands
  super_collections sympy termcolor terminado test tinycss2 tokenizers tomli torch torchgen
  tornado tqdm traitlets transformers triton truststore typer typing_extensions typing_inspection
  typing_utils tzdata tzlocal unicodedata2 uri_template urllib3 uvicorn verspec wandb watchdog
  wcwidth webcolors webencodings websocket wheel widgetsnbextension xxhash yaml yaml_env_tag zipp
  zmq zstandard
  `.split(/\s+/).filter(Boolean),
);

/** Shipped with CPython but left out of sys.stdlib_module_names. */
const STDLIB_EXTRA = new Set([
  "test", "idlelib", "xxlimited", "xxlimited_35", "xxsubtype",
  // Removed in 3.12 but still present on 3.11, which calt-x also supports.
  "asynchat", "asyncore", "smtpd", "imp", "distutils",
]);

/** Scripts that sit next to the entry point, so they shadow a namespace folder. */
const SCRIPTS = new Set(["generate", "train", "evaluate"]);

/** Names Windows cannot extract as folders. */
const WINDOWS = new Set([
  "con", "prn", "aux", "nul",
  ...Array.from({ length: 9 }, (_, i) => `com${i + 1}`),
  ...Array.from({ length: 9 }, (_, i) => `lpt${i + 1}`),
]);

/** Class names that are Python constants, e.g. a task named "none" would declare `class None:`. */
const CONSTANT_CLASSES = new Set(["None", "True", "False"]);

export type CustomNameIssue =
  /** Same folder as an example task or shared/. */
  | "taken"
  /** A Python module, package, keyword, script or system name the generated code cannot use. */
  | "reserved"
  /** Folder name over 40 characters (long paths fail to extract, especially on Windows). */
  | "tooLong";

/** Why this custom task name cannot be used, or null when it is fine. */
export function customNameIssue(name: string): CustomNameIssue | null {
  const folder = customFolderName(name);
  if (folder.length > 40) return "tooLong";
  if (folder === "shared" || BUNDLED_TASKS.includes(folder)) return "taken";
  if (
    STDLIB.has(folder) ||
    STDLIB_EXTRA.has(folder) ||
    KEYWORDS.has(folder) ||
    PACKAGES.has(folder) ||
    SCRIPTS.has(folder) ||
    WINDOWS.has(folder) ||
    CONSTANT_CLASSES.has(toGeneratorClassName(name))
  )
    return "reserved";
  return null;
}
