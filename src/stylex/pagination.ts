import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as Icon from '@/lib/icon'
import type { ButtonSize } from './contracts'
import type { ComponentLayoutStyle } from './contracts'
import { className } from './style'
import { tokens } from './tokens.stylex'
import { interactionTokens } from './interaction-tokens.stylex.const'
import { normalizePagination, paginationItems, type PaginationRecipeProps } from '@/lib/pagination'

export * from '@/lib/pagination'

type SlotProps = Readonly<{ children: ReadonlyArray<Html | string>; layoutStyle?: ComponentLayoutStyle; ariaLabel?: string }>

const styles = stylex.create({
  active: { borderColor: tokens.border, borderStyle: 'solid', borderWidth: 1 },
  disabled: { cursor: interactionTokens.cursorDisabled, opacity: 0.5 },
  content: { gap: '0.25rem', alignItems: 'center', display: 'flex', flexDirection: 'row', },
  ellipsis: { alignItems: 'center', display: 'flex', justifyContent: 'center', height: '2.25rem', width: '2.25rem', },
  link: { borderRadius: tokens.controlRadius, alignItems: 'center', backgroundColor: { default: tokens.transparent, ':hover': tokens.accent }, color: { default: tokens.foreground, ':hover': tokens.accentForeground }, display: 'inline-flex', fontSize: '0.875rem', fontWeight: 500, justifyContent: 'center', textDecorationLine: 'none', },
  nav: { marginInline: 'auto', display: 'flex', justifyContent: 'center', width: '100%', },
  sizeDefault: { paddingInline: '0.75rem', height: '2rem', },
  sizeIcon: { height: '2rem', width: '2rem' },
  sizeLg: { paddingInline: '1.5rem', height: '2.5rem', },
  sizeSm: { paddingInline: '0.625rem', height: '1.75rem', },
  srOnly: { margin: -1, padding: 0, overflow: 'hidden', position: 'absolute', height: 1, width: 1, },
})

const sizes = { default: styles.sizeDefault, sm: styles.sizeSm, lg: styles.sizeLg, icon: styles.sizeIcon } as const

export const pagination = <Msg>(props: SlotProps, h: HtmlBuilder<Msg>): Html => h.nav([h.Role('navigation'), h.AriaLabel(props.ariaLabel ?? 'Pagination'), h.DataAttribute('slot', 'pagination'), h.Class(className(styles.nav, props.layoutStyle))], [...props.children])
export const paginationContent = <Msg>(props: SlotProps, h: HtmlBuilder<Msg>): Html => h.ul([h.DataAttribute('slot', 'pagination-content'), h.Class(className(styles.content, props.layoutStyle))], [...props.children])
export const paginationItem = <Msg>(props: SlotProps, h: HtmlBuilder<Msg>): Html => h.li([h.DataAttribute('slot', 'pagination-item'), h.Class(className(props.layoutStyle))], [...props.children])

export type PaginationLinkProps = Readonly<{ href: string; children: ReadonlyArray<Html | string>; isActive?: boolean; size?: ButtonSize; ariaLabel?: string; layoutStyle?: ComponentLayoutStyle }>

export const paginationLink = <Msg>(props: PaginationLinkProps, h: HtmlBuilder<Msg>): Html => {
  const isActive = props.isActive ?? false
  return h.a([
    h.Href(props.href), ...(isActive ? [h.AriaCurrent('page')] : []), ...(props.ariaLabel === undefined ? [] : [h.AriaLabel(props.ariaLabel)]), h.DataAttribute('slot', 'pagination-link'), ...(isActive ? [h.DataAttribute('active', 'true')] : []),
    h.Class(className(styles.link, sizes[props.size ?? 'icon'], isActive && styles.active, props.layoutStyle)),
  ], [...props.children])
}

export type PaginationDirectionProps = Readonly<{ href?: string; isDisabled?: boolean; layoutStyle?: ComponentLayoutStyle }>
export const paginationPrevious = <Msg>(props: PaginationDirectionProps, h: HtmlBuilder<Msg>): Html => props.isDisabled === true || props.href === undefined ? h.span([h.Role('link'), h.AriaDisabled(true), h.Tabindex(-1), h.AriaLabel('Go to previous page'), h.DataAttribute('slot', 'pagination-previous'), h.Class(className(styles.link, styles.sizeDefault, styles.disabled, props.layoutStyle))], [Icon.chevronLeft<Msg>({}, h), 'Previous']) : paginationLink({ href: props.href, ariaLabel: 'Go to previous page', size: 'default', layoutStyle: props.layoutStyle, children: [Icon.chevronLeft<Msg>({}, h), 'Previous'] }, h)
export const paginationNext = <Msg>(props: PaginationDirectionProps, h: HtmlBuilder<Msg>): Html => props.isDisabled === true || props.href === undefined ? h.span([h.Role('link'), h.AriaDisabled(true), h.Tabindex(-1), h.AriaLabel('Go to next page'), h.DataAttribute('slot', 'pagination-next'), h.Class(className(styles.link, styles.sizeDefault, styles.disabled, props.layoutStyle))], ['Next', Icon.chevronRight<Msg>({}, h)]) : paginationLink({ href: props.href, ariaLabel: 'Go to next page', size: 'default', layoutStyle: props.layoutStyle, children: ['Next', Icon.chevronRight<Msg>({}, h)] }, h)

export type PaginationEllipsisProps = Readonly<{ layoutStyle?: ComponentLayoutStyle }>
export const paginationEllipsis = <Msg>(props: PaginationEllipsisProps = {}, h: HtmlBuilder<Msg>): Html => h.span([h.AriaHidden(true), h.DataAttribute('slot', 'pagination-ellipsis'), h.Class(className(styles.ellipsis, props.layoutStyle))], [Icon.moreHorizontal<Msg>({}, h), h.span([h.Class(className(styles.srOnly))], ['More pages'])])

const actionButton = <Msg>(page: number, current: number, label: string, message: Msg, h: HtmlBuilder<Msg>): Html => h.button([h.Type('button'), h.OnClick(message), h.AriaLabel(label), ...(page === current ? [h.AriaCurrent('page'), h.DataAttribute('active', 'true')] : []), h.DataAttribute('slot', 'pagination-button'), h.Class(className(styles.link, styles.sizeIcon, page === current && styles.active))], [String(page)])
const actionDirection = <Msg>(direction: 'previous' | 'next', disabled: boolean, message: Msg, h: HtmlBuilder<Msg>): Html => h.button([h.Type('button'), h.Disabled(disabled), h.OnClick(message), h.AriaLabel(`Go to ${direction} page`), h.DataAttribute('slot', `pagination-${direction}`), h.Class(className(styles.link, styles.sizeDefault, disabled && styles.disabled))], direction === 'previous' ? [Icon.chevronLeft<Msg>({}, h), 'Previous'] : ['Next', Icon.chevronRight<Msg>({}, h)])

export const paginationPages = <Msg>(props: PaginationRecipeProps<Msg>, h: HtmlBuilder<Msg>): Html => {
  const normalized = normalizePagination(props)
  const navigate = (page: number, label: string): Html => props.navigation.kind === 'link' ? paginationLink({ href: props.navigation.href(page), isActive: page === normalized.page, ariaLabel: label, children: [String(page)] }, h) : actionButton(page, normalized.page, label, props.navigation.onNavigate(page), h)
  const previous = normalized.page - 1, next = normalized.page + 1
  return pagination({ ...(props.ariaLabel === undefined ? {} : { ariaLabel: props.ariaLabel }), children: [paginationContent({ children: [
    paginationItem({ children: [props.navigation.kind === 'link' ? paginationPrevious(previous < 1 ? { isDisabled: true } : { href: props.navigation.href(previous) }, h) : actionDirection('previous', previous < 1, props.navigation.onNavigate(Math.max(1, previous)), h)] }, h),
    ...paginationItems(normalized).map(item => paginationItem({ children: [typeof item === 'number' ? navigate(item, item === normalized.page ? `Page ${String(item)}, current page` : `Go to page ${String(item)}`) : paginationEllipsis({}, h)] }, h)),
    paginationItem({ children: [props.navigation.kind === 'link' ? paginationNext(next > normalized.totalPages ? { isDisabled: true } : { href: props.navigation.href(next) }, h) : actionDirection('next', next > normalized.totalPages, props.navigation.onNavigate(Math.min(normalized.totalPages, next)), h)] }, h),
  ] }, h)] }, h)
}
