import type { Html, HtmlBuilder } from 'foldkit/html'

import { type TutorialDocsProps, chapterView } from '@/docs/tutorial-content'
import type { TutorialChapter } from '@/docs/tutorial/chapters'
import { classes } from '@/site/getting-started.stylex'

export const tutorialChapterView = <Msg>(
  chapter: TutorialChapter,
  props: TutorialDocsProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => chapterView(chapter, props, h, classes)
