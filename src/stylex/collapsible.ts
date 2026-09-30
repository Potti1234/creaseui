import type { Html, HtmlBuilder } from 'foldkit/html';

import { Disclosure as DisclosurePrimitive } from '@foldkit/ui';

import * as stylex from '@stylexjs/stylex'
import type { StaticStyles } from '@stylexjs/stylex'
import type { ComponentLayoutStyle } from './contracts'
import { className } from './style'
import { interactionTokens } from './interaction-tokens.stylex.const'

const styles = stylex.create({
  content: { overflow: 'hidden' },
  root: { display: 'block' },
  trigger: { cursor: interactionTokens.cursorAction },
  sidebarTrigger: { padding: '0.5rem', alignItems: 'center', display: 'flex', textAlign: 'left', minHeight: '2rem', width: '100%', },
})

const isStaticStyle = (value: unknown): value is StaticStyles =>
  typeof value === 'object' && value !== null
const cn = (...values: ReadonlyArray<unknown>): string =>
  className(...values.filter(isStaticStyle))

/* shadcn/ui Collapsible is a thin composition over foldkit Disclosure.
   animatePanel keeps the content mounted and smoothly transitions its height. */

export type CollapsibleProps<Msg> = Readonly<{
  id: string;
  isOpen: boolean;
  onToggle: (isOpen: boolean) => Msg;
  trigger: Html | string;
  content: Html | string;
  isDisabled?: boolean;
  ariaLabel?: string;
  variant?: 'default' | 'sidebar';
  layoutStyle?: ComponentLayoutStyle;
  triggerLayoutStyle?: ComponentLayoutStyle;
  contentLayoutStyle?: ComponentLayoutStyle;
}>;

export const collapsible = <Msg>(
  props: CollapsibleProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  return DisclosurePrimitive.view(
    {
      id: props.id,
      isOpen: props.isOpen,
      onToggle: props.onToggle,
      ...(props.isDisabled === undefined
        ? {}
        : { isDisabled: props.isDisabled }),
      ...(props.ariaLabel === undefined ? {} : { ariaLabel: props.ariaLabel }),
      toView: ({ button, panel, animatePanel }) => {
        const isDisabled = props.isDisabled === true;
        const triggerAttributes = button.filter(
          (attribute) =>
            // Base UI names the open hook on the trigger `data-panel-open`.
            !(
              attribute._tag === 'DataAttribute' && attribute.key === 'open'
            ) &&
            // A natively disabled button drops aria-disabled and leaves the
            // tab order on its own.
            !(
              isDisabled &&
              (attribute._tag === 'AriaDisabled' ||
                attribute._tag === 'Tabindex')
            ),
        );
        return h.div(
          [
            h.DataAttribute('slot', 'collapsible'),
            h.Class(cn(styles.root, props.layoutStyle)),
          ],
          [
            h.button(
              [
                ...triggerAttributes,
                ...(props.isOpen ? [h.DataAttribute('panel-open', '')] : []),
                ...(isDisabled ? [h.Disabled(true)] : []),
                h.Type('button'),
                h.DataAttribute('slot', 'collapsible-trigger'),
                h.Class(cn(styles.trigger, props.variant === 'sidebar' && styles.sidebarTrigger, props.triggerLayoutStyle)),
              ],
              [props.trigger],
            ),
            animatePanel(
              h.div(
                [
                  ...panel,
                  ...(props.isOpen
                    ? []
                    : [h.DataAttribute('closed', ''), h.Hidden(true)]),
                  h.DataAttribute('slot', 'collapsible-content'),
                  h.Class(cn(styles.content, props.contentLayoutStyle)),
                ],
                [props.content],
              ),
            ),
          ],
        );
      },
    },
    h,
  );
};

/*
Minimal wiring:
const model = init({ id: 'details' })
const nextModelOp__ = update(model, message);
    const nextModel = nextModelOp__.model;
    const commands = nextModelOp__.commands ?? [];
    const maybeToggle = Option.fromNullishOr(nextModelOp__.outMessage);
collapsible({
  model,
  toParentMessage: message => GotCollapsibleMessage({ message }),
  trigger: 'Show details',
  content: detailsView,
})
*/

