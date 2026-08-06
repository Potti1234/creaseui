import { type VariantProps, cva } from 'class-variance-authority';
import type { Html, HtmlBuilder } from 'foldkit/html';

import { cn } from '@/lib/utils';

/* Ported from shadcn/ui field.tsx as structural foldkit view functions.
   Stateful selectors are adapted to foldkit's valueless data-disabled and
   data-checked attributes. */

type Slot = Readonly<{
  class?: string;
  children: ReadonlyArray<Html | string>;
}>;

export type FieldSetProps = Slot & Readonly<{ isDisabled?: boolean }>;

export const fieldSet = <Msg>(
  props: FieldSetProps,
  h: HtmlBuilder<Msg>,
): Html => {
  return h.fieldset(
    [
      h.DataAttribute('slot', 'field-set'),
      ...(props.isDisabled === undefined ? [] : [h.Disabled(props.isDisabled)]),
      h.Class(
        cn(
          'flex flex-col gap-6 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3',
          props.class,
        ),
      ),
    ],
    [...props.children],
  );
};

export type FieldLegendProps = Slot &
  Readonly<{ variant?: 'legend' | 'label' }>;

export const fieldLegend = <Msg>(
  props: FieldLegendProps,
  h: HtmlBuilder<Msg>,
): Html => {
  const variant = props.variant ?? 'legend';

  return h.legend(
    [
      h.DataAttribute('slot', 'field-legend'),
      h.DataAttribute('variant', variant),
      h.Class(
        cn(
          'mb-3 font-medium data-[variant=legend]:text-base data-[variant=label]:text-sm',
          props.class,
        ),
      ),
    ],
    [...props.children],
  );
};

export type FieldGroupProps = Slot &
  Readonly<{ variant?: 'default' | 'outline' }>;

export const fieldGroup = <Msg>(
  props: FieldGroupProps,
  h: HtmlBuilder<Msg>,
): Html => {
  return h.div(
    [
      h.DataAttribute('slot', 'field-group'),
      ...(props.variant === undefined
        ? []
        : [h.DataAttribute('variant', props.variant)]),
      h.Class(
        cn(
          'group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4',
          props.class,
        ),
      ),
    ],
    [...props.children],
  );
};

export const fieldVariants = cva(
  'group/field flex w-full gap-2 data-[invalid=true]:text-destructive',
  {
    variants: {
      orientation: {
        vertical: ['flex-col [&>*]:w-full [&>.sr-only]:w-auto'],
        horizontal: [
          'flex-row items-center',
          '[&>[data-slot=field-label]]:flex-auto',
          'has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
        ],
        responsive: [
          'flex-col @md/field-group:flex-row @md/field-group:items-center [&>*]:w-full @md/field-group:[&>*]:w-auto [&>.sr-only]:w-auto',
          '@md/field-group:[&>[data-slot=field-label]]:flex-auto',
          '@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
        ],
      },
    },
    defaultVariants: {
      orientation: 'vertical',
    },
  },
);

export type FieldVariants = VariantProps<typeof fieldVariants>;

export type FieldProps = Slot &
  Readonly<{
    orientation?: FieldVariants['orientation'];
    isInvalid?: boolean;
    isDisabled?: boolean;
  }>;

export const field = <Msg>(props: FieldProps, h: HtmlBuilder<Msg>): Html => {
  const orientation = props.orientation ?? 'vertical';

  return h.div(
    [
      h.Role('group'),
      h.DataAttribute('slot', 'field'),
      h.DataAttribute('orientation', orientation),
      ...(props.isInvalid === true ? [h.DataAttribute('invalid', 'true')] : []),
      ...(props.isDisabled === true ? [h.DataAttribute('disabled', '')] : []),
      h.Class(cn(fieldVariants({ orientation }), props.class)),
    ],
    [...props.children],
  );
};

export const fieldContent = <Msg>(props: Slot, h: HtmlBuilder<Msg>): Html => {
  return h.div(
    [
      h.DataAttribute('slot', 'field-content'),
      h.Class(
        cn(
          'group/field-content flex flex-1 flex-col gap-1.5 leading-snug',
          props.class,
        ),
      ),
    ],
    [...props.children],
  );
};

/* PORT NOTE: FieldLabel normally composes shadcn's Label component. This batch
   is independent of label.ts, so its verbatim base class string is duplicated
   here before the FieldLabel-specific classes. */
const LABEL_CLASS =
  'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled]:pointer-events-none group-data-[disabled]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50';

export type FieldLabelProps = Slot & Readonly<{ for?: string }>;

export const fieldLabel = <Msg>(
  props: FieldLabelProps,
  h: HtmlBuilder<Msg>,
): Html => {
  return h.label(
    [
      h.DataAttribute('slot', 'field-label'),
      ...(props.for === undefined ? [] : [h.For(props.for)]),
      h.Class(
        cn(
          LABEL_CLASS,
          'group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled]/field:opacity-50',
          'has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&>*]:data-[slot=field]:p-4',
          'has-data-[checked]:border-primary has-data-[checked]:bg-primary/5 dark:has-data-[checked]:bg-primary/10',
          props.class,
        ),
      ),
    ],
    [...props.children],
  );
};

export const fieldTitle = <Msg>(props: Slot, h: HtmlBuilder<Msg>): Html => {
  return h.div(
    [
      h.DataAttribute('slot', 'field-label'),
      h.Class(
        cn(
          'flex w-fit items-center gap-2 text-sm leading-snug font-medium group-data-[disabled]/field:opacity-50',
          props.class,
        ),
      ),
    ],
    [...props.children],
  );
};

export const fieldDescription = <Msg>(
  props: Slot,
  h: HtmlBuilder<Msg>,
): Html => {
  return h.p(
    [
      h.DataAttribute('slot', 'field-description'),
      h.Class(
        cn(
          'text-sm leading-normal font-normal text-muted-foreground group-has-[[data-orientation=horizontal]]/field:text-balance',
          'last:mt-0 nth-last-2:-mt-1 [[data-variant=legend]+&]:-mt-1.5',
          '[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary',
          props.class,
        ),
      ),
    ],
    [...props.children],
  );
};

export type FieldSeparatorProps = Readonly<{
  class?: string;
  children?: ReadonlyArray<Html | string>;
}>;

export const fieldSeparator = <Msg>(
  props: FieldSeparatorProps = {},
  h: HtmlBuilder<Msg>,
): Html => {
  const hasContent = (props.children?.length ?? 0) > 0;

  return h.div(
    [
      h.DataAttribute('slot', 'field-separator'),
      h.DataAttribute('content', String(hasContent)),
      h.Class(
        cn(
          'relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2',
          props.class,
        ),
      ),
    ],
    [
      h.div(
        [
          h.DataAttribute('slot', 'separator'),
          h.DataAttribute('orientation', 'horizontal'),
          h.Role('none'),
          h.Class(
            'shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px absolute inset-0 top-1/2',
          ),
        ],
        [],
      ),
      ...(hasContent
        ? [
            h.span(
              [
                h.DataAttribute('slot', 'field-separator-content'),
                h.Class(
                  'relative mx-auto block w-fit bg-background px-2 text-muted-foreground',
                ),
              ],
              [...(props.children ?? [])],
            ),
          ]
        : []),
    ],
  );
};

export type FieldError = Readonly<{ message?: string }> | undefined;

export type FieldErrorProps = Readonly<{
  class?: string;
  children?: ReadonlyArray<Html | string>;
  errors?: ReadonlyArray<FieldError>;
}>;

export const fieldError = <Msg>(
  props: FieldErrorProps = {},
  h: HtmlBuilder<Msg>,
): Html => {
  const children = props.children ?? [];
  const messages = [
    ...new Set(
      (props.errors ?? []).flatMap((error) =>
        error?.message === undefined ? [] : [error.message],
      ),
    ),
  ];

  if (children.length === 0 && messages.length === 0) {
    return h.empty;
  }

  const content =
    children.length > 0
      ? children
      : messages.length === 1
        ? [messages[0] ?? '']
        : [
            h.ul(
              [h.Class('ml-4 flex list-disc flex-col gap-1')],
              messages.map((message) => h.li([], [message])),
            ),
          ];

  return h.div(
    [
      h.Role('alert'),
      h.DataAttribute('slot', 'field-error'),
      h.Class(cn('text-sm font-normal text-destructive', props.class)),
    ],
    content,
  );
};
