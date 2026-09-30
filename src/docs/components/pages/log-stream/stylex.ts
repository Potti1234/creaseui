import type { Html, HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import {
  logStreamFixtures,
  logStreamLiveScript,
  type LogFixtureEntry,
} from '@/docs/components/pages/log-stream/shared';
import * as LogStream from '@/stylex/log-stream';
import * as StatusDot from '@/stylex/status-dot';

interface PreviewShape {
  readonly stream: LogStream.Model;
  readonly entries: ReadonlyArray<LogFixtureEntry>;
}

const toEntries = (
  rows: ReadonlyArray<LogFixtureEntry>,
  h: HtmlBuilder<never>,
): ReadonlyArray<LogStream.LogEntry> =>
  rows.map((row) => ({
    ...row,
    ...(row.detailText === undefined
      ? {}
      : {
          detail: h.pre(
            [
              h.Class(
                'm-0 whitespace-pre-wrap font-mono text-sm leading-[1.7]',
              ),
            ],
            [row.detailText],
          ),
        }),
  }));

export const logStreamStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  index: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html => {
  const preview = model as PreviewShape;
  const fixture = logStreamFixtures[index] ?? logStreamFixtures[0];
  const toStream = (message: LogStream.Message): Msg =>
    onMessageJson(
      JSON.stringify({ _tag: 'GotStreamMessage', message }),
    );
  const stream = LogStream.logStream(
    {
      model: preview.stream,
      toParentMessage: toStream,
      entries: toEntries(preview.entries, h as never),
      variant: fixture.variant,
      maxHeight: fixture.maxHeight,
      label:
        fixture.layout === 'follow'
          ? 'Live log stream'
          : fixture.title === 'Build logs'
            ? 'Build logs'
            : 'Log results stream',
    },
    h,
  );
  if (fixture.layout !== 'follow') {
    return stream;
  }
  const isFollowing = preview.stream.scroller.isFollowing;
  const baseCount = fixture.entries.length;
  return h.div([h.Class('flex flex-col gap-3')], [
    h.div([h.Class('flex items-center gap-2')], [
      StatusDot.statusDot(
        {
          variant: isFollowing ? 'success' : 'neutral',
          label: isFollowing ? 'Following latest' : 'Not following',
        },
        h,
      ),
      h.span(
        [h.Class('flex-1 text-xs leading-5 text-muted-foreground')],
        [`${String(preview.entries.length)} rows`],
      ),
      h.button(
        [
          h.Type('button'),
          h.Class(
            'inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50',
          ),
          h.Disabled(
            preview.entries.length - baseCount >= logStreamLiveScript.length,
          ),
          h.OnClick(
            onMessageJson(JSON.stringify({ _tag: 'ClickedAppend' })),
          ),
        ],
        ['Append line'],
      ),
      h.button(
        [
          h.Type('button'),
          h.Class(
            'inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
          ),
          h.OnClick(onMessageJson(JSON.stringify({ _tag: 'ClickedReset' }))),
        ],
        ['Reset'],
      ),
    ]),
    stream,
  ]);
};
