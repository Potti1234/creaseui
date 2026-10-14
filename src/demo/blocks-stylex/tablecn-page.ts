/* tablecn block — 1:1 port of sadmann7/tablecn's tasks data-table
   (src/app/components/tasks-table.tsx) + data-grid demo. StyleX renderer.
   The block owns its state via lib/tablecn-table + lib/tablecn-grid. */

import { Option, Schema as S } from 'effect'
import { Command } from 'foldkit'
import type { Update } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import * as stylex from '@stylexjs/stylex'
import { className } from '@/stylex/style'
import { tokens } from '@/stylex/tokens.stylex'
import { foundationTokens } from '@/stylex/foundations-tokens.stylex'
import { interactionTokens } from '@/stylex/interaction-tokens.stylex.const'
import { taggedStruct } from 'foldkit/schema'

import {
  actionBar,
  actionBarClose,
  actionBarGroup,
  actionBarItem,
  actionBarSelection,
  actionBarSeparator,
} from '@/stylex/action-bar'
import { badge } from '@/stylex/badge'
import { button } from '@/stylex/button'
import { checkbox } from '@/stylex/checkbox'
import { icon } from '@/stylex/composition/icon'
import { reset } from '@/stylex/reset'
import * as Calendar from '@/stylex/calendar'
import * as DateRangeInput from '@/stylex/date-range-input'
import * as Select from '@/stylex/select'
import * as Slider from '@/stylex/slider'
import * as TableState from '@/lib/tablecn-table'
import * as Grid from '@/lib/tablecn-grid'
import type { Task } from '@/lib/tablecn-data'
import { taskLabels, taskPriorities, taskStatuses } from '@/lib/tablecn-data'
import { gridView } from './tablecn-grid-view'

const st = stylex.create({
  badge0: {
    borderColor: tokens.border,
    borderRadius: foundationTokens.radiusFull,
    borderStyle: 'solid',
    borderWidth: '1px',
    gap: '0.25rem',
    overflow: 'hidden',
    paddingBlock: '0.25rem',
    paddingInline: '0.5rem',
    alignItems: 'center',
    color: tokens.foreground,
    display: 'inline-flex',
    flexShrink: 0,
    fontSize: '0.75rem',
    fontWeight: 500,
    justifyContent: 'center',
    lineHeight: '1rem',
    transitionProperty: 'all',
    whiteSpace: 'nowrap',
    height: '1.25rem',
    width: 'fit-content',
  },
  badge1: {
    borderColor: tokens.border,
    borderRadius: foundationTokens.radiusFull,
    borderStyle: 'solid',
    borderWidth: '1px',
    gap: '0.25rem',
    overflow: 'hidden',
    paddingBlock: '0.25rem',
    paddingInline: '0.5rem',
    alignItems: 'center',
    color: tokens.foreground,
    display: 'inline-flex',
    flexShrink: 0,
    fontSize: '0.75rem',
    fontWeight: 500,
    justifyContent: 'center',
    lineHeight: '1rem',
    transitionProperty: 'all',
    whiteSpace: 'nowrap',
    height: '1.25rem',
    width: 'fit-content',
  },
  badge2: {
    borderColor: 'transparent',
    borderRadius: foundationTokens.radiusSm,
    borderStyle: 'solid',
    borderWidth: '1px',
    gap: '0.25rem',
    overflow: 'hidden',
    paddingBlock: '0.125rem',
    paddingInline: '0.25rem',
    alignItems: 'center',
    backgroundColor: tokens.secondary,
    color: tokens.secondaryForeground,
    display: 'inline-flex',
    flexShrink: 0,
    fontSize: '0.75rem',
    fontWeight: 400,
    justifyContent: 'center',
    lineHeight: '1rem',
    transitionProperty: 'all',
    whiteSpace: 'nowrap',
    height: '1.25rem',
    width: 'fit-content',
  },
  badge3: {
    borderColor: 'transparent',
    borderRadius: foundationTokens.radiusSm,
    borderStyle: 'solid',
    borderWidth: '1px',
    gap: '0.25rem',
    overflow: 'hidden',
    paddingBlock: '0.125rem',
    paddingInline: '0.25rem',
    alignItems: 'center',
    backgroundColor: tokens.secondary,
    color: tokens.secondaryForeground,
    display: 'inline-flex',
    flexShrink: 0,
    fontSize: '0.75rem',
    fontWeight: 400,
    justifyContent: 'center',
    lineHeight: '1rem',
    transitionProperty: 'all',
    whiteSpace: 'nowrap',
    height: '1.25rem',
    width: 'fit-content',
  },
  badge4: {
    borderColor: 'transparent',
    borderRadius: foundationTokens.radiusSm,
    borderStyle: 'solid',
    borderWidth: '1px',
    gap: '0.25rem',
    overflow: 'hidden',
    paddingBlock: '0.125rem',
    paddingInline: '0.25rem',
    alignItems: 'center',
    backgroundColor: tokens.secondary,
    color: tokens.secondaryForeground,
    display: 'inline-flex',
    flexShrink: 0,
    fontSize: '0.75rem',
    fontWeight: 400,
    justifyContent: 'center',
    lineHeight: '1rem',
    transitionProperty: 'all',
    whiteSpace: 'nowrap',
    height: '1.25rem',
    width: 'fit-content',
  },
  badge5: {
    borderColor: 'transparent',
    borderRadius: foundationTokens.radiusSm,
    borderStyle: 'solid',
    borderWidth: '1px',
    gap: '0.25rem',
    overflow: 'hidden',
    paddingBlock: '0.125rem',
    paddingInline: '0.25rem',
    alignItems: 'center',
    backgroundColor: tokens.secondary,
    color: tokens.secondaryForeground,
    display: 'inline-flex',
    flexShrink: 0,
    fontSize: '0.75rem',
    fontWeight: 400,
    justifyContent: 'center',
    lineHeight: '1rem',
    transitionProperty: 'all',
    whiteSpace: 'nowrap',
    height: '1.25rem',
    width: 'fit-content',
  },
  badge6: {
    borderColor: 'transparent',
    borderRadius: foundationTokens.radiusSm,
    borderStyle: 'solid',
    borderWidth: '1px',
    gap: '0.25rem',
    overflow: 'hidden',
    paddingBlock: '0.125rem',
    paddingInline: '0.25rem',
    alignItems: 'center',
    backgroundColor: tokens.secondary,
    color: tokens.secondaryForeground,
    display: 'inline-flex',
    flexShrink: 0,
    fontSize: '0.75rem',
    fontWeight: 400,
    justifyContent: 'center',
    lineHeight: '1rem',
    transitionProperty: 'all',
    whiteSpace: 'nowrap',
    height: '1.25rem',
    width: 'fit-content',
  },
  badge7: {
    borderColor: 'transparent',
    borderRadius: foundationTokens.radiusFull,
    borderStyle: 'solid',
    borderWidth: '1px',
    gap: '0.25rem',
    overflow: 'hidden',
    paddingBlock: '0.125rem',
    paddingInline: '0.375rem',
    alignItems: 'center',
    backgroundColor: tokens.secondary,
    color: tokens.secondaryForeground,
    display: 'inline-flex',
    flexShrink: 0,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: '0.75rem',
    fontWeight: 500,
    justifyContent: 'center',
    lineHeight: '1rem',
    transitionProperty: 'all',
    whiteSpace: 'nowrap',
    height: '1.25rem',
    width: 'fit-content',
  },
  cbWrap8: { display: 'inline-flex', transform: 'translateY(0.125rem)' },
  cbWrap9: { display: 'inline-flex', transform: 'translateY(0.125rem)' },
  c0: {
    padding: '0.25rem',
    borderColor: tokens.border,
    borderRadius: foundationTokens.radiusMd,
    borderStyle: 'solid',
    borderWidth: '1px',
    backgroundColor: foundationTokens.popover,
    boxShadow: foundationTokens.shadowMd,
    color: foundationTokens.popoverForeground,
    outlineStyle: 'none',
    position: 'absolute',
    zIndex: 50,
    marginTop: '0.25rem',
    top: '100%',
    width: '12rem',
  },
  c1: {
    borderRadius: foundationTokens.radiusSm,
    gap: '0.5rem',
    paddingBlock: '0.375rem',
    alignItems: 'center',
    backgroundColor: {
      default: 'transparent',
      ':hover': tokens.accent,
      ':focus': tokens.accent,
    },
    color: {
      default: null,
      ':hover': tokens.accentForeground,
      ':focus': tokens.accentForeground,
    },
    cursor: interactionTokens.cursorDefault,
    display: 'flex',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    outlineStyle: 'none',
    paddingInlineEnd: '0.5rem',
    paddingInlineStart: '2rem',
    position: 'relative',
    userSelect: 'none',
    width: '100%',
  },
  c2: {
    paddingBlock: '0.375rem',
    paddingInline: '0.5rem',
    color: tokens.mutedForeground,
    fontSize: '0.75rem',
    fontWeight: 500,
    lineHeight: '1rem',
  },
  c3: {
    marginBlock: '0.25rem',
    marginInline: '-0.25rem',
    backgroundColor: tokens.border,
    height: '1px',
  },
  c6: { position: 'relative' },
  c7: {
    inset: '0',
    backgroundColor: 'transparent',
    cursor: interactionTokens.cursorDefault,
    position: 'fixed',
    zIndex: 40,
  },
  c8: {
    alignItems: 'center',
    display: 'flex',
    insetInlineStart: '0.5rem',
    justifyContent: 'center',
    position: 'absolute',
    height: '0.875rem',
    width: '0.875rem',
  },
  c10: {
    paddingInline: '0.5rem',
    color: tokens.foreground,
    fontWeight: 500,
    textAlign: 'left',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
    height: '2.5rem',
    width: '2.5rem',
  },
  c12: {
    paddingInline: '0.5rem',
    color: tokens.foreground,
    fontWeight: 500,
    textAlign: 'left',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
    height: '2.5rem',
  },
  c13: {
    borderRadius: foundationTokens.radiusMd,
    gap: '0.375rem',
    paddingBlock: '0.375rem',
    paddingInline: '0.5rem',
    alignItems: 'center',
    backgroundColor: { default: 'transparent', ':hover': tokens.accent },
    boxShadow: { default: null, ':focus': `inset 0 0 0 1px ${tokens.ring}` },
    cursor: interactionTokens.cursorAction,
    display: 'flex',
    fontWeight: 500,
    marginInlineStart: '-0.375rem',
    textAlign: 'left',
    height: '2rem',
    width: 'auto',
  },
  c14: { insetInlineStart: '0rem', width: '7rem' },
  c15: { paddingInlineStart: '2rem' },
  c16: {
    color: tokens.mutedForeground,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: '0.75rem',
    lineHeight: '1rem',
  },
  c17: { gap: '0.5rem', alignItems: 'center', display: 'flex' },
  c18: { flexShrink: '0' },
  c19: {
    overflow: 'hidden',
    fontWeight: 500,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: '0rem',
  },
  c20: {
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'right',
    width: '5rem',
  },
  c21: {
    color: tokens.mutedForeground,
    fontSize: '0.875rem',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: '1.25rem',
  },
  c22: { display: 'flex', justifyContent: 'flex-end' },
  c23: {
    borderRadius: foundationTokens.radiusMd,
    alignItems: 'center',
    backgroundColor: { default: 'transparent', ':hover': tokens.accent },
    color: { default: null, ':hover': tokens.accentForeground },
    display: 'inline-flex',
    justifyContent: 'center',
    height: '2rem',
    width: '2rem',
  },
  c24: { insetInlineEnd: '0rem', width: '10rem' },
  c25: { opacity: '0.5' },
  c26: { marginInlineStart: 'auto' },
  c27: {
    borderColor: tokens.border,
    borderRadius: foundationTokens.radiusMd,
    borderStyle: 'solid',
    borderWidth: '1px',
    gap: '0.375rem',
    paddingInline: '0.625rem',
    alignItems: 'center',
    backgroundColor: { default: 'transparent', ':hover': tokens.accent },
    boxShadow: foundationTokens.shadowXs,
    color: { default: null, ':hover': tokens.accentForeground },
    display: 'inline-flex',
    fontSize: '0.875rem',
    fontWeight: 500,
    justifyContent: 'center',
    lineHeight: '1.25rem',
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: 'color, background-color, border-color, box-shadow',
    whiteSpace: 'nowrap',
    height: '2rem',
  },
  c28: { borderStyle: 'dashed' },
  c29: {
    marginInline: '0.25rem',
    backgroundColor: tokens.border,
    height: '1rem',
    width: '1px',
  },
  c32: { padding: '0rem', insetInlineStart: '0rem', width: '12.5rem' },
  c33: { padding: '0.25rem', maxHeight: '18rem', overflowY: 'auto' },
  c37: {
    color: tokens.mutedForeground,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: '0.75rem',
    lineHeight: '1rem',
    marginInlineStart: 'auto',
  },
  c38: {
    justifyContent: 'center',
    paddingInlineStart: '2rem',
    textAlign: 'center',
  },
  c39: {
    borderColor: tokens.border,
    borderRadius: foundationTokens.radiusMd,
    borderStyle: 'solid',
    borderWidth: '1px',
    gap: '0.375rem',
    paddingInline: '0.625rem',
    alignItems: 'center',
    backgroundColor: { default: 'transparent', ':hover': tokens.accent },
    boxShadow: foundationTokens.shadowXs,
    display: 'inline-flex',
    fontSize: '0.875rem',
    fontWeight: 500,
    justifyContent: 'center',
    lineHeight: '1.25rem',
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: 'color, background-color, border-color, box-shadow',
    whiteSpace: 'nowrap',
    height: '2rem',
  },
  c41: { padding: '0.75rem', insetInlineStart: '0rem', width: '14rem' },
  c42: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: '1.25rem',
    marginBottom: '0.5rem',
  },
  c43: {
    borderColor: tokens.border,
    borderRadius: foundationTokens.radiusMd,
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingInline: '0.5rem',
    backgroundColor: 'transparent',
    boxShadow: {
      default: foundationTokens.shadowXs,
      ':focus-visible': `inset 0 0 0 1px ${tokens.ring}`,
    },
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    outlineStyle: 'none',
    height: '2rem',
    width: '100%',
  },
  c44: { color: tokens.mutedForeground },
  pl2: { paddingInlineStart: '0.5rem' },
  panelAuto: { padding: '0rem', insetInlineStart: '0rem', width: 'auto' },
  rowSel: { backgroundColor: tokens.muted },
  col3: { gap: '0.75rem', display: 'flex', flexDirection: 'column' },
  footerTop: {
    borderTopColor: tokens.border,
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    marginTop: '0.75rem',
    paddingTop: '0.75rem',
  },
  footerPad: {
    padding: '0.75rem',
    borderTopColor: tokens.border,
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
  },
  clearBtn: {
    borderColor: tokens.border,
    borderRadius: foundationTokens.radiusMd,
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingInline: '0.625rem',
    alignItems: 'center',
    backgroundColor: { default: 'transparent', ':hover': tokens.accent },
    boxShadow: foundationTokens.shadowXs,
    display: 'inline-flex',
    fontSize: '0.875rem',
    fontWeight: 500,
    justifyContent: 'center',
    lineHeight: '1.25rem',
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: 'color, background-color, border-color, box-shadow',
    whiteSpace: 'nowrap',
    height: '2rem',
    width: '100%',
  },
  c45: {
    borderColor: tokens.border,
    borderRadius: foundationTokens.radiusMd,
    borderStyle: 'solid',
    borderWidth: '1px',
    gap: '0.375rem',
    paddingInline: '0.625rem',
    alignItems: 'center',
    backgroundColor: { default: 'transparent', ':hover': tokens.accent },
    boxShadow: foundationTokens.shadowXs,
    color: { default: null, ':hover': tokens.accentForeground },
    display: { default: 'none', '@media (min-width: 1024px)': 'flex' },
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: '1.25rem',
    marginInlineStart: 'auto',
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: 'color, background-color, border-color, box-shadow',
    height: '2rem',
  },
  c46: { insetInlineEnd: '0rem', width: '11rem' },
  c47: {
    borderColor: tokens.border,
    borderRadius: foundationTokens.radiusMd,
    borderStyle: 'solid',
    borderWidth: '1px',
    gap: '0.375rem',
    paddingInline: '0.625rem',
    alignItems: 'center',
    backgroundColor: { default: 'transparent', ':hover': tokens.accent },
    boxShadow: foundationTokens.shadowXs,
    color: { default: null, ':hover': tokens.accentForeground },
    display: 'inline-flex',
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: '1.25rem',
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: 'color, background-color, border-color, box-shadow',
    height: '2rem',
  },
  c49: {
    padding: '1rem',
    gap: '0.875rem',
    flexDirection: 'column',
    insetInlineEnd: '0rem',
    minWidth: '23.75rem',
    width: 'auto',
  },
  c50: { gap: '0.25rem', display: 'flex', flexDirection: 'column' },
  c51: { fontWeight: 500, lineHeight: 1 },
  c52: {
    color: tokens.mutedForeground,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
  c53: {
    padding: '0.25rem',
    gap: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '300px',
    overflowY: 'auto',
  },
  c54: {
    padding: '0.25rem',
    borderRadius: foundationTokens.radiusMd,
    gap: '0.5rem',
    alignItems: 'center',
    display: 'flex',
    width: '100%',
  },
  c55: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: '1.25rem',
    width: '11rem',
  },
  c56: {
    gap: '0.25rem',
    alignItems: 'center',
    display: 'flex',
    marginInlineStart: 'auto',
  },
  c57: {
    borderRadius: foundationTokens.radiusSm,
    paddingInline: '0.5rem',
    fontSize: '0.75rem',
    lineHeight: '1rem',
    height: '1.75rem',
  },
  c58: { backgroundColor: tokens.accent, color: tokens.accentForeground },
  c59: {
    backgroundColor: { default: 'transparent', ':hover': tokens.accent },
    color: tokens.mutedForeground,
  },
  c60: {
    borderRadius: foundationTokens.radiusSm,
    alignItems: 'center',
    backgroundColor: {
      default: 'transparent',
      ':hover': `color-mix(in srgb, ${tokens.destructive} 10%, transparent)`,
    },
    color: { default: tokens.mutedForeground, ':hover': tokens.destructive },
    display: 'inline-flex',
    justifyContent: 'center',
    height: '1.75rem',
    width: '1.75rem',
  },
  c61: { gap: '0.5rem', alignItems: 'center', display: 'flex', width: '100%' },
  c62: { gap: '0.375rem' },
  c70: { gap: '0.5rem', display: 'grid' },
  c71: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1 },
  c72: {
    borderColor: tokens.border,
    borderRadius: foundationTokens.radiusMd,
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingInline: '0.625rem',
    backgroundColor: 'transparent',
    boxShadow: {
      default: foundationTokens.shadowXs,
      ':focus-visible': `inset 0 0 0 1px ${tokens.ring}`,
    },
    display: 'flex',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    outlineStyle: 'none',
    height: '2rem',
    width: '100%',
  },
  c73: {
    inset: '0',
    backgroundColor: tokens.backdrop,
    position: 'fixed',
    zIndex: 50,
  },
  c74: {
    padding: '1.5rem',
    gap: '1rem',
    backgroundColor: tokens.background,
    boxShadow: foundationTokens.shadowXl,
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    zIndex: 50,
    borderLeftColor: tokens.border,
    borderLeftStyle: 'solid',
    borderLeftWidth: '1px',
    bottom: '0',
    height: '100%',
    maxWidth: { default: null, '@media (min-width: 640px)': '24rem' },
    right: '0rem',
    top: '0',
    width: '75.0%',
  },
  c75: {
    borderRadius: foundationTokens.radiusSm,
    boxShadow: { default: null, ':focus': `0 0 0 2px ${tokens.ring}` },
    opacity: '0.7',
    position: 'absolute',
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: 'opacity',
    right: '1rem',
    top: '1rem',
  },
  c76: { gap: '0.375rem', display: 'flex', flexDirection: 'column' },
  c77: { fontSize: '1.125rem', fontWeight: 600, lineHeight: '1.75rem' },
  c78: { gap: '1rem', paddingBlock: '1rem', display: 'grid' },
  c79: {
    gap: '0.5rem',
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: 'auto',
  },
  c80: {
    padding: '1.5rem',
    borderColor: tokens.border,
    borderRadius: foundationTokens.radiusLg,
    borderStyle: 'solid',
    borderWidth: '1px',
    gap: '1rem',
    backgroundColor: tokens.background,
    boxShadow: foundationTokens.shadowXl,
    display: 'grid',
    position: 'fixed',
    transform: 'translateY(-50.0%)',
    zIndex: 50,
    left: '50%',
    maxWidth: {
      default: 'calc(100%-2rem)',
      '@media (min-width: 640px)': '32rem',
    },
    top: '50.0%',
    width: '100%',
  },
  c81: {
    gap: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    textAlign: { default: 'center', '@media (min-width: 640px)': 'left' },
  },
  c82: {
    gap: '0.5rem',
    display: 'flex',
    flexDirection: {
      default: 'column-reverse',
      '@media (min-width: 640px)': 'row',
    },
    justifyContent: { default: null, '@media (min-width: 640px)': 'flex-end' },
  },
  c83: {
    insetInlineStart: '0rem',
    bottom: '100%',
    marginBottom: '0.25rem',
    top: 'auto',
    width: '9rem',
  },
  c84: { fontWeight: 500 },
  c85: {
    borderColor: tokens.border,
    borderRadius: foundationTokens.radiusMd,
    borderStyle: 'solid',
    borderWidth: '1px',
    alignItems: 'center',
    backgroundColor: { default: 'transparent', ':hover': tokens.accent },
    boxShadow: foundationTokens.shadowXs,
    display: 'inline-flex',
    justifyContent: 'center',
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: 'color, background-color, border-color, box-shadow',
    height: '2rem',
    width: '2rem',
  },
  c86: {
    padding: '0.25rem',
    gap: { default: '1rem', '@media (min-width: 640px)': '2rem' },
    overflow: 'auto',
    alignItems: 'center',
    display: 'flex',
    flexDirection: {
      default: 'column-reverse',
      '@media (min-width: 640px)': 'row',
    },
    justifyContent: 'space-between',
    width: '100%',
  },
  c87: {
    flex: '1',
    color: tokens.mutedForeground,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    whiteSpace: 'nowrap',
  },
  c88: {
    gap: { default: '1rem', '@media (min-width: 640px)': '1.5rem' },
    alignItems: 'center',
    display: 'flex',
    flexDirection: {
      default: 'column-reverse',
      '@media (min-width: 640px)': 'row',
    },
  },
  c89: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: '1.25rem',
    whiteSpace: 'nowrap',
  },
  c91: {
    alignItems: 'center',
    display: 'flex',
    fontSize: '0.875rem',
    fontWeight: 500,
    justifyContent: 'center',
    lineHeight: '1.25rem',
    whiteSpace: 'nowrap',
  },
  c92: {
    padding: '0.25rem',
    gap: '0.625rem',
    display: 'flex',
    flexDirection: 'column',
    height: '100dvh',
    width: '100%',
  },
  c95: {
    padding: '0.25rem',
    gap: '0.5rem',
    alignItems: 'flex-start',
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },
  c96: {
    flex: '1',
    gap: '0.5rem',
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
  },
  c97: {
    borderColor: { default: tokens.border, ':focus-visible': tokens.ring },
    borderRadius: foundationTokens.radiusMd,
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingInline: '0.625rem',
    backgroundColor: 'transparent',
    boxShadow: {
      default: foundationTokens.shadowXs,
      ':focus-visible': `inset 0 0 0 1px ${tokens.ring}`,
    },
    color: { default: null, '::placeholder': tokens.mutedForeground },
    display: 'flex',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    outlineStyle: 'none',
    height: '2rem',
    width: { default: '10rem', '@media (min-width: 1024px)': '14rem' },
  },
  c98: {
    borderColor: tokens.border,
    borderRadius: foundationTokens.radiusMd,
    borderStyle: 'solid',
    borderWidth: '1px',
    flex: '1',
    overflow: 'auto',
    isolation: 'isolate',
    minHeight: '0',
  },
  c99: {
    borderCollapse: 'collapse',
    captionSide: 'bottom',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    tableLayout: 'fixed',
    width: '100%',
  },
  c100: { opacity: '1' },
  c101: {
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: 'color, background-color, border-color, box-shadow',
    borderBottomColor: tokens.border,
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
  },
  c102: { opacity: '1' },
  c103: {
    backgroundColor: {
      default: 'transparent',
      ':hover': `color-mix(in srgb, ${tokens.muted} 50%, transparent)`,
    },
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: 'color, background-color, border-color, box-shadow',
    borderBottomColor: tokens.border,
    borderBottomStyle: 'solid',
    borderBottomWidth: { default: '1px', ':last-child': '0px' },
  },
  c104: { padding: '0.5rem', verticalAlign: 'middle' },
  c105: { minWidth: '0rem' },
  c106: { gap: '0.625rem', display: 'flex', flexDirection: 'column' },
  icon0: { display: 'inline-flex', fontSize: '1rem' },
  icon1: { display: 'inline-flex' },
  icon2: { display: 'inline-flex' },
  icon3: { display: 'inline-flex' },
  icon4: { display: 'inline-flex' },
  icon5: { display: 'inline-flex' },
  icon6: { display: 'inline-flex' },
  icon7: { display: 'inline-flex' },
  icon8: { display: 'inline-flex' },
  icon9: { display: 'inline-flex' },
  icon10: { display: 'inline-flex' },
  icon11: { display: 'inline-flex' },
  icon12: { display: 'inline-flex' },
  icon13: { display: 'inline-flex' },
  icon14: { display: 'inline-flex' },
  icon15: { display: 'inline-flex' },
  icon17: { display: 'inline-flex' },
  icon18: { display: 'inline-flex' },
  icon19: { display: 'inline-flex' },
  icon20: { display: 'inline-flex' },
  icon21: { display: 'inline-flex' },
  icon22: {
    color: tokens.mutedForeground,
    display: 'inline-flex',
    fontSize: '1rem',
  },
  icon23: {
    color: tokens.mutedForeground,
    display: 'inline-flex',
    fontSize: '1rem',
  },
  icon24: { display: 'inline-flex' },
  icon27: { display: 'inline-flex' },
  icon28: { display: 'inline-flex', fontSize: '1rem' },
  icon29: { display: 'inline-flex', fontSize: '0.875rem', opacity: '0.6' },
  icon30: { display: 'inline-flex', fontSize: '1rem' },
  icon31: { display: 'inline-flex', fontSize: '1rem' },
  icon32: { display: 'inline-flex', fontSize: '1rem' },
  icon33: { display: 'inline-flex' },
  icon34: { display: 'inline-flex', fontSize: '1rem' },
})
export const ActiveView = S.Literals(['data-table', 'data-grid'])
export type ActiveView = typeof ActiveView.Type

export const Model = S.Struct({
  view: ActiveView,
  table: TableState.Model,
  grid: Grid.Model,
})
export type Model = typeof Model.Type

export const SwitchView = taggedStruct('TablecnSwitchView', {
  view: ActiveView,
})
/* Mount streams (action-bar escape + toolbar roving focus) emit their own
   message unions; forward them into the page union. */
export const GotActionBarMount = taggedStruct('TablecnActionBarMount', {
  message: S.Any,
})
export const GotToolbarMount = taggedStruct('TablecnToolbarMount', {
  message: S.Any,
})

export const Message = S.Union([
  SwitchView,
  GotActionBarMount,
  GotToolbarMount,
  TableState.Message,
  Grid.Message,
])
export type Message = typeof Message.Type

export const init = (view: ActiveView = 'data-table'): Model => ({
  view,
  table: TableState.init(100),
  grid: Grid.init(500),
})

type UpdateReturn = Update.Return<Model, Message>

const liftTable = (model: Model, message: TableState.Message): UpdateReturn => {
  const { model: table, commands } = TableState.update(model.table, message)
  return {
    model: { ...model, table },
    commands: Command.mapMessages(commands ?? [], m => m as Message),
  }
}

export const update = (model: Model, message: Message): UpdateReturn => {
  if (message._tag === 'TablecnSwitchView')
    return { model: { ...model, view: message.view } }
  if (message._tag === 'TablecnActionBarMount') {
    const inner = message.message as { _tag: string }
    return inner._tag === 'RequestedClose'
      ? liftTable(model, TableState.Message.ClosedActionBar({}))
      : { model }
  }
  if (message._tag === 'TablecnToolbarMount') return { model }
  // Grid and TableState share several message tags (SetPanel, ToggledSort,
  // ToggledAllRows, ToggledColumnHidden, SetDirection, RemovedSort), so route
  // by which view emitted the message — only one subview is mounted at a time.
  if (model.view === 'data-grid') {
    if (message._tag in Grid.Message)
      return {
        model: {
          ...model,
          grid: Grid.update(model.grid, message as Grid.Message),
        },
      }
    return { model }
  }
  if (message._tag in TableState.Message)
    return liftTable(model, message as TableState.Message)
  return { model }
}

/* ---------- shared chrome ---------- */

const PANEL_CLASS = st.c0

const tablecnStyles = stylex.create({
  pageSizeTrigger: { width: '4.5rem' },
})

const MENU_ITEM_CLASS = st.c1

const MENU_LABEL_CLASS = st.c2

const MENU_SEPARATOR_CLASS = st.c3

/* relative trigger wrapper + click-outside scrim + anchored panel.
   Callers attach their own onClick to the trigger element. */
const TRIGGER_PANEL = <Msg>(
  isOpen: boolean,
  trigger: Html,
  onClose: Msg,
  panel: Html,
  h: HtmlBuilder<Msg>,
): Html =>
  h.div(
    [h.Class(className(st.c6))],
    [
      trigger,
      ...(isOpen
        ? [
            h.button([
              h.Type('button'),
              h.AriaHidden(true),
              h.Tabindex(-1),
              h.Class(className(reset.button, st.c7)),
              h.OnClick(onClose),
            ]),
            h.div(
              [
                h.OnKeyDownPreventDefault(key =>
                  key === 'Escape' ? Option.some(onClose) : Option.none(),
                ),
              ],
              [panel],
            ),
          ]
        : []),
    ],
  )

const capitalize = (value: string): string =>
  value === '' ? value : value[0]!.toUpperCase() + value.slice(1)

const checkItem = <Msg>(
  label: string,
  isChecked: boolean,
  onSelect: Msg,
  iconNode: Html | undefined,
  h: HtmlBuilder<Msg>,
): Html =>
  h.button(
    [
      h.Type('button'),
      h.Role('menuitemcheckbox'),
      h.AriaChecked(isChecked),
      h.OnClick(onSelect),
      h.Class(className(reset.button, MENU_ITEM_CLASS)),
    ],
    [
      h.span(
        [h.Class(className(st.c8))],
        [
          isChecked
            ? h.span(
                [h.Class(className(st.icon0))],
                [icon({ name: 'check', size: 'sm' }, h)],
              )
            : h.empty,
        ],
      ),
      ...(iconNode === undefined ? [] : [iconNode]),
      h.span([], [label]),
    ],
  )

const sortIcon = (
  model: TableState.Model,
  columnId: string,
  h: HtmlBuilder<Message>,
): Html => {
  const entry = model.sorting.find(e => e.id === columnId)
  if (entry === undefined)
    return h.span(
      [h.Class(className(st.icon1))],
      [icon({ name: 'chevrons-up-down', size: 'sm' }, h)],
    )
  return entry.desc
    ? h.span(
        [h.Class(className(st.icon2))],
        [icon({ name: 'chevron-down', size: 'sm' }, h)],
      )
    : h.span(
        [h.Class(className(st.icon3))],
        [icon({ name: 'chevron-up', size: 'sm' }, h)],
      )
}

/* ---------- tasks table ---------- */

const STATUS_ICONS: Record<string, string> = {
  todo: 'circle',
  'in-progress': 'timer',
  done: 'circle-check-big',
  canceled: 'circle-x',
}
const PRIORITY_ICONS: Record<string, string> = {
  low: 'arrow-down',
  medium: 'arrow-right',
  high: 'arrow-up',
}
const LABEL_ICONS: Record<string, string> = {
  bug: 'bug',
  feature: 'sparkles',
  enhancement: 'arrow-up-circle',
  documentation: 'book',
}

const statusBadge = (status: string, h: HtmlBuilder<Message>): Html =>
  h.span(
    [h.Class(className(st.badge0))],
    [
      h.span(
        [h.Class(className(st.icon4))],
        [icon({ name: STATUS_ICONS[status] ?? 'circle', size: 'sm' }, h)],
      ),
      status === 'in-progress' ? 'In-Progress' : status,
    ],
  )

const priorityBadge = (priority: string, h: HtmlBuilder<Message>): Html =>
  h.span(
    [h.Class(className(st.badge1))],
    [
      h.span(
        [h.Class(className(st.icon5))],
        [icon({ name: PRIORITY_ICONS[priority] ?? 'minus', size: 'sm' }, h)],
      ),
      priority,
    ],
  )

const formatDate = (date: Date | string): string =>
  (date instanceof Date ? date : new Date(Date.parse(date))).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
  )

/* column defs used by toolbar + header + view menu */
interface TableColumn {
  id: string
  header: string
  sortable: boolean
  hideable: boolean
  filterVariant?: string
}

const COLUMNS: ReadonlyArray<TableColumn> = [
  { id: 'select', header: '', sortable: false, hideable: false },
  { id: 'code', header: 'Task', sortable: true, hideable: false },
  {
    id: 'title',
    header: 'Title',
    sortable: true,
    hideable: true,
    filterVariant: 'text',
  },
  {
    id: 'status',
    header: 'Status',
    sortable: true,
    hideable: true,
    filterVariant: 'multiSelect',
  },
  {
    id: 'priority',
    header: 'Priority',
    sortable: true,
    hideable: true,
    filterVariant: 'multiSelect',
  },
  {
    id: 'estimatedHours',
    header: 'Est. Hours',
    sortable: true,
    hideable: true,
    filterVariant: 'range',
  },
  {
    id: 'createdAt',
    header: 'Created At',
    sortable: true,
    hideable: true,
    filterVariant: 'dateRange',
  },
  { id: 'actions', header: '', sortable: false, hideable: false },
]

const visibleColumns = (model: TableState.Model): Array<TableColumn> =>
  COLUMNS.filter(c => !model.hiddenColumnIds.includes(c.id))

const headerCell = (
  model: TableState.Model,
  column: TableColumn,
  h: HtmlBuilder<Message>,
): Html => {
  const isOpen = model.headerMenuColumnId === column.id
  const close = TableState.Message.SetHeaderMenu({ columnId: '' })
  if (column.id === 'select') {
    const { rows } = TableState.pageTasks(model)
    const selected = new Set(model.selectedIds)
    const allSelected = rows.length > 0 && rows.every(r => selected.has(r.id))
    const someSelected = rows.some(r => selected.has(r.id)) && !allSelected
    return h.th(
      [h.DataAttribute('slot', 'table-head'), h.Class(className(st.c10))],
      [
        h.span(
          [h.Class(className(st.cbWrap9))],
          [
            checkbox(
              {
                id: 'select-all',
                isChecked: allSelected,
                isIndeterminate: someSelected,
                onToggle: checked =>
                  TableState.Message.ToggledAllRows({ checked }),
              },
              h,
            ),
          ],
        ),
      ],
    )
  }
  if (!column.sortable) {
    return h.th(
      [h.DataAttribute('slot', 'table-head'), h.Class(className(st.c12))],
      [column.header],
    )
  }
  const ascChecked = model.sorting.some(e => e.id === column.id && !e.desc)
  const descChecked = model.sorting.some(e => e.id === column.id && e.desc)
  return h.th(
    [h.DataAttribute('slot', 'table-head'), h.Class(className(st.c12))],
    [
      TRIGGER_PANEL(
        isOpen,
        h.button(
          [
            h.Type('button'),
            h.AriaHasPopup('menu'),
            h.AriaExpanded(isOpen),
            h.OnClick(
              TableState.Message.SetHeaderMenu({ columnId: column.id }),
            ),
            h.Class(className(reset.button, st.c13)),
            h.DataAttribute('state', isOpen ? 'open' : 'closed'),
          ],
          [column.header, sortIcon(model, column.id, h)],
        ),
        close,
        h.div(
          [
            h.Role('menu'),
            h.DataAttribute('slot', 'dropdown-menu-content'),
            h.Class(className(PANEL_CLASS, st.c14)),
          ],
          [
            checkItem(
              'Asc',
              ascChecked,
              TableState.Message.ToggledSort({
                columnId: column.id,
                desc: false,
              }),
              h.span(
                [h.Class(className(st.icon6))],
                [icon({ name: 'chevron-up', size: 'sm' }, h)],
              ),
              h,
            ),
            checkItem(
              'Desc',
              descChecked,
              TableState.Message.ToggledSort({
                columnId: column.id,
                desc: true,
              }),
              h.span(
                [h.Class(className(st.icon7))],
                [icon({ name: 'chevron-down', size: 'sm' }, h)],
              ),
              h,
            ),
            ...(column.hideable
              ? [
                  h.div([h.Class(className(MENU_SEPARATOR_CLASS))], []),
                  h.button(
                    [
                      h.Type('button'),
                      h.Role('menuitem'),
                      h.OnClick(
                        TableState.Message.ToggledColumnHidden({
                          columnId: column.id,
                        }),
                      ),
                      h.Class(className(reset.button, MENU_ITEM_CLASS, st.c15)),
                    ],
                    [
                      h.span(
                        [h.Class(className(st.icon8))],
                        [icon({ name: 'eye-off', size: 'sm' }, h)],
                      ),
                      'Hide',
                    ],
                  ),
                ]
              : []),
          ],
        ),
        h,
      ),
    ],
  )
}

const taskCell = (
  model: TableState.Model,
  task: Task,
  columnId: string,
  h: HtmlBuilder<Message>,
): Html => {
  switch (columnId) {
    case 'select':
      return h.span(
        [h.Class(className(st.cbWrap8))],
        [
          checkbox(
            {
              id: `select-${task.id}`,
              isChecked: model.selectedIds.includes(task.id),
              onToggle: () =>
                TableState.Message.ToggledRowSelected({
                  id: task.id,
                  shiftKey: false,
                }),
            },
            h,
          ),
        ],
      )
    case 'code':
      return h.span([h.Class(className(st.c16))], [task.code])
    case 'title':
      return h.div(
        [h.Class(className(st.c17))],
        [
          badge(
            {
              variant: 'outline',
              layoutStyle: st.c18,
              children: [
                h.span(
                  [h.Class(className(st.icon9))],
                  [
                    icon(
                      { name: LABEL_ICONS[task.label] ?? 'tag', size: 'sm' },
                      h,
                    ),
                  ],
                ),
                task.label,
              ],
            },
            h,
          ),
          h.span([h.Class(className(st.c19))], [task.title]),
        ],
      )
    case 'status':
      return statusBadge(task.status, h)
    case 'priority':
      return priorityBadge(task.priority, h)
    case 'estimatedHours':
      return h.div([h.Class(className(st.c20))], [String(task.estimatedHours)])
    case 'createdAt':
      return h.span([h.Class(className(st.c21))], [formatDate(task.createdAt)])
    case 'actions': {
      const isOpen = model.rowMenuRowId === task.id
      const close = TableState.Message.SetRowMenu({ rowId: '' })
      return h.div(
        [h.Class(className(st.c22))],
        [
          TRIGGER_PANEL(
            isOpen,
            h.button(
              [
                h.Type('button'),
                h.AriaLabel(`Open actions for ${task.code}`),
                h.AriaHasPopup('menu'),
                h.AriaExpanded(isOpen),
                h.OnClick(TableState.Message.SetRowMenu({ rowId: task.id })),
                h.Class(className(reset.button, st.c23)),
                h.DataAttribute('state', isOpen ? 'open' : 'closed'),
              ],
              [
                h.span(
                  [h.Class(className(st.icon10))],
                  [icon({ name: 'ellipsis', size: 'sm' }, h)],
                ),
              ],
            ),
            close,
            h.div(
              [
                h.Role('menu'),
                h.DataAttribute('slot', 'dropdown-menu-content'),
                h.Class(className(PANEL_CLASS, st.c24)),
              ],
              [
                h.div([h.Class(className(MENU_LABEL_CLASS))], ['Actions']),
                h.div([h.Class(className(MENU_SEPARATOR_CLASS))], []),
                h.button(
                  [
                    h.Type('button'),
                    h.Role('menuitem'),
                    h.OnClick(
                      TableState.Message.OpenedUpdateSheet({
                        taskId: task.id,
                      }),
                    ),
                    h.Class(className(reset.button, MENU_ITEM_CLASS, st.c15)),
                  ],
                  [
                    h.span(
                      [h.Class(className(st.icon11))],
                      [icon({ name: 'pencil', size: 'sm' }, h)],
                    ),
                    'Edit',
                  ],
                ),
                h.button(
                  [
                    h.Type('button'),
                    h.Role('menuitem'),
                    h.Class(
                      className(reset.button, MENU_ITEM_CLASS, st.c15, st.c25),
                    ),
                  ],
                  [
                    h.span(
                      [h.Class(className(st.icon12))],
                      [icon({ name: 'tag', size: 'sm' }, h)],
                    ),
                    'Labels',
                    h.span(
                      [h.Class(className(st.c26))],
                      [
                        h.span(
                          [h.Class(className(st.icon13))],
                          [icon({ name: 'chevron-right', size: 'sm' }, h)],
                        ),
                      ],
                    ),
                  ],
                ),
                h.div([h.Class(className(MENU_SEPARATOR_CLASS))], []),
                h.button(
                  [
                    h.Type('button'),
                    h.Role('menuitem'),
                    h.DataAttribute('variant', 'destructive'),
                    h.OnClick(
                      TableState.Message.OpenedDeleteDialog({
                        ids: [task.id],
                      }),
                    ),
                    h.Class(className(reset.button, MENU_ITEM_CLASS, st.c15)),
                  ],
                  [
                    h.span(
                      [h.Class(className(st.icon14))],
                      [icon({ name: 'trash-2', size: 'sm' }, h)],
                    ),
                    'Delete',
                  ],
                ),
              ],
            ),
            h,
          ),
        ],
      )
    }
    default:
      return h.empty
  }
}

/* ---------- toolbar ---------- */

const facetedFilter = (
  model: TableState.Model,
  columnId: 'status' | 'priority',
  title: string,
  options: ReadonlyArray<{ value: string; label: string; iconName: string }>,
  selected: ReadonlyArray<string>,
  toggle: (value: string) => TableState.Message,
  h: HtmlBuilder<Message>,
): Html => {
  const panelId = `filter-${columnId}` as const
  const isOpen = model.openPanel === panelId
  const counts = new Map<string, number>()
  for (const task of TableState.filteredTasks({
    ...model,
    statusFilter: columnId === 'status' ? [] : model.statusFilter,
    priorityFilter: columnId === 'priority' ? [] : model.priorityFilter,
  })) {
    const key = columnId === 'status' ? task.status : task.priority
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const trigger = h.button(
    [
      h.Type('button'),
      h.AriaHasPopup('menu'),
      h.AriaExpanded(isOpen),
      h.OnClick(TableState.Message.SetPanel({ panel: panelId })),
      h.Class(className(reset.button, st.c27, selected.length === 0 && st.c28)),
    ],
    [
      h.span(
        [h.Class(className(st.icon15))],
        [icon({ name: 'circle-plus', size: 'sm' }, h)],
      ),
      title,
      ...(selected.length > 0
        ? [
            h.span([h.Class(className(st.c29))], []),
            ...(selected.length > 2
              ? [
                  h.span(
                    [h.Class(className(st.badge2))],
                    [`${String(selected.length)} selected`],
                  ),
                  ...selected
                    .slice(0, 2)
                    .map(
                      value =>
                        h.span(
                          [h.Class(className(st.badge3))],
                          [value === 'in-progress' ? 'In-Progress' : value],
                        ) as Html,
                    ),
                ]
              : selected.map(
                  value =>
                    h.span(
                      [h.Class(className(st.badge4))],
                      [value === 'in-progress' ? 'In-Progress' : value],
                    ) as Html,
                )),
          ]
        : []),
    ],
  )
  return TRIGGER_PANEL(
    isOpen,
    trigger,
    TableState.Message.SetPanel({ panel: 'none' }),
    h.div(
      [
        h.Role('menu'),
        h.DataAttribute('slot', 'popover-content'),
        h.Class(className(PANEL_CLASS, st.c32)),
      ],
      [
        h.div(
          [h.Class(className(st.c33))],
          [
            ...options.map(option =>
              h.button(
                [
                  h.Type('button'),
                  h.Role('menuitemcheckbox'),
                  h.AriaChecked(selected.includes(option.value)),
                  h.OnClick(toggle(option.value)),
                  h.Class(className(reset.button, MENU_ITEM_CLASS, st.pl2)),
                ],
                [
                  h.span(
                    [h.Class(className(st.icon17))],
                    [icon({ name: option.iconName, size: 'sm' }, h)],
                  ),
                  h.span([], [option.label]),
                  h.span(
                    [h.Class(className(st.c37))],
                    [
                      selected.includes(option.value)
                        ? icon({ name: 'check', size: 'sm' }, h)
                        : String(counts.get(option.value) ?? 0),
                    ],
                  ),
                ],
              ),
            ),
            ...(selected.length > 0
              ? [
                  h.div([h.Class(className(MENU_SEPARATOR_CLASS))], []),
                  h.button(
                    [
                      h.Type('button'),
                      h.Role('menuitem'),
                      h.OnClick(TableState.Message.ClearedFilters({})),
                      h.Class(className(reset.button, MENU_ITEM_CLASS, st.c38)),
                    ],
                    ['Clear filters'],
                  ),
                ]
              : []),
          ],
        ),
      ],
    ),
    h,
  )
}

const rangeFilter = (
  model: TableState.Model,
  h: HtmlBuilder<Message>,
): Html => {
  const isOpen = model.openPanel === 'filter-hours'
  const trigger = h.button(
    [
      h.Type('button'),
      h.AriaHasPopup('menu'),
      h.AriaExpanded(isOpen),
      h.OnClick(TableState.Message.SetPanel({ panel: 'filter-hours' })),
      h.Class(className(reset.button, st.c39, !model.hasHoursFilter && st.c28)),
    ],
    [
      h.span(
        [h.Class(className(st.icon18))],
        [icon({ name: 'circle-plus', size: 'sm' }, h)],
      ),
      'Est. Hours',
      ...(model.hasHoursFilter
        ? [
            h.span([h.Class(className(st.c29))], []),
            h.span(
              [h.Class(className(st.badge5))],
              [
                model.hoursMax > 0
                  ? `${String(model.hoursMin)}-${String(model.hoursMax)}`
                  : `${String(model.hoursMin)}+`,
              ],
            ),
          ]
        : []),
    ],
  )
  const bounds = TableState.hoursBounds(model)
  const sliderValues: readonly [number, number] = [
    model.hasHoursFilter && model.hoursMin > 0 ? model.hoursMin : bounds.min,
    model.hasHoursFilter && model.hoursMax > 0 ? model.hoursMax : bounds.max,
  ]
  return TRIGGER_PANEL(
    isOpen,
    trigger,
    TableState.Message.SetPanel({ panel: 'none' }),
    h.div(
      [
        h.DataAttribute('slot', 'popover-content'),
        h.Class(className(PANEL_CLASS, st.c41)),
      ],
      [
        h.div(
          [h.Class(className(st.col3))],
          [
            h.div([h.Class(className(st.c42))], ['Estimated hours']),
            h.div(
              [h.Class(className(st.c17))],
              [
                h.input([
                  h.Type('number'),
                  h.Placeholder(String(bounds.min)),
                  h.Min(String(bounds.min)),
                  h.Max(String(bounds.max)),
                  h.Class(className(reset.input, st.c43)),
                  h.Value(String(sliderValues[0])),
                  h.OnInput(value =>
                    TableState.Message.ChangedHoursMin({
                      value,
                    }),
                  ),
                ]),
                h.input([
                  h.Type('number'),
                  h.Placeholder(String(bounds.max)),
                  h.Min(String(bounds.min)),
                  h.Max(String(bounds.max)),
                  h.Class(className(reset.input, st.c43)),
                  h.Value(String(sliderValues[1])),
                  h.OnInput(value =>
                    TableState.Message.ChangedHoursMax({
                      value,
                    }),
                  ),
                ]),
              ],
            ),
            Slider.rangeSlider(
              {
                model: model.hoursSlider,
                values: sliderValues,
                toParentMessage: message =>
                  TableState.Message.GotHoursSliderMessage({ message }),
                direction: model.direction,
                ariaLabels: ['Minimum hours', 'Maximum hours'],
              },
              h,
            ),
          ],
        ),
        ...(model.hasHoursFilter
          ? [
              h.div(
                [h.Class(className(st.footerTop))],
                [
                  h.button(
                    [
                      h.Type('button'),
                      h.OnClick(TableState.Message.ClearedHoursFilter({})),
                      h.Class(className(reset.button, st.clearBtn)),
                    ],
                    ['Clear'],
                  ),
                ],
              ),
            ]
          : []),
      ],
    ),
    h,
  )
}

const dateRangeFilter = (
  model: TableState.Model,
  h: HtmlBuilder<Message>,
): Html => {
  const isOpen = model.openPanel === 'filter-created'
  const hasRange = model.createdFrom !== '' || model.createdTo !== ''
  const label =
    model.createdFrom !== '' && model.createdTo !== ''
      ? `${model.createdFrom.slice(5)} – ${model.createdTo.slice(5)}`
      : model.createdFrom !== ''
        ? `After ${model.createdFrom.slice(5)}`
        : model.createdTo !== ''
          ? `Before ${model.createdTo.slice(5)}`
          : ''
  const trigger = h.button(
    [
      h.Type('button'),
      h.AriaHasPopup('menu'),
      h.AriaExpanded(isOpen),
      h.OnClick(TableState.Message.SetPanel({ panel: 'filter-created' })),
      h.Class(className(reset.button, st.c39, !hasRange && st.c28)),
    ],
    [
      h.span(
        [h.Class(className(st.icon19))],
        [icon({ name: 'circle-plus', size: 'sm' }, h)],
      ),
      'Created At',
      ...(hasRange
        ? [
            h.span([h.Class(className(st.c29))], []),
            h.span([h.Class(className(st.badge6))], [label]),
          ]
        : []),
    ],
  )
  const displayRange = Option.match(model.createdRange.pendingStart, {
    onNone: () => model.createdRange.value,
    onSome: start => Option.some({ start, end: start }),
  })
  return TRIGGER_PANEL(
    isOpen,
    trigger,
    TableState.Message.SetPanel({ panel: 'none' }),
    h.div(
      [
        h.DataAttribute('slot', 'popover-content'),
        h.Class(className(PANEL_CLASS, st.panelAuto)),
      ],
      [
        Calendar.calendar(
          {
            model: model.createdRange.calendar,
            maybeSelectedDate: Option.none(),
            toParentMessage: message =>
              TableState.Message.GotCreatedRangeMessage({
                message: DateRangeInput.Message.GotCalendarMessage({
                  message,
                }),
              }),
            captionLayout: 'dropdown',
            direction: model.direction,
            ...(Option.isSome(displayRange)
              ? { range: displayRange.value }
              : {}),
          },
          h,
        ),
        ...(hasRange
          ? [
              h.div(
                [h.Class(className(st.footerPad))],
                [
                  h.button(
                    [
                      h.Type('button'),
                      h.OnClick(TableState.Message.ClearedCreatedRange({})),
                      h.Class(className(reset.button, st.clearBtn)),
                    ],
                    ['Clear'],
                  ),
                ],
              ),
            ]
          : []),
      ],
    ),
    h,
  )
}

const dirToggle = (model: TableState.Model, h: HtmlBuilder<Message>): Html =>
  h.button(
    [
      h.Type('button'),
      h.AriaLabel('Toggle direction'),
      h.OnClick(
        TableState.Message.SetDirection({
          direction: model.direction === 'ltr' ? 'rtl' : 'ltr',
        }),
      ),
      h.Class(className(reset.button, st.c47)),
    ],
    [
      h.span(
        [h.Class(className(st.icon22))],
        [icon({ name: 'languages', size: 'sm' }, h)],
      ),
      model.direction === 'ltr' ? 'LTR' : 'RTL',
    ],
  )

const viewOptions = (
  model: TableState.Model,
  h: HtmlBuilder<Message>,
): Html => {
  const isOpen = model.openPanel === 'view-options'
  const trigger = h.button(
    [
      h.Type('button'),
      h.AriaLabel('View columns'),
      h.AriaHasPopup('menu'),
      h.AriaExpanded(isOpen),
      h.OnClick(TableState.Message.SetPanel({ panel: 'view-options' })),
      h.Class(className(reset.button, st.c45)),
    ],
    [
      h.span(
        [h.Class(className(st.icon20))],
        [icon({ name: 'settings-2', size: 'sm' }, h)],
      ),
      'View',
      h.span(
        [h.Class(className(st.icon21))],
        [icon({ name: 'chevron-down', size: 'sm' }, h)],
      ),
    ],
  )
  return TRIGGER_PANEL(
    isOpen,
    trigger,
    TableState.Message.SetPanel({ panel: 'none' }),
    h.div(
      [
        h.Role('menu'),
        h.DataAttribute('slot', 'dropdown-menu-content'),
        h.Class(className(PANEL_CLASS, st.c46)),
      ],
      [
        h.div([h.Class(className(MENU_LABEL_CLASS))], ['Toggle columns']),
        h.div([h.Class(className(MENU_SEPARATOR_CLASS))], []),
        ...COLUMNS.filter(c => c.hideable).map(column =>
          checkItem(
            column.header,
            !model.hiddenColumnIds.includes(column.id),
            TableState.Message.ToggledColumnHidden({ columnId: column.id }),
            undefined,
            h,
          ),
        ),
      ],
    ),
    h,
  )
}

const sortMenu = (model: TableState.Model, h: HtmlBuilder<Message>): Html => {
  const isOpen = model.openPanel === 'sort-menu'
  const sortable = COLUMNS.filter(
    c => c.sortable && !model.hiddenColumnIds.includes(c.id),
  )
  const trigger = h.button(
    [
      h.Type('button'),
      h.AriaLabel('Sort options'),
      h.AriaHasPopup('dialog'),
      h.AriaExpanded(isOpen),
      h.OnClick(TableState.Message.SetPanel({ panel: 'sort-menu' })),
      h.Class(className(reset.button, st.c47)),
    ],
    [
      h.span(
        [h.Class(className(st.icon22))],
        [icon({ name: 'arrow-down-up', size: 'sm' }, h)],
      ),
      'Sort',
      ...(model.sorting.length > 0
        ? [
            h.span(
              [h.Class(className(st.badge7))],
              [String(model.sorting.length)],
            ) as Html,
          ]
        : []),
    ],
  )
  const unused = sortable.filter(c => !model.sorting.some(e => e.id === c.id))
  return TRIGGER_PANEL(
    isOpen,
    trigger,
    TableState.Message.SetPanel({ panel: 'none' }),
    h.div(
      [
        h.DataAttribute('slot', 'popover-content'),
        h.Class(className(PANEL_CLASS, st.c49)),
      ],
      [
        h.div(
          [h.Class(className(st.c50))],
          [
            h.h4(
              [h.Class(className(st.c51))],
              [model.sorting.length > 0 ? 'Sort by' : 'No sorting applied'],
            ),
            h.p(
              [h.Class(className(st.c52))],
              [
                model.sorting.length > 0
                  ? 'Modify sorting to organize your rows.'
                  : 'Add sorting to organize your rows.',
              ],
            ),
          ],
        ),
        ...(model.sorting.length > 0
          ? [
              h.ul(
                [h.Class(className(st.c53))],
                model.sorting.map((entry, index) => {
                  const column = sortable.find(c => c.id === entry.id)
                  return h.li(
                    [h.Class(className(st.c54))],
                    [
                      h.span(
                        [h.Class(className(st.icon23))],
                        [icon({ name: 'grip-vertical', size: 'sm' }, h)],
                      ),
                      h.span(
                        [h.Class(className(st.c55))],
                        [column?.header ?? entry.id],
                      ),
                      h.div(
                        [h.Class(className(st.c56))],
                        [
                          h.button(
                            [
                              h.Type('button'),
                              h.AriaPressed(String(!entry.desc)),
                              h.OnClick(
                                TableState.Message.ChangedSortDirection({
                                  index,
                                  desc: false,
                                }),
                              ),
                              h.Class(
                                className(
                                  reset.button,
                                  st.c57,
                                  !entry.desc ? st.c58 : st.c59,
                                ),
                              ),
                            ],
                            ['Asc'],
                          ),
                          h.button(
                            [
                              h.Type('button'),
                              h.AriaPressed(String(entry.desc)),
                              h.OnClick(
                                TableState.Message.ChangedSortDirection({
                                  index,
                                  desc: true,
                                }),
                              ),
                              h.Class(
                                className(
                                  reset.button,
                                  st.c57,
                                  entry.desc ? st.c58 : st.c59,
                                ),
                              ),
                            ],
                            ['Desc'],
                          ),
                          h.button(
                            [
                              h.Type('button'),
                              h.AriaLabel(`Remove sort on ${entry.id}`),
                              h.OnClick(
                                TableState.Message.RemovedSort({ index }),
                              ),
                              h.Class(className(reset.button, st.c60)),
                            ],
                            [
                              h.span(
                                [h.Class(className(st.icon24))],
                                [icon({ name: 'trash-2', size: 'sm' }, h)],
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  )
                }),
              ),
            ]
          : []),
        h.div(
          [h.Class(className(st.c61))],
          [
            h.div(
              [h.Class(className(st.c6))],
              [
                button<Message>(
                  {
                    variant: 'outline',
                    size: 'sm',
                    buttonAttributes: [h.Class(className(st.c62))],
                    children: ['Add sort'],
                    isDisabled: unused.length === 0,
                    ...(unused.length === 0
                      ? {}
                      : {
                          onClick: TableState.Message.AddedSort({
                            columnId: unused[0]!.id,
                          }),
                        }),
                  },
                  h,
                ),
              ],
            ),
            ...(model.sorting.length > 0
              ? [
                  button(
                    {
                      variant: 'outline',
                      size: 'sm',
                      layoutStyle: st.c26,
                      children: ['Reset sorting'],
                      onClick: TableState.Message.ResetSorting({}),
                    },
                    h,
                  ) as Html,
                ]
              : []),
          ],
        ),
      ],
    ),
    h,
  )
}

/* ---------- update sheet + delete dialog ---------- */

const updateSheet = (
  model: TableState.Model,
  h: HtmlBuilder<Message>,
): Html => {
  if (model.updateSheetTaskId === '') return h.empty
  const field = (
    label: string,
    name: string,
    options: ReadonlyArray<string>,
  ): Html =>
    h.div(
      [h.Class(className(st.c70))],
      [
        h.label([h.Class(className(st.c71))], [label]),
        h.select(
          [
            h.Name(name),
            h.Class(className(st.c72)),
            h.OnInput(value =>
              TableState.Message.ChangedDraftField({
                field: name,
                value,
              }),
            ),
          ],
          options.map(option =>
            h.option(
              [
                h.Value(option),
                ...(option ===
                (name === 'label'
                  ? model.draftLabel
                  : name === 'status'
                    ? model.draftStatus
                    : model.draftPriority)
                  ? [h.Attribute('selected', '')]
                  : []),
              ],
              [capitalize(option)],
            ),
          ),
        ),
      ],
    )
  return h.div(
    [],
    [
      h.div([
        h.Class(className(st.c73)),
        h.OnClick(TableState.Message.ClosedUpdateSheet({})),
      ]),
      h.div(
        [
          h.Role('dialog'),
          h.AriaModal(true),
          h.DataAttribute('slot', 'sheet-content'),
          h.Class(className(st.c74)),
        ],
        [
          h.button(
            [
              h.Type('button'),
              h.AriaLabel('Close'),
              h.OnClick(TableState.Message.ClosedUpdateSheet({})),
              h.Class(className(reset.button, st.c75)),
            ],
            [
              h.span(
                [h.Class(className(st.icon27))],
                [icon({ name: 'x', size: 'sm' }, h)],
              ),
            ],
          ),
          h.div(
            [h.Class(className(st.c76))],
            [
              h.h2([h.Class(className(st.c77))], ['Update task']),
              h.p(
                [h.Class(className(st.c52))],
                ['Update the task details and save the changes'],
              ),
            ],
          ),
          h.div(
            [h.Class(className(st.c78))],
            [
              h.div(
                [h.Class(className(st.c70))],
                [
                  h.label([h.Class(className(st.c71))], ['Title']),
                  h.input([
                    h.Class(className(reset.input, st.c72)),
                    h.Value(model.draftTitle),
                    h.OnInput(value =>
                      TableState.Message.ChangedDraftField({
                        field: 'title',
                        value,
                      }),
                    ),
                  ]),
                ],
              ),
              field('Label', 'label', taskLabels),
              field('Status', 'status', taskStatuses),
              field('Priority', 'priority', taskPriorities),
              h.div(
                [h.Class(className(st.c70))],
                [
                  h.label([h.Class(className(st.c71))], ['Estimated Hours']),
                  h.input([
                    h.Type('number'),
                    h.Class(className(reset.input, st.c72)),
                    h.Value(model.draftHours),
                    h.OnInput(value =>
                      TableState.Message.ChangedDraftField({
                        field: 'estimatedHours',
                        value,
                      }),
                    ),
                  ]),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class(className(st.c79))],
            [
              button(
                {
                  variant: 'outline',
                  size: 'sm',
                  children: ['Cancel'],
                  onClick: TableState.Message.ClosedUpdateSheet({}),
                },
                h,
              ),
              button(
                {
                  variant: 'default',
                  size: 'sm',
                  children: ['Save'],
                  onClick: TableState.Message.SavedTask({}),
                },
                h,
              ),
            ],
          ),
        ],
      ),
    ],
  )
}

const deleteDialog = (
  model: TableState.Model,
  h: HtmlBuilder<Message>,
): Html => {
  if (model.deleteDialogIds.length === 0) return h.empty
  const count = model.deleteDialogIds.length
  return h.div(
    [],
    [
      h.div([
        h.Class(className(st.c73)),
        h.OnClick(TableState.Message.ClosedDeleteDialog({})),
      ]),
      h.div(
        [
          h.Role('alertdialog'),
          h.AriaModal(true),
          h.DataAttribute('slot', 'alert-dialog-content'),
          h.Class(className(st.c80)),
        ],
        [
          h.div(
            [h.Class(className(st.c81))],
            [
              h.h2([h.Class(className(st.c77))], ['Are you absolutely sure?']),
              h.p(
                [h.Class(className(st.c52))],
                [
                  `This action cannot be undone. This will permanently delete ${count === 1 ? 'this task' : `${String(count)} tasks`} from our servers.`,
                ],
              ),
            ],
          ),
          h.div(
            [h.Class(className(st.c82))],
            [
              button(
                {
                  variant: 'outline',
                  size: 'sm',
                  children: ['Cancel'],
                  onClick: TableState.Message.ClosedDeleteDialog({}),
                },
                h,
              ),
              button(
                {
                  variant: 'destructive',
                  size: 'sm',
                  children: ['Delete'],
                  onClick: TableState.Message.ConfirmedDelete({}),
                },
                h,
              ),
            ],
          ),
        ],
      ),
    ],
  )
}

/* ---------- action bar (diceui ActionBar port) ---------- */

const tasksActionBar = (
  model: TableState.Model,
  h: HtmlBuilder<Message>,
): Html => {
  const { rows } = TableState.pageTasks(model)
  const selected = new Set(model.selectedIds)
  const visible = rows.filter(row => selected.has(row.id))
  const open = visible.length > 0
  const menuItem = (label: string, onSelect: TableState.Message): Html =>
    h.button(
      [
        h.Type('button'),
        h.Role('menuitem'),
        h.OnClick(onSelect),
        h.Class(className(reset.button, MENU_ITEM_CLASS, st.c15)),
      ],
      [label],
    )
  const enumMenu = (
    menuId: string,
    label: string,
    iconName: string,
    options: ReadonlyArray<string>,
    apply: (value: string) => TableState.Message,
  ): Html => {
    const isOpen = model.actionBarMenu === menuId
    return h.div(
      [h.Class(className(st.c6))],
      [
        actionBarItem(
          {
            onSelect: TableState.Message.SetActionBarMenu({ menu: menuId }),
            extraStyle: st.c62,
            children: [
              h.span(
                [h.Class(className(st.icon28))],
                [icon({ name: iconName, size: 'sm' }, h)],
              ),
              label,
              h.span(
                [h.Class(className(st.icon29))],
                [icon({ name: 'chevron-down', size: 'sm' }, h)],
              ),
            ],
          },
          h,
        ),
        ...(isOpen
          ? [
              h.button([
                h.Type('button'),
                h.AriaHidden(true),
                h.Tabindex(-1),
                h.Class(className(reset.button, st.c7)),
                h.OnClick(TableState.Message.SetActionBarMenu({ menu: '' })),
              ]),
              h.div(
                [
                  h.Role('menu'),
                  h.DataAttribute('slot', 'dropdown-menu-content'),
                  h.Class(className(PANEL_CLASS, st.c83)),
                ],
                [
                  h.div([h.Class(className(MENU_LABEL_CLASS))], [label]),
                  ...options.map(option =>
                    menuItem(capitalize(option), apply(option)),
                  ),
                ],
              ),
            ]
          : []),
      ],
    )
  }
  return actionBar(
    {
      open,
      toParentMessage: message =>
        /* Forward mount-stream messages; update() closes the bar on
           RequestedClose and ignores the rest. */
        message._tag === 'RequestedClose'
          ? GotActionBarMount({ message })
          : GotToolbarMount({ message }),
      children: [
        actionBarSelection(
          {
            children: [
              h.span([h.Class(className(st.c84))], [String(visible.length)]),
              h.span([h.Class(className(st.c44))], ['selected']),
              actionBarSeparator({}, h),
              actionBarClose(
                {
                  onClose: TableState.Message.ClosedActionBar({}),
                  ariaLabel: 'Clear selection',
                  children: [
                    h.span(
                      [h.Class(className(st.icon30))],
                      [icon({ name: 'x', size: 'sm' }, h)],
                    ),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
        actionBarGroup(
          {
            children: [
              enumMenu(
                'status',
                'Status',
                'check-circle-2',
                [...taskStatuses],
                status => TableState.Message.AppliedBulkStatus({ status }),
              ),
              enumMenu(
                'priority',
                'Priority',
                'arrow-up',
                [...taskPriorities],
                priority =>
                  TableState.Message.AppliedBulkPriority({ priority }),
              ),
              actionBarItem(
                {
                  onSelect: TableState.Message.RequestedExport({}),
                  extraStyle: st.c62,
                  children: [
                    h.span(
                      [h.Class(className(st.icon31))],
                      [icon({ name: 'download', size: 'sm' }, h)],
                    ),
                    'Export',
                  ],
                },
                h,
              ),
              actionBarItem(
                {
                  variant: 'destructive',
                  onSelect: TableState.Message.OpenedDeleteDialog({
                    ids: [...selected],
                  }),
                  extraStyle: st.c62,
                  children: [
                    h.span(
                      [h.Class(className(st.icon32))],
                      [icon({ name: 'trash-2', size: 'sm' }, h)],
                    ),
                    'Delete',
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
      ],
    },
    h,
  )
}

/* ---------- pagination ---------- */

const pagination = (
  model: TableState.Model,
  pageCount: number,
  h: HtmlBuilder<Message>,
): Html => {
  const page = Math.min(model.pageIndex, pageCount - 1)
  const selected = model.selectedIds.length
  const pageBtn = (
    label: string,
    iconName: string,
    onClick: TableState.Message,
    isDisabled: boolean,
    extra?: string,
  ): Html =>
    h.button(
      [
        h.Type('button'),
        h.AriaLabel(label),
        h.OnClick(onClick),
        ...(isDisabled ? [h.Attribute('disabled', '')] : []),
        h.Class(
          className(reset.button, st.c85) +
            (extra === undefined ? '' : ' ' + extra),
        ),
      ],
      [
        h.span(
          [h.Class(className(st.icon33))],
          [icon({ name: iconName, size: 'sm' }, h)],
        ),
      ],
    )
  return h.div(
    [
      h.DataAttribute('slot', 'data-table-pagination'),
      h.Class(className(st.c86)),
    ],
    [
      h.div(
        [h.Role('status'), h.Class(className(st.c87))],
        [`${String(selected)} row${selected === 1 ? '' : 's'} selected.`],
      ),
      h.div(
        [h.Class(className(st.c88))],
        [
          h.div(
            [h.Class(className(st.c17))],
            [
              h.p([h.Class(className(st.c89))], ['Rows per page']),
              Select.select(
                {
                  model: model.pageSizeSelect,
                  maybeSelectedValue: Option.some(String(model.pageSize)),
                  toParentMessage: message =>
                    TableState.Message.GotPageSizeSelectMessage({ message }),
                  items: [10, 20, 30, 40, 50],
                  itemToValue: size => String(size),
                  itemToLabel: size => String(size),
                  size: 'sm',
                  ariaLabel: 'Rows per page',
                  triggerLayoutStyle: tablecnStyles.pageSizeTrigger,
                },
                h,
              ),
            ],
          ),
          h.div(
            [h.Class(className(st.c91))],
            [`Page ${String(page + 1)} of ${String(pageCount)}`],
          ),
          h.div(
            [h.Class(className(st.c17))],
            [
              pageBtn(
                'Go to first page',
                'chevrons-left',
                TableState.Message.SetPage({ index: 0 }),
                page === 0,
                'hidden lg:flex',
              ),
              pageBtn(
                'Go to previous page',
                'chevron-left',
                TableState.Message.SetPage({ index: page - 1 }),
                page === 0,
              ),
              pageBtn(
                'Go to next page',
                'chevron-right',
                TableState.Message.SetPage({ index: page + 1 }),
                page >= pageCount - 1,
              ),
              pageBtn(
                'Go to last page',
                'chevrons-right',
                TableState.Message.SetPage({ index: pageCount - 1 }),
                page >= pageCount - 1,
                'hidden lg:flex',
              ),
            ],
          ),
        ],
      ),
    ],
  )
}

/* ---------- the data table ---------- */

const tasksTable = (model: TableState.Model, h: HtmlBuilder<Message>): Html => {
  const { rows, pageCount } = TableState.pageTasks(model)
  const columns = visibleColumns(model)
  const filterCount = TableState.filterCount(model)
  return h.div(
    [
      h.DataAttribute('slot', 'data-table'),
      h.Dir(model.direction),
      h.Class(className(st.c92)),
    ],
    [
      h.div(
        [
          h.DataAttribute('slot', 'data-table-toolbar'),
          h.Class(className(st.c95)),
        ],
        [
          h.div(
            [h.Class(className(st.c96))],
            [
              h.input([
                h.Type('text'),
                h.Placeholder('Search titles...'),
                h.AriaLabel('Search titles'),
                h.Value(model.titleQuery),
                h.OnInput(value =>
                  TableState.Message.ChangedTitleQuery({
                    value,
                  }),
                ),
                h.Class(className(reset.input, st.c97)),
              ]),
              facetedFilter(
                model,
                'status',
                'Status',
                taskStatuses.map(value => ({
                  value,
                  label:
                    value === 'in-progress' ? 'In-Progress' : capitalize(value),
                  iconName: STATUS_ICONS[value] ?? 'circle',
                })),
                model.statusFilter,
                value => TableState.Message.ToggledStatusFilter({ value }),
                h,
              ),
              facetedFilter(
                model,
                'priority',
                'Priority',
                taskPriorities.map(value => ({
                  value,
                  label: capitalize(value),
                  iconName: PRIORITY_ICONS[value] ?? 'minus',
                })),
                model.priorityFilter,
                value => TableState.Message.ToggledPriorityFilter({ value }),
                h,
              ),
              rangeFilter(model, h),
              dateRangeFilter(model, h),
              ...(filterCount > 0
                ? [
                    button(
                      {
                        variant: 'outline',
                        size: 'sm',
                        buttonAttributes: [h.Class(className(st.c28))],
                        children: [
                          h.span(
                            [h.Class(className(st.icon34))],
                            [icon({ name: 'x', size: 'sm' }, h)],
                          ),
                          'Reset',
                        ],
                        onClick: TableState.Message.ClearedFilters({}),
                      },
                      h,
                    ) as Html,
                  ]
                : []),
            ],
          ),
          h.div(
            [h.Class(className(st.c17))],
            [sortMenu(model, h), viewOptions(model, h), dirToggle(model, h)],
          ),
        ],
      ),
      h.div(
        [h.Class(className(st.c98))],
        [
          h.table(
            [
              h.Role('table'),
              h.AriaLabel('Tasks'),
              h.Class(className(st.c99)),
              h.Style({ minWidth: '100%' }),
            ],
            [
              h.thead(
                [h.Class(className(st.c100))],
                [
                  h.tr(
                    [h.Class(className(st.c101))],
                    columns.map(column => headerCell(model, column, h)),
                  ),
                ],
              ),
              h.tbody(
                [h.Class(className(st.c102))],
                rows.map(task =>
                  h.tr(
                    [
                      h.DataAttribute(
                        'state',
                        model.selectedIds.includes(task.id)
                          ? 'selected'
                          : 'unselected',
                      ),
                      h.Class(
                        className(
                          st.c103,
                          model.selectedIds.includes(task.id) && st.rowSel,
                        ),
                      ),
                    ],
                    columns.map(column =>
                      h.td(
                        [
                          h.Class(className(st.c104)),
                          ...(column.id === 'title'
                            ? [h.Class(className(st.c105))]
                            : []),
                        ],
                        [taskCell(model, task, column.id, h)],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class(className(st.c106))],
        [pagination(model, pageCount, h), tasksActionBar(model, h)],
      ),
      updateSheet(model, h),
      deleteDialog(model, h),
    ],
  )
}

/* ---------- page ---------- */

export const view = (model: Model, h: HtmlBuilder<Message>): Html => {
  const hg = h as HtmlBuilder<Grid.Message>
  return model.view === 'data-table'
    ? tasksTable(model.table, h)
    : gridView(model.grid, hg)
}
