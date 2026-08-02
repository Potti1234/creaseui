import { type Html, type HtmlBuilder } from 'foldkit/html';

import { Textarea as TextareaPrimitive } from '@foldkit/ui';

import { cn } from '@/lib/utils';

/* Ported from shadcn/ui textarea.tsx. The textarea class string is verbatim.
   The foldkit Textarea primitive sets the native disabled attribute, so
   shadcn's `disabled:` variants work unchanged. It also wires the optional
   label and description to the textarea through its attribute groups. */

const TEXTAREA_CLASS =
  'flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40';

const LABEL_CLASS =
  'flex items-center gap-2 text-sm leading-none font-medium select-none';

const DESCRIPTION_CLASS = 'text-muted-foreground text-sm';

export type TextareaProps<Msg> = Readonly<{
  id: string;
  value: string;
  onInput: (value: string) => Msg;
  label?: string;
  description?: string;
  placeholder?: string;
  name?: string;
  rows?: number;
  isDisabled?: boolean;
  isInvalid?: boolean;
  class?: string;
}>;

export const textarea = <Msg>(
  props: TextareaProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  return TextareaPrimitive.view(
    {
      id: props.id,
      value: props.value,
      onInput: props.onInput,
      isDisabled: props.isDisabled ?? false,
      isInvalid: props.isInvalid ?? false,
      ...(props.name === undefined ? {} : { name: props.name }),
      ...(props.rows === undefined ? {} : { rows: props.rows }),
      ...(props.placeholder === undefined
        ? {}
        : { placeholder: props.placeholder }),
      toView: ({ textarea: textareaAttributes, label, description }) => {
        const textareaElement = h.textarea(
          [
            ...textareaAttributes,
            h.DataAttribute('slot', 'textarea'),
            h.Class(cn(TEXTAREA_CLASS, props.class)),
          ],
          [],
        );

        if (props.label === undefined && props.description === undefined) {
          return textareaElement;
        }

        return h.div(
          [h.Class('grid gap-2')],
          [
            ...(props.label === undefined
              ? []
              : [h.label([...label, h.Class(LABEL_CLASS)], [props.label])]),
            textareaElement,
            ...(props.description === undefined
              ? []
              : [
                  h.p(
                    [...description, h.Class(DESCRIPTION_CLASS)],
                    [props.description],
                  ),
                ]),
          ],
        );
      },
    },
    h,
  );
};
