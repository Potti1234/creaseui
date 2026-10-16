import type { Html, HtmlBuilder } from 'foldkit/html'
import * as Icon from '@/lib/icon'
import * as Button from '@/ui/button'
import * as Avatar from '@/ui/avatar'
import { people, type Assignee, type Status, type Priority } from '@/data'

const personTones: Record<
  Assignee,
  'lavender' | 'sage' | 'sand' | 'rose' | 'neutral'
> = {
  alex: 'lavender',
  maya: 'sage',
  leo: 'sand',
  nina: 'rose',
  none: 'neutral',
}

export const glyph = <M>(name: Icon.IconName, h: HtmlBuilder<M>): Html =>
  h.span(
    [h.Class('product-icon'), h.AriaHidden(true)],
    [Icon.icon(name, {}, h)],
  )

export const shortcut = <M>(keys: string, h: HtmlBuilder<M>): Html =>
  h.kbd([h.Class('shortcut'), h.AriaHidden(true)], [keys])

export const statusIcon = <M>(status: Status, h: HtmlBuilder<M>): Html =>
  h.span(
    [h.Class('status-icon status-' + status), h.AriaHidden(true)],
    status === 'done' ? [glyph('check', h)] : [],
  )

export const priorityIcon = <M>(priority: Priority, h: HtmlBuilder<M>): Html =>
  priority === 'urgent'
    ? h.span(
        [h.Class('priority-urgent'), h.AriaHidden(true)],
        [glyph('circle-alert', h)],
      )
    : priority === 'none'
      ? h.span(
          [h.Class('priority-none'), h.AriaHidden(true)],
          [glyph('minus', h)],
        )
      : h.span(
          [h.Class('priority-bars priority-' + priority), h.AriaHidden(true)],
          [1, 2, 3].map(bar =>
            h.span([h.DataAttribute('bar', String(bar))], []),
          ),
        )

export const person = <M>(assignee: Assignee, h: HtmlBuilder<M>): Html =>
  assignee === 'none'
    ? h.span(
        [h.Class('person-unassigned'), h.AriaHidden(true)],
        [glyph('user', h)],
      )
    : h.span(
        [
          h.Class('person-avatar person-' + personTones[assignee]),
          h.AriaHidden(true),
        ],
        [
          Avatar.avatar(
            {
              size: 'sm',
              children: [
                Avatar.avatarFallback(
                  { children: [people[assignee].initials] },
                  h,
                ),
              ],
            },
            h,
          ),
        ],
      )

type ActionProps<M> = Readonly<{
  label: string
  onClick: M
  intent?: 'primary' | 'quiet' | 'outline'
  icon?: Icon.IconName
  keys?: string
  id?: string
  isDisabled?: boolean
}>

export const action = <M>(props: ActionProps<M>, h: HtmlBuilder<M>): Html =>
  Button.button(
    {
      onClick: props.onClick,
      ariaLabel: props.label,
      ...(props.id === undefined ? {} : { id: props.id }),
      ...(props.isDisabled === undefined
        ? {}
        : { isDisabled: props.isDisabled }),
      variant:
        props.intent === 'quiet'
          ? 'taskQuiet'
          : props.intent === 'outline'
            ? 'taskOutline'
            : 'taskPrimary',
      size: 'sm',
      children: [
        ...(props.icon ? [glyph(props.icon, h)] : []),
        props.label,
        ...(props.keys ? [shortcut(props.keys, h)] : []),
      ],
    },
    h,
  )

export const iconAction = <M>(
  props: Readonly<{
    label: string
    icon: Icon.IconName
    onClick: M
    id?: string
  }>,
  h: HtmlBuilder<M>,
): Html =>
  Button.button(
    {
      ariaLabel: props.label,
      ...(props.id === undefined ? {} : { id: props.id }),
      onClick: props.onClick,
      variant: 'taskIcon',
      size: 'icon-sm',
      children: [glyph(props.icon, h)],
    },
    h,
  )

export const brand = <M>(h: HtmlBuilder<M>): Html =>
  h.svg(
    [h.ViewBox('0 0 24 24'), h.Class('brand-mark'), h.AriaHidden(true)],
    [
      h.rect(
        [
          h.X('0'),
          h.Y('0'),
          h.Width('24'),
          h.Height('24'),
          h.Rx('6'),
          h.Fill('currentColor'),
        ],
        [],
      ),
      h.path([h.D('M6 7.5h12L11 16.5H6l6-7H6z'), h.Fill('white')], []),
    ],
  )
