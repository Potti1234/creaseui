// @ts-nocheck: snapshot of creaseui-demo chapter-10:src/design/save-notice.ts
import type { Html, HtmlBuilder } from 'foldkit/html'

import { alert, alertDescription, alertIcon, alertTitle } from '../ui/alert'
import { button } from '../ui/button'
import { icon } from '../ui/icon'
import { stack } from '../ui/stack'

/**
 * SaveNotice: what the page says when the browser did not keep a change.
 *
 * Rules:
 * - Shown at the top of the content only while a save has failed, or when
 *   saved data could not be read at startup. Nothing is shown while saving
 *   works: success is the normal case and needs no message.
 * - It says what happened and what is still true ("your changes are still
 *   on this page"), and offers Retry when retrying can help.
 * - It is announced to screen readers once, as an alert.
 */
export const saveNotice = <Msg>(
  props: Readonly<{ title: string; description: string; onRetry?: Msg }>,
  h: HtmlBuilder<Msg>,
): Html =>
  stack(
    {
      paddingInline: 4,
      paddingBlockEnd: 3,
      children: [
        alert(
          {
            variant: 'destructive',
            announcement: 'alert',
            children: [
              alertIcon({ children: [icon({ name: 'triangle-alert' }, h)] }, h),
              alertTitle({ children: [props.title] }, h),
              alertDescription(
                {
                  children: [
                    props.description,
                    ...(props.onRetry === undefined
                      ? []
                      : [
                          button(
                            { onClick: props.onRetry, children: ['Retry'] },
                            h,
                          ),
                        ]),
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
