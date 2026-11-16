/**
 * The engine version the site targets.
 *
 * The generated README and the on-screen install command read CALT_REQUIREMENT
 * directly. The same pin is also baked into project-files/pyproject.toml and,
 * through `npm run bundle`, into src/generated/projectFiles.ts (the shipped
 * pyproject.toml and the Engine line of CALT_SNAPSHOT.txt). `npm run build`
 * runs scripts/check-bundle.mjs, which fails if those copies disagree with this
 * constant; zip.ts also rewrites the pin line at download time. To bump, follow
 * "Bumping the calt-x version" in MAINTAINING.md.
 *
 * Do not pin below 1.6.0. calt-x declares `transformers>=4.49.0` with no upper
 * bound, so a fresh install resolves the newest transformers. transformers
 * 5.15.0 (2026-08-10) removed TrainingArguments.warmup_ratio, and calt-x 1.5.0
 * and earlier crash at training start on it (`'TrainingArguments' object has
 * no attribute 'warmup_ratio'`, calt #51). 1.6.0 is the first release that
 * trains on current transformers 5.x as well as 4.x (calt PR #54). Its release
 * notes say config files need no changes.
 *
 * Earlier floors still apply: 1.5.0 normalizes the token+position sum before
 * the transformer stack (without it coefficient accuracy sits at chance level)
 * and adds the decoder-only model (model_type: decoder_only); 1.4.0 added the
 * monomial embedding (model_type: monomial). 1.6.0 adds the monomial
 * decoder-only model (model_type: monomial_decoder_only), which the site does
 * not offer yet.
 */
export const CALT_VERSION = "1.6.0";

/** `calt-x==<CALT_VERSION>`: the dependency specifier used in pyproject and the README. */
export const CALT_REQUIREMENT = `calt-x==${CALT_VERSION}`;
