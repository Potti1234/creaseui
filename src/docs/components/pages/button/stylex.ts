import * as stylex from '@stylexjs/stylex';
import { Option } from 'effect';
import type { Html, HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import {
  buttonFixtures,
  buttonGroupItemIcon,
  buttonGroupItemLabel,
  buttonGroupLabelItems,
  buttonGroupMenuItems,
  buttonSizeTiers,
  type ButtonGroupMenuItem,
  type ButtonFixture,
  type ButtonItemSpec,
} from '@/docs/components/pages/button/shared';
import * as Icon from '@/lib/icon';
import * as Button from '@/stylex/button';
import * as ButtonGroup from '@/stylex/button-group';
import * as DropdownMenu from '@/stylex/dropdown-menu';
import * as Spinner from '@/stylex/spinner';

const styles = stylex.create({
  row: {
    gap: '0.5rem',
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
  },
  tiers: {
    gap: '2rem',
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
  },
  tierGroup: {
    gap: '0.5rem',
    alignItems: 'flex-start',
    display: 'flex',
  },
});

type PreviewModel = Readonly<{
  menu: DropdownMenu.Model;
  labelAs: Option.Option<string>;
}>;

const itemChildren = <Msg>(
  item: ButtonItemSpec,
  h: HtmlBuilder<Msg>,
): Array<Html | string> => {
  const children: Array<Html | string> = [];
  if (item.spinner === 'start')
    children.push(Spinner.spinner({ isDecorative: true, dataIcon: 'inline-start' }, h));
  if (item.icon !== undefined && (item.iconPosition ?? 'start') === 'start')
    children.push(Icon.icon(item.icon, { dataIcon: 'inline-start' }, h));
  if (item.label !== undefined) children.push(item.label);
  if (item.icon !== undefined && item.iconPosition === 'end')
    children.push(Icon.icon(item.icon, { dataIcon: 'inline-end' }, h));
  if (item.spinner === 'end')
    children.push(Spinner.spinner({ isDecorative: true, dataIcon: 'inline-end' }, h));
  return children;
};

const itemHtml = <Msg>(item: ButtonItemSpec, h: HtmlBuilder<Msg>): Html => {
  const size = item.size ?? 'default';
  const inset =
    item.icon !== undefined ? item.iconPosition ?? 'start' : item.spinner;
  const isIconSize =
    size === 'icon' || size === 'icon-xs' || size === 'icon-sm' || size === 'icon-lg';
  return Button.button({
    ...(item.variant === undefined ? {} : { variant: item.variant }),
    ...(item.size === undefined ? {} : { size: item.size }),
    ...(item.rounded === true ? { rounded: true } : {}),
    ...(item.isDisabled === true ? { isDisabled: true } : {}),
    ...(item.ariaLabel === undefined ? {} : { ariaLabel: item.ariaLabel }),
    ...(inset === undefined || isIconSize ? {} : { iconInset: inset }),
    children: itemChildren(item, h),
  }, h);
};

const menuItemConfig = <Msg>(
  labelAs: Option.Option<string>,
  h: HtmlBuilder<Msg>,
) => (item: ButtonGroupMenuItem): DropdownMenu.DropdownMenuItemConfig<ButtonGroupMenuItem> => {
  if (item === 'personal' || item === 'work' || item === 'other')
    return { label: item.charAt(0).toUpperCase() + item.slice(1), kind: 'radio' };
  const main = item as (typeof buttonGroupMenuItems)[number];
  return {
    label: buttonGroupItemLabel(main),
    icon: Icon.icon(buttonGroupItemIcon(main), {}, h),
    ...(main === 'snooze' || main === 'trash' ? { separatorBefore: true } : {}),
    ...(main === 'trash' ? { variant: 'destructive' as const } : {}),
    ...(main === 'label-as'
      ? {
          submenu: {
            items: buttonGroupLabelItems,
            itemToConfig: (label: ButtonGroupMenuItem) => ({
              label: label.charAt(0).toUpperCase() + label.slice(1),
              kind: 'radio' as const,
              isChecked: Option.getOrNull(labelAs) === label,
            }),
          },
        }
      : {}),
  };
};

const buttonGroupHtml = <Msg>(
  model: PreviewModel,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html =>
  ButtonGroup.buttonGroup({ children: [
    ButtonGroup.buttonGroup({ children: [
      Button.button({ variant: 'outline', size: 'icon', ariaLabel: 'Go Back', children: [Icon.icon('arrow-left', {}, h)] }, h),
    ] }, h),
    ButtonGroup.buttonGroup({ children: [
      Button.button({ variant: 'outline', children: ['Archive'] }, h),
      Button.button({ variant: 'outline', children: ['Report'] }, h),
    ] }, h),
    ButtonGroup.buttonGroup({ children: [
      Button.button({ variant: 'outline', children: ['Snooze'] }, h),
      DropdownMenu.dropdownMenu({
        model: model.menu,
        toParentMessage: message =>
          onMessageJson(JSON.stringify({ _tag: 'GotMenuMessage', message })),
        trigger: Icon.icon('ellipsis', {}, h),
        triggerButtonVariant: 'outline',
        triggerButtonSize: 'icon',
        ariaLabel: 'More options',
        items: [...buttonGroupMenuItems],
        itemToConfig: menuItemConfig(model.labelAs, h),
      }, h),
    ] }, h),
  ] }, h);

const fixtureHtml = <Msg>(
  fixture: ButtonFixture,
  model: PreviewModel,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html => {
  switch (fixture.kind) {
    case 'link':
      return Button.buttonLink({ href: '/login', children: ['Login'] }, h);
    case 'buttonGroup':
      return buttonGroupHtml(model, onMessageJson, h);
    case 'sizes':
      return h.div([h.Class(stylex.props(styles.tiers).className ?? '')],
        buttonSizeTiers.map(tier =>
          h.div([h.Class(stylex.props(styles.tierGroup).className ?? '')], [
            itemHtml(
              { label: tier.name, variant: 'outline', ...(tier.size === undefined ? {} : { size: tier.size }) },
              h,
            ),
            itemHtml(
              { variant: 'outline', size: tier.iconSize, icon: 'arrow-up-right', ariaLabel: tier.name },
              h,
            ),
          ]),
        ),
      );
    case 'items': {
      const items = fixture.items.map(item => itemHtml(item, h));
      if (items.length === 1 && fixture.direction === undefined) return items[0] as Html;
      return h.div(
        [
          ...(fixture.direction === 'rtl' ? [h.Dir('rtl')] : []),
          h.Class(stylex.props(styles.row).className ?? ''),
        ],
        items,
      );
    }
  }
};

export const buttonStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) =>
  fixtureHtml(
    buttonFixtures[exampleIndex] ?? buttonFixtures[0],
    model as PreviewModel,
    onMessageJson,
    h,
  );
