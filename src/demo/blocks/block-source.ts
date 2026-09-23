type BlockRenderer = "tailwind" | "stylex";

const rawBlockSources = import.meta.glob(
  ["/src/demo/blocks/*.ts", "/src/demo/blocks-stylex/*.ts"],
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

export const loadBlockSource = async (
  renderer: BlockRenderer,
  name: string,
): Promise<string> => {
  const load = rawBlockSources[blockSourcePath(renderer, name)];
  if (load === undefined) return "// Source unavailable for this block.";
  try {
    return (await load()) as string;
  } catch {
    return "// Failed to load block source.";
  }
};
