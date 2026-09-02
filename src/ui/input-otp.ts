import type { Html, HtmlBuilder } from 'foldkit/html';

import { cn } from '@/lib/utils';

export type InputOtpProps<Msg> = Readonly<{
  id: string;
  value: string;
  onInput: (value: string) => Msg;
  length?: number;
  name?: string;
  ariaLabel?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  class?: string;
  groupClass?: string;
  /** Pattern accepted by the control. Defaults to ASCII digits. */
  pattern?: RegExp;
  inputMode?:
    'numeric' | 'text' | 'tel' | 'decimal' | 'email' | 'url' | 'search';
  slotClass?: string;
  separator?: (index: number) => Html;
}>;

const normalize = (value: string, length: number, pattern: RegExp): string =>
  Array.from(value)
    .filter((character) => {
      pattern.lastIndex = 0;
      return pattern.test(character);
    })
    .slice(0, length)
    .join('');

export const inputOtp = <Msg>(
  props: InputOtpProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const length = props.length ?? 6;
  const pattern = props.pattern ?? /[0-9]/;
  const value = normalize(props.value, length, pattern);

  return h.div(
    [
      h.DataAttribute('slot', 'input-otp'),
      h.Class(cn('relative inline-flex items-center', props.class)),
    ],
    [
      h.input([
        h.Id(props.id),
        h.Type('text'),
        h.Value(value),
        h.InputMode(props.inputMode ?? 'numeric'),
        h.Pattern(pattern.source),
        h.Maxlength(length),
        h.Autocomplete('one-time-code'),
        h.Spellcheck(false),
        h.AriaLabel(props.ariaLabel ?? 'One-time password'),
        h.AriaInvalid(props.isInvalid ?? false),
        h.Disabled(props.isDisabled ?? false),
        ...(props.name === undefined ? [] : [h.Name(props.name)]),
        h.OnInput((next) => props.onInput(normalize(next, length, pattern))),
        h.Class(
          'peer absolute inset-0 z-10 size-full cursor-text opacity-0 disabled:cursor-not-allowed',
        ),
      ]),
      h.div(
        [
          h.DataAttribute('slot', 'input-otp-group'),
          h.AriaHidden(true),
          h.Class(cn('flex items-center', props.groupClass)),
        ],
        Array.from({ length }, (_, index) => {
          const character = value[index];
          const isActive = value.length === index;
          const slot = h.div(
            [
              h.DataAttribute('slot', 'input-otp-slot'),
              h.DataAttribute('active', String(isActive)),
              h.Class(
                cn(
                  'relative flex size-9 items-center justify-center border-y border-r border-input text-sm shadow-xs transition-all first:rounded-l-md first:border-l last:rounded-r-md',
                  'peer-focus-within:border-ring peer-focus-within:ring-[3px] peer-focus-within:ring-ring/50',
                  'peer-aria-invalid:border-destructive peer-aria-invalid:ring-destructive/20 dark:peer-aria-invalid:ring-destructive/40',
                  'peer-disabled:opacity-50',
                  props.slotClass,
                ),
              ),
            ],
            [
              character ?? '',
              ...(isActive
                ? [
                    h.div(
                      [
                        h.Class(
                          'pointer-events-none absolute inset-0 flex items-center justify-center',
                        ),
                      ],
                      [
                        h.div(
                          [
                            h.Class(
                              'h-4 w-px animate-caret-blink bg-foreground duration-1000 motion-reduce:animate-none',
                            ),
                          ],
                          [],
                        ),
                      ],
                    ),
                  ]
                : []),
            ],
          );

          const separator = props.separator?.(index);
          return separator === undefined || index === length - 1
            ? slot
            : h.div([h.Class('contents')], [slot, separator]);
        }),
      ),
    ],
  );
};

export const inputOtpSeparator = <Msg>(h: HtmlBuilder<Msg>): Html => {
  return h.div(
    [
      h.Role('separator'),
      h.DataAttribute('slot', 'input-otp-separator'),
      h.Class('px-2 text-muted-foreground'),
    ],
    ['·'],
  );
};
