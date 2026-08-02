import { type Html, type HtmlBuilder } from 'foldkit/html';

import { Switch as SwitchPrimitive } from '@foldkit/ui';

import { cn } from '@/lib/utils';

export type SwitchSize = 'sm' | 'default';

const SWITCH_CLASS =
  'peer group inline-flex shrink-0 items-center rounded-full border border-transparent bg-input shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[checked]:bg-primary dark:bg-input/80 dark:data-[checked]:bg-primary';

const THUMB_CLASS =
  'pointer-events-none block translate-x-0 rounded-full bg-background ring-0 transition-transform group-data-[size=default]:size-4 group-data-[size=sm]:size-3 group-data-[checked]:translate-x-[calc(100%-2px)] dark:bg-foreground dark:group-data-[checked]:bg-primary-foreground';

const LABEL_CLASS =
  'text-sm leading-none font-medium select-none peer-data-[disabled]:cursor-not-allowed peer-data-[disabled]:opacity-50';

const DESCRIPTION_CLASS = 'text-muted-foreground text-sm';

export type SwitchProps<Msg> = Readonly<{
  id: string;
  isChecked: boolean;
  onToggle: (isChecked: boolean) => Msg;
  label: string;
  description?: string;
  size?: SwitchSize;
  isDisabled?: boolean;
  name?: string;
  value?: string;
  class?: string;
}>;

export const switchControl = <Msg>(
  props: SwitchProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const size = props.size ?? 'default';

  return SwitchPrimitive.view(
    {
      id: props.id,
      isChecked: props.isChecked,
      onToggle: props.onToggle,
      isDisabled: props.isDisabled ?? false,
      ...(props.name === undefined ? {} : { name: props.name }),
      ...(props.value === undefined ? {} : { value: props.value }),
      toView: ({ button, label, description, hiddenInput }) => {
        return h.div(
          [h.Class('flex items-start gap-2')],
          [
            h.button(
              [
                ...button,
                h.Type('button'),
                h.DataAttribute('slot', 'switch'),
                h.DataAttribute('size', size),
                h.Class(cn(SWITCH_CLASS, props.class)),
              ],
              [
                h.span(
                  [
                    h.DataAttribute('slot', 'switch-thumb'),
                    h.Class(THUMB_CLASS),
                  ],
                  [],
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

export { switchControl as switch };

/*
Model: { notificationsEnabled: S.Boolean }
Update: ToggledNotifications: ({ isChecked }) => [evo(model, { notificationsEnabled: () => isChecked }), []]
View: Switch.switch({ id: 'notifications', isChecked: model.notificationsEnabled, onToggle: isChecked => ToggledNotifications({ isChecked }), label: 'Notifications' })
*/
