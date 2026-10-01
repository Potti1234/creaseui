import * as stylex from '@stylexjs/stylex';
import type { Html, HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import {
  segmentedControlFixtures,
  type SCOption,
} from '@/docs/components/pages/segmented-control/shared';
import * as Icon from '@/lib/icon';
import * as SegmentedControl from '@/stylex/segmented-control';
import { className } from '@/stylex/style';

const styles = stylex.create({
  frame: { width: '400px' },
  iconFill: { width: '100%', height: '100%' },
});

const Bundle = SegmentedControl.create<string>();

interface PreviewShape {
  readonly control: SegmentedControl.Model;
  readonly value: string;
}

const optionConfig = <Msg>(
  option: SCOption,
  h: HtmlBuilder<Msg>,
): SegmentedControl.SegmentedControlItem<string> => ({
  value: option.value,
  label: option.label,
  ...(option.icon !== undefined ? { icon: Icon.icon(option.icon, { class: className(styles.iconFill) }, h) } : {}),
  ...(option.isLabelHidden === true ? { isLabelHidden: true } : {}),
  ...(option.isDisabled === true ? { isDisabled: true } : {}),
});

export const segmentedControlStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const preview = model as PreviewShape;
  const fixture = segmentedControlFixtures[exampleIndex] ?? segmentedControlFixtures[0];
  const control: Html = Bundle.segmentedControl(
    {
      model: preview.control,
      toParentMessage: message =>
        onMessageJson(
          JSON.stringify({
            _tag: 'GotSegmentedControlPreviewMessage',
            message,
          }),
        ),
      ariaLabel: fixture.group.ariaLabel,
      value: preview.value,
      options: fixture.group.options.map(option => optionConfig(option, h)),
      ...(fixture.group.size !== undefined ? { size: fixture.group.size } : {}),
      ...(fixture.group.layout === 'fill' ? { layout: 'fill' as const } : {}),
    },
    h,
  );
  return fixture.width === undefined
    ? control
    : h.div([h.Class(className(styles.frame))], [control]);
};
