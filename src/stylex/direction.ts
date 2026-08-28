const styles = stylex.create({
  root: { display: 'contents' },
})

const isStaticStyle = (value: unknown): value is StaticStyles =>
  typeof value === 'object' && value !== null
const cn = (...values: ReadonlyArray<unknown>): string =>
  className(...values.filter(isStaticStyle))

import * as stylex from '@stylexjs/stylex'
import type { StaticStyles } from '@stylexjs/stylex'
import type { ComponentLayoutStyle } from './contracts'
import { className } from './style'

import type { Html, HtmlBuilder } from 'foldkit/html';

export type Direction = 'ltr' | 'rtl';

export const direction = <Msg>(
  props: Readonly<{
    direction: Direction;
    children: ReadonlyArray<Html | string>;
    layoutStyle?: ComponentLayoutStyle;
  }>,
  h: HtmlBuilder<Msg>,
): Html => {
  return h.div(
    [
      h.Dir(props.direction),
      h.Class(className(styles.root, props.layoutStyle)),
    ],
    [...props.children],
  );
};

