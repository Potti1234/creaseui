import { Schema as S } from 'effect'
import { Runtime } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

/* R3 dashboard fixture: a KPI row of Stats. Values must use tabular digits
   and the row must reflow without horizontal overflow at phone widths. */
export type DashboardKit = Readonly<{
  stat: <Msg>(
    props: Readonly<{
      label: string
      value: string
      delta?: Readonly<{ value: string; direction: 'up' | 'down' | 'flat' }>
      description?: string
    }>,
    h: HtmlBuilder<Msg>,
  ) => Html
}>

const STATS = [
  ['Total revenue', '$1.28M', '+12.4%', 'up'],
  ['Error rate', '0.42%', '-0.08%', 'down'],
  ['Active users', '18,204', '0.0%', 'flat'],
] as const

const Model = S.Struct({})
type Model = typeof Model.Type

const Message = defineMessageUnion({ Noop: {} })
type Message = typeof Message.Type

const view =
  (kit: DashboardKit) =>
  (_model: Model, h: HtmlBuilder<Message>): Html =>
    h.section(
      [
        h.Id('dashboard'),
        h.Attribute(
          'style',
          'display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,1fr));gap:1rem',
        ),
      ],
      STATS.map(([label, value, delta, direction]) =>
        kit.stat(
          {
            label,
            value,
            delta: { value: delta, direction },
            description: 'vs. previous 30 days',
          },
          h,
        ),
      ),
    )

export const runDashboard = (kit: DashboardKit) =>
  Runtime.run(
    Runtime.makeElement({
      Model,
      init: () => ({ model: {} }),
      update: (model: Model) => ({ model }),
      view: view(kit),
      container: document.getElementById('dashboard-root'),
      devTools: false,
    }),
  )
