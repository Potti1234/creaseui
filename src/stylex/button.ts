import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'

import {
  type ButtonBehaviorProps,
  type ButtonLinkBehaviorProps,
  renderButton,
  renderButtonLink,
} from '@/lib/button'
import type {
  Assert,
  ButtonSize,
  ButtonVariant,
  ComponentLayoutStyle,
  HasExactlyKeys,
} from './contracts'
import { className } from './style'
import { tokens } from './tokens.stylex'
import { interactionTokens } from './interaction-tokens.stylex.const'

export type { ButtonSize, ButtonVariant } from './contracts'

const base = stylex.create({
  root: {
    borderColor: {
      default: tokens.transparent,
      ':focus-visible': tokens.ring,
    },
    borderRadius: tokens.controlRadius,
    borderStyle: 'solid',
    borderWidth: 0,
    gap: '0.5rem',
    alignItems: 'center',
    appearance: 'none',
    boxShadow: {
      default: tokens.shadowNone,
      ':focus-visible': tokens.focusRingShadow,
    },
    cursor: interactionTokens.cursorAction,
    display: 'inline-flex',
    flexShrink: 0,
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    fontWeight: 500,
    justifyContent: 'center',
    lineHeight: '1.25rem',
    outlineStyle: 'none',
    transform: {
      default: 'none',
      ':active': interactionTokens.pressTransform,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    transitionDuration: {
      default: interactionTokens.motionFast,
      '@media (prefers-reduced-motion: reduce)': interactionTokens.motionNone,
    },
    transitionProperty: 'background-color, color, border-color, box-shadow, transform',
    transitionTimingFunction: interactionTokens.easingStandard,
    whiteSpace: 'nowrap',
  },
  disabled: {
    cursor: interactionTokens.cursorDisabled,
    opacity: 0.5,
    pointerEvents: 'none',
  },
})

const variants = stylex.create({
  default: {
    backgroundColor: {
      default: tokens.primary,
      ':hover': tokens.primaryHover,
    },
    boxShadow: tokens.shadowSm,
    color: tokens.primaryForeground,
  },
  destructive: {
    backgroundColor: {
      default: tokens.destructiveSurface,
      ':hover': tokens.destructiveHover,
    },
    boxShadow: tokens.shadowSm,
    color: tokens.destructiveForeground,
  },
  outline: {
    borderColor: tokens.border,
    borderWidth: 1,
    backgroundColor: {
      default: tokens.outlineSurface,
      ':hover': tokens.outlineHover,
    },
    boxShadow: tokens.shadowSm,
    color: {
      default: tokens.foreground,
      ':hover': tokens.accentForeground,
    },
  },
  secondary: {
    backgroundColor: {
      default: tokens.secondary,
      ':hover': tokens.secondaryHover,
    },
    boxShadow: tokens.shadowSm,
    color: tokens.secondaryForeground,
  },
  ghost: {
    backgroundColor: {
      default: tokens.transparent,
      ':hover': tokens.accent,
    },
    color: {
      default: tokens.foreground,
      ':hover': tokens.accentForeground,
    },
  },
  link: {
    backgroundColor: tokens.transparent,
    color: tokens.primary,
    textDecorationLine: {
      default: 'none',
      ':hover': 'underline',
    },
    textUnderlineOffset: '4px',
  },
})

const sizes = stylex.create({
  default: {
    paddingInline: '0.75rem',
    height: '2rem',
  },
  sm: {
    gap: '0.375rem',
    paddingInline: '0.625rem',
    height: '1.75rem',
  },
  lg: {
    paddingInline: '1.5rem',
    height: '2.5rem',
  },
  icon: {
    paddingInline: 0,
    height: '2rem',
    width: '2rem',
  },
})

type _VariantMapIsExhaustive = Assert<HasExactlyKeys<typeof variants, ButtonVariant>>
type _SizeMapIsExhaustive = Assert<HasExactlyKeys<typeof sizes, ButtonSize>>

export type ButtonProps<Msg> = ButtonBehaviorProps<Msg> & Readonly<{
  variant?: ButtonVariant
  size?: ButtonSize
  /** Parent-layout positioning only. Add visual choices as named variants. */
  layoutStyle?: ComponentLayoutStyle
}>

export const button = <Msg>(props: ButtonProps<Msg>, h: HtmlBuilder<Msg>): Html =>
  renderButton(
    props,
    [h.Class(className(base.root, variants[props.variant ?? 'default'], sizes[props.size ?? 'default'], (props.isDisabled === true || props.isLoading === true) && base.disabled, props.layoutStyle))],
    h,
  )

export type ButtonLinkProps = ButtonLinkBehaviorProps & Readonly<{
  variant?: ButtonVariant
  size?: ButtonSize
  /** Parent-layout positioning only. Add visual choices as named variants. */
  layoutStyle?: ComponentLayoutStyle
}>

export const buttonLink = <Msg>(
  props: ButtonLinkProps,
  h: HtmlBuilder<Msg>,
): Html =>
  renderButtonLink(
    props,
    [h.Class(className(base.root, variants[props.variant ?? 'default'], sizes[props.size ?? 'default'], props.layoutStyle))],
    h,
  )
