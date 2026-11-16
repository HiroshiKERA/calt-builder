// Fails the build when the engine pin is out of step.
//
// The engine version is defined in src/lib/caltVersion.ts. It is also baked
// into project-files/pyproject.toml and, through `npm run bundle`, into
// src/generated/projectFiles.ts (the shipped pyproject.toml and the Engine line
// of CALT_SNAPSHOT.txt). zip.ts rewrites only the pin at download time, so a
// forgotten edit or re-bundle would otherwise ship a self-contradicting
// project (e.g. a new pin next to the old requires-python of a stale bundle).
// It checks that project-files/pyproject.toml pins CALT_VERSION, that the
// bundled pyproject.toml is identical to it, and that CALT_SNAPSHOT.txt names
// the same version. It does not decide what requires-python should be.
// Run by `npm run build`.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8").replace(/\r\n/g, "\n");

const version = read("src/lib/caltVersion.ts").match(/CALT_VERSION\s*=\s*"([^"]+)"/)?.[1];
if (!version) fail("could not find CALT_VERSION in src/lib/caltVersion.ts");
const want = `calt-x==${version}`;

const PIN_RE = /(?<![\w.-])calt-x(\[[^\]]*\])?\s*==\s*([^\s"',;]+)/g;
const pinsIn = (text) =>
  text
    .split("\n")
    .map((l) => l.replace(/#.*/, ""))
    .flatMap((l) => [...l.matchAll(PIN_RE)].map((m) => m[2]));

const problems = [];

const sitePyproject = read("project-files/pyproject.toml");
const sitePins = pinsIn(sitePyproject);
if (sitePins.length !== 1 || sitePins[0] !== version)
  problems.push(`project-files/pyproject.toml pins ${JSON.stringify(sitePins)}, expected ["${version}"]`);

const bundle = read("src/generated/projectFiles.ts");
const commonLine = bundle.split("\n").find((l) => l.startsWith("export const COMMON_FILES"));
const common = commonLine && JSON.parse(commonLine.slice(commonLine.indexOf("=") + 1).trim().replace(/;$/, ""));
if (!common) fail("could not read COMMON_FILES from src/generated/projectFiles.ts");

if (common["pyproject.toml"] !== sitePyproject)
  problems.push("the bundled pyproject.toml differs from project-files/pyproject.toml");
const engine = (common["CALT_SNAPSHOT.txt"] || "").match(/^Engine\s*:\s*(.*)$/m)?.[1]?.trim() ?? "";
const enginePins = pinsIn(engine);
if (enginePins.length !== 1 || enginePins[0] !== version)
  problems.push(`CALT_SNAPSHOT.txt says "Engine : ${engine}", expected "${want}"`);

if (problems.length) {
  fail(
    `engine pin out of step with CALT_VERSION (${version}):\n  - ${problems.join("\n  - ")}\n` +
      "Update project-files/pyproject.toml, then run `npm run bundle` (see MAINTAINING.md).",
  );
}
console.log(`check-bundle: ${want} is consistent across caltVersion.ts, pyproject and the bundle`);

function fail(msg) {
  console.error(`check-bundle: ${msg}`);
  process.exit(1);
}
