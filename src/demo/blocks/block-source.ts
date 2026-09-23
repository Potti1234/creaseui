type BlockRenderer = "tailwind" | "stylex";

const rawBlockSources = import.meta.glob(
  [
    "/src/*.ts",
    "/src/lib/**/*.ts",
    "/src/ui/**/*.ts",
    "/src/stylex/**/*.ts",
    "/src/demo/**/*.ts",
    "/src/demo/**/*.json",
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

const IMPORT_SPECIFIER =
  /from\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]/g;

const normalizePath = (path: string): string => {
  const out: string[] = [];
  for (const seg of path.split("/")) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") out.pop();
    else out.push(seg);
  }
  return `/${out.join("/")}`;
};

const resolveSpecifier = (
  fromPath: string,
  specifier: string,
): string | undefined => {
  if (specifier.startsWith("@/")) {
    return withExtension(`/src/${specifier.slice(2)}`);
  }
  if (specifier.startsWith("./") || specifier.startsWith("../")) {
    const dir = fromPath.slice(0, fromPath.lastIndexOf("/"));
    return withExtension(normalizePath(`${dir}/${specifier}`));
  }
  return undefined;
};

const withExtension = (base: string): string | undefined => {
  const candidates = base.endsWith(".ts") || base.endsWith(".json")
    ? [base]
    : [`${base}.ts`, `${base}.json`, `${base}/index.ts`];
  return candidates.find((p) => rawBlockSources[p] !== undefined);
};

const SIDEBAR_DATA_FILE = /^\/src\/demo\/blocks\/sidebar-\d+\.ts$/;

const dependencyPaths = (
  name: string,
  primaryPath: string,
  source: string,
): ReadonlyArray<string> => {
  const resolved: string[] = [];
  for (const match of source.matchAll(IMPORT_SPECIFIER)) {
    const specifier = match[1] ?? match[2];
    if (specifier === undefined) continue;
    const path = resolveSpecifier(primaryPath, specifier);
    if (path === undefined || path === primaryPath) continue;
    if (path.startsWith("/src/demo/")) {
      // Demo files aggregate blocks; only pull the primary's own deps, and
      // never a sidebar data file belonging to a different block.
      if (SIDEBAR_DATA_FILE.test(path) && path !== `/src/demo/blocks/${name}.ts`) {
        continue;
      }
    }
    resolved.push(path);
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
  if (rawBlockSources[primary] === undefined) {
    return { primary, files: { [primary]: "// Source unavailable for this block." } };
  }

  const loadSource = async (path: string): Promise<string> => {
    const loader = rawBlockSources[path];
    if (loader === undefined) return "// Source unavailable.";
    try {
      return (await loader()) as string;
    } catch {
      return "// Failed to load source.";
    }
  };

  try {
    const primarySource = await loadSource(primary);
    const otherRendererDemo =
      renderer === "stylex" ? "/src/demo/blocks/" : "/src/demo/blocks-stylex/";
    const seen = new Set([primary]);
    const ordered = [primary];
    // Breadth-first import closure: the primary's own demo deps plus every
    // component/library file reachable from the block (transitively).
    // Demo files are only expanded at depth 0 (they aggregate blocks), and
    // cross-renderer demo files are included as data sources but never
    // walked — their own imports belong to the other renderer.
    const queue: { path: string; source: string; deep: boolean }[] = [
      { path: primary, source: primarySource, deep: false },
    ];
    while (queue.length > 0) {
      const { path, source, deep } = queue.shift()!;
      if (path.startsWith(otherRendererDemo)) continue;
      for (const dep of dependencyPaths(name, path, source)) {
        if (deep && dep.startsWith("/src/demo/")) continue;
        if (seen.has(dep)) continue;
        seen.add(dep);
        ordered.push(dep);
        queue.push({ path: dep, source: await loadSource(dep), deep: true });
      }
    }
    const entries = await Promise.all(
      ordered.map(async (path) => [path, await loadSource(path)] as const),
    );
    return { primary, files: Object.fromEntries(entries) };
  } catch {
    return { primary, files: { [primary]: "// Failed to load block source." } };
  }
};
