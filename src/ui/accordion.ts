import { Option, Schema as S } from 'effect';
import type { Command } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';

import { Disclosure as DisclosurePrimitive } from '@foldkit/ui';

import * as Icon from '@/lib/icon';
import { cn } from '@/lib/utils';

/* shadcn/ui Accordion composed from one foldkit Disclosure submodel per item.
   Disclosure.animatePanel replaces Radix's accordion height keyframes with a
   finite grid-row transition. */

export const AccordionType = S.Literals(['single', 'multiple']);
export type AccordionType = typeof AccordionType.Type;

export const Model = S.Struct({
  id: S.String,
  type: AccordionType,
  itemIds: S.Array(S.String),
  openStates: S.Array(S.Boolean),
});
export type Model = typeof Model.Type;

export const GotDisclosureMessage = m('GotDisclosureMessage', {
  index: S.Number,
  isOpen: S.Boolean,
});

export const Message = S.Union([GotDisclosureMessage]);
export type Message = typeof Message.Type;

export const ToggledItem = m('ToggledItem', {
  value: S.String,
  index: S.Number,
  isOpen: S.Boolean,
});

export const OutMessage = S.Union([ToggledItem]);
export type OutMessage = typeof OutMessage.Type;

export type AccordionInitItem = Readonly<{
  value: string;
  isOpen?: boolean;
}>;

export type InitConfig = Readonly<{
  id: string;
  type?: AccordionType;
  items: ReadonlyArray<AccordionInitItem>;
}>;

export const init = (config: InitConfig): Model => {
  const type = config.type ?? 'single';
  let hasOpenItem = false;

  return {
    id: config.id,
    type,
    itemIds: config.items.map((item) => item.value),
    openStates: config.items.map((item) => {
      const isOpen =
        item.isOpen === true && (type === 'multiple' || hasOpenItem === false);

      if (isOpen) {
        hasOpenItem = true;
      }

      return isOpen;
    }),
  };
};

type UpdateReturn = readonly [
  Model,
  ReadonlyArray<Command.Command<Message>>,
  Option.Option<OutMessage>,
];

export const update = (model: Model, message: Message): UpdateReturn => {
  const item = model.openStates[message.index];
  const value = model.itemIds[message.index];

  if (item === undefined || value === undefined) {
    return [model, [], Option.none()];
  }

  const openStates = model.openStates.map((current, index) => {
    if (index === message.index) {
      return message.isOpen;
    }

    return model.type === 'single' && message.isOpen ? false : current;
  });

  return [
    { ...model, openStates },
    [],
    Option.some(
      ToggledItem({ value, index: message.index, isOpen: message.isOpen }),
    ),
  ];
};

const ITEM_CLASS = 'border-b last:border-b-0';

const TRIGGER_CLASS =
  'group flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50';

const ICON_CLASS =
  'pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200 group-data-[open]:rotate-180';

const PANEL_CLASS = 'overflow-hidden text-sm';
const CONTENT_CLASS = 'pt-0 pb-4';

export type AccordionItem = Readonly<{
  value: string;
  trigger: Html | string;
  content: Html | string;
  isDisabled?: boolean;
}>;

export type AccordionProps<Msg> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => Msg;
  items: ReadonlyArray<AccordionItem>;
  class?: string;
  itemClass?: string;
  triggerClass?: string;
  contentClass?: string;
}>;

export const accordion = <Msg>(
  props: AccordionProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  return h.div(
    [
      h.DataAttribute('slot', 'accordion'),
      ...(props.class === undefined ? [] : [h.Class(cn(props.class))]),
    ],
    props.model.openStates.flatMap((isOpen, index) => {
      const config = props.items[index];

      if (config === undefined || props.model.itemIds[index] !== config.value) {
        return [];
      }

      return [
        DisclosurePrimitive.view(
          {
            id: `${props.model.id}-item-${index}`,
            isOpen,
            onToggle: (nextIsOpen) =>
              props.toParentMessage(
                GotDisclosureMessage({ index, isOpen: nextIsOpen }),
              ),
            ...(config.isDisabled === undefined
              ? {}
              : { isDisabled: config.isDisabled }),
            toView: ({ button, panel, animatePanel }) => {
              return h.div(
                [
                  h.DataAttribute('slot', 'accordion-item'),
                  h.Class(cn(ITEM_CLASS, props.itemClass)),
                ],
                [
                  h.h3(
                    [h.Class('flex')],
                    [
                      h.button(
                        [
                          ...button,
                          h.Type('button'),
                          h.DataAttribute('slot', 'accordion-trigger'),
                          h.Class(cn(TRIGGER_CLASS, props.triggerClass)),
                        ],
                        [
                          config.trigger,
                          Icon.chevronDown<Msg>(
                            {
                              class: ICON_CLASS,
                            },
                            h,
                          ),
                        ],
                      ),
                    ],
                  ),
                  animatePanel(
                    h.div(
                      [
                        ...panel,
                        h.DataAttribute('slot', 'accordion-content'),
                        h.Class(PANEL_CLASS),
                      ],
                      [
                        h.div(
                          [h.Class(cn(CONTENT_CLASS, props.contentClass))],
                          [config.content],
                        ),
                      ],
                    ),
                  ),
                ],
              );
            },
          },
          h,
        ),
      ];
    }),
  );
};

/*
Minimal wiring:
const model = init({
  id: 'faq',
  type: 'single',
  items: [{ value: 'shipping' }, { value: 'returns' }],
})
const [nextModel, commands, maybeToggle] = update(model, message)
accordion({
  model,
  toParentMessage: message => GotAccordionMessage({ message }),
  items: [
    { value: 'shipping', trigger: 'Shipping', content: shippingView },
    { value: 'returns', trigger: 'Returns', content: returnsView },
  ],
})
*/
