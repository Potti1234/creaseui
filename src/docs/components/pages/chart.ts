import { authoredPage, staticComponentApplication } from '@/docs/components/pages/authored-page';
import * as Chart from '@/ui/chart';

const barSource = staticComponentApplication({
  componentName: 'Chart', componentSlug: 'chart', exampleName: 'Monthly revenue',
  viewBody: `Chart.barChart({
  class: 'max-w-xl',
  data: [
    { label: 'Jan', value: 186 },
    { label: 'Feb', value: 305 },
    { label: 'Mar', value: 237 },
    { label: 'Apr', value: 273 },
    { label: 'May', value: 209 },
    { label: 'Jun', value: 314 },
  ],
}, h),`,
});

const areaSource = staticComponentApplication({
  componentName: 'Chart', componentSlug: 'chart', exampleName: 'Traffic trend',
  viewBody: `h.div([h.Class('w-full max-w-xl space-y-4')], [
  Chart.areaChart({ data: [186, 305, 237, 273, 209, 314] }, h),
  Chart.chartLegend({
    config: { visitors: { label: 'Visitors', color: 'var(--chart-2)' } },
  }, h),
]),`,
});

export const chartPage = authoredPage({
  slug: 'chart', title: 'Chart', kind: 'recipe',
  previewMode: 'static',
  definition: {
    kind: 'recipe', description: 'Dependency-free SVG chart recipes and shared legend, tooltip, and series configuration helpers.',
    architecture: 'Chart helpers are pure view composition, not child Models. Keep live data and interaction in the parent, derive SVG from that Model, and introduce Messages only when the surrounding product behavior needs them.',
    apiHref: 'https://foldkit.dev/guide/html',
    composition: 'Parent domain Model\n└── view-derived chart data\n    ├── SVG renderer (bar / area / donut)\n    ├── optional series config\n    ├── legend\n    └── tooltip content',
    styling: 'Chart colors come from theme tokens or ChartConfig CSS variables. Size the outer layout; the SVG renderers preserve their viewBox and scale to the available width.',
    accessibility: 'Every renderer exposes an image role and accessible name. For decision-critical charts, pair the graphic with a concise text summary or an accessible data table; color alone must not carry meaning.',
    examples: [
      { title: 'Monthly revenue', description: 'A responsive bar chart is a pure projection of typed data and needs no update branch.', staticPreview: (_model, h) => Chart.barChart({ class: 'max-w-xl', data: [{ label: 'Jan', value: 186 }, { label: 'Feb', value: 305 }, { label: 'Mar', value: 237 }, { label: 'Apr', value: 273 }, { label: 'May', value: 209 }, { label: 'Jun', value: 314 }] }, h), code: barSource, previewClass: 'justify-stretch' },
      { title: 'Traffic trend', description: 'Area rendering and the shared legend remain separate helpers so the application controls composition.', staticPreview: (_model, h) => h.div([h.Class('w-full max-w-xl space-y-4')], [Chart.areaChart({ data: [186, 305, 237, 273, 209, 314] }, h), Chart.chartLegend({ config: { visitors: { label: 'Visitors', color: 'var(--chart-2)' } } }, h)]), code: areaSource, previewClass: 'justify-stretch' },
    ],
  },
});
