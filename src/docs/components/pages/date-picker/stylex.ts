import { Option } from 'effect';
import type * as FoldkitCalendar from 'foldkit/calendar';
import type { HtmlBuilder } from 'foldkit/html';
import * as stylex from '@stylexjs/stylex';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import {
  arabicCalendarLocale,
  datePickerFixtures,
  type DatePickerFixtureKind,
} from '@/docs/components/pages/date-picker/shared';
import * as Calendar from '@/stylex/calendar';
import * as DatePicker from '@/stylex/date-picker';
import * as Field from '@/stylex/field';
import * as Icon from '@/lib/icon';
import * as Input from '@/stylex/input';
import * as InputGroup from '@/stylex/input-group';
import * as Popover from '@/stylex/popover';
import { className } from '@/stylex/style';

const styles = stylex.create({
  triggerRow: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },
  chevron: { opacity: 0.5, height: '1rem', width: '1rem', },
  trigger: { width: '11rem' },
  demoTrigger: { width: '13.25rem' },
  rangeTrigger: { width: '15rem' },
  iconTrigger: { height: '1.25rem', width: '1.25rem' },
  icon: { height: '1rem', width: '1rem' },
  srOnly: {
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    position: 'absolute',
    height: '1px',
    width: '1px',
  },
  field44: { marginInline: 'auto', width: '11rem', },
  field48: { marginInline: 'auto', width: '12rem', },
  field60: { marginInline: 'auto', width: '15rem', },
  fieldNatural: { marginInline: 'auto', maxWidth: '20rem', },
  timeRow: {
    gap: '1rem',
    marginInline: 'auto',
    display: 'flex',
    flexDirection: 'row',
    maxWidth: '20rem',
  },
  timeField: { width: '8rem' },
  centerRow: { gap: '0.5rem', alignItems: 'center', display: 'flex', },
});

interface Preview {
  kind: string;
  datePicker: DatePicker.Model;
  calendar: Calendar.Model;
  popover: Popover.Model;
  selectedDate: Option.Option<FoldkitCalendar.CalendarDate>;
  rangeStart: Option.Option<FoldkitCalendar.CalendarDate>;
  rangeEnd: Option.Option<FoldkitCalendar.CalendarDate>;
  inputValue: string;
  timeValue: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December',
];
const SHORT_MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const formatDisplay = (date: FoldkitCalendar.CalendarDate): string =>
  `${MONTH_NAMES[date.month - 1]} ${String(date.day).padStart(2, '0')}, ${date.year}`;
const formatCompact = (date: FoldkitCalendar.CalendarDate): string =>
  `${SHORT_MONTH_NAMES[date.month - 1]} ${String(date.day).padStart(2, '0')}, ${date.year}`;
const formatUs = (date: FoldkitCalendar.CalendarDate): string =>
  `${date.month}/${date.day}/${date.year}`;
const formatArabic = (date: FoldkitCalendar.CalendarDate): string =>
  `${arabicCalendarLocale.monthNames[date.month - 1]} ${date.day}، ${date.year}`;

const picker = <Msg>(
  kind: DatePickerFixtureKind,
  preview: Preview,
  onMessageJson: (json: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const isRtl = kind === 'rtl';
  const placeholder =
    kind === 'demo' || kind === 'basic'
      ? 'Pick a date'
      : isRtl
        ? 'اختر تاريخًا'
        : 'Select date';
  const format = kind === 'dob' ? formatUs : isRtl ? formatArabic : formatDisplay;
  const withChevron = kind === 'demo' || kind === 'time' || isRtl;
  return DatePicker.datePicker(
    {
      model: preview.datePicker,
      maybeSelectedDate: preview.selectedDate,
      toParentMessage: message =>
        onMessageJson(
          JSON.stringify({ _tag: 'GotDatePickerMessage', message }),
        ),
      name: 'date',
      ariaLabel: placeholder,
      triggerContent: maybeDate =>
        withChevron
          ? h.span([h.Class(className(styles.triggerRow))], [
              Option.match(maybeDate, {
                onNone: () => h.span([], [placeholder]),
                onSome: date => h.span([], [format(date)]),
              }),
              Icon.chevronDown({ class: className(styles.chevron) }, h),
            ])
          : Option.match(maybeDate, {
              onNone: () => h.span([], [placeholder]),
              onSome: date => h.span([], [format(date)]),
            }),
      triggerLayoutStyle:
        kind === 'demo' ? styles.demoTrigger : styles.trigger,
      ...(isRtl ? { direction: 'rtl' as const } : {}),
    },
    h,
  );
};

export const datePickerStyleXPreview: StyleXExamplePreviewProvider = <
  Msg,
>(
  index: number,
  model: unknown,
  onMessageJson: (json: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const preview = model as Preview;
  const fixture = datePickerFixtures[index] ?? datePickerFixtures[0]!;
  const kind = fixture.kind;

  if (kind === 'range') {
    const rangeText = Option.match(preview.rangeStart, {
      onNone: () => 'Pick a date',
      onSome: start =>
        Option.match(preview.rangeEnd, {
          onNone: () => formatCompact(start),
          onSome: end => `${formatCompact(start)} - ${formatCompact(end)}`,
        }),
    });
    const rangeOption = Option.match(preview.rangeStart, {
      onNone: () => Option.none(),
      onSome: start =>
        Option.match(preview.rangeEnd, {
          onNone: () => Option.some({ start, end: start }),
          onSome: end => Option.some({ start, end }),
        }),
    });
    return Field.field(
      {
        layoutStyle: styles.field60,
        children: [
          Field.fieldLabel(
            { for: 'date-picker-range', children: ['Date Picker Range'] },
            h,
          ),
          Popover.popover(
            {
              model: preview.popover,
              toParentMessage: message =>
                onMessageJson(
                  JSON.stringify({ _tag: 'GotPopoverMessage', message }),
                ),
              align: 'start',
              trigger: h.span([h.Class(className(styles.centerRow))], [
                Icon.calendarIcon({ class: className(styles.icon) }, h),
                rangeText,
              ]),
              triggerLayoutStyle: styles.rangeTrigger,
              content: Calendar.calendar(
                {
                  model: preview.calendar,
                  maybeSelectedDate: Option.none(),
                  toParentMessage: message =>
                    onMessageJson(
                      JSON.stringify({ _tag: 'GotCalendarMessage', message }),
                    ),
                  ...(Option.isSome(rangeOption)
                    ? { range: rangeOption.value }
                    : {}),
                },
                h,
              ),
            },
            h,
          ),
        ],
      },
      h,
    );
  }

  if (kind === 'input' || kind === 'natural') {
    const isNatural = kind === 'natural';
    return Field.field(
      {
        layoutStyle: isNatural ? styles.fieldNatural : styles.field48,
        children: [
          Field.fieldLabel(
            {
              for: isNatural ? 'date-optional' : 'date-required',
              children: [isNatural ? 'Schedule Date' : 'Subscription Date'],
            },
            h,
          ),
          InputGroup.inputGroup(
            {
              children: [
                InputGroup.inputGroupInput(
                  {
                    id: isNatural ? 'date-optional' : 'date-required',
                    value: preview.inputValue,
                    onInput: value =>
                      onMessageJson(
                        JSON.stringify({ _tag: 'ChangedInput', value }),
                      ),
                    onKeyDown: key =>
                      onMessageJson(
                        JSON.stringify({ _tag: 'PressedKeyInInput', key }),
                      ),
                    placeholder: isNatural
                      ? 'Tomorrow or next week'
                      : 'June 01, 2025',
                  },
                  h,
                ),
                InputGroup.inputGroupAddon(
                  {
                    align: 'inline-end',
                    children: [
                      DatePicker.datePicker(
                        {
                          model: preview.datePicker,
                          maybeSelectedDate: preview.selectedDate,
                          toParentMessage: message =>
                            onMessageJson(
                              JSON.stringify({
                                _tag: 'GotDatePickerMessage',
                                message,
                              }),
                            ),
                          ariaLabel: 'Select date',
                          triggerContent: () =>
                            h.span(
                              [h.Class(className(styles.centerRow))],
                              [
                                Icon.calendarIcon(
                                  { class: className(styles.icon) },
                                  h,
                                ),
                                h.span(
                                  [h.Class(className(styles.srOnly))],
                                  ['Select date'],
                                ),
                              ],
                            ),
                          triggerLayoutStyle: styles.iconTrigger,
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
  }

  if (kind === 'time') {
    return h.div(
      [h.Class(className(styles.timeRow))],
      [
          Field.field(
            {
              children: [
                Field.fieldLabel(
                  { for: 'date-picker-optional', children: ['Date'] },
                  h,
                ),
                picker(kind, preview, onMessageJson, h),
              ],
            },
            h,
          ),
          Field.field(
            {
              layoutStyle: styles.timeField,
              children: [
                Field.fieldLabel(
                  { for: 'time-picker-optional', children: ['Time'] },
                  h,
                ),
                Input.input(
                  {
                    id: 'time-picker-optional',
                    value: preview.timeValue,
                    onInput: value =>
                      onMessageJson(
                        JSON.stringify({ _tag: 'ChangedTime', value }),
                      ),
                    type: 'time',
                  },
                  h,
                ),
              ],
            },
            h,
          ),
        ],
    );
  }

  if (kind === 'demo') {
    return h.div([], [picker(kind, preview, onMessageJson, h)]);
  }

  if (kind === 'rtl') {
    return h.div(
      [h.Dir('rtl'), h.Class(className(styles.field44))],
      [picker(kind, preview, onMessageJson, h)],
    );
  }

  return Field.field(
    {
      layoutStyle: styles.field44,
      children: [
        Field.fieldLabel(
          {
            for: 'date-picker',
            children: [kind === 'basic' ? 'Date' : 'Date of birth'],
          },
          h,
        ),
        picker(kind, preview, onMessageJson, h),
      ],
    },
    h,
  );
};
