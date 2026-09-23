type BlockRenderer = "tailwind" | "stylex";

const rawBlockSources = import.meta.glob(
  [
    "/src/demo/blocks/*.ts",
    "/src/demo/blocks-stylex/*.ts",
    "/src/demo/blocks/**/*.json",
    "/src/demo/blocks-stylex/**/*.json",
  ],
  { query: "?raw", import: "default" },
) as Record<string, () => Promise<string>>;

const SHARED_STEMS: Readonly<Record<string, string>> = {
  "dashboard-01": "featured-page",
  "login-03": "featured-page",
  "login-04": "featured-page",
  "astryx-executive-summary": "astryx-inspired-dashboards",
  "astryx-cohort-funnel": "astryx-inspired-dashboards",
  "astryx-project-status": "astryx-inspired-dashboards",
  "astryx-service-monitoring": "astryx-inspired-dashboards",
  "astryx-incident-console": "astryx-inspired-dashboards",
  "astryx-kanban-board": "astryx-inspired-blocks",
  "astryx-inbox-table": "astryx-inspired-blocks",
  "astryx-order-detail": "astryx-inspired-blocks",
  "astryx-checkout-form": "astryx-inspired-blocks",
  "astryx-data-dashboard": "astryx-inspired-blocks",
  "astryx-card-grid": "astryx-inspired-blocks",
  "chart-analytics-dashboard": "chart-analytics-dashboard",
};

export const blockSourcePath = (
  renderer: BlockRenderer,
  name: string,
): string => {
  const stem =
    SHARED_STEMS[name] ??
    (renderer === "tailwind" ? name : "sidebar-page");
  const dir = renderer === "stylex" ? "blocks-stylex" : "blocks";
  return `/src/demo/${dir}/${stem}.ts`;
};

const IMPORT_SPECIFIER = /from\s+['"](\.[^'"]+|@\/demo\/[^'"]+)['"]/g;

const dependencyPaths = (
  primaryPath: string,
  source: string,
): ReadonlyArray<string> => {
  const dir = primaryPath.slice(0, primaryPath.lastIndexOf("/"));
  const resolved: string[] = [];
  for (const match of source.matchAll(IMPORT_SPECIFIER)) {
    const specifier = match[1];
    if (specifier === undefined) continue;
    const base = specifier.startsWith("@/demo/")
      ? `/src/demo/${specifier.slice("@/demo/".length)}`
      : `${dir}/${specifier.slice(2)}`;
    const path = base.endsWith(".ts") || base.endsWith(".json")
      ? base
      : `${base}.ts`;
    if (path !== primaryPath && rawBlockSources[path] !== undefined) {
      resolved.push(path);
    }
  }
  return resolved;
};

export type BlockSources = Readonly<{
  primary: string;
  files: Readonly<Record<string, string>>;
}>;

export const loadBlockSources = async (
  renderer: BlockRenderer,
  name: string,
): Promise<BlockSources> => {
  const primary = blockSourcePath(renderer, name);
  const load = rawBlockSources[primary];
  if (load === undefined) {
    return { primary, files: { [primary]: "// Source unavailable for this block." } };
  }
  try {
    const source = (await load()) as string;
    const deps = name.startsWith("sidebar-") && renderer === "stylex"
      ? [`/src/demo/blocks/${name}.ts`]
      : dependencyPaths(primary, source);
    const entries = await Promise.all(
      [primary, ...deps].map(async (path) => {
        try {
          const loader = rawBlockSources[path];
          const contents = loader === undefined ? "// Source unavailable." : ((await loader()) as string);
          return [path, contents] as const;
        } catch {
          return [path, "// Failed to load source."] as const;
        }
      }),
    );
    return { primary, files: Object.fromEntries(entries) };
  } catch {
    return { primary, files: { [primary]: "// Failed to load block source." } };
  }
};
