import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'
import * as Icon from '@/lib/icon'
import type { ComponentLayoutStyle } from './contracts'
import { className } from './style'
import { tokens } from './tokens.stylex'
import { interactionTokens } from './interaction-tokens.stylex.const'
type Slot = Readonly<{ layoutStyle?: ComponentLayoutStyle; children: ReadonlyArray<Html | string> }>
const styles = stylex.create({
  nav: {}, list: { gap: '0.375rem', alignItems: 'center', color: tokens.mutedForeground, display: 'flex', flexWrap: 'wrap', fontSize: '0.875rem', overflowWrap: 'break-word', }, item: { gap: '0.375rem', alignItems: 'center', display: 'inline-flex', },
  link: { color: { default: tokens.mutedForeground, ':hover': tokens.foreground }, transitionDuration: interactionTokens.motionFast, transitionProperty: 'color' }, page: { color: tokens.foreground, fontWeight: 400 }, separator: { height: '0.875rem', width: '0.875rem' }, ellipsis: { alignItems: 'center', display: 'flex', justifyContent: 'center', height: '2.25rem', width: '2.25rem', }, hidden: { overflow: 'hidden', clip: 'rect(0,0,0,0)', position: 'absolute', whiteSpace: 'nowrap', height: '1px', width: '1px', },
})
export type BreadcrumbProps = Slot
export const breadcrumb = <Msg>(p: BreadcrumbProps,h:HtmlBuilder<Msg>):Html=>h.nav([h.AriaLabel('breadcrumb'),h.DataAttribute('slot','breadcrumb'),h.Class(className(styles.nav,p.layoutStyle))],[...p.children])
export const breadcrumbList = <Msg>(p:Slot,h:HtmlBuilder<Msg>):Html=>h.ol([h.DataAttribute('slot','breadcrumb-list'),h.Class(className(styles.list,p.layoutStyle))],[...p.children])
export const breadcrumbItem = <Msg>(p:Slot,h:HtmlBuilder<Msg>):Html=>h.li([h.DataAttribute('slot','breadcrumb-item'),h.Class(className(styles.item,p.layoutStyle))],[...p.children])
export type BreadcrumbLinkProps = Slot & Readonly<{href:string}>
export const breadcrumbLink = <Msg>(p:BreadcrumbLinkProps,h:HtmlBuilder<Msg>):Html=>h.a([h.DataAttribute('slot','breadcrumb-link'),h.Href(p.href),h.Class(className(styles.link,p.layoutStyle))],[...p.children])
export const breadcrumbPage = <Msg>(p:Slot,h:HtmlBuilder<Msg>):Html=>h.span([h.DataAttribute('slot','breadcrumb-page'),h.Role('link'),h.AriaDisabled(true),h.AriaCurrent('page'),h.Class(className(styles.page,p.layoutStyle))],[...p.children])
export type BreadcrumbSeparatorProps=Readonly<{layoutStyle?:ComponentLayoutStyle;children?:ReadonlyArray<Html|string>}>
export const breadcrumbSeparator=<Msg>(p:BreadcrumbSeparatorProps={},h:HtmlBuilder<Msg>):Html=>h.li([h.DataAttribute('slot','breadcrumb-separator'),h.Role('presentation'),h.AriaHidden(true),h.Class(className(styles.separator,p.layoutStyle))],p.children===undefined?[Icon.chevronRight({},h)]:[...p.children])
export type BreadcrumbEllipsisProps=Readonly<{layoutStyle?:ComponentLayoutStyle}>
export const breadcrumbEllipsis=<Msg>(p:BreadcrumbEllipsisProps={},h:HtmlBuilder<Msg>):Html=>h.span([h.DataAttribute('slot','breadcrumb-ellipsis'),h.Role('presentation'),h.AriaHidden(true),h.Class(className(styles.ellipsis,p.layoutStyle))],[Icon.moreHorizontal({},h),h.span([h.Class(className(styles.hidden))],['More'])])


