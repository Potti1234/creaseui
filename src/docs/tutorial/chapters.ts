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

import {
  TUTORIAL_CHAPTERS,
  type TutorialChapterId,
  type TutorialChapterMeta,
} from './chapter-meta'

export type TutorialChapter = TutorialChapterMeta &
  Readonly<{
    /* Mounts the chapter essay app inside `container`; the returned handle's
       dispose() restores the container empty. */
    mount: (container: HTMLElement | null) => EmbedHandle
  }>

const mounts: Record<TutorialChapterId, TutorialChapter['mount']> = {
  short: container =>
    Runtime.embed(
      Runtime.makeElement({
        Model: chShort.Model,
        init: chShort.init,
        update: chShort.update,
        view: chShortView,
        container,
      }),
    ),
  '01': container =>
    Runtime.embed(
      Runtime.makeElement({
        Model: ch01.Model,
        init: ch01.init,
        update: ch01.update,
        view: ch01View,
        container,
      }),
    ),
  '02': container =>
    Runtime.embed(
      Runtime.makeElement({
        Model: ch02.Model,
        init: ch02.init,
        update: ch02.update,
        view: ch02View,
        container,
      }),
    ),
  '03': container =>
    Runtime.embed(
      Runtime.makeElement({
        Model: ch03.Model,
        init: ch03.init,
        update: ch03.update,
        view: ch03View,
        container,
      }),
    ),
  '04': container =>
    Runtime.embed(
      Runtime.makeElement({
        Model: ch04.Model,
        init: ch04.init,
        update: ch04.update,
        view: ch04View,
        container,
      }),
    ),
  '05': container =>
    Runtime.embed(
      Runtime.makeElement({
        Model: ch05.Model,
        init: ch05.init,
        update: ch05.update,
        view: ch05View,
        container,
      }),
    ),
  '06': container =>
    Runtime.embed(
      Runtime.makeElement({
        Model: ch06.Model,
        init: ch06.init,
        update: ch06.update,
        view: ch06View,
        container,
      }),
    ),
  '07': container =>
    Runtime.embed(
      Runtime.makeElement({
        Model: ch07.Model,
        init: ch07.init,
        update: ch07.update,
        view: ch07View,
        container,
      }),
    ),
  '08': container =>
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
  '09': container =>
    Runtime.embed(
      Runtime.makeElement({
        Model: ch09.Model,
        init: ch09.init,
        update: ch09.update,
        view: ch09View,
        container,
      }),
    ),
  '10': container =>
    Runtime.embed(
      Runtime.makeElement({
        Model: ch10.Model,
        init: ch10.init,
        update: ch10.update,
        view: ch10View,
        container,
      }),
    ),
  '11': container =>
    Runtime.embed(
      Runtime.makeElement({
        Model: ch11.Model,
        init: ch11.init,
        update: ch11.update,
        view: ch11View,
        container,
      }),
    ),
  '12': container =>
    Runtime.embed(
      Runtime.makeElement({
        Model: ch12.Model,
        init: ch12.init,
        update: ch12.update,
        view: ch12View,
        container,
      }),
    ),
  '13': container =>
    Runtime.embed(
      Runtime.makeElement({
        Model: ch13.Model,
        init: ch13.init,
        update: ch13.update,
        view: ch13View,
        container,
      }),
    ),
  '14': container =>
    Runtime.embed(
      Runtime.makeElement({
        Model: ch14.Model,
        init: ch14.init,
        update: ch14.update,
        view: ch14View,
        container,
      }),
    ),
  '15': container =>
    Runtime.embed(
      Runtime.makeElement({
        Model: ch15.Model,
        init: ch15.init,
        update: ch15.update,
        view: ch15View,
        container,
      }),
    ),
}

const RUNTIME_CHAPTERS: ReadonlyArray<TutorialChapter> = TUTORIAL_CHAPTERS.map(
  meta => ({ ...meta, mount: mounts[meta.id] }),
)

export const tutorialChapter = (id: string): TutorialChapter | undefined =>
  RUNTIME_CHAPTERS.find(chapter => chapter.id === id)
