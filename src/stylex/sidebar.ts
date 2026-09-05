import * as stylex from '@stylexjs/stylex'
import type { StaticStyles } from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as Icon from '@/lib/icon'
import type { ComponentLayoutStyle } from './contracts'
import { className } from './style'
import { complexTokens } from './complex-tokens.stylex'
import { tokens } from './tokens.stylex'
import { interactionTokens } from './interaction-tokens.stylex.const'

export * from '@/lib/sidebar-state'

export type SidebarState = 'expanded' | 'collapsed'
export type SidebarSide = 'left' | 'right'
export type SidebarVariant = 'sidebar' | 'floating' | 'inset'
export type SidebarCollapsible = 'offcanvas' | 'icon' | 'none'
type Slot = Readonly<{ children: ReadonlyArray<Html | string>; layoutStyle?: ComponentLayoutStyle }>

const styles = stylex.create({
  action: { padding: 0, borderRadius: tokens.controlRadius, alignItems: 'center', aspectRatio: '1 / 1', backgroundColor: { default: tokens.transparent, ':hover': complexTokens.sidebarAccent }, color: { default: complexTokens.sidebarForeground, ':hover': complexTokens.sidebarAccentForeground }, display: 'flex', justifyContent: 'center', position: 'absolute', right: '0.75rem', top: '0.875rem', width: '1.25rem', },
  backdrop: { backgroundColor: complexTokens.overlaySurface, display: { default: 'block', '@media (min-width: 768px)': 'none' }, opacity: 0.5, position: 'fixed', zIndex: 40, bottom: 0, left: 0, right: 0, top: 0, },
  badge: { paddingInline: '0.25rem', alignItems: 'center', color: complexTokens.sidebarForeground, display: 'flex', fontSize: '0.75rem', fontVariantNumeric: 'tabular-nums', fontWeight: 500, justifyContent: 'center', pointerEvents: 'none', position: 'absolute', height: '1.25rem', minWidth: '1.25rem', right: '0.25rem', top: '0.375rem', },
  collapsedIcon: { overflow: 'hidden', width: 'var(--sidebar-width-icon)' },
  collapsedOffcanvas: { transform: 'translateX(-100%)' },
  collapsedOffcanvasRight: { transform: 'translateX(100%)' },
  content: { gap: '0.5rem',
 overflow: 'auto',
 display: 'flex',
 flexBasis: '0%',
 flexDirection: 'column',
 flexGrow: '1',
 flexShrink: '1',
 minHeight: 0, },
  footer: { padding: '0.5rem', gap: '0.5rem', display: 'flex', flexDirection: 'column', },
  group: { padding: '0.5rem', display: 'flex', flexDirection: 'column', position: 'relative', minWidth: 0, width: '100%', },
  groupFirst: { paddingBottom: '0.25rem' },
  groupLater: { paddingTop: '0.25rem' },
  groupContent: { fontSize: '0.875rem', width: '100%' },
  groupLabel: { overflow: 'hidden', paddingInline: '0.5rem', alignItems: 'center', color: complexTokens.sidebarForeground, display: 'flex', flexShrink: 0, fontSize: '0.75rem', fontWeight: 500, opacity: 0.7, whiteSpace: 'nowrap', height: '2rem', },
  header: { padding: '0.5rem', gap: '0.5rem', display: 'flex', flexDirection: 'column', },
  inset: { backgroundColor: tokens.background,
 display: 'flex',
 flexBasis: '0%',
 flexDirection: 'column',
 flexGrow: '1',
 flexShrink: '1',
 position: 'relative',
 width: '100%', },
  insetVariant: { margin: { default: 0, '@media (min-width: 768px)': '0.5rem' }, borderRadius: tokens.radius, boxShadow: { default: tokens.shadowNone, '@media (min-width: 768px)': tokens.shadowCard }, marginLeft: { default: 0, '@media (min-width: 768px)': 0 }, },
  insetVariantCollapsed: { marginLeft: { default: 0, '@media (min-width: 768px)': '0.5rem' } },
  inner: { backgroundColor: complexTokens.sidebar, color: complexTokens.sidebarForeground, display: 'flex', flexDirection: 'column', height: '100%', width: '100%' },
  innerFloating: { borderColor: complexTokens.sidebarBorder, borderRadius: tokens.radius, borderStyle: 'solid', borderWidth: 1, boxShadow: tokens.shadowCard },
  input: { borderColor: { default: tokens.input, ':focus-visible': tokens.ring }, borderRadius: tokens.controlRadius, borderStyle: 'solid', borderWidth: 1, paddingInline: '0.625rem', backgroundColor: tokens.background, boxShadow: { default: tokens.shadowNone, ':focus-visible': tokens.focusRingShadow }, fontSize: '0.875rem', outlineStyle: 'none', height: '2rem', minWidth: 0, width: '100%', },
  menu: { gap: '0.25rem', display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%', },
  menuAction: { padding: 0, borderRadius: tokens.controlRadius, alignItems: 'center', backgroundColor: { default: tokens.transparent, ':hover': complexTokens.sidebarAccent }, color: complexTokens.sidebarForeground, display: 'flex', justifyContent: 'center', position: 'absolute', height: '1.25rem', right: '0.25rem', top: '0.375rem', width: '1.25rem', },
  menuActionHover: { opacity: { default: 0, ':focus-visible': 1, ':hover': 1, } },
  menuButton: { padding: '0.5rem', borderRadius: tokens.controlRadius, gap: '0.5rem', overflow: 'hidden', alignItems: 'center', backgroundColor: { default: tokens.transparent, ':hover': complexTokens.sidebarAccent, ':active': complexTokens.sidebarAccent }, color: { default: complexTokens.sidebarForeground, ':hover': complexTokens.sidebarAccentForeground }, display: 'flex', textAlign: 'left', transitionProperty: 'width, height, padding', width: '100%', },
  menuButtonActive: { backgroundColor: complexTokens.sidebarAccent, color: complexTokens.sidebarAccentForeground, fontWeight: 500 },
  menuButtonDefault: { fontSize: '0.875rem', height: '2rem' },
  menuButtonLg: { fontSize: '0.875rem', height: '3rem' },
  menuButtonOutline: { backgroundColor: { default: tokens.background, ':hover': complexTokens.sidebarAccent }, boxShadow: complexTokens.resizeShadow },
  menuButtonPrimary: { backgroundColor: { default: tokens.primary, ':hover': tokens.primary }, color: { default: tokens.primaryForeground, ':hover': tokens.primaryForeground }, fontWeight: 600 },
  menuButtonSm: { fontSize: '0.75rem', height: '1.75rem' },
  menuItem: { position: 'relative' },
  mobile: { backgroundColor: complexTokens.sidebar, color: complexTokens.sidebarForeground, display: { default: 'flex', '@media (min-width: 768px)': 'none' }, flexDirection: 'column', position: 'fixed', zIndex: 50, bottom: 0, maxWidth: 'calc(100vw - 2rem)', top: 0, width: 'var(--sidebar-width-mobile)', },
  mobileClose: { borderRadius: tokens.controlRadius, alignItems: 'center', backgroundColor: { default: tokens.transparent, ':hover': complexTokens.sidebarAccent }, color: { default: complexTokens.sidebarForeground, ':hover': complexTokens.sidebarAccentForeground }, display: { default: 'inline-flex', '@media (min-width: 768px)': 'none' }, justifyContent: 'center', position: 'absolute', height: '2rem', right: '0.5rem', top: '0.5rem', width: '2rem', },
  panel: { backgroundColor: complexTokens.sidebar, color: complexTokens.sidebarForeground, display: 'flex', flexDirection: 'column', borderRightColor: complexTokens.sidebarBorder, borderRightStyle: 'solid', borderRightWidth: 1, height: '100%', minWidth: 0, width: '100%', },
  panelTransparent: { backgroundColor: tokens.transparent },
  rail: { cursor: interactionTokens.cursorResizeHorizontal, display: { default: 'none', '@media (min-width: 640px)': 'block' }, position: 'absolute', zIndex: 20, bottom: 0, top: 0, width: '1rem', },
  right: { left: 'auto', right: 0 },
  root: { color: complexTokens.sidebarForeground, position: 'relative' },
  sidebarGap: { backgroundColor: tokens.transparent, display: { default: 'none', '@media (min-width: 768px)': 'block' }, flexShrink: 0, transitionDuration: interactionTokens.motionModerate, transitionProperty: 'width', width: 'var(--sidebar-width)' },
  sidebarGapCollapsedIcon: { width: 'var(--sidebar-width-icon)' },
  sidebarGapCollapsedFloating: { width: 'calc(var(--sidebar-width-icon) + 1rem)' },
  sidebarGapCollapsedOffcanvas: { width: 0 },
  separator: { marginInline: '0.5rem', backgroundColor: complexTokens.sidebarBorder, flexShrink: 0, height: 1, },
  sidebarContainer: { display: { default: 'none', '@media (min-width: 768px)': 'flex' }, position: 'fixed', transitionDuration: interactionTokens.motionModerate, transitionProperty: 'left, right, width, transform', zIndex: 10, bottom: 0, height: '100svh', left: 0, top: 0, width: 'var(--sidebar-width)', },
  sidebarContainerContained: { position: 'absolute', height: '100%' },
  sidebarContainerFloating: { padding: '0.5rem' },
  sidebarContainerFloatingCollapsed: { width: 'calc(var(--sidebar-width-icon) + 1rem)' },
  skeleton: { gap: '0.5rem', paddingInline: '0.5rem', alignItems: 'center', display: 'flex', height: '2rem', },
  skeletonIcon: { borderRadius: tokens.controlRadius, backgroundColor: complexTokens.sidebarAccent, height: '1rem', width: '1rem', },
  skeletonText: { borderRadius: tokens.controlRadius,
 backgroundColor: complexTokens.sidebarAccent,
 flexBasis: '0%',
 flexGrow: '1',
 flexShrink: '1',
 height: '1rem',
 maxWidth: 'var(--skeleton-width)', },
  srOnly: { margin: -1, padding: 0, overflow: 'hidden', position: 'absolute', height: 1, width: 1, },
  sub: { gap: '0.25rem', marginInline: '0.875rem', paddingBlock: '0.125rem', paddingInline: '0.625rem', display: 'flex', flexDirection: 'column', transform: 'translateX(1px)', borderLeftColor: complexTokens.sidebarBorder, borderLeftStyle: 'solid', borderLeftWidth: 1, minWidth: 0, },
  subButton: { borderRadius: tokens.controlRadius, gap: '0.5rem', overflow: 'hidden', paddingInline: '0.5rem', alignItems: 'center', backgroundColor: { default: tokens.transparent, ':hover': complexTokens.sidebarAccent }, color: { default: complexTokens.sidebarForeground, ':hover': complexTokens.sidebarAccentForeground }, display: 'flex', textDecorationLine: 'none', transform: 'translateX(-1px)', height: '1.75rem', minWidth: 0, },
  subMd: { fontSize: '0.875rem' },
  subSm: { fontSize: '0.75rem' },
  trigger: { borderRadius: tokens.controlRadius, alignItems: 'center', backgroundColor: { default: tokens.transparent, ':hover': complexTokens.sidebarAccent }, display: 'inline-flex', justifyContent: 'center', height: '1.75rem', width: '1.75rem', },
  triggerDesktop: { display: { default: 'none', '@media (min-width: 768px)': 'inline-flex' } },
  triggerMobile: { display: { default: 'inline-flex', '@media (min-width: 768px)': 'none' } },
  triggerWrapper: { display: 'contents' },
  wrapper: { display: 'flex', minHeight: '100svh', width: '100%' },
})

const slotDiv = (slot: string, sidebarPart: string, base: StaticStyles) => <Msg>(props: Slot, h: HtmlBuilder<Msg>): Html => h.div([h.DataAttribute('slot', slot), h.DataAttribute('sidebar', sidebarPart), h.Class(className(base, props.layoutStyle))], [...props.children])

export type SidebarProviderProps = Slot & Readonly<{ state?: SidebarState; width?: string; mobileWidth?: string; iconWidth?: string }>
export const sidebarProvider = <Msg>(props: SidebarProviderProps, h: HtmlBuilder<Msg>): Html => h.div([h.DataAttribute('renderer', 'stylex'), h.DataAttribute('slot', 'sidebar-wrapper'), h.DataAttribute('state', props.state ?? 'expanded'), h.Style({ '--sidebar-width': props.width ?? '16rem', '--sidebar-width-mobile': props.mobileWidth ?? '18rem', '--sidebar-width-icon': props.iconWidth ?? '3rem' }), h.Class(className(styles.wrapper, props.layoutStyle))], [...props.children])

export type SidebarProps<Msg> = Slot & Readonly<{ state?: SidebarState; side?: SidebarSide; variant?: SidebarVariant; collapsible?: SidebarCollapsible; surface?: 'default' | 'transparent'; presentation?: 'application' | 'contained'; isMobileOpen?: boolean; onMobileDismiss?: Msg }>
export const sidebar = <Msg>(props: SidebarProps<Msg>, h: HtmlBuilder<Msg>): Html => {
  const state = props.state ?? 'expanded'; const side = props.side ?? 'left'; const variant = props.variant ?? 'sidebar'; const collapsible = props.collapsible ?? 'offcanvas'
  if (collapsible === 'none') return h.div([h.DataAttribute('slot', 'sidebar'), h.Class(className(styles.panel, props.surface === 'transparent' && styles.panelTransparent, props.layoutStyle))], [...props.children])
  const collapsed = state === 'collapsed'
  return h.div([h.DataAttribute('state', state), h.DataAttribute('collapsible', collapsed ? collapsible : ''), h.DataAttribute('variant', variant), h.DataAttribute('side', side), h.DataAttribute('slot', 'sidebar'), h.Class(className(styles.root, props.layoutStyle))], [
    ...((props.isMobileOpen ?? false) ? [h.button([h.Type('button'), h.AriaLabel('Close sidebar backdrop'), ...(props.onMobileDismiss === undefined ? [] : [h.OnClick(props.onMobileDismiss)]), h.Class(className(styles.backdrop))], []), h.aside([h.DataAttribute('slot', 'sidebar-mobile'), h.AriaLabel('Sidebar'), h.Class(className(styles.mobile, side === 'right' && styles.right))], [...props.children, ...(props.onMobileDismiss === undefined ? [] : [h.button([h.Type('button'), h.AriaLabel('Close sidebar'), h.OnClick(props.onMobileDismiss), h.Class(className(styles.mobileClose))], [Icon.x({}, h)])])])] : []),
    h.div([h.DataAttribute('slot', 'sidebar-gap'), h.Class(className(styles.sidebarGap, collapsed && collapsible === 'offcanvas' && styles.sidebarGapCollapsedOffcanvas, collapsed && collapsible === 'icon' && (variant === 'floating' || variant === 'inset' ? styles.sidebarGapCollapsedFloating : styles.sidebarGapCollapsedIcon)))], []),
    h.div([h.DataAttribute('slot', 'sidebar-container'), h.Class(className(styles.sidebarContainer, props.presentation === 'contained' && styles.sidebarContainerContained, side === 'right' && styles.right, (variant === 'floating' || variant === 'inset') && styles.sidebarContainerFloating, collapsed && collapsible === 'offcanvas' && (side === 'right' ? styles.collapsedOffcanvasRight : styles.collapsedOffcanvas), collapsed && collapsible === 'icon' && (variant === 'floating' || variant === 'inset' ? styles.sidebarContainerFloatingCollapsed : styles.collapsedIcon)))], [h.div([h.DataAttribute('sidebar', 'sidebar'), h.DataAttribute('slot', 'sidebar-inner'), h.Class(className(styles.inner, variant === 'floating' && styles.innerFloating))], [...props.children])]),
  ])
}

export type SidebarTriggerProps<Msg> = Readonly<{ onClick: Msg; onMobileClick?: Msg; layoutStyle?: ComponentLayoutStyle }>
export const sidebarTrigger = <Msg>(props: SidebarTriggerProps<Msg>, h: HtmlBuilder<Msg>): Html => { const trigger = (onClick: Msg, visibility?: StaticStyles): Html => h.button([h.DataAttribute('sidebar', 'trigger'), h.DataAttribute('slot', 'sidebar-trigger'), h.OnClick(onClick), h.Type('button'), h.Class(className(styles.trigger, visibility, props.layoutStyle))], [Icon.panelLeft<Msg>({}, h), h.span([h.Class(className(styles.srOnly))], ['Toggle Sidebar'])]); return props.onMobileClick === undefined ? trigger(props.onClick) : h.span([h.DataAttribute('slot', 'sidebar-responsive-trigger'), h.Class(className(styles.triggerWrapper))], [trigger(props.onMobileClick, styles.triggerMobile), trigger(props.onClick, styles.triggerDesktop)]) }
export type SidebarRailProps<Msg> = Readonly<{ onClick: Msg }>
export const sidebarRail = <Msg>(props: SidebarRailProps<Msg>, h: HtmlBuilder<Msg>): Html => h.button([h.DataAttribute('sidebar', 'rail'), h.DataAttribute('slot', 'sidebar-rail'), h.AriaLabel('Toggle Sidebar'), h.Attribute('tabindex', '-1'), h.OnClick(props.onClick), h.Title('Toggle Sidebar'), h.Type('button'), h.Class(className(styles.rail))], [])

export type SidebarInsetProps = Slot & Readonly<{ variant?: SidebarVariant; state?: SidebarState }>
export const sidebarInset = <Msg>(props: SidebarInsetProps, h: HtmlBuilder<Msg>): Html => h.main([h.DataAttribute('slot', 'sidebar-inset'), h.Class(className(styles.inset, props.variant === 'inset' && styles.insetVariant, props.variant === 'inset' && props.state === 'collapsed' && styles.insetVariantCollapsed, props.layoutStyle))], [...props.children])
export type SidebarInputProps<Msg> = Readonly<{ id?: string; value?: string; onInput?: (value: string) => Msg; placeholder?: string; type?: string; name?: string; isDisabled?: boolean; isInvalid?: boolean; layoutStyle?: ComponentLayoutStyle }>
export const sidebarInput = <Msg>(props: SidebarInputProps<Msg>, h: HtmlBuilder<Msg>): Html => h.input([h.DataAttribute('slot', 'sidebar-input'), h.DataAttribute('sidebar', 'input'), ...(props.id === undefined ? [] : [h.Id(props.id)]), ...(props.value === undefined ? [] : [h.Value(props.value)]), ...(props.onInput === undefined ? [] : [h.OnInput(props.onInput)]), ...(props.placeholder === undefined ? [] : [h.Placeholder(props.placeholder)]), ...(props.name === undefined ? [] : [h.Name(props.name)]), h.Type(props.type ?? 'text'), h.Disabled(props.isDisabled ?? false), h.AriaInvalid(props.isInvalid ?? false), h.Class(className(styles.input, props.layoutStyle))])

export const sidebarHeader = slotDiv('sidebar-header', 'header', styles.header)
export const sidebarFooter = slotDiv('sidebar-footer', 'footer', styles.footer)
export const sidebarSeparator = <Msg>(props: Readonly<{ layoutStyle?: ComponentLayoutStyle }> = {}, h: HtmlBuilder<Msg>): Html => h.div([h.DataAttribute('slot', 'sidebar-separator'), h.DataAttribute('sidebar', 'separator'), h.DataAttribute('orientation', 'horizontal'), h.Role('none'), h.Class(className(styles.separator, props.layoutStyle))], [])
export const sidebarContent = slotDiv('sidebar-content', 'content', styles.content)
export type SidebarGroupProps = Slot & Readonly<{ spacing?: 'default' | 'first' | 'later' }>
export const sidebarGroup = <Msg>(props: SidebarGroupProps, h: HtmlBuilder<Msg>): Html => h.div([h.DataAttribute('slot', 'sidebar-group'), h.DataAttribute('sidebar', 'group'), h.Class(className(styles.group, props.spacing === 'first' && styles.groupFirst, props.spacing === 'later' && styles.groupLater, props.layoutStyle))], [...props.children])
export const sidebarGroupLabel = slotDiv('sidebar-group-label', 'group-label', styles.groupLabel)
export type SidebarActionProps<Msg> = Slot & Readonly<{ onClick?: Msg }>
export const sidebarGroupAction = <Msg>(props: SidebarActionProps<Msg>, h: HtmlBuilder<Msg>): Html => h.button([h.DataAttribute('slot', 'sidebar-group-action'), h.DataAttribute('sidebar', 'group-action'), ...(props.onClick === undefined ? [] : [h.OnClick(props.onClick)]), h.Type('button'), h.Class(className(styles.action, props.layoutStyle))], [...props.children])
export const sidebarGroupContent = slotDiv('sidebar-group-content', 'group-content', styles.groupContent)
export const sidebarMenu = <Msg>(props: Slot, h: HtmlBuilder<Msg>): Html => h.ul([h.DataAttribute('slot', 'sidebar-menu'), h.DataAttribute('sidebar', 'menu'), h.Class(className(styles.menu, props.layoutStyle))], [...props.children])
export const sidebarMenuItem = <Msg>(props: Slot, h: HtmlBuilder<Msg>): Html => h.li([h.DataAttribute('slot', 'sidebar-menu-item'), h.DataAttribute('sidebar', 'menu-item'), h.Class(className(styles.menuItem, props.layoutStyle))], [...props.children])

export type SidebarMenuButtonVariants = Readonly<{ variant?: 'default' | 'outline' | 'primary' | null; size?: 'default' | 'sm' | 'lg' | null }>
const menuSizes = { default: styles.menuButtonDefault, sm: styles.menuButtonSm, lg: styles.menuButtonLg } as const
export const sidebarMenuButtonVariants = (options: SidebarMenuButtonVariants = {}): string => className(styles.menuButton, options.variant === 'outline' && styles.menuButtonOutline, options.variant === 'primary' && styles.menuButtonPrimary, menuSizes[options.size ?? 'default'])
export type SidebarMenuButtonProps<Msg> = Readonly<{ children: ReadonlyArray<Html | string>; onClick?: Msg; href?: string; isActive?: boolean; variant?: SidebarMenuButtonVariants['variant']; size?: SidebarMenuButtonVariants['size']; tooltip?: string; layoutStyle?: ComponentLayoutStyle }>
export const sidebarMenuButton = <Msg>(props: SidebarMenuButtonProps<Msg>, h: HtmlBuilder<Msg>): Html => { const size = props.size ?? 'default'; const attributes = [h.DataAttribute('slot', 'sidebar-menu-button'), h.DataAttribute('sidebar', 'menu-button'), h.DataAttribute('size', size), ...((props.isActive ?? false) ? [h.DataAttribute('active', '')] : []), ...(props.onClick === undefined ? [] : [h.OnClick(props.onClick)]), h.Class(className(styles.menuButton, props.variant === 'outline' && styles.menuButtonOutline, props.variant === 'primary' && styles.menuButtonPrimary, menuSizes[size], props.isActive === true && styles.menuButtonActive, props.layoutStyle))]; const children = [...props.children]; return props.href === undefined ? h.button([...attributes, h.Type('button'), ...(props.tooltip === undefined ? [] : [h.Title(props.tooltip), h.AriaLabel(props.tooltip)])], children) : h.a([h.Href(props.href), ...attributes, ...(props.tooltip === undefined ? [] : [h.Title(props.tooltip), h.AriaLabel(props.tooltip)])], children) }

export type SidebarMenuActionProps<Msg> = SidebarActionProps<Msg> & Readonly<{ showOnHover?: boolean }>
export const sidebarMenuAction = <Msg>(props: SidebarMenuActionProps<Msg>, h: HtmlBuilder<Msg>): Html => h.button([h.DataAttribute('slot', 'sidebar-menu-action'), h.DataAttribute('sidebar', 'menu-action'), ...((props.showOnHover ?? false) ? [h.DataAttribute('show-on-hover', '')] : []), ...(props.onClick === undefined ? [] : [h.OnClick(props.onClick)]), h.Type('button'), h.Class(className(styles.menuAction, props.showOnHover === true && styles.menuActionHover, props.layoutStyle))], [...props.children])
export const sidebarMenuBadge = slotDiv('sidebar-menu-badge', 'menu-badge', styles.badge)
export type SidebarMenuSkeletonProps = Readonly<{ showIcon?: boolean; widthPercent?: number; layoutStyle?: ComponentLayoutStyle }>
export const sidebarMenuSkeleton = <Msg>(props: SidebarMenuSkeletonProps = {}, h: HtmlBuilder<Msg>): Html => { const widthPercent = Math.min(90, Math.max(50, props.widthPercent ?? 70)); return h.div([h.DataAttribute('slot', 'sidebar-menu-skeleton'), h.DataAttribute('sidebar', 'menu-skeleton'), h.Class(className(styles.skeleton, props.layoutStyle))], [...((props.showIcon ?? false) ? [h.div([h.DataAttribute('slot', 'skeleton'), h.DataAttribute('sidebar', 'menu-skeleton-icon'), h.Class(className(styles.skeletonIcon))], [])] : []), h.div([h.DataAttribute('slot', 'skeleton'), h.DataAttribute('sidebar', 'menu-skeleton-text'), h.Style({ '--skeleton-width': `${widthPercent}%` }), h.Class(className(styles.skeletonText))], [])]) }
export const sidebarMenuSub = <Msg>(props: Slot, h: HtmlBuilder<Msg>): Html => h.ul([h.DataAttribute('slot', 'sidebar-menu-sub'), h.DataAttribute('sidebar', 'menu-sub'), h.Class(className(styles.sub, props.layoutStyle))], [...props.children])
export const sidebarMenuSubItem = <Msg>(props: Slot, h: HtmlBuilder<Msg>): Html => h.li([h.DataAttribute('slot', 'sidebar-menu-sub-item'), h.DataAttribute('sidebar', 'menu-sub-item'), h.Class(className(styles.menuItem, props.layoutStyle))], [...props.children])
export type SidebarMenuSubButtonProps<Msg> = Readonly<{ children: ReadonlyArray<Html | string>; href?: string; onClick?: Msg; size?: 'sm' | 'md'; isActive?: boolean; layoutStyle?: ComponentLayoutStyle }>
export const sidebarMenuSubButton = <Msg>(props: SidebarMenuSubButtonProps<Msg>, h: HtmlBuilder<Msg>): Html => { const size = props.size ?? 'md'; return h.a([h.DataAttribute('slot', 'sidebar-menu-sub-button'), h.DataAttribute('sidebar', 'menu-sub-button'), h.DataAttribute('size', size), ...((props.isActive ?? false) ? [h.DataAttribute('active', '')] : []), ...(props.href === undefined ? [] : [h.Href(props.href)]), ...(props.onClick === undefined ? [] : [h.OnClick(props.onClick)]), h.Class(className(styles.subButton, size === 'sm' ? styles.subSm : styles.subMd, props.isActive === true && styles.menuButtonActive, props.layoutStyle))], [...props.children]) }
