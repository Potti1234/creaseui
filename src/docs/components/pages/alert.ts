import type { HtmlBuilder } from 'foldkit/html'

import * as Alert from '@/ui/alert'
import * as Icon from '@/lib/icon'
import { authoredPage, staticComponentApplication } from '@/docs/components/pages/authored-page'

const examples = [
  { severity: 'info', announcement: 'static', title: 'Deployment window', description: 'Maintenance is scheduled for Saturday at 02:00 UTC.', icon: 'info' },
  { severity: 'success', announcement: 'status', title: 'Changes saved', description: 'Your workspace settings are now available to every project.', icon: 'circleCheck' },
  { severity: 'warning', announcement: 'status', title: 'Storage nearly full', description: 'This workspace has used 92% of its storage. Archive old build artifacts or increase the storage limit before the next release creates additional logs and source maps.', icon: 'triangleAlert' },
  { severity: 'error', announcement: 'alert', title: 'Upload failed', description: 'Check your connection and try again.', icon: 'octagonX' },
] as const

const preview = <Msg>(index: number, h: HtmlBuilder<Msg>) => {
  const item = examples[index] ?? examples[0]
  const icon = item.icon === 'circleCheck' ? Icon.circleCheck({}, h) : item.icon === 'triangleAlert' ? Icon.triangleAlert({}, h) : item.icon === 'octagonX' ? Icon.octagonX({}, h) : Icon.info({}, h)
  return Alert.alert({ severity: item.severity, announcement: item.announcement, class: 'max-w-xl', children: [Alert.alertIcon({ children: [icon] }, h), Alert.alertTitle({ children: [item.title] }, h), Alert.alertDescription({ children: [item.description] }, h)] }, h)
}

const source = (index: number): string => {
  const item = examples[index] ?? examples[0]
  return staticComponentApplication({
    componentName: 'Alert', componentSlug: 'alert', exampleName: item.title,
    componentImports: `import * as Icon from '@/lib/icon'`,
    viewBody: `Alert.alert({
  severity: '${item.severity}',
  announcement: '${item.announcement}',
  class: 'max-w-xl',
  children: [
    Alert.alertIcon({ children: [Icon.${item.icon}({}, h)] }, h),
    Alert.alertTitle({ children: ['${item.title}'] }, h),
    Alert.alertDescription({ children: ['${item.description}'] }, h),
  ],
}, h)`,
  })
}

export const alertPage = authoredPage({
  slug: 'alert', title: 'Alert', kind: 'helper', previewMode: 'static',
  definition: {
    kind: 'helper', description: 'Presents per-render feedback with explicit severity and announcement policy.',
    architecture: 'Alert owns no Model. Severity, icon, title, description, and whether new content should be static, politely announced, or assertively announced are required per-render decisions.',
    apiHref: 'https://foldkit.dev/ui/overview',
    composition: 'Alert[severity, announcement]\n├── AlertIcon (decorative)\n├── AlertTitle\n└── AlertDescription',
    styling: 'Semantic info, success, warning, and error tones share one two-column icon/content grid. Titles are not truncated, and long descriptions wrap within the container.',
    accessibility: 'announcement="static" adds no live-region role. "status" maps to polite status semantics for non-urgent updates. "alert" maps to assertive alert semantics and is reserved for urgent failures.',
    examples: [
      { title: 'Static information', description: 'Visible guidance does not announce merely because it rendered.', staticPreview: (_model, h) => preview(0, h), code: source(0) },
      { title: 'Polite success', description: 'A completed background action uses status semantics.', staticPreview: (_model, h) => preview(1, h), code: source(1) },
      { title: 'Long warning', description: 'Long warning content preserves icon, title, and description alignment.', staticPreview: (_model, h) => preview(2, h), code: source(2) },
      { title: 'Urgent error', description: 'Only an urgent newly rendered failure uses assertive alert semantics.', staticPreview: (_model, h) => preview(3, h), code: source(3) },
    ],
  },
})
