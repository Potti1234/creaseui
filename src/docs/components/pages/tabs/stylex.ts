import * as stylex from '@stylexjs/stylex';
import type { Html, HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import {
  tabsFixtures,
  type TabsCardSpec,
  type TabsTabSpec,
} from '@/docs/components/pages/tabs/shared';
import * as Card from '@/stylex/card';
import * as Icon from '@/lib/icon';
import * as Tabs from '@/stylex/tabs';

const styles = stylex.create({
  cardText: {
    color: 'var(--muted-foreground)',
    fontSize: '0.875rem',
  },
  demoWidth: { width: '25rem' },
});

const Bundle = Tabs.create<string>();

interface TabsPreviewShape {
  readonly tabs: Tabs.Model;
  readonly selectedTab: string;
}

const cardView = <Msg>(card: TabsCardSpec, h: HtmlBuilder<Msg>): Html =>
  Card.card({
    children: [
      Card.cardHeader({
        children: [
          Card.cardTitle({ children: [card.title] }, h),
          Card.cardDescription({ children: [card.description] }, h),
        ],
      }, h),
      Card.cardContent({
        children: [
          h.span([h.Class(stylex.props(styles.cardText).className ?? '')], [card.text]),
        ],
      }, h),
    ],
  }, h);

export const tabsStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const preview = model as TabsPreviewShape;
  const fixture = tabsFixtures[exampleIndex] ?? tabsFixtures[0];
  return Bundle.tabs({
    model: preview.tabs,
    selectedValue: preview.selectedTab,
    toParentMessage: message =>
      onMessageJson(
        JSON.stringify({ _tag: 'GotTabsMessage', message }),
      ),
    ariaLabel: fixture.ariaLabel,
    tabs: fixture.tabs.map((tab: TabsTabSpec) => ({
      value: tab.value,
      label:
        tab.icon === undefined
          ? tab.label
          : h.span([], [Icon.icon(tab.icon, {}, h), tab.label]),
      content: tab.card === undefined ? tab.content : cardView(tab.card, h),
      ...(tab.isDisabled === true ? { isDisabled: true } : {}),
    })),
    ...(fixture.variant === 'line' ? { variant: 'line' as const } : {}),
    ...(fixture.orientation === 'vertical'
      ? { orientation: 'vertical' as const }
      : {}),
    ...(fixture.rtl === true ? { direction: 'rtl' as const } : {}),
    ...(fixture.kind === 'demo' ? { layoutStyle: styles.demoWidth } : {}),
  }, h);
};
