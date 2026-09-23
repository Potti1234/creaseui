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

const IMPORT_CLAUSE =
  /import\s+(?:type\s+)?([\w*$,\s{}]+?)\s+from\s+['"]([^'"]+)['"]/g;
const BARE_IMPORT = /import\s+['"]([^'"]+)['"]/g;
const EXPORT_CLAUSE =
  /export\s+(?:type\s+)?([\w*$,\s{}]+?)\s+from\s+['"]([^'"]+)['"]/g;

type NameFilter = "all" | ReadonlySet<string>;

const clauseNames = (clause: string): NameFilter => {
  const c = clause.trim();
  if (c.startsWith("*")) return "all";
  const names = new Set<string>();
  for (const part of c.replace(/[{}]/g, "").split(",")) {
    const segs = part.trim().replace(/^type\s+/, "").split(/\s+as\s+/);
    const name = segs[0]?.trim();
    if (name !== undefined && name !== "") {
      // For `import { a as b }` the local name is b but the export is a;
      // keep the exported name so it can match a barrel's re-export.
      names.add(segs.length > 1 ? segs[0]!.trim() : name);
    }
  }
  return names.size === 0 ? "all" : names;
};

const exportClauseNames = (clause: string): NameFilter => {
  const c = clause.trim();
  if (c.startsWith("*")) return "all";
  const names = new Set<string>();
  for (const part of c.replace(/[{}]/g, "").split(",")) {
    const segs = part.trim().replace(/^type\s+/, "").split(/\s+as\s+/);
    const name = (segs[segs.length - 1] ?? "").trim();
    if (name !== "") names.add(name);
  }
  return names.size === 0 ? "all" : names;
};

const normalizePath = (path: string): string => {
  const out: string[] = [];
  for (const seg of path.split("/")) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") out.pop();
    else out.push(seg);
  }
  return `/${out.join("/")}`;
};

const withExtension = (base: string): string | undefined => {
  const candidates = base.endsWith(".ts") || base.endsWith(".json")
    ? [base]
    : [`${base}.ts`, `${base}.json`, `${base}/index.ts`];
  return candidates.find((p) => rawBlockSources[p] !== undefined);
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

const SIDEBAR_DATA_FILE = /^\/src\/demo\/blocks\/sidebar-\d+\.ts$/;

type Dep = Readonly<{ path: string; filter: NameFilter }>;

const dependencyPaths = (
  name: string,
  fromPath: string,
  source: string,
  filter: NameFilter,
  otherRendererDir: string,
): ReadonlyArray<Dep> => {
  const deps: Dep[] = [];
  const push = (specifier: string, names: NameFilter) => {
    const path = resolveSpecifier(fromPath, specifier);
    if (path === undefined || path === fromPath) return;
    if (
      SIDEBAR_DATA_FILE.test(path) &&
      path !== `/src/demo/blocks/${name}.ts`
    ) {
      return;
    }
    // The other renderer's component tree is never part of this block.
    if (path.startsWith(otherRendererDir)) return;
    deps.push({ path, filter: names });
  };

  // A filtered file (a barrel reached via named imports) only expands the
  // re-exports the importer actually used; its own imports still count.
  for (const match of source.matchAll(IMPORT_CLAUSE)) {
    push(match[2]!, filter === "all" ? clauseNames(match[1]!) : "all");
  }
  for (const match of source.matchAll(EXPORT_CLAUSE)) {
    const exported = exportClauseNames(match[1]!);
    if (filter === "all") {
      push(match[2]!, exported);
    } else if (exported === "all" || [...exported].some((n) => filter.has(n))) {
      push(match[2]!, "all");
    }
  }
  for (const match of source.matchAll(BARE_IMPORT)) {
    push(match[1]!, "all");
  }
  return deps;
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
    const rendererDir =
      renderer === "stylex" ? "/src/stylex/" : "/src/ui/";
    const otherRendererDir =
      renderer === "stylex" ? "/src/ui/" : "/src/stylex/";
    const walkable = (path: string): boolean =>
      path.startsWith(rendererDir) || path.startsWith("/src/lib/");
    const included = new Set([primary]);
    const ordered = [primary];
    // The block's own source plus the components it uses: demo files and
    // anything outside the renderer/lib dirs are leaves; barrel index files
    // only expand the re-exports an importer actually named.
    const queue: { path: string; source: string; filter: NameFilter }[] = [
      { path: primary, source: primarySource, filter: "all" },
    ];
    const walkedAll = new Set([primary]);
    const barrelExpanded = new Map<string, Set<string>>();
    while (queue.length > 0) {
      const { path, source, filter } = queue.shift()!;
      let effective = filter;
      if (effective !== "all") {
        const prev = barrelExpanded.get(path) ?? new Set<string>();
        const fresh = new Set([...effective].filter((n) => !prev.has(n)));
        if (fresh.size === 0) continue;
        barrelExpanded.set(path, new Set([...prev, ...fresh]));
        effective = fresh;
      }
      for (const dep of dependencyPaths(name, path, source, effective, otherRendererDir)) {
        if (!included.has(dep.path)) {
          included.add(dep.path);
          ordered.push(dep.path);
        }
        if (!walkable(dep.path)) continue;
        const depFilter =
          dep.path.endsWith("/index.ts") && dep.filter !== "all"
            ? dep.filter
            : "all";
        if (depFilter === "all") {
          if (walkedAll.has(dep.path)) continue;
          walkedAll.add(dep.path);
        }
        queue.push({
          path: dep.path,
          source: await loadSource(dep.path),
          filter: depFilter,
        });
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
