import { Option, Schema as S } from 'effect';
import { type Html, type HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';

import * as Icon from '@/lib/icon';
import { cn } from '@/lib/utils';

export const Model = S.Struct({
  id: S.String,
  index: S.Number,
  count: S.Number,
});
export type Model = typeof Model.Type;
export const Previous = m('Previous');
export const Next = m('Next');
export const WentTo = m('WentTo', { index: S.Number });
export const Message = S.Union([Previous, Next, WentTo]);
export type Message = typeof Message.Type;

export const init = (id: string, count: number, index = 0): Model => ({
  id,
  count: Math.max(0, count),
  index: Math.max(0, Math.min(index, count - 1)),
});

export const update = (model: Model, message: Message): Model => {
  if (model.count === 0) return model;
  switch (message._tag) {
    case 'Previous':
      return { ...model, index: Math.max(0, model.index - 1) };
    case 'Next':
      return { ...model, index: Math.min(model.count - 1, model.index + 1) };
    case 'WentTo':
      return {
        ...model,
        index: Math.max(0, Math.min(message.index, model.count - 1)),
      };
  }
};

export type CarouselProps<Msg> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => Msg;
  items: ReadonlyArray<Html | string>;
  ariaLabel?: string;
  orientation?: 'horizontal' | 'vertical';
  loop?: boolean;
  /** Number of slides advanced by the controls. */
  slidesToScroll?: number;
  /** Slide width/height as a percentage of the viewport; may vary per item. */
  itemSize?: number | ((index: number) => number);
  keyboardNavigation?: boolean;
  previousLabel?: string;
  nextLabel?: string;
  class?: string;
}>;

export const carousel = <Msg>(
  props: CarouselProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const vertical = props.orientation === 'vertical';
  const count = Math.min(props.model.count, props.items.length);
  const step = Math.max(1, Math.floor(props.slidesToScroll ?? 1));
  const previousIndex =
    props.model.index - step < 0 && props.loop === true
      ? Math.max(0, count - 1)
      : Math.max(0, props.model.index - step);
  const nextIndex =
    props.model.index + step >= count && props.loop === true
      ? 0
      : Math.min(Math.max(0, count - 1), props.model.index + step);
  const previous = WentTo({ index: previousIndex });
  const next = WentTo({ index: nextIndex });
  const sizeAt = (index: number) =>
    clampPercent(
      typeof props.itemSize === 'function'
        ? props.itemSize(index)
        : (props.itemSize ?? 100),
    );
  const offset = props.items
    .slice(0, props.model.index)
    .reduce((total, _item, index) => total + sizeAt(index), 0);
  const transform = vertical
    ? `translateY(-${offset}%)`
    : `translateX(-${offset}%)`;
  return h.section(
    [
      h.Role('region'),
      h.AriaRoleDescription('carousel'),
      h.AriaLabel(props.ariaLabel ?? 'Carousel'),
      h.DataAttribute('slot', 'carousel'),
      h.Tabindex(props.keyboardNavigation === false ? -1 : 0),
      h.OnKeyDownPreventDefault((key) =>
        key === (vertical ? 'ArrowUp' : 'ArrowLeft')
          ? Option.some(props.toParentMessage(previous))
          : key === (vertical ? 'ArrowDown' : 'ArrowRight')
            ? Option.some(props.toParentMessage(next))
            : key === 'Home'
              ? Option.some(props.toParentMessage(WentTo({ index: 0 })))
              : key === 'End'
                ? Option.some(
                    props.toParentMessage(
                      WentTo({ index: props.model.count - 1 }),
                    ),
                  )
                : Option.none(),
      ),
      h.Class(
        cn(
          'relative outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
          props.class,
        ),
      ),
    ],
    [
      h.div(
        [
          h.DataAttribute('slot', 'carousel-content'),
          h.Class('overflow-hidden'),
        ],
        [
          h.div(
            [
              h.Class(
                cn(
                  'flex transition-transform duration-300 ease-out',
                  vertical ? 'h-full flex-col' : '-ml-4',
                ),
              ),
              h.Style({ transform }),
            ],
            props.items.map((item, index) =>
              h.div(
                [
                  h.Role('group'),
                  h.AriaRoleDescription('slide'),
                  h.AriaLabel(`${index + 1} of ${props.items.length}`),
                  h.DataAttribute('slot', 'carousel-item'),
                  h.Style({ flexBasis: `${sizeAt(index)}%` }),
                  h.Class(
                    cn(
                      'min-w-0 shrink-0 grow-0 snap-start',
                      vertical ? 'pt-4' : 'pl-4',
                    ),
                  ),
                ],
                [item],
              ),
            ),
          ),
        ],
      ),
      carouselButton(
        {
          direction: 'previous',
          isDisabled:
            count === 0 || (props.model.index === 0 && props.loop !== true),
          onClick: props.toParentMessage(previous),
          vertical,
          label: props.previousLabel ?? 'Previous slide',
        },
        h,
      ),
      carouselButton(
        {
          direction: 'next',
          isDisabled:
            count === 0 ||
            (props.model.index >= count - 1 && props.loop !== true),
          onClick: props.toParentMessage(next),
          vertical,
          label: props.nextLabel ?? 'Next slide',
        },
        h,
      ),
    ],
  );
};

const clampPercent = (value: number): number =>
  Math.max(1, Math.min(100, value));

const carouselButton = <Msg>(
  props: Readonly<{
    direction: 'previous' | 'next';
    isDisabled: boolean;
    onClick: Msg;
    vertical: boolean;
    label: string;
  }>,
  h: HtmlBuilder<Msg>,
): Html => {
  const previous = props.direction === 'previous';
  return h.button(
    [
      h.Type('button'),
      h.Disabled(props.isDisabled),
      h.OnClick(props.onClick),
      h.DataAttribute('slot', `carousel-${props.direction}`),
      h.Class(
        cn(
          'absolute flex size-8 items-center justify-center rounded-full border bg-background shadow-xs hover:bg-accent disabled:pointer-events-none disabled:opacity-50',
          props.vertical
            ? `left-1/2 -translate-x-1/2 ${previous ? '-top-12 rotate-90' : '-bottom-12 rotate-90'}`
            : `top-1/2 -translate-y-1/2 ${previous ? '-left-12' : '-right-12'}`,
        ),
      ),
    ],
    [
      previous
        ? Icon.arrowLeft<Msg>({ class: 'size-4' }, h)
        : Icon.arrowRight<Msg>({ class: 'size-4' }, h),
      h.span([h.Class('sr-only')], [props.label]),
    ],
  );
};
