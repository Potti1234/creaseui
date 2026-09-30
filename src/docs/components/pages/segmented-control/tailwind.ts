import { Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import {
  segmentedControlFixtures,
  type SCOption,
} from '@/docs/components/pages/segmented-control/shared';
import * as Icon from '@/lib/icon';
import * as SegmentedControl from '@/ui/segmented-control';

const ExampleControl = SegmentedControl.create<string>();

const GotSegmentedControlPreviewMessage = defineMessageUnion({
  GotSegmentedControlPreviewMessage: {
    message: SegmentedControl.Message,
  },
});
type PreviewMessage = typeof GotSegmentedControlPreviewMessage.Type;

const PreviewModel = S.Struct({
  _docsPage: S.Literal('segmented-control'),
  control: SegmentedControl.Model,
  value: S.String,
});
type PreviewModel = typeof PreviewModel.Type;

const optionConfig = (
  option: SCOption,
  h: HtmlBuilder<PreviewMessage>,
): SegmentedControl.SegmentedControlItem<string> => ({
  value: option.value,
  label: option.label,
  ...(option.icon !== undefined ? { icon: Icon.icon(option.icon, {}, h) } : {}),
  ...(option.isLabelHidden === true ? { isLabelHidden: true } : {}),
  ...(option.isDisabled === true ? { isDisabled: true } : {}),
});

export const segmentedControlTailwindPreviewProgram = definePreviewProgram<
  PreviewModel,
  PreviewMessage
>({
  Model: PreviewModel,
  Message: GotSegmentedControlPreviewMessage,
  init: index => {
    const fixture = segmentedControlFixtures[index] ?? segmentedControlFixtures[0];
    return {
      _docsPage: 'segmented-control',
      control: SegmentedControl.init({
        id: `docs-segmented-control-${fixture.group.id}`,
      }),
      value: fixture.group.selected,
    };
  },
  update: (model, message) => {
    switch (message._tag) {
      case 'GotSegmentedControlPreviewMessage': {
        const next = ExampleControl.update(model.control, message.message);
        const selection = Option.getOrUndefined(
          Option.fromNullishOr(next.outMessage),
        )?.value;
        return {
          model: {
            ...model,
            control: next.model,
            ...(selection === undefined ? {} : { value: selection }),
          },
          commands: Command.mapMessages(next.commands ?? [], nextMessage =>
            GotSegmentedControlPreviewMessage.GotSegmentedControlPreviewMessage({
              message: nextMessage,
            }),
          ),
        };
      }
    }
  },
  view: (index, model, h) => {
    const fixture = segmentedControlFixtures[index] ?? segmentedControlFixtures[0];
    const control: Html = ExampleControl.segmentedControl(
      {
        model: model.control,
        toParentMessage: message =>
          GotSegmentedControlPreviewMessage.GotSegmentedControlPreviewMessage({
            message,
          }),
        ariaLabel: fixture.group.ariaLabel,
        value: model.value,
        options: fixture.group.options.map(option => optionConfig(option, h)),
        ...(fixture.group.size !== undefined ? { size: fixture.group.size } : {}),
        ...(fixture.group.layout === 'fill' ? { layout: 'fill' as const } : {}),
      },
      h,
    );
    return fixture.width === undefined
      ? control
      : h.div([h.Class(`w-[${fixture.width}px]`)], [control]);
  },
});
