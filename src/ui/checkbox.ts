import { type Html, type HtmlBuilder } from 'foldkit/html';

import { Checkbox as CheckboxPrimitive } from '@foldkit/ui';

import * as Icon from '@/lib/icon';
import { cn } from '@/lib/utils';

const CHECKBOX_CLASS =
  'peer group size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[checked]:border-primary data-[checked]:bg-primary data-[checked]:text-primary-foreground dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:data-[checked]:bg-primary';

const INDICATOR_CLASS =
  'hidden place-content-center text-current transition-none group-data-[checked]:grid group-data-[indeterminate]:grid';

const LABEL_CLASS =
  'text-sm leading-none font-medium select-none peer-data-[disabled]:cursor-not-allowed peer-data-[disabled]:opacity-50';

const DESCRIPTION_CLASS = 'text-muted-foreground text-sm';

export type CheckboxProps<Msg> = Readonly<{
  id: string;
  isChecked: boolean;
  onToggle: (isChecked: boolean) => Msg;
  label: string;
  description?: string;
  isDisabled?: boolean;
  isIndeterminate?: boolean;
  name?: string;
  value?: string;
  class?: string;
}>;

export const checkbox = <Msg>(
  props: CheckboxProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  return CheckboxPrimitive.view(
    {
      id: props.id,
      isChecked: props.isChecked,
      onToggle: props.onToggle,
      isDisabled: props.isDisabled ?? false,
      isIndeterminate: props.isIndeterminate ?? false,
      ...(props.name === undefined ? {} : { name: props.name }),
      ...(props.value === undefined ? {} : { value: props.value }),
      toView: ({
        checkbox: checkboxAttributes,
        label,
        description,
        hiddenInput,
      }) => {
        return h.div(
          [h.Class('flex items-start gap-2')],
          [
            h.button(
              [
                ...checkboxAttributes,
                h.Type('button'),
                h.DataAttribute('slot', 'checkbox'),
                h.Class(cn(CHECKBOX_CLASS, props.class)),
              ],
              [
                h.span(
                  [
                    h.DataAttribute('slot', 'checkbox-indicator'),
                    h.Class(INDICATOR_CLASS),
                  ],
                  [Icon.check<Msg>({ class: 'size-3.5' }, h)],
                ),
              ],
            ),
            h.div(
              [h.Class('grid gap-1.5')],
              [
                h.label([...label, h.Class(LABEL_CLASS)], [props.label]),
                ...(props.description === undefined
                  ? []
                  : [
                      h.p(
                        [...description, h.Class(DESCRIPTION_CLASS)],
                        [props.description],
                      ),
                    ]),
              ],
            ),
            ...(props.name === undefined ? [] : [h.input([...hiddenInput])]),
          ],
        );
      },
    },
    h,
  );
};

/*
Model: { acceptedTerms: S.Boolean }
Update: ToggledTerms: ({ isChecked }) => [evo(model, { acceptedTerms: () => isChecked }), []]
View: Checkbox.checkbox({ id: 'terms', isChecked: model.acceptedTerms, onToggle: isChecked => ToggledTerms({ isChecked }), label: 'Accept terms' })
*/
