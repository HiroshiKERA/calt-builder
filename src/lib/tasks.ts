// Registry of the real CALT example tasks bundled from the repo (see
// scripts/bundle-tasks.mjs). Display name, summary and tagline come from i18n
// (tasks.items, keyed by id); here we keep the icon and SageMath requirement.

import { BUNDLED_TASKS } from "../generated/projectFiles";

export interface TaskMeta {
  id: string; // repo folder name, e.g. "parity"
  icon: string; // lucide icon name (no digits, so the dynamic map resolves it)
  needsSage?: boolean;
  extraDeps?: string[];
}

/**
 * The example tasks shown on the site. border_basis is bundled but intentionally
 * dropped: it is close to Gröbner bases and less popular (per the maintainers'
 * feedback). en.ts checks its tasks.items against this list.
 */
export const ALLOWED_TASK_IDS = [
  "parity",
  "groebner_basis",
  "integer_factorization",
  "gf17_addition",
  "eigvec_3x3",
  "polynomial_addition",
] as const;
export type AllowedTaskId = (typeof ALLOWED_TASK_IDS)[number];

const META: Record<AllowedTaskId, Omit<TaskMeta, "id">> = {
  parity: { icon: "Shuffle" },
  groebner_basis: { icon: "text:G", needsSage: true },
  integer_factorization: { icon: "Asterisk" },
  gf17_addition: { icon: "Clock" },
  eigvec_3x3: { icon: "Grid3x3" },
  polynomial_addition: { icon: "Plus", needsSage: true },
};

const ALLOWED_TASKS = new Set<string>(ALLOWED_TASK_IDS);

/** All bundled example tasks, in a stable order, with their display metadata. */
export const TASKS: TaskMeta[] = BUNDLED_TASKS
  .filter((id) => ALLOWED_TASKS.has(id))
  .map((id) => ({
    id,
    icon: META[id as AllowedTaskId].icon,
    needsSage: META[id as AllowedTaskId].needsSage,
    extraDeps: META[id as AllowedTaskId].extraDeps,
  }));

export function getTaskMeta(id: string): TaskMeta | undefined {
  return TASKS.find((t) => t.id === id);
}
