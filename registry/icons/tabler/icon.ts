import type { Attribute, Html, HtmlBuilder } from 'foldkit/html';

import { iconNodes } from '@/lib/icon-nodes';
import { cn } from '@/lib/utils';

type IconTag = 'circle' | 'ellipse' | 'g' | 'path' | 'rect';
type IconAttributes = Readonly<Record<string, string>>;
type IconNode = readonly [IconTag, IconAttributes, ReadonlyArray<IconNode>];
type IconDefinition = Readonly<{
  width: number;
  height: number;
  nodes: ReadonlyArray<IconNode>;
}>;

export type IconConfig = Readonly<{
  class?: string;
  ariaLabel?: string;
  dataIcon?: 'inline-start' | 'inline-end';
}>;

export type IconName = keyof typeof iconNodes;
export const iconNames: ReadonlyArray<IconName> = Object.keys(iconNodes) as IconName[];
export const hasIcon = (name: string): name is IconName => Object.hasOwn(iconNodes, name);

const nodeView = <Msg>(h: HtmlBuilder<Msg>, node: IconNode): Html => {
  const attributes: ReadonlyArray<Attribute<Msg>> = Object.entries(node[1]).map(
    ([key, value]) => h.Attribute(key, value),
  );
  const children = node[2].map((child) => nodeView(h, child));
  switch (node[0]) {
    case 'circle': return h.circle(attributes, children);
    case 'ellipse': return h.ellipse(attributes, children);
    case 'g': return h.g(attributes, children);
    case 'path': return h.path(attributes, children);
    case 'rect': return h.rect(attributes, children);
  }
};

export const icon = <Msg>(
  name: string,
  config: IconConfig,
  h: HtmlBuilder<Msg>,
): Html => {
  const isMissing = !hasIcon(name);
  const definition: IconDefinition = hasIcon(name) ? iconNodes[name] : iconNodes['circle-question-mark'];
  const width = definition?.width ?? 24;
  const height = definition?.height ?? 24;
  return h.svg(
    [
      h.Xmlns('http://www.w3.org/2000/svg'),
      h.ViewBox(`0 0 ${width} ${height}`),
      h.Width('1em'),
      h.Height('1em'),
      h.Class(cn('crease-icon crease-icon-tabler', `crease-icon-${name}`, config.class)),
      ...(isMissing ? [h.DataAttribute('icon-missing', name)] : []),
      ...(config.dataIcon === undefined ? [] : [h.DataAttribute('icon', config.dataIcon)]),
      ...(config.ariaLabel === undefined
        ? [h.AriaHidden(true)]
        : [h.Role('img'), h.AriaLabel(config.ariaLabel)]),
    ],
    (definition?.nodes ?? []).map((child) => nodeView(h, child)),
  );
};

const named =
  (name: string) =>
  <Msg>(config: IconConfig, h: HtmlBuilder<Msg>): Html =>
    icon(name, config, h);

export const arrowLeft = named('arrow-left');
export const banknote = named('banknote');
export const mousePointer2 = named('mouse-pointer-2');
export const userCheck = named('user-check');
export const arrowRight = named('arrow-right');
export const arrowUpRight = named('arrow-up-right');
export const badgeCheck = named('badge-check');
export const bookmark = named('bookmark');
export const arrowDown = named('arrow-down');
export const arrowUp = named('arrow-up');
export const calendarIcon = named('calendar');
export const calendarDays = named('calendar-days');
export const check = named('check');
export const chevronDown = named('chevron-down');
export const chevronLeft = named('chevron-left');
export const chevronRight = named('chevron-right');
export const chevronUp = named('chevron-up');
export const chevronsUpDown = named('chevrons-up-down');
export const circleCheck = named('circle-check');
export const circleIcon = named('circle');
export const clock = named('clock');
export const codeXml = named('code-xml');
export const gripVertical = named('grip-vertical');
export const info = named('info');
export const eye = named('eye');
export const eyeOff = named('eye-off');
export const filter = named('funnel');
export const loaderCircle = named('loader-circle');
export const menu = named('menu');
export const house = named('house');
export const folder = named('folder');
export const chartBarStacked = named('chart-bar-stacked');
export const settings = named('settings');
export const users = named('users');
export const layoutDashboard = named('layout-dashboard');
export const minus = named('minus');
export const moreHorizontal = named('ellipsis');
export const moveHorizontal = named('move-horizontal');
export const octagonX = named('octagon-x');
export const panelLeft = named('panel-left');
export const plus = named('plus');
export const pin = named('pin');
export const rotateCcw = named('rotate-ccw');
export const search = named('search');
export const triangleAlert = named('triangle-alert');
export const x = named('x');
