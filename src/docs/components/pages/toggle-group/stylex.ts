import * as stylex from '@stylexjs/stylex';
import type { Html, HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import {
  toggleGroupFixtures,
  type TGFixture,
  type TGGroupSpec,
  type TGItem,
} from '@/docs/components/pages/toggle-group/shared';
import * as Field from '@/stylex/field';
import * as Icon from '@/lib/icon';
import * as ToggleGroup from '@/stylex/toggle-group';
import { className } from '@/stylex/style';

const styles = stylex.create({
  stack: { gap: '1rem', display: 'flex', flexDirection: 'column', },
  weightItem: {
    borderRadius: '0.75rem',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '4rem',
    width: '4rem',
  },
  weightLight: { fontSize: '1.5rem', fontWeight: 300, lineHeight: 1, },
  weightNormal: { fontSize: '1.5rem', fontWeight: 400, lineHeight: 1, },
  weightMedium: { fontSize: '1.5rem', fontWeight: 500, lineHeight: 1, },
  weightBold: { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1, },
  weightLabel: { color: 'var(--muted-foreground)', fontSize: '0.75rem', },
  inlineCode: {
    borderRadius: '0.375rem',
    paddingBlock: '0.125rem',
    paddingInline: '0.25rem',
    backgroundColor: 'var(--muted)',
    fontFamily: 'monospace',
  },
});

const Bundle = ToggleGroup.create<string>();

interface PreviewShape {
  readonly groups: Readonly<Record<string, ToggleGroup.Model>>;
  readonly selections: Readonly<Record<string, ReadonlyArray<string>>>;
}

const weightClass = (weight: string) =>
  weight === 'light'
    ? styles.weightLight
    : weight === 'medium'
      ? styles.weightMedium
      : weight === 'bold'
        ? styles.weightBold
        : styles.weightNormal;

const itemChildren = <Msg>(item: TGItem, h: HtmlBuilder<Msg>): ReadonlyArray<Html | string> => {
  if (item.icon !== undefined) {
    return [Icon.icon(item.icon, {}, h)];
  }
  if (item.weight !== undefined) {
    return [
      h.div(
        [h.Class(className(styles.weightItem))],
        [
          h.span([h.Class(className(weightClass(item.weight)))], ['Aa']),
          h.span([h.Class(className(styles.weightLabel))], [item.label ?? '']),
        ],
      ),
    ];
  }
  return [item.label ?? ''];
};

const itemConfig = <Msg>(item: TGItem, h: HtmlBuilder<Msg>) => ({
  value: item.value,
  ariaLabel: item.ariaLabel,
  children: itemChildren(item, h),
  ...(item.isDisabled === true ? { isDisabled: true } : {}),
});

const groupView = <Msg>(
  group: TGGroupSpec,
  preview: PreviewShape,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html =>
  Bundle.toggleGroup({
    model: preview.groups[group.id] ?? ToggleGroup.init({ id: group.id }),
    toParentMessage: message =>
      onMessageJson(
        JSON.stringify({
          _tag: 'GotToggleGroupPreviewMessage',
          id: group.id,
          message,
        }),
      ),
    ariaLabel: group.ariaLabel,
    ...(group.multiple
      ? { values: preview.selections[group.id] ?? [] }
      : {
          value: preview.selections[group.id]?.[0] ?? group.selected[0] ?? '',
        }),
    items: group.items.map(item => itemConfig(item, h)),
    ...(group.variant === 'outline' ? { variant: 'outline' as const } : {}),
    ...(group.size !== undefined ? { size: group.size } : {}),
    ...(group.arrangement === 'wrapped'
      ? { arrangement: 'wrapped' as const }
      : {}),
    ...(group.orientation === 'vertical'
      ? { orientation: 'vertical' as const }
      : {}),
    ...(group.rtl === true ? { direction: 'rtl' as const } : {}),
  }, h);

export const toggleGroupStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const preview = model as PreviewShape;
  const fixture: TGFixture =
    toggleGroupFixtures[exampleIndex] ?? toggleGroupFixtures[0];
  if (fixture.kind === 'stack') {
    return h.div(
      [h.Class(className(styles.stack))],
      fixture.groups.map(group => groupView(group, preview, onMessageJson, h)),
    );
  }
  if (fixture.kind === 'custom') {
    const group = fixture.groups[0]!;
    return Field.field({
      children: [
        Field.fieldLabel({ children: ['Font Weight'] }, h),
        groupView(group, preview, onMessageJson, h),
        Field.fieldDescription({
          children: [
            'Use ',
            h.code(
              [h.Class(className(styles.inlineCode))],
              [`font-${preview.selections[group.id]?.[0] ?? 'normal'}`],
            ),
            ' to set the font weight.',
          ],
        }, h),
      ],
    }, h);
  }
  return groupView(fixture.groups[0]!, preview, onMessageJson, h);
};
