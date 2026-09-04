import { Option } from 'effect';
import type { HtmlBuilder } from 'foldkit/html';
import * as stylex from '@stylexjs/stylex';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { comboboxFixtures, comboboxFrameworks, comboboxLabel } from '@/docs/components/pages/combobox/shared';
import * as Combobox from '@/stylex/combobox';

const styles = stylex.create({ sample: { display: 'grid', gap: '0.5rem' }, status: { color: 'var(--muted-foreground)', fontSize: '0.875rem' } });

export const comboboxStyleXPreview: StyleXExamplePreviewProvider = <Msg>(index: number, model: unknown, onMessageJson: (messageJson: string) => Msg, h: HtmlBuilder<Msg>) => {
  const fixture = comboboxFixtures[index] ?? comboboxFixtures[0];
  const preview = model as { combobox: Combobox.Model; maybeFramework: Option.Option<string> };
  return h.div([h.Class(stylex.props(styles.sample).className ?? '')], [
    Combobox.combobox({
      model: preview.combobox, maybeSelectedValue: preview.maybeFramework,
      restingInputValue: Option.match(preview.maybeFramework, { onNone: () => '', onSome: comboboxLabel }),
      toParentMessage: message => onMessageJson(JSON.stringify({ _tag: 'GotComboboxPreviewMessage', message })),
      items: fixture.empty ? [] : comboboxFrameworks,
      itemToValue: item => item.value, itemToLabel: item => item.label,
      placeholder: 'Search frameworks…', ariaLabel: 'Framework', formName: 'framework',
      ...(fixture.grouped ? { itemGroupKey: (item: typeof comboboxFrameworks[number]) => item.value === 'next' ? 'React' : 'Other', groupToHeading: (group: string) => group } : {}),
      ...(fixture.readOnly ? { isReadOnly: true, direction: 'rtl' as const } : {}),
    }, h),
    ...(fixture.empty ? [h.p([h.Role('status'), h.Class(stylex.props(styles.status).className ?? '')], ['No frameworks match this query.'])] : []),
  ]);
};
