import { Schema as S } from 'effect'
import { Runtime } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

/* R3 mixed-form fixture: one renderer-neutral Model/update/view. Renderer
   entry points only pass their styled component modules (the "kit"). The
   kit types list just the props this fixture uses, so every renderer's
   wider component signature satisfies them. */
type Field<Msg> = Readonly<{
  id: string
  label: string
  value: string
}> & { onInput: (value: string) => Msg }

export type Kit = Readonly<{
  button: <Msg>(
    props: Readonly<{
      variant?: 'outline'
      onClick?: Msg
      children: ReadonlyArray<string>
    }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  input: <Msg>(
    props: Field<Msg> &
      Readonly<{
        isRequired: boolean
        isInvalid: boolean
        description: string
      }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  textarea: <Msg>(props: Field<Msg>, h: HtmlBuilder<Msg>) => Html
  nativeSelect: <Msg>(
    props: Readonly<{
      id: string
      label: string
      value: string
      onChange: (value: string) => Msg
      options: ReadonlyArray<Readonly<{ value: string; label: string }>>
    }>,
    h: HtmlBuilder<Msg>,
  ) => Html
  checkbox: <Msg>(
    props: Readonly<{
      id: string
      label: string
      isChecked: boolean
      onToggle: (isChecked: boolean) => Msg
      isInvalid?: boolean
      description?: string
    }>,
    h: HtmlBuilder<Msg>,
  ) => Html
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
  name: S.String,
  bio: S.String,
  plan: S.String,
  terms: S.Boolean,
  updates: S.Boolean,
  attempted: S.Boolean,
  saved: S.Boolean,
})
type Model = typeof Model.Type

const Message = defineMessageUnion({
  ChangedName: { value: S.String },
  ChangedBio: { value: S.String },
  ChangedPlan: { value: S.String },
  ToggledTerms: { isChecked: S.Boolean },
  ToggledUpdates: { isChecked: S.Boolean },
  ClickedSave: {},
})
type Message = typeof Message.Type

const isValid = (model: Model) => model.name.trim() !== '' && model.terms

const update = (model: Model, message: Message): { model: Model } => {
  switch (message._tag) {
    case 'ChangedName':
      return { model: { ...model, name: message.value, saved: false } }
    case 'ChangedBio':
      return { model: { ...model, bio: message.value, saved: false } }
    case 'ChangedPlan':
      return { model: { ...model, plan: message.value, saved: false } }
    case 'ToggledTerms':
      return { model: { ...model, terms: message.isChecked, saved: false } }
    case 'ToggledUpdates':
      return { model: { ...model, updates: message.isChecked, saved: false } }
    case 'ClickedSave':
      return { model: { ...model, attempted: true, saved: isValid(model) } }
  }
}

const view =
  (kit: Kit) =>
  (model: Model, h: HtmlBuilder<Message>): Html => {
    const nameInvalid = model.attempted && model.name.trim() === ''
    const termsInvalid = model.attempted && !model.terms
    return h.div(
      [h.Id('fixture')],
      [
        kit.input(
          {
            id: 'name',
            label: 'Display name',
            value: model.name,
            onInput: value => Message.ChangedName({ value }),
            isRequired: true,
            isInvalid: nameInvalid,
            description: nameInvalid
              ? 'Enter a display name.'
              : 'Shown on your profile.',
          },
          h,
        ),
        kit.textarea(
          {
            id: 'bio',
            label: 'Bio',
            value: model.bio,
            onInput: value => Message.ChangedBio({ value }),
          },
          h,
        ),
        kit.nativeSelect(
          {
            id: 'plan',
            label: 'Plan',
            value: model.plan,
            onChange: value => Message.ChangedPlan({ value }),
            options: [
              { value: 'free', label: 'Free' },
              { value: 'pro', label: 'Pro' },
            ],
          },
          h,
        ),
        kit.checkbox(
          {
            id: 'terms',
            label: 'Accept terms',
            isChecked: model.terms,
            onToggle: isChecked => Message.ToggledTerms({ isChecked }),
            isInvalid: termsInvalid,
            ...(termsInvalid
              ? { description: 'You must accept the terms.' }
              : {}),
          },
          h,
        ),
        kit.switchControl(
          {
            id: 'updates',
            label: 'Product updates',
            isChecked: model.updates,
            onToggle: isChecked => Message.ToggledUpdates({ isChecked }),
          },
          h,
        ),
        h.div(
          [h.Id('actions')],
          [
            kit.button({ variant: 'outline', children: ['Cancel'] }, h),
            kit.button(
              { onClick: Message.ClickedSave(), children: ['Save'] },
              h,
            ),
          ],
        ),
        h.p(
          [h.Id('status')],
          [
            model.saved
              ? `Saved ${model.name} on ${model.plan}${model.updates ? ' with updates' : ''}`
              : model.attempted
                ? 'Fix the highlighted fields'
                : 'Not saved',
          ],
        ),
      ],
    )
  }

export const runMixedForm = (kit: Kit) =>
  Runtime.run(
    Runtime.makeElement({
      Model,
      init: () => ({
        model: {
          name: '',
          bio: '',
          plan: 'free',
          terms: false,
          updates: false,
          attempted: false,
          saved: false,
        },
      }),
      update,
      view: view(kit),
      container: document.getElementById('root'),
      devTools: false,
    }),
  )
