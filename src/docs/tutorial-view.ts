import type { Html, HtmlBuilder } from 'foldkit/html'

import {
  type TutorialDocsProps,
  chapterView,
  indexView,
} from '@/docs/tutorial-content'
import type { TutorialChapter } from '@/docs/tutorial/chapters'
import { styles } from '@/docs/getting-started-view'

export const tutorialIndexView = <Msg>(
  props: TutorialDocsProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => indexView(props, h, styles)

export const tutorialChapterView = <Msg>(
  chapter: TutorialChapter,
  props: TutorialDocsProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => chapterView(chapter, props, h, styles)
