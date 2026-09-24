import { DatePart, type LocaleConfig } from 'foldkit/calendar';
import type { DocsExample } from '@/docs/components/page-definition';
import { foldkitApplication } from '@/docs/components/pages/authored-page';

export const germanCalendarLocale: LocaleConfig = {
  firstDayOfWeek: 'Monday',
  monthNames: [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August',
    'September', 'Oktober', 'November', 'Dezember',
  ],
  shortMonthNames: [
    'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt',
    'Nov', 'Dez',
  ],
  dayNames: [
    'Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag',
    'Samstag',
  ],
  shortDayNames: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  longFormat: [
    DatePart.DayNumber(),
    DatePart.LiteralText({ text: '. ' }),
    DatePart.MonthName(),
    DatePart.LiteralText({ text: ' ' }),
    DatePart.YearNumber(),
  ],
  shortFormat: [
    DatePart.DayNumber(),
    DatePart.LiteralText({ text: '. ' }),
    DatePart.ShortMonthName(),
    DatePart.LiteralText({ text: ' ' }),
    DatePart.YearNumber(),
  ],
  ariaLabelFormat: [
    DatePart.DayName(),
    DatePart.LiteralText({ text: ', ' }),
    DatePart.DayNumber(),
    DatePart.LiteralText({ text: '. ' }),
    DatePart.MonthName(),
    DatePart.LiteralText({ text: ' ' }),
    DatePart.YearNumber(),
  ],
  monthYearFormat: [
    DatePart.MonthName(),
    DatePart.LiteralText({ text: ' ' }),
    DatePart.YearNumber(),
  ],
};

const PRESETS = [
  { label: 'Today', days: 0 },
  { label: 'Tomorrow', days: 1 },
  { label: 'In 3 days', days: 3 },
  { label: 'In a week', days: 7 },
  { label: 'In 2 weeks', days: 14 },
] as const;

const BOOKED_DATES = [3, 12, 13, 14, 15] as const;

export type CalendarFixture = Readonly<{
  title: string;
  description: string;
  heroOnly?: boolean;
  layout: 'single' | 'range' | 'presets' | 'time';
  bordered?: boolean;
  card?: boolean;
  weekNumbers?: boolean;
  direction?: 'rtl';
  roomy?: boolean;
  booked?: boolean;
  localized?: boolean;
}>;

export const calendarFixtures: Readonly<Array<CalendarFixture>> = [
  {
    title: 'Demo',
    description:
      'A bordered calendar with the selected date owned by the parent.',
    heroOnly: true,
    layout: 'single',
    bordered: true,
  },
  {
    title: 'Basic',
    description: 'A basic calendar component with a rounded border.',
    layout: 'single',
    bordered: true,
  },
  {
    title: 'Range Calendar',
    description:
      'The parent owns both range endpoints; Calendar decorates the start, middle, and end cells. Interactive drag-to-range is not a foldkit calendar mode.',
    layout: 'range',
    bordered: true,
  },
  {
    title: 'Month and Year Selector',
    description:
      'Click the month-year heading to drill into the month grid, then the year grid — the foldkit equivalent of upstream caption dropdowns.',
    layout: 'single',
    bordered: true,
  },
  {
    title: 'Presets',
    description:
      'Preset buttons select relative dates and focus the calendar on the result.',
    layout: 'presets',
    card: true,
  },
  {
    title: 'Date and Time Picker',
    description: 'A calendar with start and end time fields.',
    layout: 'time',
    card: true,
  },
  {
    title: 'Booked dates',
    description:
      'Unavailable dates are disabled via init config and cannot be selected.',
    layout: 'single',
    booked: true,
  },
  {
    title: 'Custom Cell Size',
    description:
      'Customize cell size via the cell-size token — roomier cells, same model.',
    layout: 'single',
    roomy: true,
    bordered: true,
  },
  {
    title: 'Week Numbers',
    description: 'Show ISO week numbers in a leading column.',
    layout: 'single',
    weekNumbers: true,
    card: true,
  },
  {
    title: 'RTL',
    description: 'Right-to-left direction mirrors navigation and labels.',
    layout: 'single',
    direction: 'rtl',
    localized: true,
  },
];

const bookedDatesSource = `
    disabledDates: [${BOOKED_DATES.map(
      day => `{ year: 2026, month: 7, day: ${day} }`,
    ).join(', ')}],`;

const calendarPropsSource = (
  f: CalendarFixture,
  renderer: 'tailwind' | 'stylex',
): string => {
  const isSx = renderer === 'stylex';
  const parts: Array<string> = [
    `model: model.calendar`,
    `maybeSelectedDate: ${f.layout === 'range' ? 'Option.none()' : 'model.selectedDate'}`,
    `toParentMessage: message =>
              Message['GotCalendarMessage']({ message })`,
  ];
  if (f.layout === 'range')
    parts.push(`range: { start: model.rangeStart, end: model.rangeEnd }`);
  if (f.weekNumbers === true) parts.push('weekNumbers: true');
  if (f.direction === 'rtl') parts.push(`direction: 'rtl'`);
  if (f.roomy === true)
    parts.push(
      isSx ? `size: 'comfortable'` : `class: '[--cell-size:--spacing(10)]'`,
    );
  return parts.join(',\n            ');
};

const calendarViewSource = (
  f: CalendarFixture,
  renderer: 'tailwind' | 'stylex',
): string => `Calendar.calendar({
            ${calendarPropsSource(f, renderer)},
          }, h)`;

const borderedSource = (
  f: CalendarFixture,
  renderer: 'tailwind' | 'stylex',
  inner: string,
): string => {
  const wrapped = `h.div(
          [h.Class(${renderer === 'stylex' ? 'className(styles.bordered)' : `'rounded-lg border w-fit'`})],
          [${inner}],
        )`;
  return wrapped;
};

const presetsSource = (renderer: 'tailwind' | 'stylex'): string => {
  const isSx = renderer === 'stylex';
  return `Card.card({
          ${isSx ? 'layoutStyle: styles.cardFit,' : `class: 'mx-auto w-fit max-w-[300px]',`}
          size: 'sm',
          children: [
            Card.cardContent({
              children: [
                ${calendarViewSource(
                  { title: '', description: '', layout: 'single' },
                  renderer,
                )},
              ],
            }, h),
            Card.cardFooter({
              children: PRESETS.map(preset =>
                Button.button({
                  variant: 'outline',
                  size: 'sm',
                  onClick: Message.ClickedPreset({ days: preset.days }),
                  ${isSx ? 'layoutStyle: styles.presetButton,' : `class: 'flex-1',`}
                  children: [preset.label],
                }, h),
              ),
            }, h),
          ],
        }, h)`;
};

const timeFieldSource = (
  field: 'start' | 'end',
  renderer: 'tailwind' | 'stylex',
): string => {
  const label = field === 'start' ? 'Start Time' : 'End Time';
  const id = field === 'start' ? 'time-from' : 'time-to';
  const msg = field === 'start' ? 'ChangedStartTime' : 'ChangedEndTime';
  const modelField = field === 'start' ? 'startTime' : 'endTime';
  return `Field.field({
                  children: [
                    Field.fieldLabel({ for: '${id}', children: ['${label}'] }, h),
                    Field.fieldContent({
                      children: [
                        InputGroup.inputGroup({
                          children: [
                            InputGroup.inputGroupInput({
                              id: '${id}',
                              type: 'time',
                              value: model.${modelField},
                              onInput: value =>
                                Message['${msg}']({ value }),
                              ariaLabel: '${label}',
                            }, h),
                            InputGroup.inputGroupAddon({
                              children: [
                                Icon.icon('clock', ${renderer === 'stylex' ? '{ class: className(styles.icon) }' : `{ class: 'size-4 text-muted-foreground' }`}, h),
                              ],
                            }, h),
                          ],
                        }, h),
                      ],
                    }, h),
                  ],
                }, h)`;
};

const timePickerSource = (
  f: CalendarFixture,
  renderer: 'tailwind' | 'stylex',
): string => {
  const isSx = renderer === 'stylex';
  return `Card.card({
          ${isSx ? 'layoutStyle: styles.cardFit,' : `class: 'mx-auto w-fit',`}
          size: 'sm',
          children: [
            Card.cardContent({
              children: [
                ${calendarViewSource(f, renderer)},
              ],
            }, h),
            Card.cardFooter({
              children: [
                Field.fieldGroup({
                  children: [
                    ${timeFieldSource('start', renderer)},
                    ${timeFieldSource('end', renderer)},
                  ],
                }, h),
              ],
            }, h),
          ],
        }, h)`;
};

const viewBodySource = (
  fixture: CalendarFixture,
  renderer: 'tailwind' | 'stylex',
): string => {
  if (fixture.layout === 'presets') return presetsSource(renderer);
  if (fixture.layout === 'time') return timePickerSource(fixture, renderer);
  const calendar = calendarViewSource(fixture, renderer);
  if (fixture.card === true) {
    const isSx = renderer === 'stylex';
    return `Card.card({
          ${isSx ? 'layoutStyle: styles.cardFit,' : `class: 'mx-auto w-fit p-0',`}
          children: [
            Card.cardContent({
              children: [${calendar}],
            }, h),
          ],
        }, h)`;
  }
  return fixture.bordered === true
    ? borderedSource(fixture, renderer, calendar)
    : calendar;
};

type Needs = Readonly<{
  range: boolean;
  presets: boolean;
  time: boolean;
  booked: boolean;
  card: boolean;
  localized: boolean;
}>;

const needsFor = (f: CalendarFixture): Needs => ({
  range: f.layout === 'range',
  presets: f.layout === 'presets',
  time: f.layout === 'time',
  booked: f.booked === true,
  card: f.card === true,
  localized: f.localized === true,
});

const componentImports = (
  needs: Needs,
  renderer: 'tailwind' | 'stylex',
): string => {
  const root = renderer === 'stylex' ? 'stylex' : 'ui';
  const imports: Array<string> = [];
  if (needs.card) imports.push(`import * as Card from '@/${root}/card'`);
  if (needs.presets) imports.push(`import * as Button from '@/${root}/button'`);
  if (needs.time) {
    imports.push(`import * as Field from '@/${root}/field'`);
    imports.push(`import * as InputGroup from '@/${root}/input-group'`);
    imports.push(`import * as Icon from '@/lib/icon'`);
  }
  if (renderer === 'stylex')
    imports.push(
      `import * as stylex from '@stylexjs/stylex'`,
      `import { className } from '@/stylex/style'`,
    );
  return imports.join('\n');
};

const stylesSource = (f: CalendarFixture): string => {
  const parts: Array<string> = [];
  if (f.card === true)
    parts.push(`  cardFit: { marginInline: 'auto', maxWidth: '18.75rem', width: 'fit-content' },`);
  if (f.layout === 'presets')
    parts.push(`  presetButton: { flexGrow: '1' },`);
  if (f.layout === 'time')
    parts.push(`  icon: { height: '1rem', width: '1rem' },`);
  if (f.bordered === true)
    parts.push(
      `  bordered: { borderColor: 'var(--border)', borderRadius: '0.5rem', borderStyle: 'solid', borderWidth: 1, width: 'fit-content' },`,
    );
  if (parts.length === 0) return '';
  return `
const styles = stylex.create({
${parts.join('\n')}
});`;
};

const source = (f: CalendarFixture, renderer: 'tailwind' | 'stylex'): string => {
  const needs = needsFor(f);
  const tag = f.title.replaceAll(/[^a-zA-Z0-9]/g, '');
  const modelFields = [
    `  calendar: Calendar.Model,`,
    f.layout === 'range'
      ? `  rangeStart: FoldkitCalendar.CalendarDate,\n  rangeEnd: FoldkitCalendar.CalendarDate,`
      : `  selectedDate: S.Option(FoldkitCalendar.CalendarDate),`,
    needs.time
      ? `  startTime: S.String,\n  endTime: S.String,`
      : '',
  ]
    .filter(Boolean)
    .join('\n');
  const messageFields = [
    `  GotCalendarMessage: { message: Calendar.Message },`,
    needs.presets ? `  ClickedPreset: { days: S.Int },` : '',
    needs.time
      ? `  ChangedStartTime: { value: S.String },\n  ChangedEndTime: { value: S.String },`
      : '',
  ]
    .filter(Boolean)
    .join('\n');
  const initFields = [
    `calendar: Calendar.init({
          id: 'docs-calendar',
          today: Calendar.dateInTimeZone(new Date('2026-07-28T12:00:00Z'), ${needs.localized ? "'Europe/Berlin'" : "'UTC'"}),
          initialViewDate: initialDate,${needs.localized ? '\n          locale,' : ''}${needs.booked ? bookedDatesSource : ''}
        })`,
    f.layout === 'range'
      ? `rangeStart: { year: 2026, month: 7, day: 14 },
        rangeEnd: { year: 2026, month: 7, day: 20 }`
      : `selectedDate: Option.some(initialDate)`,
    needs.time ? `startTime: '10:30:00',\n        endTime: '12:30:00'` : '',
  ]
    .filter(Boolean)
    .join(',\n        ');
  const updateCases = [
    `    case 'GotCalendarMessage': {
      const next = Calendar.update(model.calendar, message.message)
      const maybeOutput = Option.fromNullishOr(next.outMessage)
      return {
        model: {
          ...model,
          calendar: next.model,${f.layout === 'range' ? '' : `
          selectedDate: Option.match(maybeOutput, {
            onNone: () => model.selectedDate,
            onSome: output =>
              output._tag === 'SelectedDate'
                ? Option.some(output.date)
                : model.selectedDate,
          }),`}
        },
        commands: Command.mapMessages(
          next.commands ?? [],
          next => Message['GotCalendarMessage']({ message: next }),
        ),
      }
    }`,
    needs.presets
      ? `    case 'ClickedPreset': {
      const date = addDays(today, message.days)
      return {
        model: {
          ...model,
          calendar: Calendar.focusDate(model.calendar, date),
          selectedDate: Option.some(date),
        },
      }
    }`
      : '',
    needs.time
      ? `    case 'ChangedStartTime':
      return { model: { ...model, startTime: message.value } }
    case 'ChangedEndTime':
      return { model: { ...model, endTime: message.value } }`
      : '',
  ]
    .filter(Boolean)
    .join('\n');
  const localeDecl = needs.localized
    ? `const locale: FoldkitCalendar.LocaleConfig = ${JSON.stringify(germanCalendarLocale)}\n\n`
    : '';
  const helpers = needs.presets
    ? `const today = { year: 2026, month: 7, day: 28 } as const
const PRESETS = [
  { label: 'Today', days: 0 },
  { label: 'Tomorrow', days: 1 },
  { label: 'In 3 days', days: 3 },
  { label: 'In a week', days: 7 },
  { label: 'In 2 weeks', days: 14 },
] as const
const addDays = (date: FoldkitCalendar.CalendarDate, days: number): FoldkitCalendar.CalendarDate => {
  const d = new Date(Date.UTC(date.year, date.month - 1, date.day + days))
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() }
}

`
    : '';
  return foldkitApplication({
    title: `Calendar — ${f.title}`,
    imports: `import { Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription, Update } from 'foldkit'
import * as FoldkitCalendar from 'foldkit/calendar'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

import * as Calendar from '@/${renderer === 'stylex' ? 'stylex' : 'ui'}/calendar'
${componentImports(needs, renderer)}${renderer === 'stylex' ? stylesSource(f) : ''}`,
    model: `${localeDecl}export const Model = S.Struct({
${modelFields}
})
export type Model = typeof Model.Type`,
    messages: `import { defineMessageUnion } from 'foldkit/message'

export const Message = defineMessageUnion({
${messageFields}
});
export type Message = typeof Message.Type`,
    init: `const initialDate = { year: 2026, month: 7, day: 18 }
export const init = (): Update.Return<Model, Message> => ({
  model: {
        ${initFields},
  },
})`,
    update: `export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> => {
  switch (message._tag) {
${updateCases}
  }
}`,
    view: `${helpers}export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Calendar — ${f.title}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    ${viewBodySource(f, renderer)},
  ]),
})`,
  });
};

export const calendarExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> =>
  calendarFixtures.map(fixture => ({
    title: fixture.title,
    description: fixture.description,
    ...(fixture.heroOnly === true ? { heroOnly: true } : {}),
    code: source(fixture, renderer),
  }));
