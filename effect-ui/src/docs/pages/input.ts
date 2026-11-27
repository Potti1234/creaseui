import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import {
  Badge,
  Button,
  ButtonGroup,
  FileInput,
  Icon,
  Input,
  InputGroup,
  Select,
} from '#components'
import { InputBehavior } from '../../behaviors/input'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const Message = UiSchema.TaggedEnum({
  ChangedInputValue: { field: Schema.String, value: Schema.String },
  PickedCountry: { value: Schema.NullOr(Schema.String) },
  RequestedOpenCountry: {},
  RequestedCloseCountry: {},
  ChangedFiles: { names: Schema.Array(Schema.String) },
})

const Model = Schema.Struct({
  values: Schema.Record(Schema.String, Schema.String),
  country: Schema.NullOr(Schema.String),
  countryOpen: Schema.Boolean,
  files: Schema.Array(Schema.String),
})

const countries = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
]

const InputDemo = Html.component({
  name: 'DocsInputDemo',
  props: Schema.Struct({ kind: Schema.String, idPrefix: Schema.String }),
  model: Model,
  message: Message,
}).make({
  init: () => ({ values: {}, country: 'us', countryOpen: false, files: [] }),
  update: {
    ChangedInputValue: ($, { field, value }) =>
      $.evolve({ values: values => ({ ...values, [field]: value }) }),
    PickedCountry: ($, { value }) =>
      $.evolve({ country: value, countryOpen: false }),
    RequestedOpenCountry: $ => $.evolve({ countryOpen: true }),
    RequestedCloseCountry: $ => $.evolve({ countryOpen: false }),
    ChangedFiles: ($, { names }) => $.evolve({ files: names }),
  },
  view: (h, model) => {
    const kind = h.props.kind
    const prefix = h.props.idPrefix
    const input = (
      key: string,
      id: string,
      options: {
        placeholder?: string
        type?: string
        disabled?: boolean
        invalid?: boolean
        required?: boolean
      } = {},
    ) =>
      Input(h, {
        id,
        ...(options.invalid === true ? { invalid: true } : {}),
        element: h.input.attrs({
          ...(options.type === undefined ? {} : { type: options.type }),
          ...(options.placeholder === undefined
            ? {}
            : { placeholder: options.placeholder }),
          ...(options.required === true ? { required: '' } : {}),
        }),
        props: {
          value: model.values[key] ?? '',
          ...(options.disabled === true ? { disabled: true } : {}),
        },
        onUpdate: ({ value }) =>
          Message.ChangedInputValue({ field: key, value }),
      })
    const label = (id: string, children: unknown) =>
      h.label
        .class('flex w-fit gap-2 text-sm leading-snug font-medium')
        .attr('for', id)
        .children(children as never)
    const description = (text: string) =>
      h.p.class('text-sm leading-normal text-muted-foreground').children(text)
    const field = (...children: Array<unknown>) =>
      h.div
        .class('grid min-w-0 gap-2')
        .attr('data-slot', 'field')
        .children(...(children as never[]))
    const group = (...children: Array<unknown>) =>
      h.div
        .class('flex min-w-0 flex-col gap-6')
        .attr('data-slot', 'field-group')
        .children(...(children as never[]))
    const horizontalActions = (...children: Array<unknown>) =>
      h.div
        .class(
          'grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,2fr)] items-center gap-2',
        )
        .attr('data-slot', 'field')
        .children(...(children as never[]))

    let content: unknown
    switch (kind) {
      case 'basic':
        content = input('basic', `${prefix}-basic`, {
          placeholder: 'Enter text',
        })
        break
      case 'field':
        content = field(
          label(`${prefix}-username`, 'Username'),
          input('username', `${prefix}-username`, {
            type: 'text',
            placeholder: 'Enter your username',
          }),
          description('Choose a unique username for your account.'),
        )
        break
      case 'fieldGroup':
        content = group(
          field(
            label(`${prefix}-name`, 'Name'),
            input('name', `${prefix}-name`, { placeholder: 'Jordan Lee' }),
          ),
          field(
            label(`${prefix}-email`, 'Email'),
            input('email', `${prefix}-email`, {
              type: 'email',
              placeholder: 'name@example.com',
            }),
            description(`We'll send updates to this address.`),
          ),
          horizontalActions(
            h.div,
            h.div
              .class('flex gap-2')
              .children(
                Button(h, { variant: 'outline', type: 'reset' }).children(
                  'Reset',
                ),
                Button(h, { type: 'submit' }).children('Submit'),
              ),
          ),
        )
        break
      case 'disabled':
        content = field(
          label(`${prefix}-disabled`, 'Email'),
          input('disabled', `${prefix}-disabled`, {
            type: 'email',
            placeholder: 'Email',
            disabled: true,
          }),
          description('This field is currently disabled.'),
        )
        break
      case 'invalid':
        content = field(
          label(`${prefix}-invalid`, 'Invalid Input'),
          input('invalid', `${prefix}-invalid`, {
            placeholder: 'Error',
            invalid: true,
          }),
          description('This field contains validation errors.'),
        )
        break
      case 'file':
        content = FileInput(h, {
          key: 'picture',
          id: `${prefix}-picture`,
          label: 'Picture',
          description: 'Select a picture to upload.',
          files: model.files.map(name => ({ name })),
          props: {},
          onFiles: ({ accepted }) =>
            Message.ChangedFiles({ names: accepted.map(file => file.name) }),
        })
        break
      case 'inline':
        content = h.div
          .class('grid grid-cols-[minmax(0,1fr)_auto] gap-2')
          .children(
            input('search', `${prefix}-search`, {
              type: 'search',
              placeholder: 'Search...',
            }),
            Button(h, {}).children('Search'),
          )
        break
      case 'grid':
        content = h.div.class('grid max-w-sm grid-cols-2 gap-4').children(
          field(
            label(`${prefix}-first-name`, 'First Name'),
            input('firstName', `${prefix}-first-name`, {
              placeholder: 'Jordan',
            }),
          ),
          field(
            label(`${prefix}-last-name`, 'Last Name'),
            input('lastName', `${prefix}-last-name`, { placeholder: 'Lee' }),
          ),
        )
        break
      case 'required':
        content = field(
          label(`${prefix}-required`, [
            'Required Field ',
            h.span.class('text-destructive').children('*'),
          ] as never),
          input('required', `${prefix}-required`, {
            placeholder: 'This field is required',
            required: true,
          }),
          description('This field must be filled out.'),
        )
        break
      case 'badge':
        content = field(
          label(`${prefix}-badge`, [
            'Webhook URL ',
            Badge(h, { variant: 'secondary' })
              .class('ml-auto')
              .children('Beta'),
          ] as never),
          input('webhookUrl', `${prefix}-badge`, {
            type: 'url',
            placeholder: 'https://api.example.com/webhook',
          }),
        )
        break
      case 'inputGroup':
        content = field(
          label(`${prefix}-group-url`, 'Website URL'),
          InputGroup(h, {
            focusControlId: `${prefix}-group-url`,
            addOns: {
              'inline-start': h.span
                .class(
                  'inline-flex items-center gap-2 text-sm text-muted-foreground',
                )
                .children('https://'),
              'inline-end': Icon(h, { name: 'info', size: 'sm' }),
            },
            control: group =>
              group.input(
                InputBehavior(h, {
                  element: h.input.attrs({
                    id: `${prefix}-group-url`,
                    placeholder: 'example.com',
                  }),
                  props: { value: model.values['websiteUrl'] ?? '' },
                  onUpdate: ({ value }) =>
                    Message.ChangedInputValue({ field: 'websiteUrl', value }),
                }),
              ),
          }),
        )
        break
      case 'buttonGroup':
        content = field(
          label(`${prefix}-button-group`, 'Search'),
          ButtonGroup(h, {
            children: [
              input('searchButton', `${prefix}-button-group`, {
                placeholder: 'Type to search...',
              }),
              Button(h, { variant: 'outline' }).children('Search'),
            ],
          }),
        )
        break
      case 'form':
        content = h.form.class('w-full max-w-sm').children(
          group(
            field(
              label(`${prefix}-form-name`, 'Name'),
              input('formName', `${prefix}-form-name`, {
                type: 'text',
                placeholder: 'Evil Rabbit',
                required: true,
              }),
            ),
            field(
              label(`${prefix}-form-email`, 'Email'),
              input('formEmail', `${prefix}-form-email`, {
                type: 'email',
                placeholder: 'john@example.com',
              }),
              description(`We'll never share your email with anyone.`),
            ),
            h.div.class('grid grid-cols-2 gap-4').children(
              field(
                label(`${prefix}-form-phone`, 'Phone'),
                input('formPhone', `${prefix}-form-phone`, {
                  type: 'tel',
                  placeholder: '+1 (555) 123-4567',
                }),
              ),
              field(
                label(`${prefix}-form-country`, 'Country'),
                Select(h, {
                  key: 'country',
                  ariaLabel: 'Country',
                  props: {
                    open: model.countryOpen,
                    items: countries,
                    value: model.country,
                  },
                  onEmit: {
                    Picked: ({ value }) =>
                      typeof value === 'string' || value === null
                        ? Message.PickedCountry({ value })
                        : undefined,
                    RequestedOpen: () => Message.RequestedOpenCountry(),
                    RequestedClose: () => Message.RequestedCloseCountry(),
                    Settled: () => undefined,
                  },
                }),
              ),
            ),
            field(
              label(`${prefix}-form-address`, 'Address'),
              input('formAddress', `${prefix}-form-address`, {
                type: 'text',
                placeholder: '123 Main St',
              }),
            ),
            horizontalActions(
              h.div,
              h.div
                .class('flex gap-2')
                .children(
                  Button(h, { type: 'button', variant: 'outline' }).children(
                    'Cancel',
                  ),
                  Button(h, { type: 'submit' }).children('Submit'),
                ),
            ),
          ),
        )
        break
      default:
        content = h.div.attr('dir', 'rtl').children(
          field(
            label(`${prefix}-api-key`, 'مفتاح API'),
            input('apiKey', `${prefix}-api-key`, {
              type: 'password',
              placeholder: 'sk-...',
            }),
            description('مفتاح API الخاص بك مشفر ومخزن بأمان.'),
          ),
        )
    }
    return h.div.class('w-full max-w-sm').children(content as never)
  },
})

const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h, context) =>
    InputDemo(h, {
      key: `${context.idPrefix}-${kind}`,
      props: { kind, idPrefix: `${context.idPrefix}-${kind}` },
    })

const source = exampleApplicationSource({
  imports: `import { Input } from '@/ui/effect/ui'`,
  body: `Input(h, {
  id: 'email',
  element: h.input.attrs({ type: 'email', placeholder: 'name@example.com' }),
  props: { value },
  onUpdate: ({ value }) => ChangedInputValue({ value }),
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { Input } from '@/ui/effect/ui'\n\nInput(h, { id, element, props: { value }, onUpdate })`,
  examples: [
    { title: 'Basic', view: view('basic'), source },
    { title: 'Field', view: view('field'), source },
    { title: 'Field Group', view: view('fieldGroup'), source },
    { title: 'Disabled', view: view('disabled'), source },
    { title: 'Invalid', view: view('invalid'), source },
    { title: 'File', view: view('file'), source },
    { title: 'Inline', view: view('inline'), source },
    { title: 'Grid', view: view('grid'), source },
    { title: 'Required', view: view('required'), source },
    { title: 'Badge', view: view('badge'), source },
    { title: 'Input Group', view: view('inputGroup'), source },
    { title: 'Button Group', view: view('buttonGroup'), source },
    { title: 'Form', view: view('form'), source },
    { title: 'RTL', view: view('rtl'), source },
  ],
})
