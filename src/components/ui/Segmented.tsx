import { useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  layoutKey,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel?: string;
  /**
   * Fixed, untranslated id for the sliding highlight (framer-motion layoutId).
   * Keep it stable across languages and remounts: switching task tabs in
   * Settings slides the highlight because the remounted control reuses it.
   */
  layoutKey: string;
}) {
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (dir: 1 | -1) => {
    const i = options.findIndex((o) => o.value === value);
    const nextIdx = (i + dir + options.length) % options.length;
    const next = options[nextIdx];
    if (next) {
      onChange(next.value);
      btnRefs.current[nextIdx]?.focus();
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      // Below sm, options that cannot fit side by side move to a new row instead
      // of widening the page (the Settings card overflowed on phones). From sm up
      // the layout is unchanged: one row, labels wrap inside their button.
      className="inline-flex w-full flex-wrap gap-y-1 rounded-xl bg-ink-100 p-1 sm:flex-nowrap"
    >
      {options.map((o, idx) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => (btnRefs.current[idx] = el)}
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                move(1);
              } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                move(-1);
              }
            }}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-400/40",
              active ? "text-ink-900" : "text-ink-500 hover:text-ink-700",
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${layoutKey}`}
                className="absolute inset-0 rounded-lg bg-surface shadow-soft"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {o.icon}
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
