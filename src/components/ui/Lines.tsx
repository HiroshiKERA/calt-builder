import { Fragment } from "react";

/**
 * Renders text that may contain "\n" as hand-picked line breaks (used for some
 * Japanese copy). Each break is a <br> with `brClassName`, e.g. "hidden sm:block",
 * so the breaks only apply from a width where every line fits; below it the
 * text wraps naturally (the parts join with no space, which suits Japanese).
 * Pass the class as a full literal so Tailwind keeps it.
 */
export function Lines({ text, brClassName }: { text: string; brClassName: string }) {
  const parts = text.split("\n");
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {i > 0 && <br className={brClassName} />}
          {part}
        </Fragment>
      ))}
    </>
  );
}
