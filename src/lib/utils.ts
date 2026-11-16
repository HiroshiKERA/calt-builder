// Small helpers shared across the app.

/** Join class names, dropping falsy values. */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

/**
 * Turn an arbitrary label into a valid Python module / folder name
 * (snake_case, starts with a letter, only [a-z0-9_]).
 */
export function toSnakeCase(input: string): string {
  const cleaned = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
  if (!cleaned) return "";
  // Module names must not start with a digit.
  return /^[0-9]/.test(cleaned) ? `task_${cleaned}` : cleaned;
}

/**
 * Derive a PascalCase class name from a task name, e.g. "my_task" -> "MyTask".
 * Names with no usable characters use the same my_task fallback as the folder,
 * so an empty name gives MyTask everywhere (the ZIP passes `name || "my_task"`).
 */
export function toGeneratorClassName(taskName: string): string {
  const snake = toSnakeCase(taskName) || "my_task";
  const pascal = snake
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
  return pascal || "Task";
}

/** Text safe to put inside a Python triple-quoted docstring (backslashes, triple quotes). */
export function pyDocText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/"""/g, '\\"\\"\\"');
}

/**
 * Keep previously-seeded generator code in sync when the task name changes.
 *
 * The generator class name is derived from the task name, and the generated
 * scripts/generate.py imports that derived name. When a user renames the task
 * after the editor was seeded, the frozen code would still declare the old class
 * (e.g. `MyTask`) while generate.py imports the new one (`BigGroebner`), an
 * ImportError. This renames the class definition (and the header comment) inside
 * the stored code so the two stay consistent.
 */
export function renameTaskInCode(code: string, oldName: string, newName: string): string {
  if (!code) return code;
  let out = code;

  const oldClass = toGeneratorClassName(oldName);
  const newClass = toGeneratorClassName(newName);
  // Only the class definition: the name is derived from every keystroke, so
  // replacing all occurrences would rewrite unrelated code whenever an
  // intermediate name matched it (typing "none…" turned every None into the class).
  if (oldClass !== newClass) {
    out = out.replace(new RegExp(`\\bclass\\s+${oldClass}\\b`, "g"), `class ${newClass}`);
  }

  // Header comment: "...pairs for the <name> task." (literal replace, no regex).
  const oldDisplay = pyDocText(oldName.trim() || "my_task");
  const newDisplay = pyDocText(newName.trim() || "my_task");
  if (oldDisplay !== newDisplay) {
    out = out.split(`for the ${oldDisplay} task`).join(`for the ${newDisplay} task`);
  }

  return out;
}

/** Is this a valid Python identifier (for stat keys, etc.)? */
export function isValidIdentifier(name: string): boolean {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name);
}

/**
 * True when toSnakeCase changes characters other than the expected ones: any
 * character but ASCII letters, digits, spaces, hyphens and underscores becomes
 * "_" (or disappears at either end), while at least one usable character is
 * kept. Spaces and hyphens becoming "_" and upper case being lowered are
 * expected and do not count.
 */
export function dropsCharacters(name: string): boolean {
  return /[^A-Za-z0-9\s_-]/.test(name) && toSnakeCase(name) !== "";
}

export type FolderNameError = "empty" | "invalid" | "tooLong";

/**
 * Check that a name gives a usable project folder. Returns an error code (the
 * component maps it to a message in the UI language) or null.
 */
export function validateFolderName(name: string): FolderNameError | null {
  if (!name.trim()) return "empty";
  const snake = toSnakeCase(name);
  if (!snake) return "invalid";
  if (snake.length > 40) return "tooLong";
  return null;
}

/** Download a Blob as a file in the browser. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
