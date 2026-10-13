import { Schema as S } from 'effect'
import { Runtime } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

/* R3 actions-and-text fixture: joined button groups, heading/text roles,
   badges and an announced alert, shared by every renderer. */
type Children = ReadonlyArray<Html | string>

export type ActionsKit = Readonly<{
  button: <Msg>(
    props: Readonly<{
      variant?: 'outline'
      onClick?: Msg
      children: ReadonlyArray<string>
    }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  buttonGroup: <Msg>(
    props: Readonly<{ ariaLabel: string; children: Children }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  heading: <Msg>(
    props: Readonly<{ level: 2; children: Children }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  text: <Msg>(
    props: Readonly<{ color?: 'secondary'; children: Children }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  badge: <Msg>(
    props: Readonly<{ variant?: 'secondary'; children: Children }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  alert: <Msg>(
    props: Readonly<{ announcement: 'status'; children: Children }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  alertTitle: <Msg>(
    props: Readonly<{ children: Children }>,
    h: HtmlBuilder<Msg>,
  ) => Html
}>

const Model = S.Struct({ view: S.String })
type Model = typeof Model.Type

const Message = defineMessageUnion({ PickedView: { view: S.String } })
type Message = typeof Message.Type

const VIEWS = ['Day', 'Week', 'Month'] as const

const view =
  (kit: ActionsKit) =>
  (model: Model, h: HtmlBuilder<Message>): Html =>
    h.section(
      [h.Id('actions-text')],
      [
        kit.heading({ level: 2, children: ['Calendar view'] }, h),
        kit.text(
          { color: 'secondary', children: ['Pick how many days to show.'] },
          h,
        ),
        kit.buttonGroup(
          {
            ariaLabel: 'Calendar range',
            children: VIEWS.map(name =>
              kit.button(
                {
                  ...(model.view === name ? {} : { variant: 'outline' }),
                  onClick: Message.PickedView({ view: name }),
                  children: [name],
                },
                h,
              ),
            ),
          },
          h,
        ),
        kit.badge({ variant: 'secondary', children: [model.view] }, h),
        kit.alert(
          {
            announcement: 'status',
            children: [
              kit.alertTitle({ children: [`Showing ${model.view}`] }, h),
            ],
          },
          h,
        ),
      ],
    )

export const runActionsText = (kit: ActionsKit) =>
  Runtime.run(
    Runtime.makeElement({
      Model,
      init: () => ({ model: { view: 'Week' } }),
      update: (_model: Model, message: Message) => ({
        model: { view: message.view },
      }),
      view: view(kit),
      container: document.getElementById('actions-root'),
      devTools: false,
    }),
  )
