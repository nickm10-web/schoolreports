import type { ReportData } from '../types';

// Auto-discovers every school config in this folder. Each `<slug>.ts` becomes
// its own lazy chunk, so adding school #28 adds one chunk and never bloats the
// others. To add a school: drop a `<slug>.ts` here that default-exports a
// ReportData - no edit to this file is needed.

const modules = import.meta.glob<{ default: ReportData }>('./*.ts', {
  // exclude this index from the glob
  import: 'default',
});

/** All available school slugs (e.g. "baylor"). */
export function listSchoolSlugs(): string[] {
  return Object.keys(modules)
    .map((p) => p.replace(/^\.\//, '').replace(/\.ts$/, ''))
    .filter((s) => s !== 'index');
}

/** Lazily load one school's ReportData, or null if the slug is unknown. */
export async function loadSchoolReport(slug: string): Promise<ReportData | null> {
  const key = `./${slug}.ts`;
  const loader = modules[key];
  if (!loader) return null;
  return (await loader()) as ReportData;
}
