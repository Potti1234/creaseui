import { Effect, Schema as S } from 'effect';
import { Mount } from 'foldkit';
import { m } from 'foldkit/message';
import { File } from '@pierre/diffs';

/* Pierre File viewer embedded in foldkit. Same mount contract as the ECharts
   integration: the view renders a host div with h.OnMount, the mount owns the
   pierre component for the element's lifetime, and mount args carry only
   serializable values. Highlighting resolves asynchronously inside pierre, so
   the mount returns immediately and tokens upgrade in place.
   Theme follows the app's light/dark flag (keyed hosts remount on a flip). */

// MESSAGE

export const MountedCodeFile = m('MountedCodeFile');
export const FailedCodeFile = m('FailedCodeFile', { reason: S.String });
export const Message = S.Union([MountedCodeFile, FailedCodeFile]);
export type Message = typeof Message.Type;

// MOUNT

export const MountCodeFile = Mount.define(
  'MountCodeFile',
  {
    fileName: S.String,
    contents: S.String,
    dark: S.Boolean,
    lineNumbers: S.Boolean,
  },
  MountedCodeFile,
  FailedCodeFile,
)(
  ({ fileName, contents, dark, lineNumbers }) =>
    (element) =>
      Effect.acquireRelease(
        Effect.try({
          try: () => {
            if (!(element instanceof HTMLElement)) {
              throw new Error('Code file host is not an HTMLElement.');
            }
            const view = new File({
              themeType: dark ? 'dark' : 'light',
              disableFileHeader: true,
              disableLineNumbers: !lineNumbers,
              overflow: 'scroll',
            });
            view.render({
              file: { name: fileName, contents },
              containerWrapper: element,
            });
            return view;
          },
          catch: (error) =>
            error instanceof Error ? error : new Error(String(error)),
        }),
        (view) => Effect.sync(() => view.cleanUp()),
      ).pipe(
        Effect.map(() => MountedCodeFile()),
        Effect.catch((error) =>
          Effect.succeed(FailedCodeFile({ reason: error.message })),
        ),
      ),
);
