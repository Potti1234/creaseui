// @ts-nocheck: snapshot of creaseui-demo chapter-13:src/design/glyphs.ts
import type { Html, HtmlBuilder } from 'foldkit/html'

import {
  type Priority,
  type Status,
  PRIORITY_LABEL,
  STATUS_LABEL,
} from '../domain'
import { type IconName, icon } from '../ui/icon'

const STATUS_ICON: Readonly<Record<Status, IconName>> = {
  backlog: 'circle-dot',
  todo: 'circle',
  in_progress: 'loader-circle',
  in_review: 'circle-fading-arrow-up',
  done: 'circle-check',
}

const PRIORITY_ICON: Readonly<Record<Priority, IconName>> = {
  urgent: 'triangle-alert',
  high: 'arrow-up',
  medium: 'minus',
  low: 'arrow-down',
  none: 'ellipsis',
}

export const statusGlyph = <Msg>(status: Status, h: HtmlBuilder<Msg>): Html =>
  icon(
    {
      name: STATUS_ICON[status],
      size: 'sm',
      ariaLabel: STATUS_LABEL[status],
      ...(status === 'done' || status === 'in_review'
        ? { tone: 'primary' as const }
        : { tone: 'muted' as const }),
    },
    h,
  )

export const priorityGlyph = <Msg>(
  priority: Priority,
  h: HtmlBuilder<Msg>,
): Html =>
  icon(
    {
      name: PRIORITY_ICON[priority],
      size: 'sm',
      tone: 'muted',
      ariaLabel: PRIORITY_LABEL[priority],
    },
    h,
  )
