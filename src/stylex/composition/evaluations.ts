import type { TemplateId } from './templates'

export type EvaluationMode = 'static' | 'browser'

export type DesignSystemEvaluation = Readonly<{
  assertion: string
  id: string
  mode: EvaluationMode
  template: TemplateId
}>

/** Real tasks used to evaluate whether constraints produce coherent pages. */
export const DESIGN_SYSTEM_EVALUATIONS = [
  { assertion: 'uses dashboardShell with budgeted navigation and fill content', id: 'dashboard-structure', mode: 'static', template: 'dashboard-analytics' },
  { assertion: 'metric cards reflow without horizontal page overflow', id: 'dashboard-responsive', mode: 'browser', template: 'dashboard-analytics' },
  { assertion: 'table owns the full-width region and remains keyboard reachable', id: 'dashboard-table', mode: 'browser', template: 'dashboard-analytics' },
  { assertion: 'settings fields use formLayout and a capped form width', id: 'settings-readable', mode: 'static', template: 'settings-form' },
  { assertion: 'detail uses the panel budget and is absent from the narrow inline frame', id: 'master-detail-responsive', mode: 'browser', template: 'master-detail-records' },
  { assertion: 'filter controls wrap while retaining DOM and focus order', id: 'data-explorer-filters', mode: 'browser', template: 'data-explorer' },
  { assertion: 'changing semantic theme variables does not change recipe regions', id: 'commerce-theme-stability', mode: 'browser', template: 'commerce-catalog' },
  { assertion: 'executive narrative rail follows the scorecard at narrow widths', id: 'executive-responsive', mode: 'browser', template: 'astryx-executive-summary' },
  { assertion: 'funnel stages and cohort columns retain their authored order', id: 'cohort-order', mode: 'static', template: 'astryx-cohort-funnel' },
  { assertion: 'project risks are rows and the workstream table fills its region', id: 'project-structure', mode: 'static', template: 'astryx-project-status' },
  { assertion: 'service triage follows metric charts without horizontal overflow', id: 'service-responsive', mode: 'browser', template: 'astryx-service-monitoring' },
  { assertion: 'incident console uses dense table rows and a separate inspector region', id: 'incident-structure', mode: 'static', template: 'astryx-incident-console' },
  { assertion: 'six Apache ECharts hosts mount real canvases inside constrained StyleX regions', id: 'charts-mount', mode: 'browser', template: 'chart-analytics-dashboard' },
  { assertion: 'chart grid and insight rail remain horizontally contained at narrow widths', id: 'charts-responsive', mode: 'browser', template: 'chart-analytics-dashboard' },
] as const satisfies ReadonlyArray<DesignSystemEvaluation>

