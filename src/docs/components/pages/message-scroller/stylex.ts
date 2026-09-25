import * as stylex from '@stylexjs/stylex';
import type { HtmlBuilder } from 'foldkit/html';
import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import {
  messageScrollerFixtures,
  type MessageScrollerFixture,
} from '@/docs/components/pages/message-scroller/shared';
import * as Bubble from '@/stylex/bubble';
import * as Button from '@/stylex/button';
import * as MessageScroller from '@/stylex/message-scroller';
import { className } from '@/stylex/style';
import { tokens } from '../../../../stylex/tokens.stylex';

const styles = stylex.create({
  column: {
    gap: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '28rem',
    width: '100%',
  },
  frame: {
    borderColor: tokens.border,
    borderRadius: '0.375rem',
    borderStyle: 'solid',
    borderWidth: 1,
    position: 'relative',
    height: '18rem',
    width: '100%',
  },
  marker: {
    color: tokens.mutedForeground,
    fontSize: '0.75rem',
    textAlign: 'center',
  },
  metrics: {
    color: tokens.mutedForeground,
    columnGap: '0.75rem',
    display: 'grid',
    fontSize: '0.75rem',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    rowGap: '0.125rem',
  },
  following: { color: tokens.mutedForeground, fontSize: '0.75rem' },
  row: {
    opacity: 1,
    transform: 'translateY(0)',
    transitionDuration: '300ms',
    transitionProperty: 'opacity, transform',
  },
  rowEntering: { opacity: 0, transform: 'translateY(0.5rem)' },
});

type PreviewChatMessage = Readonly<{
  id: number;
  role: 'user' | 'assistant' | 'marker';
  text: string;
}>;

type PreviewModel = Readonly<{
  scroller: MessageScroller.Model;
  chat: ReadonlyArray<PreviewChatMessage>;
  streaming: boolean;
  streamStep: number;
  animatingIds: ReadonlyArray<number>;
  visibleIds: ReadonlyArray<number>;
}>;

const fixtureOf = (index: number): MessageScrollerFixture =>
  messageScrollerFixtures[index] ?? messageScrollerFixtures[0]!;

const chatRow = <Msg>(
  message: PreviewChatMessage,
  fixture: MessageScrollerFixture,
  preview: PreviewModel,
  h: HtmlBuilder<Msg>,
) =>
  MessageScroller.messageScrollerItem(
    {
      messageId: `msg-${String(message.id)}`,
      scrollAnchor:
        fixture.kind === 'group-chat'
          ? message.role === 'marker'
          : message.role === 'user',
      children: [
        h.div(
          [
            ...(fixture.kind === 'animation'
              ? [
                  h.Class(
                    className(
                      styles.row,
                      ...(preview.animatingIds.includes(message.id)
                        ? [styles.rowEntering]
                        : []),
                    ),
                  ),
                ]
              : []),
          ],
          [
            message.role === 'marker'
              ? h.div([h.Class(className(styles.marker))], [message.text])
              : Bubble.bubble(
                  {
                    align: message.role === 'user' ? 'end' : 'start',
                    children: [
                      Bubble.bubbleContent({ children: [message.text] }, h),
                    ],
                  },
                  h,
                ),
          ],
        ),
      ],
    },
    h,
  );

const toolbarButton = <Msg>(
  label: string,
  messageJson: string,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) =>
  Button.button(
    {
      variant: 'outline',
      size: 'sm',
      onClick: onMessageJson(messageJson),
      children: [label],
    },
    h,
  );

export const messageScrollerStyleXPreview: StyleXExamplePreviewProvider = <
  Msg,
>(
  index: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const fixture = fixtureOf(index);
  const preview = model as PreviewModel;
  const toParentMessage = (message: MessageScroller.Message) =>
    onMessageJson(
      JSON.stringify({ _tag: 'GotScrollerMessage', message }),
    );

  const scrollerFrame = h.div([h.Class(className(styles.frame))], [
    MessageScroller.messageScroller(
      {
        children: [
          MessageScroller.messageScrollerViewport(
            {
              model: preview.scroller,
              toParentMessage,
              children: [
                MessageScroller.messageScrollerContent(
                  {
                    children: preview.chat.map(message =>
                      chatRow(message, fixture, preview, h),
                    ),
                  },
                  h,
                ),
              ],
            },
            h,
          ),
          ...(fixture.kind === 'scrollable'
            ? [
                MessageScroller.messageScrollerButton(
                  {
                    model: preview.scroller,
                    toParentMessage,
                    direction: 'start',
                  },
                  h,
                ),
              ]
            : []),
          MessageScroller.messageScrollerButton(
            {
              model: preview.scroller,
              toParentMessage,
              direction: 'end',
            },
            h,
          ),
        ],
      },
      h,
    ),
  ]);

  const toolbar = (() => {
    switch (fixture.kind) {
      case 'anchoring':
      case 'previous-context':
      case 'animation':
        return [
          toolbarButton(
            'Send message',
            JSON.stringify({ _tag: 'PressedSend' }),
            onMessageJson,
            h,
          ),
        ];
      case 'group-chat':
        return [
          toolbarButton(
            'Marcus joins the chat',
            JSON.stringify({ _tag: 'PressedAddMember' }),
            onMessageJson,
            h,
          ),
        ];
      case 'streaming':
        return [
          toolbarButton(
            'Start streaming',
            JSON.stringify({ _tag: 'PressedStartStream' }),
            onMessageJson,
            h,
          ),
        ];
      case 'load-history':
        return [
          toolbarButton(
            'Load earlier messages',
            JSON.stringify({ _tag: 'PressedLoadHistory' }),
            onMessageJson,
            h,
          ),
        ];
      case 'commands':
        return [
          toolbarButton(
            'Jump to first question',
            JSON.stringify({ _tag: 'PressedJumpTo', id: 2 }),
            onMessageJson,
            h,
          ),
          toolbarButton(
            'Jump to the RTL answer',
            JSON.stringify({ _tag: 'PressedJumpTo', id: 8 }),
            onMessageJson,
            h,
          ),
          toolbarButton(
            'Jump to the last turn',
            JSON.stringify({ _tag: 'PressedJumpTo', id: 10 }),
            onMessageJson,
            h,
          ),
        ];
      default:
        return [];
    }
  })();

  const header = (() => {
    if (fixture.kind === 'visibility')
      return [
        h.p([h.Class(className(styles.following))], [
          preview.visibleIds.length === 0
            ? 'Nothing in view'
            : `In view: ${preview.visibleIds.map(id => `msg-${String(id)}`).join(', ')}`,
        ]),
      ];
    if (fixture.kind === 'streaming')
      return [
        h.p([h.Class(className(styles.following))], [
          preview.scroller.isFollowing
            ? 'Following the live edge'
            : preview.scroller.hasNewMessages
              ? 'New messages below — jump to the end'
              : 'Not following',
        ]),
      ];
    if (fixture.kind === 'scrollable')
      return [
        h.div(
          [h.Class(className(styles.metrics))],
          [
            h.span(
              [],
              [
                `scrollTop: ${String(Math.round(preview.scroller.scrollTop))}px`,
              ],
            ),
            h.span(
              [],
              [
                `scrollHeight: ${String(Math.round(preview.scroller.scrollHeight))}px`,
              ],
            ),
            h.span(
              [],
              [
                preview.scroller.isFollowing
                  ? 'Following the live edge'
                  : 'Not following',
              ],
            ),
            h.span(
              [],
              [
                preview.scroller.hasNewMessages
                  ? 'New messages below'
                  : 'No pending messages',
              ],
            ),
          ],
        ),
      ];
    return [];
  })();

  return h.div([h.Class(className(styles.column))], [
    ...(toolbar.length === 0
      ? []
      : [h.div([h.Class(className(styles.toolbar))], toolbar)]),
    ...header,
    scrollerFrame,
  ]);
};
