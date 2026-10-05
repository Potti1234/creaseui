import { reset } from '@/stylex/reset'
import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'

import type { ComponentLayoutStyle } from './contracts'
import { className } from './style'
import { tokens } from './tokens.stylex'

/* Ported from Meta Astryx AppShell/AppShell.tsx — the application scaffold:
   root column shell with a skip link, an optional banner + topNav header
   region, an optional sideNav start panel, and a scrollable <main> content
   area. astryx's mobileNav drawer machinery is not ported (it depends on a
   media-query subscription and the SideNav/TopNav/MobileNav drawer
   components, none of which exist in Crease UI). astryx's auto-mode measured
   header offset becomes a fixed 48px (--spacing-12) sticky offset, and
   --radius-page = 28px becomes borderStartStartRadius '1.75rem'. */

const styles = stylex.create({
  root: {
    overflow: 'clip',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  rootFill: { height: '100dvh' },
  rootAuto: { minHeight: '100dvh' },
  variantWash: { backgroundColor: tokens.background },
  variantSurface: { backgroundColor: tokens.card },
  variantSection: { backgroundColor: tokens.card },
  variantElevated: { backgroundColor: tokens.background },
  skipLink: {
    margin: { default: '-1px', ':focus': 0 },
    borderWidth: 0,
    overflow: { default: 'hidden', ':focus': 'visible' },
    paddingBlock: { default: 0, ':focus': '0.5rem' },
    paddingInline: { default: 0, ':focus': '1rem' },
    backgroundColor: { default: 'transparent', ':focus': tokens.card },
    clipPath: { default: 'inset(50%)', ':focus': 'none' },
    color: { default: 'inherit', ':focus': tokens.primary },
    fontSize: { default: null, ':focus': '0.875rem' },
    fontWeight: { default: null, ':focus': 600 },
    insetInlineStart: { default: 0, ':focus': '0.5rem' },
    lineHeight: { default: null, ':focus': '1.25rem' },
    position: { default: 'absolute', ':focus': 'fixed' },
    textDecorationLine: { default: 'none', ':focus': 'none' },
    whiteSpace: { default: 'nowrap', ':focus': 'normal' },
    zIndex: { default: null, ':focus': 9999 },
    height: { default: '1px', ':focus': 'auto' },
    top: { default: 0, ':focus': '0.5rem' },
    width: { default: '1px', ':focus': 'auto' },
  },
  mainFocusTarget: { outline: { default: null, ':focus': 'none' } },
  banner: { flexShrink: 0 },
  headerSticky: { position: 'sticky', zIndex: 1, top: 0 },
  sideNavSticky: {
    overflow: 'clip',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    position: 'sticky',
    height: 'calc(100dvh - 3rem)',
    top: '3rem',
  },
  elevatedBackdrop: {
    inset: 0,
    backgroundColor: tokens.card,
    borderStartStartRadius: '1.75rem',
    pointerEvents: 'none',
    position: 'absolute',
  },
  elevatedContentWrapper: {
    display: 'flex',
    flexBasis: '0%',
    flexGrow: 1,
    flexShrink: 1,
    position: 'relative',
    height: '100%',
    minHeight: 0,
  },
  navAreaWash: { backgroundColor: tokens.background },
  navAreaSurface: { backgroundColor: tokens.card },
  contentBgWash: { backgroundColor: tokens.background },
  contentBgSurface: { backgroundColor: tokens.card },
  contentBgTransparent: {
    backgroundColor: 'transparent',
    isolation: 'isolate',
  },
  sideNav: { display: 'flex', flexDirection: 'column', flexShrink: 0 },
  sideNavFill: { overflow: 'auto' },
  sideNavAuto: {
    overflow: 'auto',
    flexBasis: '0%',
    flexGrow: 1,
    flexShrink: 1,
  },
  sideNavDivider: {
    borderColor: tokens.border,
    borderInlineEndStyle: 'solid',
    borderInlineEndWidth: 1,
  },
  headerDivider: {
    borderColor: tokens.border,
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
  },
  main: {
    flexBasis: '0%',
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
    minWidth: 0,
  },
  mainFill: { overflow: 'auto' },
  middle: {
    display: 'flex',
    flexBasis: '0%',
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
  },
})

const contentPaddingStyles = stylex.create({
  0: { padding: '0px' },
  0.5: { padding: '0.125rem' },
  1: { padding: '0.25rem' },
  1.5: { padding: '0.375rem' },
  2: { padding: '0.5rem' },
  3: { padding: '0.75rem' },
  4: { padding: '1rem' },
  5: { padding: '1.25rem' },
  6: { padding: '1.5rem' },
  8: { padding: '2rem' },
  10: { padding: '2.5rem' },
})

export type AppShellVariant = 'elevated' | 'wash' | 'surface' | 'section'
export type AppShellHeight = 'fill' | 'auto'
export type AppShellSpacing = keyof typeof contentPaddingStyles

export type AppShellProps = Readonly<{
  variant?: AppShellVariant
  banner?: Html
  topNav?: Html
  sideNav?: Html
  contentPadding?: AppShellSpacing
  height?: AppShellHeight
  skipLinkLabel?: string
  mainId?: string
  children?: ReadonlyArray<Html | string>
  layoutStyle?: ComponentLayoutStyle
}>

export const appShell = <Msg>(
  props: AppShellProps,
  h: HtmlBuilder<Msg>,
): Html => {
  const variant = props.variant ?? 'elevated'
  const height = props.height ?? 'fill'
  const isFill = height === 'fill'
  const isAuto = height === 'auto'
  const mainId = props.mainId ?? 'app-shell-main'
  const hasBanner = props.banner !== undefined
  const hasTopNav = props.topNav !== undefined
  const hasSideNav = props.sideNav !== undefined
  const navHasDividers = variant === 'section'
  const isElevated = variant === 'elevated'
  const contentPadding = props.contentPadding ?? 0
  const navAreaStyle =
    variant === 'wash' || variant === 'elevated'
      ? styles.navAreaWash
      : variant === 'surface'
        ? styles.navAreaSurface
        : undefined
  const contentAreaStyle =
    variant === 'wash'
      ? styles.contentBgWash
      : isElevated && hasTopNav && hasSideNav
        ? styles.contentBgTransparent
        : variant === 'surface' || variant === 'elevated'
          ? styles.contentBgSurface
          : undefined
  const headerAreaStyle =
    navAreaStyle ??
    (isAuto && variant === 'section' ? styles.navAreaSurface : undefined)
  const stickyBgStyle = navAreaStyle ?? styles.navAreaSurface

  const headerContent =
    hasTopNav || hasBanner
      ? h.div(
          [
            h.Role('banner'),
            h.DataAttribute('slot', 'app-shell-header'),
            h.Class(
              className(
                headerAreaStyle,
                isAuto ? styles.headerSticky : undefined,
              ),
            ),
          ],
          [
            h.header(
              [
                h.Class(
                  className(
                    navHasDividers && hasTopNav
                      ? styles.headerDivider
                      : undefined,
                  ),
                ),
              ],
              [
                ...(hasBanner
                  ? [
                      h.div(
                        [
                          h.DataAttribute('slot', 'app-shell-banner'),
                          h.Class(className(styles.banner, navAreaStyle)),
                        ],
                        [props.banner as Html],
                      ),
                    ]
                  : []),
                ...(hasTopNav ? [props.topNav as Html] : []),
              ],
            ),
          ],
        )
      : undefined

  const sideNavPanel = hasSideNav
    ? h.aside(
        [
          h.DataAttribute('slot', 'app-shell-sidenav'),
          h.Class(
            className(
              styles.sideNav,
              navAreaStyle,
              navHasDividers ? styles.sideNavDivider : undefined,
              isFill ? styles.sideNavFill : styles.sideNavAuto,
            ),
          ),
        ],
        [props.sideNav as Html],
      )
    : undefined

  const sideNavContent =
    sideNavPanel !== undefined && isAuto
      ? h.div(
          [h.Class(className(styles.sideNavSticky, stickyBgStyle))],
          [sideNavPanel],
        )
      : sideNavPanel

  const mainInner = h.main(
    [
      h.DataAttribute('slot', 'app-shell-content'),
      h.Id(mainId),
      h.Tabindex(-1),
      h.Class(
        className(
          styles.main,
          styles.mainFocusTarget,
          contentAreaStyle,
          contentPaddingStyles[contentPadding],
          isFill ? styles.mainFill : undefined,
        ),
      ),
    ],
    [...(props.children ?? [])],
  )

  const mainContent =
    isElevated && hasTopNav && hasSideNav
      ? h.div(
          [
            h.DataAttribute('slot', 'app-shell-elevated-wrapper'),
            h.Class(className(styles.elevatedContentWrapper)),
          ],
          [h.div([h.Class(className(styles.elevatedBackdrop))], []), mainInner],
        )
      : mainInner

  return h.div(
    [
      h.DataAttribute('slot', 'app-shell'),
      h.DataAttribute('variant', variant),
      h.Class(
        className(
          styles.root,
          variant === 'wash'
            ? styles.variantWash
            : variant === 'surface'
              ? styles.variantSurface
              : variant === 'section'
                ? styles.variantSection
                : styles.variantElevated,
          isFill ? styles.rootFill : styles.rootAuto,
          props.layoutStyle,
        ),
      ),
    ],
    [
      h.a(
        [
          h.Href(`#${mainId}`),
          h.DataAttribute('testid', 'skip-to-content'),
          h.Class(className(reset.link, styles.skipLink)),
        ],
        [props.skipLinkLabel ?? 'Skip to content'],
      ),
      ...(headerContent === undefined ? [] : [headerContent]),
      h.div(
        [
          h.DataAttribute('slot', 'app-shell-middle'),
          h.Class(className(styles.middle)),
        ],
        [
          ...(sideNavContent === undefined ? [] : [sideNavContent]),
          mainContent,
        ],
      ),
    ],
  )
}
