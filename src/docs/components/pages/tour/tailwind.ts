import { Schema as S } from 'effect';
import { Command } from 'foldkit';
import type { Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import {
  type TourFixture,
  stepsFor,
  tourFixtures,
} from '@/docs/components/pages/tour/shared';
import * as Button from '@/ui/button';
import * as Tour from '@/ui/tour';

const PreviewModel = S.Struct({
  _docsPage: S.Literal('tour'),
  tour: Tour.Model,
});
type PreviewModel = typeof PreviewModel.Type;

const PreviewMessage = defineMessageUnion({
  ClickedStartTourPreview: {},
  GotTourPreviewMessage: { message: Tour.Message },
});
type PreviewMessage = typeof PreviewMessage.Type;

const fixtureFor = (index: number): TourFixture =>
  tourFixtures[index] ?? tourFixtures[0]!;

const targetLabels = (fixture: TourFixture): ReadonlyArray<string> =>
  fixture.kind === 'showcase'
    ? ['New project', 'Invite team', 'Reports']
    : fixture.kind === 'lightweight'
      ? ['Save', 'Share']
      : ['Quick actions', 'Filters'];

const view = (index: number, model: PreviewModel, h: HtmlBuilder<PreviewMessage>): Html => {
  const fixture = fixtureFor(index);
  const labels = targetLabels(fixture);
  return h.main(
    [h.Class('flex min-h-screen items-center justify-center p-8')],
    [
      h.div(
        [h.Class('flex w-full max-w-md flex-col gap-4 rounded-lg border p-6')],
        [
          h.h3([h.Class('text-lg font-semibold')], ['Workspace']),
          h.p([h.Class('text-sm text-muted-foreground')], [
            'A tour walks new teammates through the parts that matter.',
          ]),
          h.div(
            [h.Class('flex flex-wrap gap-2')],
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
                onClick: PreviewMessage.ClickedStartTourPreview(),
                children: ['Start tour'],
              }, h),
            ],
          ),
        ],
      ),
      Tour.tour({
        model: model.tour,
        toParentMessage: (message: Tour.Message): PreviewMessage =>
          PreviewMessage.GotTourPreviewMessage({ message }),
        steps: stepsFor(fixture),
        hasBackdrop: fixture.hasBackdrop,
        isStepCountShown: fixture.isStepCountShown,
      }, h),
    ],
  );
};

export const tourTailwindPreviewProgram = definePreviewProgram<
  PreviewModel,
  PreviewMessage
>({
  Model: PreviewModel,
  Message: PreviewMessage,
  init: () => ({ _docsPage: 'tour', tour: Tour.init() }),
  update: (model, message): Update.Return<PreviewModel, PreviewMessage> => {
    switch (message._tag) {
      case 'ClickedStartTourPreview': {
        const result = Tour.activate(model.tour);
        return { model: { ...model, tour: result.model } };
      }
      case 'GotTourPreviewMessage': {
        const result = Tour.update(model.tour, message.message);
        const tour =
          result.outMessage === undefined
            ? result.model
            : Tour.deactivate(result.model).model;
        return {
          model: { ...model, tour },
          commands: Command.mapMessages(result.commands ?? [], next =>
            PreviewMessage.GotTourPreviewMessage({ message: next }),
          ),
        };
      }
    }
  },
  view,
});
