import { Html } from '@effect/ui/html'

import { Field, Input } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const inputClass =
  'h-8 w-full min-w-0 rounded-md border border-input bg-background px-2.5 py-1 text-sm shadow-xs outline-none'
const controlInput = (
  h: Html.H<DocsMessage>,
  id: string,
  value = '',
  type?: string,
) =>
  Input(h, {
    id,
    element: h.input.attrs({ type, placeholder: value }),
    props: { value: '' },
    onUpdate: () => undefined,
  })
const simpleField = (
  h: Html.H<DocsMessage>,
  id: string,
  label: string,
  control: unknown,
  description?: string,
) =>
  Field(h, {
    props: { id },
    label,
    description,
    control: () => control as never,
  })
const shell = (...children: unknown[]): any => children[0]
const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) => {
    const id = context.idPrefix
    if (kind === 'payment')
      return h.div.class('w-full max-w-md').children(
        h.fieldset.class('grid gap-3').children(
          h.legend.class('text-sm font-medium').children('Payment Method'),
          ['Card', 'PayPal', 'Apple Pay'].map((label, index) =>
            h.label
              .key(label)
              .class('flex items-center gap-3 rounded-lg border p-3')
              .children(
                h.input.attrs({
                  type: 'radio',
                  name: `${id}-payment`,
                  checked: index === 0 ? '' : undefined,
                }),
                h.span.class('text-sm font-medium').children(label),
              ),
          ),
        ),
      )
    if (kind === 'textarea')
      return simpleField(
        h,
        `${id}-bio`,
        'Bio',
        h.textarea
          .class(inputClass + ' min-h-24')
          .attrs({ placeholder: 'Tell us about yourself' }),
        'Share a few details about yourself.',
      )
    if (kind === 'select')
      return simpleField(
        h,
        `${id}-country`,
        'Country',
        h.select
          .class(inputClass)
          .children(
            h.option.children('United States'),
            h.option.children('Canada'),
            h.option.children('United Kingdom'),
          ),
      )
    if (kind === 'slider')
      return simpleField(
        h,
        `${id}-volume`,
        'Volume',
        h.input
          .attrs({ type: 'range', value: '60' })
          .class('w-full accent-primary'),
        'Adjust the playback volume.',
      )
    if (kind === 'checkbox')
      return simpleField(
        h,
        `${id}-terms`,
        'Terms',
        h.label
          .class('flex items-center gap-2 text-sm')
          .children(
            h.input.attrs({ type: 'checkbox' }),
            'Accept terms and conditions',
          ),
      )
    if (kind === 'radio')
      return simpleField(
        h,
        `${id}-plan`,
        'Plan',
        h.div.class('grid gap-2').children(
          ['Free', 'Pro'].map((label, index) =>
            h.label
              .key(label)
              .class('flex items-center gap-2 text-sm')
              .children(
                h.input.attrs({
                  type: 'radio',
                  name: `${id}-plan`,
                  checked: index === 0 ? '' : undefined,
                }),
                label,
              ),
          ),
        ),
      )
    if (kind === 'switch')
      return simpleField(
        h,
        `${id}-notifications`,
        'Notifications',
        h.label
          .class('inline-flex items-center gap-2 text-sm')
          .children(
            h.input
              .attrs({ type: 'checkbox', role: 'switch', checked: '' })
              .class('accent-primary'),
            'Email me product updates',
          ),
      )
    if (kind === 'choice')
      return h.div.class('grid w-full max-w-md gap-3').children(
        ['Basic', 'Pro'].map((label, index) =>
          h.label
            .key(label)
            .class(
              'flex cursor-pointer items-start gap-3 rounded-lg border p-4',
            )
            .children(
              h.input.attrs({
                type: 'radio',
                name: `${id}-choice`,
                checked: index === 0 ? '' : undefined,
              }),
              h.span.children(
                h.span.class('block text-sm font-medium').children(label),
                h.span
                  .class('block text-xs text-muted-foreground')
                  .children(
                    index === 0 ? 'For personal projects' : 'For growing teams',
                  ),
              ),
            ),
        ),
      )
    if (kind === 'group')
      return h.div
        .class('grid w-full max-w-md gap-6')
        .children(
          simpleField(
            h,
            `${id}-first`,
            'First name',
            controlInput(h, `${id}-first-input`, 'Jordan'),
          ) as never,
          simpleField(
            h,
            `${id}-last`,
            'Last name',
            controlInput(h, `${id}-last-input`, 'Lee'),
          ) as never,
        )
    if (kind === 'rtl')
      return h.div
        .attrs({ dir: 'rtl' })
        .class('w-full max-w-sm')
        .children(
          simpleField(
            h,
            `${id}-arabic`,
            'البريد الإلكتروني',
            controlInput(h, `${id}-arabic-input`, 'name@example.com', 'email'),
            'سنرسل التحديثات إلى هذا العنوان.',
          ) as never,
        )
    if (kind === 'responsive')
      return h.div
        .class('grid w-full max-w-2xl gap-4 md:grid-cols-2')
        .children(
          simpleField(
            h,
            `${id}-city`,
            'City',
            controlInput(h, `${id}-city-input`, 'Berlin'),
          ) as never,
          simpleField(
            h,
            `${id}-zip`,
            'Postal code',
            controlInput(h, `${id}-zip-input`, '10115'),
          ) as never,
        )
    if (kind === 'fieldset')
      return h.fieldset
        .class('grid w-full max-w-md gap-4 rounded-lg border p-4')
        .children(
          h.legend
            .class('px-1 text-sm font-medium')
            .children('Shipping address'),
          simpleField(
            h,
            `${id}-street`,
            'Street',
            controlInput(h, `${id}-street-input`, 'Main Street 1'),
          ) as never,
          simpleField(
            h,
            `${id}-city2`,
            'City',
            controlInput(h, `${id}-city2-input`, 'Berlin'),
          ) as never,
        )
    return shell(
      simpleField(
        h,
        `${id}-email`,
        'Email',
        controlInput(h, `${id}-email-input`, 'name@example.com', 'email'),
        'We only send product updates.',
      ),
    )
  }

const source = exampleApplicationSource({
  imports: `import { Field, Input } from '@/ui/effect/ui'`,
  body: `Field(h, {
  props: { id: 'email' },
  label: 'Email',
  description: 'We only send product updates.',
  control: () => Input(h, { id: 'email', props: { value }, onUpdate }),
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { Field } from '@/ui/effect/ui'\n\nField(h, { props: { id }, label, control })`,
  examples: [
    { title: 'Payment Method', view: view('payment'), source },
    { title: 'Input', view: view('input'), source },
    { title: 'Textarea', view: view('textarea'), source },
    { title: 'Select', view: view('select'), source },
    { title: 'Slider', view: view('slider'), source },
    { title: 'Fieldset', view: view('fieldset'), source },
    { title: 'Checkbox', view: view('checkbox'), source },
    { title: 'Radio', view: view('radio'), source },
    { title: 'Switch', view: view('switch'), source },
    { title: 'Choice Card', view: view('choice'), source },
    { title: 'Field Group', view: view('group'), source },
    { title: 'RTL', view: view('rtl'), source },
    { title: 'Responsive Layout', view: view('responsive'), source },
  ],
})
