import { Html } from '@effect/ui/html'

import { Button, Field, Input } from '#components'
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
    if (kind === 'payment' || kind === 'rtl') {
      const rtl = kind === 'rtl'
      const copy = rtl
        ? {
            paymentMethod: 'طريقة الدفع',
            secureTransactions: 'جميع المعاملات آمنة ومشفرة',
            nameOnCard: 'الاسم على البطاقة',
            cardNumber: 'رقم البطاقة',
            cardNumberDescription: 'أدخل رقم البطاقة المكون من 16 رقمًا',
            month: 'الشهر',
            year: 'السنة',
            billingAddress: 'عنوان الفوترة',
            billingAddressDescription:
              'عنوان الفوترة المرتبط بطريقة الدفع الخاصة بك',
            sameAsShipping: 'نفس عنوان الشحن',
            comments: 'تعليقات',
            commentsPlaceholder: 'أضف أي تعليقات إضافية',
            submit: 'إرسال',
            cancel: 'إلغاء',
          }
        : {
            paymentMethod: 'Payment Method',
            secureTransactions: 'All transactions are secure and encrypted',
            nameOnCard: 'Name on Card',
            cardNumber: 'Card Number',
            cardNumberDescription: 'Enter your 16-digit card number',
            month: 'Month',
            year: 'Year',
            billingAddress: 'Billing Address',
            billingAddressDescription:
              'The billing address associated with your payment method',
            sameAsShipping: 'Same as shipping address',
            comments: 'Comments',
            commentsPlaceholder: 'Add any additional comments',
            submit: 'Submit',
            cancel: 'Cancel',
          }
      const fieldLabel = 'text-sm leading-snug font-medium'
      const input =
        'h-8 w-full min-w-0 rounded-md border border-input bg-background px-2.5 py-1 text-sm shadow-xs outline-none placeholder:text-muted-foreground'
      const field = (label: string, control: unknown, description?: string) =>
        h.div
          .class('flex w-full flex-col gap-2')
          .children(
            h.label.class(fieldLabel).children(label),
            control as never,
            description === undefined
              ? undefined
              : h.p
                  .class('m-0 text-sm text-muted-foreground')
                  .children(description),
          )
      const select = (label: string, placeholder: string) =>
        h.div
          .class('flex w-full flex-col gap-2')
          .children(
            h.label.class(fieldLabel).children(label),
            h.select.class(input).children(h.option.children(placeholder)),
          )
      return h.div
        .attrs(rtl ? { dir: 'rtl' } : {})
        .class('flex w-full max-w-md flex-col gap-7')
        .children(
          h.fieldset
            .class('m-0 flex min-w-0 flex-col gap-6 border-0 p-0')
            .children(
              h.legend
                .class('mb-0 text-base font-medium')
                .children(copy.paymentMethod),
              h.p
                .class('m-0 -mt-4 text-sm text-muted-foreground')
                .children(copy.secureTransactions),
              h.div
                .class('mt-6 flex w-full flex-col gap-7')
                .children(
                  field(
                    copy.nameOnCard,
                    h.input.class(input).attrs({ placeholder: 'Evil Rabbit' }),
                  ) as never,
                  field(
                    copy.cardNumber,
                    h.input
                      .class(input)
                      .attrs({ placeholder: '1234 5678 9012 3456' }),
                    copy.cardNumberDescription,
                  ) as never,
                  h.div
                    .class('grid grid-cols-3 gap-4')
                    .children(
                      select(copy.month, 'MM') as never,
                      select(copy.year, 'YYYY') as never,
                      field(
                        'CVV',
                        h.input.class(input).attrs({ placeholder: '123' }),
                      ) as never,
                    ),
                ),
            ),
          h.hr.class('m-0 h-px border-0 bg-border'),
          h.fieldset
            .class('m-0 flex min-w-0 flex-col gap-6 border-0 p-0')
            .children(
              h.legend
                .class('mb-0 text-base font-medium')
                .children(copy.billingAddress),
              h.p
                .class('m-0 -mt-4 text-sm text-muted-foreground')
                .children(copy.billingAddressDescription),
              h.label
                .class('flex items-center gap-2 text-sm font-medium')
                .children(
                  h.input
                    .class('size-4 accent-primary')
                    .attrs({ type: 'checkbox', checked: '' }),
                  copy.sameAsShipping,
                ),
            ),
          h.div
            .class('mt-5 flex w-full flex-col gap-2')
            .children(
              h.label.class(fieldLabel).children(copy.comments),
              h.textarea
                .class(input + ' min-h-16 resize-none')
                .attrs({ placeholder: copy.commentsPlaceholder }),
            ),
          h.div
            .class('flex items-center gap-2')
            .children(
              Button(h, {}).children(copy.submit) as never,
              Button(h, { variant: 'outline' }).children(copy.cancel) as never,
            ),
        )
    }
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
    if (kind === 'responsive') {
      const responsiveField =
        'group/field flex w-full flex-col gap-2 @md/field-group:flex-row @md/field-group:items-center [&>*]:w-full @md/field-group:[&>*]:w-auto'
      return h.div
        .class('w-full max-w-lg')
        .children(
          h.fieldset
            .class('m-0 flex flex-col gap-6 border-0 p-0')
            .children(
              h.legend.class('mb-3 text-base font-medium').children('Profile'),
              h.p
                .class(
                  'm-0 -mt-1.5 text-sm leading-normal text-muted-foreground',
                )
                .children('Fill in your profile information.'),
              h.div
                .class('@container/field-group flex w-full flex-col gap-7')
                .children(
                  h.div
                    .class(responsiveField)
                    .children(
                      h.div
                        .class('flex flex-1 flex-col gap-1.5 leading-snug')
                        .children(
                          h.label
                            .class(
                              'flex w-fit items-center gap-2 text-sm leading-snug font-medium',
                            )
                            .children('Name'),
                          h.p
                            .class(
                              'm-0 text-sm leading-normal text-muted-foreground',
                            )
                            .children(
                              'Provide your full name for identification',
                            ),
                        ),
                      h.input
                        .class(inputClass)
                        .attrs({ placeholder: 'Evil Rabbit' }),
                    ),
                  h.div
                    .class(responsiveField)
                    .children(
                      Button(h, {})
                        .attrs({ type: 'submit' })
                        .children('Submit') as never,
                      Button(h, { variant: 'outline' })
                        .attrs({ type: 'button' })
                        .children('Cancel') as never,
                    ),
                ),
            ),
        )
    }
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
