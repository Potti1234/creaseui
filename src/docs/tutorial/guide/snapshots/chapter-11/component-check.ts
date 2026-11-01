// @ts-nocheck: snapshot of creaseui-demo chapter-11:src/component-check.ts
import './styles.css'
import './theme/tokens.css'
import './theme/geometry.css'

import { Schema as S } from 'effect'
import { Runtime } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { item, itemContent, itemTitle } from './ui/item'
import { stack } from './ui/stack'
import { text } from './ui/text'

/* A page for the browser check: components rendered in the situations their
   guarantees are about, independent of today's patterns. The inline item
   must stay one 36px line even with text in its content, in a narrow column. */

const Model = S.Struct({})

const view = (_model: typeof Model.Type, h: HtmlBuilder<never>): Html =>
  stack(
    {
      width: 240,
      padding: 4,
      children: [
        item(
          {
            size: 'xs',
            layout: 'inline',
            children: [
              itemContent(
                {
                  children: [
                    text(
                      {
                        size: 'xsm',
                        color: 'secondary',
                        children: ['CRE-136'],
                      },
                      h,
                    ),
                    itemTitle(
                      {
                        children: [
                          'Very long issue titles wrap the row and push the assignee out of view',
                        ],
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
      ],
    },
    h,
  )

Runtime.run(
  Runtime.makeElement({
    Model,
    init: () => ({ model: {} }),
    update: model => ({ model }),
    view,
    container: document.getElementById('root'),
  }),
)
