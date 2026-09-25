import * as stylex from '@stylexjs/stylex';
import type { Html, HtmlBuilder } from 'foldkit/html';

import type { ComponentLayoutStyle } from './contracts';
import { className } from './style';
import { interactionTokens } from './interaction-tokens.stylex.const'
import { tokens } from './tokens.stylex';

export type MarkerVariant = 'default' | 'separator' | 'border';
export type MarkerPurpose = 'annotation' | 'status' | 'decorative';
type ChildrenProps = Readonly<{
  children: ReadonlyArray<Html | string>;
  layoutStyle?: ComponentLayoutStyle;
}>;

const shimmerSweep = stylex.keyframes({
  from: { backgroundPosition: '100% 0' },
  to: { backgroundPosition: '0 0' },
});

const styles = stylex.create({
  root: {
    gap: '0.5rem',
    alignItems: 'center',
    color: tokens.mutedForeground,
    display: 'flex',
    fontSize: '0.875rem',
    position: 'relative',
    textAlign: 'left',
    minHeight: '1rem',
    width: '100%',
  },
  default: {},
  separator: {},
  border: {
    borderBlockEndColor: tokens.border,
    borderBlockEndStyle: 'solid',
    borderBlockEndWidth: 1,
    paddingBottom: '0.5rem',
  },
  interactive: {
    color: {
      default: tokens.mutedForeground,
      ':hover': tokens.foreground,
    },
    cursor: interactionTokens.cursorAction,
    textDecorationLine: {
      default: 'none',
      ':hover': 'none',
    },
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: 'color',
    width: 'fit-content',
  },
  column: { alignItems: 'flex-start', flexDirection: 'column', },
  icon: { flexShrink: 0, height: '1rem', width: '1rem' },
  content: { overflowWrap: 'break-word', minWidth: 0 },
  shimmer: {
    WebkitTextFillColor: 'transparent',
    animationDuration: interactionTokens.motionLoopSlow,
    animationIterationCount: 'infinite',
    animationName: shimmerSweep,
    animationTimingFunction: interactionTokens.easingLinear,
    backgroundClip: 'text',
    backgroundImage:
      'linear-gradient(110deg, currentColor calc(50% - 3ch - 40px), color-mix(in oklch, color-mix(in oklch, currentColor 20%, transparent), currentColor 50%) calc(50% - 1.5ch - 20px), color-mix(in oklch, currentColor 20%, transparent) 50%, color-mix(in oklch, color-mix(in oklch, currentColor 20%, transparent), currentColor 50%) calc(50% + 1.5ch + 20px), currentColor calc(50% + 3ch + 40px))',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'calc(200% + 6ch + 80px) 100%',
  },
});

export const markerVariants = (
  options: Readonly<{ variant?: MarkerVariant | null }> = {},
): string => className(styles.root, styles[options.variant ?? 'default']);

export const marker = <Msg>(
  props: ChildrenProps &
    Readonly<{
      variant?: MarkerVariant;
      purpose?: MarkerPurpose;
      ariaLabel?: string;
      element?: 'div' | 'a' | 'button';
      href?: string;
      onClick?: () => Msg;
      direction?: 'row' | 'column';
    }>,
  h: HtmlBuilder<Msg>,
): Html => {
  const purpose = props.purpose ?? 'annotation';
  const element = props.element ?? 'div';
  const attrs = [
    h.DataAttribute('slot', 'marker'),
    h.DataAttribute('variant', props.variant ?? 'default'),
    h.DataAttribute('purpose', purpose),
    ...(purpose === 'decorative'
      ? [h.Role('none'), h.AriaHidden(true)]
      : [h.Role(purpose === 'status' ? 'status' : 'note')]),
    ...(props.ariaLabel === undefined ? [] : [h.AriaLabel(props.ariaLabel)]),
    h.Class(
      className(
        styles.root,
        styles[props.variant ?? 'default'],
        ...(props.direction === 'column' ? [styles.column] : []),
        ...(element === 'div' ? [] : [styles.interactive]),
        props.layoutStyle,
      ),
    ),
  ];
  switch (element) {
    case 'a':
      return h.a([...attrs, h.Href(props.href ?? '#')], [...props.children]);
    case 'button':
      return h.button(
        [
          ...attrs,
          h.Type('button'),
          ...(props.onClick === undefined
            ? []
            : [h.OnClick(props.onClick())]),
        ],
        [...props.children],
      );
    default:
      return h.div(attrs, [...props.children]);
  }
};

export const markerIcon = <Msg>(
  props: ChildrenProps,
  h: HtmlBuilder<Msg>,
): Html =>
  h.span(
    [
      h.DataAttribute('slot', 'marker-icon'),
      h.AriaHidden(true),
      h.Class(className(styles.icon, props.layoutStyle)),
    ],
    [...props.children],
  );

export const markerContent = <Msg>(
  props: ChildrenProps & Readonly<{ shimmer?: boolean }>,
  h: HtmlBuilder<Msg>,
): Html =>
  h.span(
    [
      h.DataAttribute('slot', 'marker-content'),
      h.Class(
        className(
          styles.content,
          ...(props.shimmer === true ? [styles.shimmer] : []),
          props.layoutStyle,
        ),
      ),
    ],
    [...props.children],
  );
