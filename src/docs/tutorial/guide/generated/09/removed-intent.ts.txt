// expect: crease/component-contract
// A value removed in chapter 5, arriving through a variable.
import type { Html, HtmlBuilder } from 'foldkit/html'

import { button } from '@/ui/button'

const legacyIntent: string = 'ghost'

export const fixture = <Msg>(h: HtmlBuilder<Msg>): Html =>
  button({ intent: legacyIntent as 'primary', children: ['Filter'] }, h)
