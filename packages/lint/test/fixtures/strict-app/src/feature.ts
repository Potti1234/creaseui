import type { Html, HtmlBuilder } from 'foldkit/html'

import { button, stack, copy } from '@design/index'

export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  stack(
    {
      children: [
        copy({ children: ['Hello'] }, h),
        button({ children: ['Save'] }, h),
      ],
    },
    h,
  )
