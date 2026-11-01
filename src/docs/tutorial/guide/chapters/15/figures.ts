import type { Html, HtmlBuilder } from 'foldkit/html'

import { segmented } from '../../shared/prose'
import { type Message, Message as M, type Model } from './model'

type H = HtmlBuilder<Message>

const shot = (
  h: H,
  src: string,
  alt: string,
  tag: string,
  note: string,
): Html =>
  h.div(
    [h.Class('flex flex-col gap-1.5')],
    [
      h.div(
        [h.Class('flex flex-col gap-0.5 text-[12.5px]')],
        [
          h.span([h.Class('font-mono font-semibold text-foreground')], [tag]),
          h.span([h.Class('text-muted-foreground')], [note]),
        ],
      ),
      h.img([
        h.Attribute('src', src),
        h.Attribute('alt', alt),
        h.Attribute('width', '256'),
        h.Class(
          'w-full max-w-[256px] rounded-lg shadow-[0_0_0_1px_var(--border)]',
        ),
      ]),
    ],
  )

/** The sidebar before and after the update, in either theme. */
export const sidebars = (h: H, model: Model): Html =>
  h.div(
    [h.Class('flex flex-col gap-4')],
    [
      segmented(
        h,
        'Theme',
        [
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
        ],
        model.theme,
        theme => M.ChoseTheme({ theme }),
      ),
      h.div(
        [h.Class('grid grid-cols-2 gap-4 sm:gap-8')],
        [
          shot(
            h,
            `/shots/15/before-${model.theme}.png`,
            `The sidebar at chapter-14, ${model.theme} theme`,
            'chapter-14',
            'Team pages are sidebar buttons with the local indent option.',
          ),
          shot(
            h,
            `/shots/15/after-${model.theme}.png`,
            `The sidebar at chapter-15, ${model.theme} theme`,
            'chapter-15',
            "Team pages are crease's sub-menu, with a guide line.",
          ),
        ],
      ),
    ],
  )
