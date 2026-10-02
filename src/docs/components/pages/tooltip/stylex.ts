import * as stylex from '@stylexjs/stylex';
import type { Html, HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import {
  tooltipFixtures,
  type TooltipTipSpec,
} from '@/docs/components/pages/tooltip/shared';
import * as Icon from '@/lib/icon';
import type { ComponentLayoutStyle } from '@/stylex/contracts';
import * as Kbd from '@/stylex/kbd';
import { className } from '@/stylex/style';
import * as Tooltip from '@/stylex/tooltip';

const styles = stylex.create({
  row: {
    gap: '0.5rem',
    display: 'flex',
    flexWrap: 'wrap',
  },
  trigger: {
    borderColor: 'var(--border)',
    borderRadius: 'var(--radius-md)',
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingBlock: '0.5rem',
    paddingInline: '0.75rem',
    fontSize: '0.875rem',
 lineHeight: '1.25rem',
    textTransform: 'capitalize',
    width: 'fit-content',
  },
  iconTrigger: {
    borderColor: 'var(--border)',
    borderRadius: 'var(--radius-md)',
    borderStyle: 'solid',
    borderWidth: '1px',
    alignItems: 'center',
    display: 'inline-flex',
    justifyContent: 'center',
    height: '2.25rem',
    width: '2.25rem',
  },
});

interface TooltipPreviewShape {
  readonly tooltips: Readonly<Record<string, Tooltip.Model>>;
}

const tipView = <Msg>(
  tip: TooltipTipSpec,
  content: string,
  shape: TooltipPreviewShape,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html =>
  Tooltip.tooltip(
    {
      model: shape.tooltips[tip.id] ?? Tooltip.init({ id: tip.id }),
      toParentMessage: message =>
        onMessageJson(
          JSON.stringify({ _tag: 'GotDocsTooltipMessage', id: tip.id, message }),
        ),
      trigger:
        tip.iconTrigger === true ? Icon.icon('save', {}, h) : tip.label,
      content:
        tip.kbd === undefined
          ? content
          : h.span([], [
              `${content} `,
              Kbd.kbd({ children: [tip.kbd] }, h),
            ]),
      side: tip.side ?? 'top',
      triggerLayoutStyle: (tip.iconTrigger === true
        ? styles.iconTrigger
        : styles.trigger) as ComponentLayoutStyle,
      ...(tip.isDisabled === true ? { isDisabled: true } : {}),
    },
    h,
  );

export const tooltipStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const shape = model as TooltipPreviewShape;
  const fixture = tooltipFixtures[exampleIndex] ?? tooltipFixtures[0];
  if (fixture.kind === 'sides' || fixture.kind === 'rtl') {
    return h.div(
      [
        h.Class(className(styles.row)),
        ...(fixture.kind === 'rtl' ? [h.Dir('rtl')] : []),
      ],
      fixture.tips.map(tip =>
        tipView(tip, fixture.content, shape, onMessageJson, h)),
    );
  }
  const tip = fixture.tips[0];
  return tipView(
    tip === undefined ? { id: 'tip', label: 'Hover' } : tip,
    fixture.content,
    shape,
    onMessageJson,
    h,
  );
};
