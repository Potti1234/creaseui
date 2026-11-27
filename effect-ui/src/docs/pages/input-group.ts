import { Html } from '@effect/ui/html'

import { Icon, InputGroup, Kbd, Spinner } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

type H = Html.H<DocsMessage>
const icon = (h: H, name: any) => Icon(h, { name, size: 'sm' })
const field =
  (label: string, control: unknown, description?: string) => (h: H) =>
    h.div
      .class('grid gap-2')
      .children(
        h.label.class('text-sm font-medium').children(label),
        control as never,
        description === undefined
          ? undefined
          : h.p.class('text-sm text-muted-foreground').children(description),
      )
const inputGroup = (
  h: H,
  id: string,
  {
    placeholder = '',
    type = 'text',
    start,
    end,
    blockStart,
    blockEnd,
    radius,
    textarea = false,
    className,
    dir,
  }: any,
) =>
  InputGroup(h, {
    focusControlId: id,
    radius,
    direction: dir,
    className,
    addOns: {
      ...(start === undefined ? {} : { 'inline-start': start }),
      ...(end === undefined ? {} : { 'inline-end': end }),
      ...(blockStart === undefined ? {} : { 'block-start': blockStart }),
      ...(blockEnd === undefined ? {} : { 'block-end': blockEnd }),
    },
    control: group =>
      textarea
        ? group.textarea(h.textarea.attrs({ id, placeholder }))
        : group.input(h.input.attrs({ id, placeholder, type })),
  })
const buttonIcon = (h: H, name: string, label: string) =>
  h.button
    .class(
      'flex size-6 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent/50',
    )
    .attrs({ type: 'button', 'aria-label': label })
    .children(icon(h, name))
const fixture = (h: H, kind: string) => {
  switch (kind) {
    case 'demo':
      return h.div.class('w-full max-w-xs').children(
        inputGroup(h, 'demo', {
          placeholder: 'Search...',
          start: icon(h, 'search'),
          end: '12 results',
        }),
      )
    case 'align':
      return h.div.class('grid w-full max-w-sm gap-10').children(
        field(
          'Input',
          inputGroup(h, 'align-start', {
            placeholder: 'Search...',
            start: icon(h, 'search'),
          }),
          'Icon positioned at the start.',
        )(h),
        field(
          'Input',
          inputGroup(h, 'align-end', {
            placeholder: 'Enter password',
            type: 'password',
            end: buttonIcon(h, 'eye-off', 'Show password'),
          }),
          'Icon positioned at the end.',
        )(h),
        field(
          'Input',
          inputGroup(h, 'align-block-input', {
            placeholder: 'Enter your name',
            blockStart: 'Full Name',
          }),
          'Header positioned above the input.',
        )(h),
        field(
          'Textarea',
          inputGroup(h, 'align-block-area', {
            textarea: true,
            placeholder: "console.log('Hello, world!');",
            blockStart: [
              icon(h, 'file-code'),
              h.span.class('font-mono').children('script.js'),
              h.span.class('ms-auto').children(buttonIcon(h, 'copy', 'Copy')),
            ],
          }),
          'Header positioned above the textarea.',
        )(h),
        field(
          'Input',
          inputGroup(h, 'align-end-input', {
            placeholder: 'Enter amount',
            blockEnd: 'USD',
          }),
          'Footer positioned below the input.',
        )(h),
        field(
          'Textarea',
          inputGroup(h, 'align-end-area', {
            textarea: true,
            placeholder: 'Write a comment...',
            blockEnd: [
              h.span.children('0/280'),
              h.button
                .class(
                  'ms-auto rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground',
                )
                .children('Post'),
            ],
          }),
          'Footer positioned below the textarea.',
        )(h),
      )
    case 'icon':
      return h.div.class('grid w-full max-w-sm gap-6').children(
        inputGroup(h, 'icon-search', {
          placeholder: 'Search...',
          start: icon(h, 'search'),
        }),
        inputGroup(h, 'icon-email', {
          type: 'email',
          placeholder: 'Enter your email',
          start: icon(h, 'mail'),
        }),
        inputGroup(h, 'icon-card', {
          placeholder: 'Card number',
          start: icon(h, 'credit-card'),
          end: icon(h, 'check'),
        }),
        inputGroup(h, 'icon-card-star', {
          placeholder: 'Card number',
          end: [icon(h, 'star'), icon(h, 'info')],
        }),
      )
    case 'text':
      return h.div.class('grid w-full max-w-sm gap-6').children(
        inputGroup(h, 'text-amount', {
          placeholder: '0.00',
          start: '$',
          end: 'USD',
        }),
        inputGroup(h, 'text-domain', {
          placeholder: 'example.com',
          start: 'https://',
          end: '.com',
        }),
        inputGroup(h, 'text-user', {
          placeholder: 'Enter your username',
          end: '@company.com',
        }),
        inputGroup(h, 'text-message', {
          textarea: true,
          placeholder: 'Enter your message',
          blockEnd: h.span
            .class('text-xs text-muted-foreground')
            .children('120 characters left'),
        }),
      )
    case 'button':
      return h.div.class('grid w-full max-w-sm gap-6').children(
        inputGroup(h, 'button-copy', {
          placeholder: 'https://creaseui.com',
          end: buttonIcon(h, 'copy', 'Copy'),
        }),
        inputGroup(h, 'button-secure', {
          radius: 'full',
          start: [buttonIcon(h, 'info', 'Info'), 'https://'],
          end: buttonIcon(h, 'star', 'Favorite'),
        }),
        inputGroup(h, 'button-search', {
          placeholder: 'Type to search...',
          end: h.button
            .class(
              'rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground',
            )
            .children('Search'),
        }),
      )
    case 'kbd':
      return h.div.class('w-full max-w-sm').children(
        inputGroup(h, 'kbd-search', {
          placeholder: 'Search...',
          start: icon(h, 'search'),
          end: Kbd(h, { children: ['⌘K'] }),
        }),
      )
    case 'dropdown':
      return h.div.class('grid w-full max-w-sm gap-4').children(
        inputGroup(h, 'dropdown-file', {
          placeholder: 'Enter file name',
          end: buttonIcon(h, 'ellipsis', 'More'),
        }),
        inputGroup(h, 'dropdown-query', {
          radius: 'xl',
          placeholder: 'Enter search query',
          end: h.button
            .class(
              'flex h-6 items-center gap-1 rounded-sm px-1.5 text-xs text-muted-foreground',
            )
            .children('Search In...', icon(h, 'chevron-down')),
        }),
      )
    case 'spinner':
      return h.div.class('grid w-full max-w-sm gap-4').children(
        inputGroup(h, 'spinner-input', {
          placeholder: 'Searching...',
          end: Spinner(h, { isDecorative: true }),
        }),
        inputGroup(h, 'spinner-area', {
          textarea: true,
          placeholder: 'Send a message...',
          blockEnd: [
            Spinner(h, { isDecorative: true }),
            h.span.children('Saving...'),
            h.button
              .class(
                'ms-auto flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground',
              )
              .children(icon(h, 'arrow-up')),
          ],
        }),
      )
    case 'textarea':
      return h.div.class('grid w-full max-w-md gap-4').children(
        inputGroup(h, 'textarea-code', {
          textarea: true,
          className: '[&_textarea]:min-h-50 [&_textarea]:font-mono',
          placeholder: 'Paste your code here...',
          blockStart: [
            icon(h, 'file-code'),
            h.span.class('font-mono').children('script.js'),
          ],
          blockEnd: [
            h.span.children('Line 1, Column 1'),
            h.button
              .class(
                'ms-auto rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground',
              )
              .children('Run'),
          ],
        }),
      )
    case 'custom':
      return h.div.class('grid w-full max-w-sm gap-6').children(
        InputGroup(h, {
          focusControlId: 'custom-area',
          addOns: {
            'block-end': [
              h.span.children('0/280'),
              h.button
                .class(
                  'ms-auto rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground',
                )
                .children('Post'),
            ],
          },
          control: group =>
            group.textarea(
              h.textarea
                .class('field-sizing-content min-h-16 resize-none')
                .attrs({
                  id: 'custom-area',
                  placeholder: 'Write a comment...',
                }),
            ),
        }),
      )
    case 'rtl':
      return h.div
        .class('grid w-full max-w-sm gap-6')
        .attrs({ dir: 'rtl' })
        .children(
          inputGroup(h, 'rtl-search', {
            dir: 'rtl',
            placeholder: 'بحث...',
            start: icon(h, 'search'),
            end: '١٢ نتيجة',
          }),
          inputGroup(h, 'rtl-spinner', {
            dir: 'rtl',
            placeholder: 'جاري البحث...',
            end: Spinner(h, { isDecorative: true }),
          }),
          inputGroup(h, 'rtl-area', {
            dir: 'rtl',
            textarea: true,
            placeholder: 'اكتب تعليقًا...',
            blockEnd: [
              h.span.children('٠/٢٨٠'),
              h.button
                .class(
                  'ms-auto rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground',
                )
                .children('نشر'),
            ],
          }),
        )
  }
}
const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h: H, context) =>
    h.div.children(fixture(h, kind) as never)
const source = exampleApplicationSource({
  imports: `import { Icon, InputGroup } from '@/ui/effect/ui'`,
  body: `InputGroup(h, {
  focusControlId: 'search',
  addOns: { 'inline-start': Icon(h, { name: 'search' }) },
  control: group => group.input(h.input.attrs({ id: 'search', placeholder: 'Search...' })),
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { InputGroup } from '@/ui/effect/ui'\n\nInputGroup(h, { addOns, control })`,
  examples: [
    { title: 'Basic', view: view('demo'), source },
    { title: 'Align', view: view('align'), source },
    { title: 'Icon', view: view('icon'), source },
    { title: 'Text', view: view('text'), source },
    { title: 'Button', view: view('button'), source },
    { title: 'Kbd', view: view('kbd'), source },
    { title: 'Dropdown', view: view('dropdown'), source },
    { title: 'Spinner', view: view('spinner'), source },
    { title: 'Textarea', view: view('textarea'), source },
    { title: 'Custom Input', view: view('custom'), source },
    { title: 'RTL', view: view('rtl'), source },
  ],
})
