import type { Html, HtmlBuilder } from 'foldkit/html';

import * as stylex from '@stylexjs/stylex';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import {
  type TourFixture,
  stepsFor,
  tourFixtures,
} from '@/docs/components/pages/tour/shared';
import * as Button from '@/stylex/button';
import { className } from '@/stylex/style';
import * as Tour from '@/stylex/tour';

const styles = stylex.create({
  main: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '2rem',
  },
  card: {
    borderColor: 'var(--border)',
    borderRadius: '0.5rem',
    borderStyle: 'solid',
    borderWidth: '1px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    maxWidth: '28rem',
    padding: '1.5rem',
    width: '100%',
  },
  heading: { fontSize: '1.125rem', fontWeight: 600 },
  body: {
    color: 'var(--muted-foreground)',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
  actions: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
});

type PreviewModel = Readonly<{
  tour: Tour.Model;
}>;

const msg = <Msg>(
  onMessageJson: (json: string) => Msg,
  tag: string,
  fields?: Record<string, unknown>,
): Msg => onMessageJson(JSON.stringify({ _tag: tag, ...fields }));

const fixtureFor = (index: number): TourFixture =>
  tourFixtures[index] ?? tourFixtures[0]!;

const targetLabels = (fixture: TourFixture): ReadonlyArray<string> =>
  fixture.kind === 'showcase'
    ? ['New project', 'Invite team', 'Reports']
    : fixture.kind === 'lightweight'
      ? ['Save', 'Share']
      : ['Quick actions', 'Filters'];

export const tourStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (json: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html | undefined => {
  const fixture = fixtureFor(exampleIndex);
  const m = model as PreviewModel;
  const labels = targetLabels(fixture);
  return h.main([h.Class(className(styles.main))], [
    h.div([h.Class(className(styles.card))], [
      h.h3([h.Class(className(styles.heading))], ['Workspace']),
      h.p([h.Class(className(styles.body))], [
        'A tour walks new teammates through the parts that matter.',
      ]),
      h.div(
        [h.Class(className(styles.actions))],
        [
          ...fixture.targets.map((targetId, i) =>
            Button.button({
              variant: 'outline',
              id: targetId,
              children: [labels[i] ?? targetId],
            }, h),
          ),
          Button.button({
            variant: 'default',
            onClick: msg(onMessageJson, 'ClickedStartTourPreview'),
            children: ['Start tour'],
          }, h),
        ],
      ),
    ]),
    Tour.tour({
      model: m.tour,
      toParentMessage: message =>
        msg(onMessageJson, 'GotTourPreviewMessage', { message }),
      steps: stepsFor(fixture),
      hasBackdrop: fixture.hasBackdrop,
      isStepCountShown: fixture.isStepCountShown,
    }, h),
  ]);
};
