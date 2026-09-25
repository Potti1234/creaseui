import { Option } from 'effect';
import * as stylex from '@stylexjs/stylex';
import type { HtmlBuilder } from 'foldkit/html';
import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import {
  calendarFixtures,
  type CalendarFixture,
} from '@/docs/components/pages/calendar/shared';
import {
  FA_DAY_NAMES,
  FA_MONTH_NAMES,
  faDigits,
  jalaliMonthCells,
  type JalaliCell,
  type JalaliDate,
} from '@/lib/jalali';
import * as Button from '@/stylex/button';
import * as Calendar from '@/stylex/calendar';
import * as Card from '@/stylex/card';
import * as Field from '@/stylex/field';
import * as Icon from '@/lib/icon';
import * as InputGroup from '@/stylex/input-group';
import { className } from '@/stylex/style';
import { tokens } from '../../../../stylex/tokens.stylex';

const styles = stylex.create({
  cardFit: {
    marginInline: 'auto',
    maxWidth: '18.75rem',
    width: 'fit-content',
  },
  presetButton: { flexGrow: '1' },
  bordered: {
    borderColor: tokens.border,
    borderRadius: '0.5rem',
    borderStyle: 'solid',
    borderWidth: 1,
    width: 'fit-content',
  },
  icon: { color: tokens.mutedForeground, height: '1rem', width: '1rem' },
  jalaliContainer: {
    padding: '0.75rem',
    borderColor: tokens.border,
    borderRadius: '0.5rem',
    borderStyle: 'solid',
    borderWidth: 1,
    width: 'fit-content',
  },
  jalaliHeader: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
  },
  jalaliTitle: { fontSize: '0.875rem', fontWeight: 500 },
  jalaliGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    marginTop: '0.5rem',
  },
  jalaliDayName: {
    alignItems: 'center',
    color: tokens.mutedForeground,
    display: 'flex',
    fontSize: '0.8rem',
    justifyContent: 'center',
    height: '2rem',
    width: '2rem',
  },
  jalaliDay: {
    borderRadius: '0.375rem',
    borderStyle: 'none',
    alignItems: 'center',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    fontSize: '0.8rem',
    justifyContent: 'center',
    transitionDuration: '150ms',
    transitionProperty: 'background-color, color',
    height: '2rem',
    width: '2rem',
  },
  jalaliDayInMonth: { color: tokens.foreground },
  jalaliDayOutside: { color: tokens.mutedForeground, opacity: 0.5 },
  jalaliDayToday: {
    backgroundColor: tokens.accent,
    color: tokens.accentForeground,
  },
  jalaliDaySelected: {
    backgroundColor: tokens.primary,
    color: tokens.primaryForeground,
  },
});

type PreviewModel = Readonly<{
  calendar: Calendar.Model;
  selectedDate: Parameters<
    typeof Calendar.calendar<never>
  >[0]['maybeSelectedDate'];
  rangeStart: { year: number; month: number; day: number };
  rangeEnd: { year: number; month: number; day: number };
  startTime: string;
  endTime: string;
  jalaliViewYear: number;
  jalaliViewMonth: number;
  jalaliDay: Option.Option<JalaliDate>;
  jalaliToday: JalaliDate;
}>;

const fixtureOf = (index: number): CalendarFixture =>
  calendarFixtures[index] ?? {
    title: 'Demo',
    description: '',
    layout: 'single',
  };

const PRESETS = [
  { label: 'Today', days: 0 },
  { label: 'Tomorrow', days: 1 },
  { label: 'In 3 days', days: 3 },
  { label: 'In a week', days: 7 },
  { label: 'In 2 weeks', days: 14 },
] as const;

const calendarView = <Msg>(
  fixture: CalendarFixture,
  preview: PreviewModel,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) =>
  Calendar.calendar(
    {
      model: preview.calendar,
      maybeSelectedDate: preview.selectedDate,
      toParentMessage: message =>
        onMessageJson(
          JSON.stringify({ _tag: 'GotCalendarPreviewMessage', message }),
        ),
      ...(fixture.layout === 'range'
        ? { range: { start: preview.rangeStart, end: preview.rangeEnd } }
        : {}),
      ...(fixture.weekNumbers === true ? { weekNumbers: true } : {}),
      ...(fixture.direction === 'rtl' ? { direction: 'rtl' as const } : {}),
      ...(fixture.roomy === true ? { size: 'comfortable' as const } : {}),
    },
    h,
  );

const timeFieldView = <Msg>(
  field: 'start' | 'end',
  preview: PreviewModel,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) =>
  Field.field(
    {
      children: [
        Field.fieldLabel(
          {
            for: field === 'start' ? 'time-from' : 'time-to',
            children: [field === 'start' ? 'Start Time' : 'End Time'],
          },
          h,
        ),
        Field.fieldContent(
          {
            children: [
              InputGroup.inputGroup(
                {
                  children: [
                    InputGroup.inputGroupInput(
                      {
                        id: field === 'start' ? 'time-from' : 'time-to',
                        type: 'time',
                        value:
                          field === 'start'
                            ? preview.startTime
                            : preview.endTime,
                        onInput: value =>
                          onMessageJson(
                            JSON.stringify({
                              _tag:
                                field === 'start'
                                  ? 'ChangedStartTime'
                                  : 'ChangedEndTime',
                              value,
                            }),
                          ),
                        ariaLabel:
                          field === 'start' ? 'Start Time' : 'End Time',
                      },
                      h,
                    ),
                    InputGroup.inputGroupAddon(
                      {
                        children: [
                          Icon.icon(
                            'clock',
                            { class: className(styles.icon) },
                            h,
                          ),
                        ],
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
      ],
    },
    h,
  );

const isSameJalaliDay = (a: JalaliDate, b: JalaliDate): boolean =>
  a.year === b.year && a.month === b.month && a.day === b.day;

const jalaliDayButton = <Msg>(
  cell: JalaliCell,
  preview: PreviewModel,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const selected =
    Option.isSome(preview.jalaliDay) &&
    isSameJalaliDay(preview.jalaliDay.value, cell);
  const today = isSameJalaliDay(preview.jalaliToday, cell);
  return h.button(
    [
      h.Type('button'),
      h.Class(
        className(
          styles.jalaliDay,
          cell.inMonth ? styles.jalaliDayInMonth : styles.jalaliDayOutside,
          ...(today ? [styles.jalaliDayToday] : []),
          ...(selected ? [styles.jalaliDaySelected] : []),
        ),
      ),
      ...(selected ? [h.AriaCurrent('date')] : []),
      h.OnClick(
        onMessageJson(
          JSON.stringify({
            _tag: 'ClickedJalaliDay',
            date: { year: cell.year, month: cell.month, day: cell.day },
          }),
        ),
      ),
    ],
    [faDigits(cell.day)],
  );
};

const jalaliView = <Msg>(
  preview: PreviewModel,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const cells = jalaliMonthCells(
    preview.jalaliViewYear,
    preview.jalaliViewMonth,
  );
  return h.div(
    [h.Dir('rtl'), h.Class(className(styles.jalaliContainer))],
    [
      h.div([h.Class(className(styles.jalaliHeader))], [
        Button.button(
          {
            variant: 'ghost',
            size: 'icon',
            ariaLabel: 'Previous month',
            onClick: onMessageJson(
              JSON.stringify({ _tag: 'PressedJalaliPreviousMonth' }),
            ),
            children: [
              Icon.chevronRight({ class: className(styles.icon) }, h),
            ],
          },
          h,
        ),
        h.span(
          [h.Class(className(styles.jalaliTitle))],
          [
            `${FA_MONTH_NAMES[preview.jalaliViewMonth - 1] ?? ''} ${faDigits(preview.jalaliViewYear)}`,
          ],
        ),
        Button.button(
          {
            variant: 'ghost',
            size: 'icon',
            ariaLabel: 'Next month',
            onClick: onMessageJson(
              JSON.stringify({ _tag: 'PressedJalaliNextMonth' }),
            ),
            children: [Icon.chevronLeft({ class: className(styles.icon) }, h)],
          },
          h,
        ),
      ]),
      h.div(
        [h.Class(className(styles.jalaliGrid))],
        [
          ...FA_DAY_NAMES.map(dayName =>
            h.span([h.Class(className(styles.jalaliDayName))], [dayName]),
          ),
          ...cells.map(cell =>
            jalaliDayButton(cell, preview, onMessageJson, h),
          ),
        ],
      ),
    ],
  );
};

export const calendarStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  index: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const fixture = fixtureOf(index);
  const preview = model as PreviewModel;

  if (fixture.layout === 'jalali')
    return jalaliView(preview, onMessageJson, h);

  if (fixture.layout === 'presets')
    return Card.card(
      {
        size: 'sm',
        layoutStyle: styles.cardFit,
        children: [
          Card.cardContent(
            { children: [calendarView(fixture, preview, onMessageJson, h)] },
            h,
          ),
          Card.cardFooter(
            {
              children: PRESETS.map(preset =>
                Button.button(
                  {
                    variant: 'outline',
                    size: 'sm',
                    layoutStyle: styles.presetButton,
                    onClick: onMessageJson(
                      JSON.stringify({
                        _tag: 'ClickedPreset',
                        days: preset.days,
                      }),
                    ),
                    children: [preset.label],
                  },
                  h,
                ),
              ),
            },
            h,
          ),
        ],
      },
      h,
    );

  if (fixture.layout === 'time')
    return Card.card(
      {
        size: 'sm',
        layoutStyle: styles.cardFit,
        children: [
          Card.cardContent(
            { children: [calendarView(fixture, preview, onMessageJson, h)] },
            h,
          ),
          Card.cardFooter(
            {
              children: [
                Field.fieldGroup(
                  {
                    children: [
                      timeFieldView('start', preview, onMessageJson, h),
                      timeFieldView('end', preview, onMessageJson, h),
                    ],
                  },
                  h,
                ),
              ],
            },
            h,
          ),
        ],
      },
      h,
    );

  const calendar = calendarView(fixture, preview, onMessageJson, h);

  if (fixture.card === true)
    return Card.card(
      {
        layoutStyle: styles.cardFit,
        children: [
          Card.cardContent({ children: [calendar] }, h),
        ],
      },
      h,
    );

  if (fixture.bordered === true)
    return h.div([h.Class(className(styles.bordered))], [calendar]);

  return calendar;
};
