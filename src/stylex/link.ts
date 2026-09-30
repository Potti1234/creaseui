import * as stylex from '@stylexjs/stylex';
import type { Html, HtmlBuilder } from 'foldkit/html';

import * as Icon from '@/lib/icon';

import type { ComponentLayoutStyle } from './contracts';
import { foundationTokens } from './foundations-tokens.stylex';
import { interactionTokens } from './interaction-tokens.stylex.const';
import { className } from './style';
import type {
  TextColor,
  TextDisplay,
  TextSize,
  TextType,
  TextWeight,
} from './text';
import { text } from './text';
import { tokens } from './tokens.stylex';

/* Ported from Meta Astryx Link (packages/core/src/Link/Link.tsx) — examples and
   visual spec adapted to Crease UI tokens. */

const BLANK_TARGET_REL_TOKENS = ['noopener', 'noreferrer'] as const;

const computeTargetAndRel = (
  target: string | undefined,
  rel: string | undefined,
): { target?: string; rel?: string } => {
  if (target !== '_blank') {
    return {
      ...(target === undefined ? {} : { target }),
      ...(rel === undefined ? {} : { rel }),
    };
  }
  const tokens = rel?.split(/\s+/).filter(Boolean) ?? [];
  for (const token of BLANK_TARGET_REL_TOKENS) {
    if (!tokens.includes(token)) {
      tokens.push(token);
    }
  }
  return { target, rel: tokens.join(' ') };
};

const styles = stylex.create({
  base: {
    gap: '2px',
    textDecoration: {
      default: 'none',
      ':hover': 'underline',
    },
    alignItems: 'center',
    cursor: {
      default: interactionTokens.cursorAction,
      ':is(:disabled,[aria-disabled="true"])': interactionTokens.cursorDefault,
    },
    display: 'inline-flex',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    fontWeight: 'inherit',
    lineHeight: 'inherit',
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: 'color, text-decoration',
    transitionTimingFunction: interactionTokens.easingStandard,
  },
  buttonReset: {
    padding: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  hasUnderline: {
    textDecoration: 'underline',
  },
  disabled: {
    cursor: interactionTokens.cursorDefault,
    opacity: 0.5,
    pointerEvents: 'none',
  },
  standalone: {
    fontSize: '0.875rem',
    lineHeight: 1.4286,
  },
  focusVisible: {
    outlineColor: {
      default: null,
      ':focus-visible': tokens.ring,
    },
    outlineOffset: {
      default: null,
      ':focus-visible': '3px',
    },
    outlineStyle: {
      default: null,
      ':focus-visible': 'solid',
    },
    outlineWidth: {
      default: null,
      ':focus-visible': '2px',
    },
  },
  pressedBackground: {
    backgroundColor: {
      default: null,
      ':active': foundationTokens.foregroundSoft,
    },
  },
  externalIcon: {
    flexShrink: 0,
    height: '0.625rem',
    width: '0.625rem',
  },
  visuallyHidden: {
    margin: '-1px',
    padding: 0,
    borderWidth: 0,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    position: 'absolute',
    whiteSpace: 'nowrap',
    height: '1px',
    width: '1px',
  },
});

const linkColorStyles = stylex.create({
  primary: {
    color: {
      default: tokens.foreground,
      /* PORT-NOTE: astryx hovers links toward tint-hover via
         color-mix(<color> 85%, light-dark(black,white) 15%); the nearest
         existing token is the 85% foreground alpha. */
      ':hover': foundationTokens.foregroundMuted,
    },
  },
  secondary: {
    color: {
      default: tokens.mutedForeground,
      ':hover': foundationTokens.foregroundMuted,
    },
  },
  /* PORT-NOTE: needs token 'textDisabled' = light #A4B0BC / dark #6F747C. */
  disabled: {
    color: tokens.mutedForeground,
    opacity: 0.5,
  },
  placeholder: {
    color: tokens.mutedForeground,
  },
  accent: {
    color: {
      default: tokens.primary,
      /* PORT-NOTE: astryx hovers toward tint-hover (darken/lighten 15%);
         primaryHover is the 90% primary alpha mix — the closest token. */
      ':hover': tokens.primaryHover,
    },
  },
  inherit: {
    color: 'currentColor',
  },
});

export type LinkProps<Msg> = Readonly<{
  children: ReadonlyArray<Html | string>;
  href?: string;
  label?: string;
  hasUnderline?: boolean;
  isDisabled?: boolean;
  isExternalLink?: boolean;
  newTabLabel?: string;
  target?: string;
  rel?: string;
  download?: string;
  onClick?: Msg;
  tooltip?: string;
  isStandalone?: boolean;
  type?: TextType;
  size?: TextSize;
  weight?: TextWeight;
  color?: TextColor;
  display?: TextDisplay;
  maxLines?: number;
  layoutStyle?: ComponentLayoutStyle;
}>;

export const link = <Msg>(props: LinkProps<Msg>, h: HtmlBuilder<Msg>): Html => {
  const color = props.color ?? 'accent';
  const isDisabled = props.isDisabled ?? false;
  const isExternalLink = props.isExternalLink ?? false;
  const newTabLabel = props.newTabLabel ?? '(opens in new tab)';
  const { target, rel } = computeTargetAndRel(
    isExternalLink ? '_blank' : props.target,
    props.rel,
  );
  const renderAsButton = props.href === undefined;

  const sharedContent = [
    text(
      {
        type: props.type ?? 'body',
        ...(props.size === undefined ? {} : { size: props.size }),
        ...(props.weight === undefined ? {} : { weight: props.weight }),
        color,
        display: props.display ?? 'inline',
        ...(props.maxLines === undefined ? {} : { maxLines: props.maxLines }),
        children: props.children,
      },
      h,
    ),
    ...(isExternalLink && !renderAsButton
      ? [
          Icon.icon<Msg>(
            'external-link',
            { class: className(styles.externalIcon) },
            h,
          ),
          h.span(
            [
              h.DataAttribute('slot', 'link-new-tab-label'),
              h.Class(className(styles.visuallyHidden)),
            ],
            [newTabLabel],
          ),
        ]
      : []),
  ];

  const sharedStyles = [
    styles.base,
    linkColorStyles[color],
    styles.focusVisible,
    ...(isDisabled ? [styles.disabled] : []),
    ...(props.hasUnderline === true ? [styles.hasUnderline] : []),
    ...(props.isStandalone === true ? [styles.standalone] : []),
  ];

  if (renderAsButton) {
    return h.button(
      [
        h.DataAttribute('slot', 'link'),
        h.DataAttribute('color', color),
        h.Type('button'),
        h.Class(
          className(
            ...sharedStyles,
            styles.buttonReset,
            ...(isDisabled ? [] : [styles.pressedBackground]),
            props.layoutStyle,
          ),
        ),
        ...(isDisabled
          ? [h.AriaDisabled(true), h.Tabindex(-1), h.Disabled(true)]
          : []),
        ...(props.onClick === undefined ? [] : [h.OnClick(props.onClick)]),
        ...(props.label === undefined ? [] : [h.AriaLabel(props.label)]),
        ...(props.tooltip === undefined ? [] : [h.Title(props.tooltip)]),
      ],
      sharedContent,
    );
  }

  if (isDisabled) {
    return h.a(
      [
        h.DataAttribute('slot', 'link'),
        h.DataAttribute('color', color),
        h.Class(className(...sharedStyles, props.layoutStyle)),
        h.AriaDisabled(true),
        h.Tabindex(-1),
        ...(props.label === undefined ? [] : [h.AriaLabel(props.label)]),
        ...(props.tooltip === undefined ? [] : [h.Title(props.tooltip)]),
      ],
      sharedContent,
    );
  }

  return h.a(
    [
      h.DataAttribute('slot', 'link'),
      h.DataAttribute('color', color),
      h.Class(
        className(...sharedStyles, styles.pressedBackground, props.layoutStyle),
      ),
      h.Href(props.href ?? ''),
      ...(target === undefined ? [] : [h.Target(target)]),
      ...(rel === undefined ? [] : [h.Rel(rel)]),
      ...(props.download === undefined ? [] : [h.Download(props.download)]),
      ...(props.onClick === undefined ? [] : [h.OnClick(props.onClick)]),
      ...(props.label === undefined ? [] : [h.AriaLabel(props.label)]),
      ...(props.tooltip === undefined ? [] : [h.Title(props.tooltip)]),
    ],
    sharedContent,
  );
};
