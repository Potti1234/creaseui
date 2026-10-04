import type { DocsExample } from '@/docs/components/page-definition'
import { foldkitApplication } from '@/docs/components/pages/authored-page'

export type CheckboxListFixtureItem = Readonly<{
  label: string
  value: string
  description?: string
  endContent?: Readonly<{
    variant: 'default' | 'secondary' | 'outline'
    label: string
  }>
}>

export type CheckboxListFixture = Readonly<{
  kind: 'showcase' | 'selectAll' | 'endContent'
  title: string
  description: string
  label: string
  helperText?: string
  initialValue: ReadonlyArray<string>
  hasDividers?: boolean
  items: ReadonlyArray<CheckboxListFixtureItem>
}>

/* Example set ported from Meta Astryx
   packages/cli/assets/templates/blocks/components/CheckboxList/*.tsx —
   same demos, same labels. */
export const checkboxListDocuments: ReadonlyArray<{
  id: string
  label: string
}> = [
  { id: 'transactions', label: 'Transaction history' },
  { id: 'statements', label: 'Account statements' },
  { id: 'tax', label: 'Tax documents' },
  { id: 'invoices', label: 'Invoices' },
]

export const checkboxListFixtures: Readonly<
  [CheckboxListFixture, ...Array<CheckboxListFixture>]
> = [
  {
    kind: 'showcase',
    title: 'Checkbox List',
    description: 'A checkbox list for notification preferences.',
    label: 'Notification preferences',
    helperText: 'Choose how you would like to be notified',
    initialValue: ['email'],
    hasDividers: true,
    items: [
      {
        label: 'Email',
        value: 'email',
        description: 'Weekly digest every Monday',
      },
      {
        label: 'Push notification',
        value: 'push',
        description: 'Instant alerts on your device',
      },
      {
        label: 'SMS',
        value: 'sms',
        description: 'Standard messaging rates apply',
      },
    ],
  },
  {
    kind: 'selectAll',
    title: 'CheckboxList — Select All With Indeterminate',
    description:
      'A "select all" toggle at the top of a checkbox list that switches to an indeterminate dash when only some items are checked, useful for bulk actions like exporting documents or assigning permissions where users often want everything at once.',
    label: 'Include in export',
    initialValue: ['transactions'],
    items: checkboxListDocuments.map(doc => ({
      label: doc.label,
      value: doc.id,
    })),
  },
  {
    kind: 'endContent',
    title: 'CheckboxList — With End Content',
    description:
      'Badges in the trailing slot show contextual info, like a price or status, next to each option without cluttering the label, so users can compare choices at a glance.',
    label: 'Add-on packages',
    initialValue: ['free'],
    hasDividers: true,
    items: [
      {
        label: 'Free tier',
        value: 'free',
        description: 'Basic features included',
        endContent: { variant: 'secondary', label: '$0/mo' },
      },
      {
        label: 'Pro tier',
        value: 'pro',
        description: 'Advanced analytics and integrations',
        endContent: { variant: 'default', label: '$9/mo' },
      },
      {
        label: 'Enterprise',
        value: 'enterprise',
        description: 'Custom solutions and dedicated support',
        endContent: { variant: 'outline', label: 'Custom' },
      },
    ],
  },
]

const ui = (renderer: 'tailwind' | 'stylex'): string =>
  renderer === 'stylex' ? 'stylex' : 'ui'

const itemsSource = (
  fixture: CheckboxListFixture,
  renderer: 'tailwind' | 'stylex',
): string => {
  if (fixture.kind === 'selectAll') {
    return `const DOCUMENTS = [
${checkboxListDocuments.map(doc => `  { id: '${doc.id}', label: '${doc.label}' },`).join('\n')}
]

const items = ({
  selected,
}: Readonly<{ selected: ReadonlyArray<string> }>,
  h: HtmlBuilder<Message>,
): ReadonlyArray<CheckboxList.CheckboxListEntry<Message>> => {
  const allChecked = DOCUMENTS.every(doc => selected.includes(doc.id))
  const noneChecked = selected.length === 0
  const selectAllState: boolean | 'indeterminate' = allChecked
    ? true
    : noneChecked
      ? false
      : 'indeterminate'
  return [
    {
      label: 'Select all',
      isChecked: selectAllState,
      onToggle: checked =>
        ChangedValue({ values: checked ? DOCUMENTS.map(doc => doc.id) : [] }),
    },
    CheckboxList.checkboxListDivider,
    ...DOCUMENTS.map(doc => ({
      label: doc.label,
      isChecked: selected.includes(doc.id),
      onToggle: (checked: boolean) =>
        ChangedValue({
          values: checked
            ? [...selected, doc.id]
            : selected.filter(value => value !== doc.id),
        }),
    })),
  ]
}`
  }
  return `const items = ({
  selected,
}: Readonly<{ selected: ReadonlyArray<string> }>,
  h: HtmlBuilder<Message>,
): ReadonlyArray<CheckboxList.CheckboxListEntry<Message>> => [
${fixture.items
  .map(
    item => `  {
    label: '${item.label}',
    value: '${item.value}',${item.description === undefined ? '' : `\n    description: '${item.description}',`}${item.endContent === undefined ? '' : `\n    endContent: Badge.badge({ variant: '${item.endContent.variant}', children: ['${item.endContent.label}'] }, h),`}
  },`,
  )
  .join('\n')}
]`
}

const source = (index: number, renderer: 'tailwind' | 'stylex'): string => {
  const fixture = checkboxListFixtures[index] ?? checkboxListFixtures[0]
  const isEndContent = fixture.kind === 'endContent'
  const extraImports = isEndContent
    ? `\nimport * as Badge from '@/${ui(renderer)}/badge'`
    : ''
  return foldkitApplication({
    title: `CheckboxList — ${fixture.title}`,
    imports: `import { Schema as S } from 'effect'
import { Runtime, Subscription, Update } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'

import * as CheckboxList from '@/${ui(renderer)}/checkbox-list'${extraImports}`,
    model: `export const Model = S.Struct({ value: S.Array(S.String) })
export type Model = typeof Model.Type`,
    messages: `import { taggedStruct } from 'foldkit/schema'
export const ChangedValue = taggedStruct('ChangedValue', { values: S.Array(S.String) });
export const Message = S.Union([ChangedValue])
export type Message = typeof Message.Type`,
    init: `export const init = (): Update.Return<Model, Message> => ({ model: {
    value: [${fixture.initialValue.map(value => `'${value}'`).join(', ')}],
  } })`,
    update: `export const update = (model: Model, message: Message): Update.Return<Model, Message> => {
  switch (message._tag) {
    case 'ChangedValue':
      return { model: { ...model, value: message.values } }
  }
}`,
    view: `${itemsSource(fixture, renderer)}

export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'CheckboxList — ${fixture.title}',
  body: h.main([h.Class('mx-auto flex min-h-screen w-full max-w-md items-center p-8')], [
    CheckboxList.checkboxList(
      {
        id: 'docs-checkbox-list',
        label: '${fixture.label}',${fixture.helperText === undefined ? '' : `\n        description: '${fixture.helperText}',`}
        value: model.value,
        onChange: values => ChangedValue({ values }),${fixture.hasDividers === true ? '\n        hasDividers: true,' : ''}
        items: items({ selected: model.value }, h),
      },
      h,
    ),
  ]),
})`,
  })
}

export const checkboxListExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> =>
  checkboxListFixtures.map((fixture, index) => ({
    title: fixture.title,
    description: fixture.description,
    code: source(index, renderer),
  }))
