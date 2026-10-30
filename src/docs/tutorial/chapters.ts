import { Runtime } from 'foldkit'
import type { EmbedHandle } from 'foldkit/runtime'

import * as ch01 from './guide/chapters/01/model'
import { view as ch01View } from './guide/chapters/01/view'
import * as ch02 from './guide/chapters/02/model'
import { view as ch02View } from './guide/chapters/02/view'
import * as ch03 from './guide/chapters/03/model'
import { view as ch03View } from './guide/chapters/03/view'
import * as ch04 from './guide/chapters/04/model'
import { view as ch04View } from './guide/chapters/04/view'
import * as ch05 from './guide/chapters/05/model'
import { view as ch05View } from './guide/chapters/05/view'
import * as ch06 from './guide/chapters/06/model'
import { view as ch06View } from './guide/chapters/06/view'
import * as ch07 from './guide/chapters/07/model'
import { view as ch07View } from './guide/chapters/07/view'
import * as ch08 from './guide/chapters/08/model'
import { essayStore } from './guide/chapters/08/storage'
import { view as ch08View } from './guide/chapters/08/view'
import * as ch09 from './guide/chapters/09/model'
import { view as ch09View } from './guide/chapters/09/view'
import * as ch10 from './guide/chapters/10/model'
import { view as ch10View } from './guide/chapters/10/view'
import * as ch11 from './guide/chapters/11/model'
import { view as ch11View } from './guide/chapters/11/view'
import * as ch12 from './guide/chapters/12/model'
import { view as ch12View } from './guide/chapters/12/view'
import * as ch13 from './guide/chapters/13/model'
import { view as ch13View } from './guide/chapters/13/view'
import * as ch14 from './guide/chapters/14/model'
import { view as ch14View } from './guide/chapters/14/view'
import * as ch15 from './guide/chapters/15/model'
import { view as ch15View } from './guide/chapters/15/view'
import * as chShort from './guide/chapters/short/model'
import { view as chShortView } from './guide/chapters/short/view'

export type TutorialChapterId =
  | 'short'
  | '01'
  | '02'
  | '03'
  | '04'
  | '05'
  | '06'
  | '07'
  | '08'
  | '09'
  | '10'
  | '11'
  | '12'
  | '13'
  | '14'
  | '15'

export type TutorialChapter = Readonly<{
  id: TutorialChapterId
  title: string
  summary: string
  /* The creaseui-demo git tag holding the app at the end of the chapter;
     null when the chapter has no tag (the short overview, chapter 1). */
  tag: string | null
  /* Mounts the chapter essay app inside `container`; the returned handle's
     dispose() restores the container empty. */
  mount: (container: HTMLElement | null) => EmbedHandle
}>

export const TUTORIAL_CHAPTERS: ReadonlyArray<TutorialChapter> = [
  {
    id: 'short',
    title: 'crease in one page',
    summary:
      'The steps of building a design system on crease, in the order the guide takes them.',
    tag: null,
    mount: container =>
      Runtime.embed(
        Runtime.makeElement({
          Model: chShort.Model,
          init: chShort.init,
          update: chShort.update,
          view: chShortView,
          container,
        }),
      ),
  },
  {
    id: '01',
    title: 'What crease is, and what you will build',
    summary:
      "crease's three parts, which layers you write, the renderers, the finished app.",
    tag: null,
    mount: container =>
      Runtime.embed(
        Runtime.makeElement({
          Model: ch01.Model,
          init: ch01.init,
          update: ch01.update,
          view: ch01View,
          container,
        }),
      ),
  },
  {
    id: '02',
    title: 'Install crease and build a first slice',
    summary:
      'The registry, the strict lint and the receipt, and three views built quickly.',
    tag: 'chapter-02',
    mount: container =>
      Runtime.embed(
        Runtime.makeElement({
          Model: ch02.Model,
          init: ch02.init,
          update: ch02.update,
          view: ch02View,
          container,
        }),
      ),
  },
  {
    id: '03',
    title: 'Write down principles and decisions',
    summary:
      'A product brief and ten decisions, each naming the code that enforces it.',
    tag: 'chapter-03',
    mount: container =>
      Runtime.embed(
        Runtime.makeElement({
          Model: ch03.Model,
          init: ch03.init,
          update: ch03.update,
          view: ch03View,
          container,
        }),
      ),
  },
  {
    id: '04',
    title: 'Generate the theme',
    summary: 'The preset compiler, a dark mode, and what tokens cannot decide.',
    tag: 'chapter-04',
    mount: container =>
      Runtime.embed(
        Runtime.makeElement({
          Model: ch04.Model,
          init: ch04.init,
          update: ch04.update,
          view: ch04View,
          container,
        }),
      ),
  },
  {
    id: '05',
    title: 'Customize a component and reduce its API',
    summary: 'One row variant added, 44 of 48 button combinations removed.',
    tag: 'chapter-05',
    mount: container =>
      Runtime.embed(
        Runtime.makeElement({
          Model: ch05.Model,
          init: ch05.init,
          update: ch05.update,
          view: ch05View,
          container,
        }),
      ),
  },
  {
    id: '06',
    title: 'Contracts and boundaries',
    summary:
      'One way into each component, and feature changes kept apart from system changes.',
    tag: 'chapter-06',
    mount: container =>
      Runtime.embed(
        Runtime.makeElement({
          Model: ch06.Model,
          init: ch06.init,
          update: ch06.update,
          view: ch06View,
          container,
        }),
      ),
  },
  {
    id: '07',
    title: 'Compose named product patterns',
    summary:
      'One row, one collection, one picker, the full sidebar, and a rule that makes them the only way.',
    tag: 'chapter-07',
    mount: container =>
      Runtime.embed(
        Runtime.makeElement({
          Model: ch07.Model,
          init: ch07.init,
          update: ch07.update,
          view: ch07View,
          container,
        }),
      ),
  },
  {
    id: '08',
    title: 'Saving, validation and workflows',
    summary:
      'The composer with a draft, browser storage, an issue page and the command menu.',
    tag: 'chapter-08',
    mount: container =>
      Runtime.embed(
        Runtime.makeElement({
          Model: ch08.Model,
          init: ch08.init,
          update: ch08.update,
          view: ch08View,
          subscriptions: ch08.subscriptions,
          resources: essayStore,
          container,
        }),
      ),
  },
  {
    id: '09',
    title: 'Verify the whole system',
    summary:
      'Tests, lint fixtures and a browser check, each tested by breaking the app.',
    tag: 'chapter-09',
    mount: container =>
      Runtime.embed(
        Runtime.makeElement({
          Model: ch09.Model,
          init: ch09.init,
          update: ch09.update,
          view: ch09View,
          container,
        }),
      ),
  },
  {
    id: '10',
    title: 'Configure the product policy',
    summary:
      'Three layers of rules, narrowing in the receipt, and where configuration ends.',
    tag: 'chapter-10',
    mount: container =>
      Runtime.embed(
        Runtime.makeElement({
          Model: ch10.Model,
          init: ch10.init,
          update: ch10.update,
          view: ch10View,
          container,
        }),
      ),
  },
  {
    id: '11',
    title: 'Write a product lint rule',
    summary:
      'One primary action per file, with tests that fail when the rule stops reporting.',
    tag: 'chapter-11',
    mount: container =>
      Runtime.embed(
        Runtime.makeElement({
          Model: ch11.Model,
          init: ch11.init,
          update: ch11.update,
          view: ch11View,
          container,
        }),
      ),
  },
  {
    id: '12',
    title: 'Feature work by agents',
    summary:
      'Three agents build the same view; where they differ becomes a decision.',
    tag: 'chapter-12',
    mount: container =>
      Runtime.embed(
        Runtime.makeElement({
          Model: ch12.Model,
          init: ch12.init,
          update: ch12.update,
          view: ch12View,
          container,
        }),
      ),
  },
  {
    id: '13',
    title: 'A design-system change, with an agent',
    summary:
      'A board proposal, reviewed, changed by an agent within a scope, and adopted.',
    tag: 'chapter-13',
    mount: container =>
      Runtime.embed(
        Runtime.makeElement({
          Model: ch13.Model,
          init: ch13.init,
          update: ch13.update,
          view: ch13View,
          container,
        }),
      ),
  },
  {
    id: '14',
    title: 'Evolve an API and migrate its callers',
    summary:
      'Deprecate, migrate, remove: three commits that each pass every check.',
    tag: 'chapter-14',
    mount: container =>
      Runtime.embed(
        Runtime.makeElement({
          Model: ch14.Model,
          init: ch14.init,
          update: ch14.update,
          view: ch14View,
          container,
        }),
      ),
  },
  {
    id: '15',
    title: 'Take in changes from crease upstream',
    summary:
      'Find the changes that reach the app, merge each kind, and delete the workarounds.',
    tag: 'chapter-15',
    mount: container =>
      Runtime.embed(
        Runtime.makeElement({
          Model: ch15.Model,
          init: ch15.init,
          update: ch15.update,
          view: ch15View,
          container,
        }),
      ),
  },
]

export const tutorialChapter = (id: string): TutorialChapter | undefined =>
  TUTORIAL_CHAPTERS.find(chapter => chapter.id === id)
