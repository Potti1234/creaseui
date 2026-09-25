import * as stylex from '@stylexjs/stylex';
import type { Html, HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import {
  sonnerFixtures,
  type SonnerFixture,
} from '@/docs/components/pages/sonner/shared';
import * as Button from '@/stylex/button';
import * as Sonner from '@/stylex/sonner';
import { className } from '@/stylex/style';

const styles = stylex.create({
  wrap: { gap: '0.5rem', display: 'flex', flexWrap: 'wrap', },
  wrapCenter: { justifyContent: 'center' },
});

interface PreviewShape {
  readonly notifications: Sonner.Model;
  readonly pendingPromiseId?: unknown;
}

export const sonnerStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html => {
  const preview = model as PreviewShape;
  const fixture: SonnerFixture =
    sonnerFixtures[exampleIndex] ?? sonnerFixtures[0];
  const offset = sonnerFixtures
    .slice(0, exampleIndex)
    .reduce((total, candidate) => total + candidate.buttons.length, 0);
  return h.div(
    [
      h.Class(
        className(
          styles.wrap,
          ...(fixture.wrap === 'center' ? [styles.wrapCenter] : []),
        ),
      ),
    ],
    fixture.buttons
      .map((button, index) =>
        Button.button(
          {
            onClick: onMessageJson(
              JSON.stringify({
                _tag: 'ClickedSonnerButton',
                index: offset + index,
              }),
            ),
            variant: 'outline',
            children: [button.label],
          },
          h,
        ))
      .concat([
        Sonner.sonner(
          {
            model: preview.notifications,
            toParentMessage: message =>
              onMessageJson(
                JSON.stringify({
                  _tag: 'GotSonnerPreviewMessage',
                  message,
                }),
              ),
            ariaLabel: 'Sonner notifications',
          },
          h,
        ),
      ]),
  );
};
