import { Style } from '@pleat/core'
import type { Html, HtmlBuilder } from 'foldkit/html'

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition'
import { skeletonFixtures } from '@/docs/components/pages/skeleton/shared'
import * as Card from '@/pleat/card'
import * as Skeleton from '@/pleat/skeleton'
import { className } from '@/pleat/style'

const styles = {
  row: Style.make({ gap: '1rem', alignItems: 'center', display: 'flex' }),
  circleLg: Style.make({ height: '3rem', width: '3rem' }),
  circleSm: Style.make({ flexShrink: 0, height: '2.5rem', width: '2.5rem' }),
  lines: Style.make({ display: 'block' }),
  linesGrid: Style.make({ gap: '0.5rem', display: 'grid' }),
  lineWide: Style.make({
    height: '1rem',
    marginBottom: '0.5rem',
    width: '15.625rem',
  }),
  lineMid: Style.make({ height: '1rem', width: '12.5rem' }),
  line150: Style.make({ height: '1rem', width: '9.375rem' }),
  line100: Style.make({ height: '1rem', width: '6.25rem' }),
  avatarRow: Style.make({
    gap: '1rem',
    alignItems: 'center',
    display: 'flex',
    width: 'fit-content',
  }),
  card: Style.make({ maxWidth: '20rem', width: '100%' }),
  lineTwoThirds: Style.make({ height: '1rem', width: '66.666667%' }),
  lineHalf: Style.make({ height: '1rem', width: '50%' }),
  media: Style.make({ aspectRatio: '16 / 9', width: '100%' }),
  textStack: Style.make({
    gap: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '20rem',
    width: '100%',
  }),
  lineFull: Style.make({ height: '1rem', width: '100%' }),
  lineThreeQuarters: Style.make({ height: '1rem', width: '75%' }),
  formStack: Style.make({
    gap: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '20rem',
    width: '100%',
  }),
  fieldStack: Style.make({
    gap: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
  }),
  labelA: Style.make({ height: '1rem', width: '5rem' }),
  labelB: Style.make({ height: '1rem', width: '6rem' }),
  inputFull: Style.make({ height: '2rem', width: '100%' }),
  buttonBar: Style.make({ height: '2rem', width: '6rem' }),
  tableStack: Style.make({
    gap: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '24rem',
    width: '100%',
  }),
  tableRow: Style.make({ gap: '1rem', display: 'flex' }),
  cellGrow: Style.make({
    flexBasis: '0%',
    flexGrow: 1,
    flexShrink: 1,
    height: '1rem',
  }),
  cellW24: Style.make({ height: '1rem', width: '6rem' }),
  cellW20: Style.make({ height: '1rem', width: '5rem' }),
}

const demoRow = <Msg>(rtl: boolean, h: HtmlBuilder<Msg>): Html =>
  h.div(
    [h.Class(className(styles.row)), ...(rtl ? [h.Dir('rtl')] : [])],
    [
      Skeleton.skeleton({ shape: 'circle', layoutStyle: styles.circleLg }, h),
      h.div(
        [h.Class(className(styles.lines))],
        [
          Skeleton.skeleton({ layoutStyle: styles.lineWide }, h),
          Skeleton.skeleton({ layoutStyle: styles.lineMid }, h),
        ],
      ),
    ],
  )

export const skeletonStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  _model: unknown,
  _onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const fixture = skeletonFixtures[exampleIndex] ?? skeletonFixtures[0]
  switch (fixture.kind) {
    case 'demo':
      return demoRow(false, h)
    case 'rtl':
      return demoRow(true, h)
    case 'avatar':
      return h.div(
        [h.Class(className(styles.avatarRow))],
        [
          Skeleton.skeleton(
            { shape: 'circle', layoutStyle: styles.circleSm },
            h,
          ),
          h.div(
            [h.Class(className(styles.linesGrid))],
            [
              Skeleton.skeleton({ layoutStyle: styles.line150 }, h),
              Skeleton.skeleton({ layoutStyle: styles.line100 }, h),
            ],
          ),
        ],
      )
    case 'card':
      return Card.card(
        {
          layoutStyle: styles.card,
          children: [
            Card.cardHeader(
              {
                children: [
                  Skeleton.skeleton({ layoutStyle: styles.lineTwoThirds }, h),
                  Skeleton.skeleton({ layoutStyle: styles.lineHalf }, h),
                ],
              },
              h,
            ),
            Card.cardContent(
              {
                children: [Skeleton.skeleton({ layoutStyle: styles.media }, h)],
              },
              h,
            ),
          ],
        },
        h,
      )
    case 'text':
      return h.div(
        [h.Class(className(styles.textStack))],
        [
          Skeleton.skeleton({ layoutStyle: styles.lineFull }, h),
          Skeleton.skeleton({ layoutStyle: styles.lineFull }, h),
          Skeleton.skeleton({ layoutStyle: styles.lineThreeQuarters }, h),
        ],
      )
    case 'form':
      return h.div(
        [h.Class(className(styles.formStack))],
        [
          h.div(
            [h.Class(className(styles.fieldStack))],
            [
              Skeleton.skeleton({ layoutStyle: styles.labelA }, h),
              Skeleton.skeleton({ layoutStyle: styles.inputFull }, h),
            ],
          ),
          h.div(
            [h.Class(className(styles.fieldStack))],
            [
              Skeleton.skeleton({ layoutStyle: styles.labelB }, h),
              Skeleton.skeleton({ layoutStyle: styles.inputFull }, h),
            ],
          ),
          Skeleton.skeleton({ layoutStyle: styles.buttonBar }, h),
        ],
      )
    case 'table':
      return h.div(
        [h.Class(className(styles.tableStack))],
        [0, 1, 2, 3, 4].map(() =>
          h.div(
            [h.Class(className(styles.tableRow))],
            [
              Skeleton.skeleton({ layoutStyle: styles.cellGrow }, h),
              Skeleton.skeleton({ layoutStyle: styles.cellW24 }, h),
              Skeleton.skeleton({ layoutStyle: styles.cellW20 }, h),
            ],
          ),
        ),
      )
  }
}
