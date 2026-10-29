import type { Attribute, Html, HtmlBuilder } from 'foldkit/html'

import { box } from '@/stylex/composition/box'

/**
 * Kanban drag-and-drop view helpers for the constrained StyleX blocks.
 *
 * Drag UX needs genuinely dynamic inline styles (per-frame ghost position,
 * conditional lane highlight) that enumerated composition props cannot
 * express. The escape lives here — in the renderer layer where `h.Style`
 * is permitted — so constrained demo files compose helpers instead of
 * reaching for `h.Style` directly (check-constrained-composition.mjs).
 */

/** Ring outline on the real card while a keyboard drag previews its slot. */
export const kanbanKeyboardPreviewAttr = <Message>(
  h: HtmlBuilder<Message>,
): Attribute<Message> =>
  h.Style({ outline: '2px solid var(--ring)', outlineOffset: '2px' })

/** Dashed insertion marker the pointer drag drops into. */
export const kanbanDropPlaceholder = <Message>(h: HtmlBuilder<Message>): Html =>
  box<Message>(
    {
      attrs: [
        h.AriaHidden(true),
        h.Style({
          backgroundColor:
            'color-mix(in oklab, var(--accent) 65%, transparent)',
          border:
            '2px dashed color-mix(in oklab, var(--primary) 55%, transparent)',
          borderRadius: 'var(--radius-md)',
          minHeight: '5rem',
        }),
      ],
      children: [],
    },
    h,
  )

/** Fixed-position clone that follows the pointer during a drag. */
export const kanbanGhostCard = <Message>(
  ghostPosition: Record<string, string>,
  content: Html,
  h: HtmlBuilder<Message>,
): Html =>
  box<Message>(
    {
      attrs: [
        h.AriaHidden(true),
        h.Style({
          ...ghostPosition,
          rotate: '2deg',
          width: '16rem',
        }),
      ],
      children: [content],
      padding: 'sm',
      radius: 'md',
      surface: 'card',
    },
    h,
  )

/**
 * Always-on 2px lane border — transparent at rest, dashed primary while the
 * lane is the drop target, so the highlight never shifts layout.
 */
export const kanbanLaneTargetAttr = <Message>(
  isTarget: boolean,
  h: HtmlBuilder<Message>,
): Attribute<Message> =>
  h.Style({
    border: `2px dashed ${
      isTarget
        ? 'color-mix(in oklab, var(--primary) 60%, transparent)'
        : 'transparent'
    }`,
    borderRadius: 'var(--radius-xl)',
  })

/** Screen-reader-only live region for drag announcements. */
export const kanbanAnnouncementRegion = <Message>(
  announcement: string,
  h: HtmlBuilder<Message>,
): Html =>
  box<Message>(
    {
      attrs: [
        h.AriaLive('assertive'),
        h.Style({
          clip: 'rect(0 0 0 0)',
          height: '1px',
          margin: '-1px',
          overflow: 'hidden',
          position: 'absolute',
          whiteSpace: 'nowrap',
          width: '1px',
        }),
      ],
      children: [announcement],
    },
    h,
  )
