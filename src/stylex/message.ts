import * as stylex from '@stylexjs/stylex'
import type { StaticStyles } from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'

import type { ComponentLayoutStyle } from './contracts'
import { className } from './style'
import { tokens } from './tokens.stylex'

type ChildrenProps = Readonly<{
  children: ReadonlyArray<Html | string>
  layoutStyle?: ComponentLayoutStyle
}>

const styles = stylex.create({
  avatar: {
    borderRadius: '50%',
    overflow: 'hidden',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: tokens.accent,
    display: 'flex',
    flexShrink: 0,
    justifyContent: 'center',
    minWidth: '2rem',
    width: 'fit-content',
  },
  content: {
    gap: '0.625rem',
    display: 'flex',
    flexDirection: 'column',
    overflowWrap: 'break-word',
    minWidth: 0,
    width: '100%',
  },
  end: { flexDirection: 'row-reverse' },
  footer: {
    paddingInline: '0.75rem',
    alignItems: 'center',
    color: tokens.mutedForeground,
    display: 'flex',
    fontSize: '0.75rem',
    fontWeight: 500,
    maxWidth: '100%',
    minWidth: 0,
  },
  group: { gap: '0.5rem', display: 'flex', flexDirection: 'column', minWidth: 0, },
  header: {
    paddingInline: '0.75rem',
    alignItems: 'center',
    color: tokens.mutedForeground,
    display: 'flex',
    fontSize: '0.75rem',
    fontWeight: 500,
    maxWidth: '100%',
    minWidth: 0,
  },
  message: {
    gap: '0.5rem',
    display: 'flex',
    fontSize: '0.875rem',
    position: 'relative',
    minWidth: 0,
    width: '100%',
  },
})

const part = <Msg>(slot: string, style: StaticStyles, props: ChildrenProps, h: HtmlBuilder<Msg>): Html =>
  h.div([h.DataAttribute('slot', slot), h.Class(className(style, props.layoutStyle))], [...props.children])

export const messageGroup = <Msg>(props: ChildrenProps, h: HtmlBuilder<Msg>): Html => part('message-group', styles.group, props, h)

export const message = <Msg>(props: ChildrenProps & Readonly<{ align?: 'start' | 'end' }>, h: HtmlBuilder<Msg>): Html => {
  const align = props.align ?? 'start'
  return h.div(
    [h.DataAttribute('slot', 'message'), h.DataAttribute('align', align), h.Class(className(styles.message, align === 'end' && styles.end, props.layoutStyle))],
    [...props.children],
  )
}

export const messageAvatar = <Msg>(props: ChildrenProps, h: HtmlBuilder<Msg>): Html => part('message-avatar', styles.avatar, props, h)
export const messageContent = <Msg>(props: ChildrenProps, h: HtmlBuilder<Msg>): Html => part('message-content', styles.content, props, h)
export const messageHeader = <Msg>(props: ChildrenProps, h: HtmlBuilder<Msg>): Html => part('message-header', styles.header, props, h)
export const messageFooter = <Msg>(props: ChildrenProps, h: HtmlBuilder<Msg>): Html => part('message-footer', styles.footer, props, h)

