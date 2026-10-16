import type { Html, HtmlBuilder } from 'foldkit/html'
import * as Dialog from '@/ui/dialog'
import * as Input from '@/ui/input'
import * as Textarea from '@/ui/textarea'
import { action, glyph, shortcut } from './primitives'

type ComposerProps<M> = Readonly<{
  model: Dialog.Model
  toMessage: (message: Dialog.Message) => M
  title: string
  description: string
  isInvalid: boolean
  onTitle: (value: string) => M
  onDescription: (value: string) => M
  onSubmit: M
  properties: ReadonlyArray<Html>
  submitKeys: string
}>

export const issueComposer = <M>(
  props: ComposerProps<M>,
  h: HtmlBuilder<M>,
): Html =>
  Dialog.dialog(
    {
      model: props.model,
      toParentMessage: props.toMessage,
      title: 'Create issue',
      description: 'Add an issue to the Product team.',
      showCloseButton: false,
      appearance: 'issueComposer',
      layout: parts => [
        h.div(
          [h.Class('composer-heading')],
          [
            h.div(
              [h.Class('composer-breadcrumb')],
              [
                glyph('layout-grid', h),
                h.span([], ['Product']),
                h.span([h.AriaHidden(true)], ['/']),
                parts.title({
                  class: 'composer-title',
                  children: ['New issue'],
                }),
              ],
            ),
            parts.close({
              ariaLabel: 'Close issue composer',
              class: 'composer-close',
            }),
          ],
        ),
        parts.description({
          class: 'sr-only',
          children: [
            'Create an issue. A title is required. Press Control or Command and Enter to create.',
          ],
        }),
        h.div(
          [h.Class('composer-fields')],
          [
            Input.input(
              {
                id: 'new-issue-title',
                value: props.title,
                onInput: props.onTitle,
                ariaLabel: 'Issue title',
                placeholder: 'Issue title',
                appearance: 'issueTitle',
                isInvalid: props.isInvalid,
                isRequired: true,
                ...(props.isInvalid
                  ? { describedBy: 'issue-title-error' }
                  : {}),
              },
              h,
            ),
            ...(props.isInvalid
              ? [
                  h.p(
                    [
                      h.Class('field-error'),
                      h.Id('issue-title-error'),
                      h.Role('alert'),
                    ],
                    ['Give your issue a title.'],
                  ),
                ]
              : []),
            Textarea.textarea(
              {
                id: 'new-issue-description',
                value: props.description,
                onInput: props.onDescription,
                label: h.span([h.Class('sr-only')], ['Description']),
                placeholder: 'Add a description...',
                resize: 'none',
                rows: 4,
                appearance: 'issueDescription',
              },
              h,
            ),
          ],
        ),
        h.div([h.Class('composer-properties')], [...props.properties]),
        h.div(
          [h.Class('composer-footer')],
          [
            h.span(
              [h.Class('composer-hint')],
              [shortcut('Esc', h), ' to close · your draft is kept'],
            ),
            action(
              {
                label: 'Create issue',
                keys: props.submitKeys,
                onClick: props.onSubmit,
              },
              h,
            ),
          ],
        ),
      ],
    },
    h,
  )

export const resetConfirmation = <M>(
  props: Readonly<{
    model: Dialog.Model
    toMessage: (message: Dialog.Message) => M
    onConfirm: M
    onCancel: M
  }>,
  h: HtmlBuilder<M>,
): Html =>
  Dialog.dialog(
    {
      model: props.model,
      toParentMessage: props.toMessage,
      title: 'Reset this workspace?',
      description:
        'This replaces your local issues with the original sample data. Other browser data is untouched.',
      appearance: 'reset',
      content: () => [],
      footer: () => [
        action(
          { label: 'Cancel', intent: 'quiet', onClick: props.onCancel },
          h,
        ),
        action({ label: 'Reset sample data', onClick: props.onConfirm }, h),
      ],
    },
    h,
  )
