import { Match as M, Option } from 'effect';
import * as FoldkitCalendar from 'foldkit/calendar';
import { type ChildAttribute, type Html, type HtmlBuilder } from 'foldkit/html';

import { Calendar as CalendarPrimitive } from '@foldkit/ui';

import * as Icon from '@/lib/icon';
import { buttonVariants } from '@/ui/button';
import { cn } from '@/lib/utils';

/* Ported from shadcn/ui calendar.tsx on top of foldkit's Calendar submodel.

   foldkit exposes three tagged render modes instead of react-day-picker's
   component map. The Days, Months, and Years branches below share the same
   shadcn root, navigation, grid, and button styles. Cell state is supplied by
   foldkit on the gridcell as data-selected/data-today/data-focused/
   data-outside-month/data-disabled, so descendant button selectors are
   adapted to those attributes. */

export const Model = CalendarPrimitive.Model;
export type Model = typeof Model.Type;
export const Message = CalendarPrimitive.Message;
export type Message = typeof Message.Type;
export const OutMessage = CalendarPrimitive.OutMessage;
export type OutMessage = typeof OutMessage.Type;

export const init = CalendarPrimitive.init;
export const update = CalendarPrimitive.update;
export const selectDate = CalendarPrimitive.selectDate;
export const focusDate = CalendarPrimitive.focusDate;
export const reflectMinDate = CalendarPrimitive.reflectMinDate;
export const reflectMaxDate = CalendarPrimitive.reflectMaxDate;
export const reflectDisabledDates = CalendarPrimitive.reflectDisabledDates;
export const reflectDisabledDaysOfWeek =
  CalendarPrimitive.reflectDisabledDaysOfWeek;
export const dropToDays = CalendarPrimitive.dropToDays;

const ROOT_CLASS =
  'group/calendar bg-background p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent w-fit';

const MONTH_CLASS = 'relative flex w-full flex-col gap-4';

const NAV_CLASS =
  'absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1';

const NAV_BUTTON_CLASS = cn(
  buttonVariants({ variant: 'ghost', size: 'icon' }),
  'size-(--cell-size) p-0 select-none aria-disabled:opacity-50',
);

const CAPTION_CLASS =
  'flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)';

const CAPTION_BUTTON_CLASS =
  'flex h-8 items-center gap-1 rounded-md pr-1 pl-2 text-sm font-medium select-none [&>svg]:size-3.5 [&>svg]:text-muted-foreground';

const GRID_CLASS = 'w-full border-collapse outline-none';

const HEADER_ROW_CLASS = 'flex';

const WEEKDAY_CLASS =
  'flex size-(--cell-size) flex-1 items-center justify-center rounded-md text-[0.8rem] font-normal text-muted-foreground select-none';

const WEEK_CLASS = 'mt-2 flex w-full';

const DAY_CELL_CLASS =
  'group/day relative aspect-square size-(--cell-size) p-0 text-center select-none data-[today]:rounded-md data-[today]:bg-accent data-[today]:text-accent-foreground data-[outside-month]:text-muted-foreground data-[disabled]:text-muted-foreground data-[disabled]:opacity-50';

const DAY_BUTTON_CLASS = cn(
  buttonVariants({ variant: 'ghost', size: 'icon' }),
  'flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused]/day:relative group-data-[focused]/day:z-10 group-data-[focused]/day:border-ring group-data-[focused]/day:ring-[3px] group-data-[focused]/day:ring-ring/50 group-data-[selected]/day:bg-primary group-data-[selected]/day:text-primary-foreground group-data-[outside-month]/day:text-muted-foreground group-data-[disabled]/day:pointer-events-none group-data-[disabled]/day:opacity-50 dark:hover:text-accent-foreground',
);

const PICKER_GRID_CLASS = 'grid grid-cols-3 gap-2 outline-none';

const PICKER_CELL_CLASS =
  'group/cell flex h-(--cell-size) items-center justify-center rounded-md text-sm data-[today]:bg-accent data-[today]:text-accent-foreground data-[disabled]:text-muted-foreground data-[disabled]:opacity-50';

const PICKER_BUTTON_CLASS = cn(
  buttonVariants({ variant: 'ghost' }),
  'h-(--cell-size) w-full px-2 font-normal group-data-[focused]/cell:relative group-data-[focused]/cell:z-10 group-data-[focused]/cell:border-ring group-data-[focused]/cell:ring-[3px] group-data-[focused]/cell:ring-ring/50 group-data-[selected]/cell:bg-primary group-data-[selected]/cell:text-primary-foreground group-data-[disabled]/cell:pointer-events-none group-data-[disabled]/cell:opacity-50',
);

export type CalendarViewOptions = Readonly<{
  class?: string;
}>;

const navigationButton = <Msg>(
  attributes: ReadonlyArray<ChildAttribute>,
  direction: 'previous' | 'next',
  h: HtmlBuilder<Msg>,
): Html => {
  return h.button(
    [...attributes, h.Class(NAV_BUTTON_CLASS)],
    [
      direction === 'previous'
        ? Icon.chevronLeft({ class: 'size-4' }, h)
        : Icon.chevronRight({ class: 'size-4' }, h),
    ],
  );
};

const daysView = <Msg>(
  attributes: CalendarPrimitive.DaysModeAttributes,
  options: CalendarViewOptions,
  h: HtmlBuilder<Msg>,
): Html => {
  return h.div(
    [
      ...attributes.root,
      h.DataAttribute('slot', 'calendar'),
      h.Class(cn(ROOT_CLASS, options.class)),
    ],
    [
      h.div(
        [h.Class(MONTH_CLASS)],
        [
          h.div(
            [h.Class(NAV_CLASS)],
            [
              navigationButton(attributes.previousMonthButton, 'previous', h),
              navigationButton(attributes.nextMonthButton, 'next', h),
            ],
          ),
          h.div(
            [h.Class(CAPTION_CLASS)],
            [
              h.button(
                [
                  ...attributes.headingButton,
                  h.Id(attributes.heading.id),
                  h.Class(CAPTION_BUTTON_CLASS),
                ],
                [
                  attributes.heading.text,
                  Icon.chevronDown({ class: 'size-3.5' }, h),
                ],
              ),
            ],
          ),
          h.div(
            [...attributes.grid, h.Class(GRID_CLASS)],
            [
              h.div(
                [...attributes.headerRow, h.Class(HEADER_ROW_CLASS)],
                attributes.columnHeaders.map((column) =>
                  h.div(
                    [...column.attributes, h.Class(WEEKDAY_CLASS)],
                    [column.name],
                  ),
                ),
              ),
              ...attributes.weeks.map((week) =>
                h.div(
                  [...week.attributes, h.Class(WEEK_CLASS)],
                  week.cells.map((cell) =>
                    h.div(
                      [...cell.cellAttributes, h.Class(DAY_CELL_CLASS)],
                      [
                        h.button(
                          [...cell.buttonAttributes, h.Class(DAY_BUTTON_CLASS)],
                          [cell.label],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    ],
  );
};

const monthsView = <Msg>(
  attributes: CalendarPrimitive.MonthsModeAttributes,
  options: CalendarViewOptions,
  h: HtmlBuilder<Msg>,
): Html => {
  return h.div(
    [
      ...attributes.root,
      h.DataAttribute('slot', 'calendar'),
      h.Class(cn(ROOT_CLASS, options.class)),
    ],
    [
      h.div(
        [h.Class(MONTH_CLASS)],
        [
          h.div(
            [h.Class(CAPTION_CLASS)],
            [
              h.button(
                [
                  ...attributes.headingButton,
                  h.Id(attributes.heading.id),
                  h.Class(CAPTION_BUTTON_CLASS),
                ],
                [
                  attributes.heading.text,
                  Icon.chevronDown({ class: 'size-3.5' }, h),
                ],
              ),
            ],
          ),
          h.div(
            [...attributes.grid, h.Class(PICKER_GRID_CLASS)],
            attributes.cells.map((cell) =>
              h.div(
                [...cell.cellAttributes, h.Class(PICKER_CELL_CLASS)],
                [
                  h.button(
                    [...cell.buttonAttributes, h.Class(PICKER_BUTTON_CLASS)],
                    [cell.shortLabel],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    ],
  );
};

const yearsView = <Msg>(
  attributes: CalendarPrimitive.YearsModeAttributes,
  options: CalendarViewOptions,
  h: HtmlBuilder<Msg>,
): Html => {
  return h.div(
    [
      ...attributes.root,
      h.DataAttribute('slot', 'calendar'),
      h.Class(cn(ROOT_CLASS, options.class)),
    ],
    [
      h.div(
        [h.Class(MONTH_CLASS)],
        [
          h.div(
            [h.Class(NAV_CLASS)],
            [
              navigationButton(attributes.previousPageButton, 'previous', h),
              navigationButton(attributes.nextPageButton, 'next', h),
            ],
          ),
          h.div(
            [h.Class(CAPTION_CLASS)],
            [
              h.div(
                [
                  h.Id(attributes.heading.id),
                  h.Class('text-sm font-medium select-none'),
                ],
                [attributes.heading.text],
              ),
            ],
          ),
          h.div(
            [...attributes.grid, h.Class(PICKER_GRID_CLASS)],
            attributes.cells.map((cell) =>
              h.div(
                [...cell.cellAttributes, h.Class(PICKER_CELL_CLASS)],
                [
                  h.button(
                    [...cell.buttonAttributes, h.Class(PICKER_BUTTON_CLASS)],
                    [cell.label],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    ],
  );
};

/** Shared renderer used by both the standalone Calendar and DatePicker. */
export const calendarView = <Msg>(
  attributes: CalendarPrimitive.CalendarAttributes,
  options: CalendarViewOptions,
  h: HtmlBuilder<Msg>,
): Html =>
  M.value(attributes).pipe(
    M.withReturnType<Html>(),
    M.tagsExhaustive({
      Days: (days) => daysView(days, options, h),
      Months: (months) => monthsView(months, options, h),
      Years: (years) => yearsView(years, options, h),
    }),
  );

export type CalendarProps<Msg> = Readonly<{
  model: Model;
  maybeSelectedDate: Option.Option<FoldkitCalendar.CalendarDate>;
  toParentMessage: (message: Message) => Msg;
  class?: string;
  previousMonthLabel?: string;
  nextMonthLabel?: string;
  previousYearsPageLabel?: string;
  nextYearsPageLabel?: string;
  daysHeadingButtonLabel?: string;
  monthsHeadingButtonLabel?: string;
}>;

export const calendar = <Msg>(
  props: CalendarProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  return h.submodel({
    slotId: props.model.id,
    model: props.model,
    view: CalendarPrimitive.view,
    viewInputs: {
      maybeSelectedDate: props.maybeSelectedDate,
      toView: (attributes) =>
        calendarView(
          attributes,
          props.class === undefined ? {} : { class: props.class },
          h,
        ),
      ...(props.previousMonthLabel === undefined
        ? {}
        : { previousMonthLabel: props.previousMonthLabel }),
      ...(props.nextMonthLabel === undefined
        ? {}
        : { nextMonthLabel: props.nextMonthLabel }),
      ...(props.previousYearsPageLabel === undefined
        ? {}
        : { previousYearsPageLabel: props.previousYearsPageLabel }),
      ...(props.nextYearsPageLabel === undefined
        ? {}
        : { nextYearsPageLabel: props.nextYearsPageLabel }),
      ...(props.daysHeadingButtonLabel === undefined
        ? {}
        : { daysHeadingButtonLabel: props.daysHeadingButtonLabel }),
      ...(props.monthsHeadingButtonLabel === undefined
        ? {}
        : { monthsHeadingButtonLabel: props.monthsHeadingButtonLabel }),
    },
    toParentMessage: props.toParentMessage,
  });
};

/*
   Minimal wiring:

   // Model: { calendar: Calendar.Model }
   // Message: GotCalendarMessage({ message: Calendar.Message })
   // Init: calendar: Calendar.init({ id: 'booking-calendar', today })
   // Update: Calendar.update(model.calendar, message)
   // View:
   // calendar({
   //   model: model.calendar,
   //   toParentMessage: message => GotCalendarMessage({ message }),
   // })
*/
