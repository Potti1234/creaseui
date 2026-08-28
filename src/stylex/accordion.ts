import { Option, Schema as S } from 'effect';
import type { Command } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';

import { Disclosure as DisclosurePrimitive } from '@foldkit/ui';

import * as Icon from '@/lib/icon';
import * as stylex from '@stylexjs/stylex'
import type { StaticStyles } from '@stylexjs/stylex'
import { overlayStyles } from './overlay-tokens.stylex'
import type { ComponentLayoutStyle } from './contracts'
import { className } from './style'
import { tokens } from './tokens.stylex'
import { interactionTokens } from './interaction-tokens.stylex.const'

const styles = stylex.create({
  content: { paddingBottom: '1rem', paddingTop: 0 },
  icon: { color: tokens.mutedForeground, flexShrink: 0, height: '1rem', width: '1rem' },
  item: { borderBottomColor: tokens.border, borderBottomStyle: 'solid', borderBottomWidth: 1 },
  panel: { overflow: 'hidden', fontSize: '0.875rem', },
  trigger: {
    borderColor: {
      default: tokens.transparent,
      ':focus-visible': tokens.ring,
    },
    gap: '1rem',
    paddingBlock: '1rem',
    alignItems: 'flex-start',
    backgroundColor: tokens.transparent,
    boxShadow: {
      default: tokens.shadowNone,
      ':focus-visible': tokens.focusRingShadow,
    },
    color: tokens.foreground,
    cursor: interactionTokens.cursorAction,
    display: 'flex',
    flexGrow: 1,
    fontSize: '0.875rem',
    fontWeight: 500,
    justifyContent: 'space-between',
    outlineStyle: 'none',
    textAlign: 'left',
    textDecorationLine: { default: 'none', ':hover': 'underline' },
  },
  triggerRow: { display: 'flex' },
})

const isStaticStyle = (value: unknown): value is StaticStyles =>
  typeof value === 'object' && value !== null
const cn = (...values: ReadonlyArray<unknown>): string =>
  className(...values.filter(isStaticStyle))

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

const ITEM_CLASS = styles.item

const TRIGGER_CLASS = styles.trigger

const ICON_CLASS = styles.icon

const PANEL_CLASS = styles.panel
const CONTENT_CLASS = styles.content

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
  layoutStyle?: ComponentLayoutStyle;
  itemLayoutStyle?: ComponentLayoutStyle;
  triggerLayoutStyle?: ComponentLayoutStyle;
  contentLayoutStyle?: ComponentLayoutStyle;
}>;

export const accordion = <Msg>(
  props: AccordionProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  return h.div(
    [
      h.DataAttribute('slot', 'accordion'),
      ...(props.layoutStyle === undefined ? [] : [h.Class(cn(props.layoutStyle))]),
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
                  h.Class(cn(ITEM_CLASS, props.itemLayoutStyle)),
                ],
                [
                  h.h3(
                    [h.Class(className(styles.triggerRow))],
                    [
                      h.button(
                        [
                          ...button,
                          h.Type('button'),
                          h.DataAttribute('slot', 'accordion-trigger'),
                          h.Class(cn(TRIGGER_CLASS, props.triggerLayoutStyle)),
                        ],
                        [
                          config.trigger,
                          Icon.chevronDown<Msg>(
                            {
                              class: className(ICON_CLASS),
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
                        h.Class(className(PANEL_CLASS)),
                      ],
                      [
                        h.div(
                          [h.Class(cn(CONTENT_CLASS, props.contentLayoutStyle))],
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


