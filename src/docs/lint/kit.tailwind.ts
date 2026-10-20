import { button } from '@/ui/button'
import * as Field from '@/ui/field'
import * as Form from '@/ui/form'
import * as Input from '@/ui/input'

import type { LintRendererKit } from './previews'

export const tailwindLintKit: LintRendererKit = {
  styles: {
    caseBlock: 'flex scroll-mt-24 flex-col gap-4',
    caseHeader: 'flex flex-col gap-1',
    compare: 'grid gap-4',
    panel: 'flex min-w-0 flex-col overflow-hidden rounded-lg border bg-card',
    panelHeader:
      'flex items-center gap-2 border-b px-4 py-2 text-sm font-medium',
    badLabel:
      'rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive',
    goodLabel:
      'rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success',
    preview:
      'flex min-h-32 flex-col items-start justify-center gap-2 border-b px-6 py-8',
    previewWide:
      'flex min-h-32 flex-col items-stretch justify-center border-b px-6 py-8',
    diagnostics: 'flex flex-col gap-3 border-t px-4 py-3',
    diagnostic: 'flex flex-col gap-1 text-sm',
    diagnosticMeta: 'font-mono text-xs text-muted-foreground',
    diagnosticRule: 'font-mono text-xs text-destructive',
    diagnosticSource:
      'overflow-x-auto rounded-md bg-muted px-3 py-2 font-mono text-xs leading-5 whitespace-pre',
    terminal:
      'rounded-md bg-muted px-3 py-2 font-mono text-xs leading-5 break-words whitespace-pre-wrap',
    note: 'rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground',
  },
  primaryVars: ['--primary', '--color-primary'],
  button: (props, h) =>
    button(
      {
        variant:
          props.broken === 'restyle' ? 'default' : (props.variant ?? 'default'),
        class:
          props.broken === 'restyle'
            ? 'rounded-none bg-red-500 text-white hover:bg-red-500'
            : props.broken === 'padding'
              ? 'self-start p-6'
              : props.fullWidth === true
                ? 'w-full'
                : 'self-start',
        children: [...props.children],
      },
      h,
    ),
  inviteForm: (props, h) =>
    h.div(
      [],
      [
        Form.form(
          {
            id: props.formId,
            ariaLabel: 'Invite member',
            onSubmit: props.submitted,
            children: [
              Field.controlField(
                {
                  id: `${props.formId}-email`,
                  label: 'Email',
                  toControl: (parts, controlH) =>
                    Input.input(
                      {
                        id: parts.controlId,
                        name: 'email',
                        type: 'email',
                        isRequired: true,
                        value: '',
                      },
                      controlH,
                    ),
                },
                h,
              ),
            ],
          },
          h,
        ),
        button(
          {
            type: 'submit',
            form: props.submitsTo,
            children: ['Send invite'],
            class: 'mt-4',
          },
          h,
        ),
      ],
    ),
}
