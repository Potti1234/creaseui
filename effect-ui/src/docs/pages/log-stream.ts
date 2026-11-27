import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Button, LogStream } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

type Entry = {
  readonly id: string
  readonly timestamp: string
  readonly level: 'info' | 'warn' | 'error' | 'debug'
  readonly source?: string
  readonly message: string
  readonly detail?: string
}
const entry = (
  id: string,
  timestamp: string,
  level: Entry['level'],
  source: string,
  message: string,
  detail?: string,
): Entry => ({
  id,
  timestamp,
  level,
  source,
  message,
  ...(detail === undefined ? {} : { detail }),
})
const buildEntries: ReadonlyArray<Entry> = [
  entry(
    'b-01',
    '12:04:16.002',
    'info',
    'build',
    'Build machine: 4 cores, 8 GB RAM (iad1)',
  ),
  entry(
    'b-02',
    '12:04:16.089',
    'info',
    'build',
    'Cloning github.com/acme/creaseui-console (branch: main)',
  ),
  entry('b-03', '12:04:18.021', 'info', 'stage', 'Install'),
  entry(
    'b-04',
    '12:04:18.144',
    'info',
    'install',
    '$ pnpm install --frozen-lockfile',
  ),
  entry('b-05', '12:04:23.348', 'info', 'build', '$ vite build'),
  entry(
    'b-06',
    '12:04:38.207',
    'warn',
    'build',
    'Compiled with warnings (1)',
    './src/pages/logs.ts\n42:9 Warning: "range" is assigned a value but never used.',
  ),
  entry(
    'b-07',
    '12:04:45.201',
    'info',
    'deploy',
    'Uploading build outputs (23.4 MB)',
  ),
  entry('b-08', '12:04:50.004', 'info', 'deploy', 'Build completed in 34s'),
]
const logEntries: ReadonlyArray<Entry> = [
  entry(
    'l-01',
    '14:02:08.114',
    'info',
    'api-gateway',
    'GET /v1/projects 200 in 42ms',
  ),
  entry(
    'l-02',
    '14:02:08.371',
    'debug',
    'auth',
    'token cache hit for key sess_7f31',
  ),
  entry(
    'l-03',
    '14:02:09.243',
    'warn',
    'billing',
    'upstream latency 1840ms exceeds 1500ms budget',
    '{\n  "upstream": "payments.stripe",\n  "latencyMs": 1840,\n  "budgetMs": 1500,\n  "traceId": "tr_9c41b2"\n}',
  ),
  entry(
    'l-04',
    '14:02:10.037',
    'error',
    'billing',
    'charge failed: upstream returned 502',
    '{\n  "error": "UpstreamBadGateway",\n  "attempt": 1,\n  "retryInMs": 400,\n  "invoice": "inv_20418"\n}',
  ),
  entry(
    'l-05',
    '14:02:11.305',
    'info',
    'billing',
    'charge succeeded for inv_20418 in 322ms',
  ),
  entry(
    'l-06',
    '14:02:13.078',
    'debug',
    'api-gateway',
    'route table reloaded (37 routes)',
  ),
]
const live: ReadonlyArray<Omit<Entry, 'id'>> = [
  {
    timestamp: '14:02:14.102',
    level: 'info',
    source: 'api-gateway',
    message: 'GET /v1/projects 200 in 38ms',
  },
  {
    timestamp: '14:02:15.310',
    level: 'debug',
    source: 'auth',
    message: 'token cache hit for key sess_9a02',
  },
  {
    timestamp: '14:02:17.708',
    level: 'warn',
    source: 'billing',
    message: 'webhook delivery slow: 2210ms to partner.acme',
  },
  {
    timestamp: '14:02:20.131',
    level: 'error',
    source: 'worker',
    message: 'job usage-rollup-0415 failed: table locked',
  },
]

const staticView =
  (
    entries: ReadonlyArray<Entry>,
    variant: 'default' | 'terminal',
  ): DocsExampleImplementation['view'] =>
  (h, context) =>
    h.div.class('w-full max-w-3xl').children(
      LogStream(h, {
        id: `${context.idPrefix}-${variant}`,
        entries,
        variant,
        maxHeight: 360,
        label: variant === 'terminal' ? 'Build logs' : 'Log results',
      }),
    )

const Message = UiSchema.TaggedEnum({ Appended: {}, Reset: {} })
const FollowDemo = Html.component({
  name: 'DocsLogStreamFollow',
  props: Schema.Struct({ idPrefix: Schema.String }),
  model: Schema.Struct({ extra: Schema.Number }),
  message: Message,
}).make({
  init: () => ({ extra: 0 }),
  update: {
    Appended: $ => $.evolve({ extra: $.model.extra + 1 }),
    Reset: $ => $.evolve({ extra: 0 }),
  },
  view: (h, model) => {
    const additions = Array.from({ length: model.extra }, (_, index) => ({
      id: `live-${index}`,
      ...live[index % live.length]!,
    }))
    return h.div.class('w-full max-w-3xl grid gap-2').children(
      h.div.class('flex gap-2').children(
        Button(h, { variant: 'outline', size: 'sm' })
          .on('click', () => Message.Appended())
          .children('Append entry'),
        Button(h, { variant: 'outline', size: 'sm' })
          .on('click', () => Message.Reset())
          .children('Reset'),
      ),
      LogStream(h, {
        id: `${h.props.idPrefix}-follow-stream`,
        entries: [...logEntries, ...additions],
        maxHeight: 320,
        label: 'Controlled log stream',
      }),
    )
  },
})
const follow: DocsExampleImplementation['view'] = (h, context) =>
  FollowDemo(h, {
    key: `${context.idPrefix}-follow`,
    props: { idPrefix: context.idPrefix },
  })
const source = exampleApplicationSource({
  imports: `import { LogStream } from '@/ui/effect/ui'`,
  body: `LogStream(h, { entries, maxHeight: 360, label: 'Build logs' })`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { LogStream } from '@/ui/effect/ui'\n\nLogStream(h, { entries, label: 'Log stream' })`,
  examples: [
    { title: 'Build logs', view: staticView(buildEntries, 'terminal'), source },
    { title: 'Log results', view: staticView(logEntries, 'default'), source },
    { title: 'Controlled follow', view: follow, source },
  ],
})
