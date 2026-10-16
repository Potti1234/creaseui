import { Tabs as TabsPrimitive } from '@foldkit/ui'
import { Option, Schema as S } from 'effect'
import { Command, Runtime } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

/* R3 settings fixture: Tabs whose panels hold real controls. Keyboard
   activation, panel swapping and a control inside the active panel must
   behave the same with every renderer's kit. */
export type SettingsKit = Readonly<{
  tabs: <Msg>(
    props: Readonly<{
      model: TabsPrimitive.Model
      selectedValue: string
      toParentMessage: (message: TabsPrimitive.Message) => Msg
      ariaLabel: string
      tabs: ReadonlyArray<
        Readonly<{ value: string; label: string; content: Html | string }>
      >
    }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  tabsUpdate: ReturnType<typeof TabsPrimitive.create<string>>['update']
  switchControl: <Msg>(
    props: Readonly<{
      id: string
      label: string
      isChecked: boolean
      onToggle: (isChecked: boolean) => Msg
    }>,
    h: HtmlBuilder<Msg>,
  ) => Html
}>

const Model = S.Struct({
  tabs: TabsPrimitive.Model,
  selected: S.String,
  digest: S.Boolean,
})
type Model = typeof Model.Type

const Message = defineMessageUnion({
  GotTabsMessage: { message: TabsPrimitive.Message },
  ToggledDigest: { isChecked: S.Boolean },
})
type Message = typeof Message.Type

const update = (kit: SettingsKit) => (model: Model, message: Message) => {
  switch (message._tag) {
    case 'GotTabsMessage': {
      const next = kit.tabsUpdate(model.tabs, message.message)
      return {
        model: {
          ...model,
          tabs: next.model,
          selected: Option.match(Option.fromNullishOr(next.outMessage), {
            onNone: () => model.selected,
            onSome: selected => selected.value,
          }),
        },
        commands: Command.mapMessages(next.commands ?? [], (inner): Message =>
          Message.GotTabsMessage({ message: inner }),
        ),
      }
    }
    case 'ToggledDigest':
      return { model: { ...model, digest: message.isChecked } }
  }
}

const view =
  (kit: SettingsKit) =>
  (model: Model, h: HtmlBuilder<Message>): Html =>
    h.section(
      [h.Id('settings')],
      [
        kit.tabs(
          {
            model: model.tabs,
            selectedValue: model.selected,
            toParentMessage: message => Message.GotTabsMessage({ message }),
            ariaLabel: 'Settings sections',
            tabs: [
              {
                value: 'profile',
                label: 'Profile',
                content: h.p([], ['Public profile details.']),
              },
              {
                value: 'notifications',
                label: 'Notifications',
                content: kit.switchControl(
                  {
                    id: 'digest',
                    label: 'Weekly digest',
                    isChecked: model.digest,
                    onToggle: isChecked => Message.ToggledDigest({ isChecked }),
                  },
                  h,
                ),
              },
            ],
          },
          h,
        ),
        h.p(
          [h.Id('settings-status')],
          [model.digest ? 'Digest on' : 'Digest off'],
        ),
      ],
    )

export const runSettings = (kit: SettingsKit) =>
  Runtime.run(
    Runtime.makeElement({
      Model,
      init: () => ({
        model: {
          tabs: TabsPrimitive.init({ id: 'settings-tabs' }),
          selected: 'profile',
          digest: false,
        },
      }),
      update: update(kit),
      view: view(kit),
      container: document.getElementById('settings-root'),
      devTools: false,
    }),
  )
