import * as stylex from '@stylexjs/stylex';
import type { HtmlBuilder } from 'foldkit/html';
import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import {
  calendarFixtures,
  type CalendarFixture,
} from '@/docs/components/pages/calendar/shared';
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

export const calendarStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  index: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const fixture = fixtureOf(index);
  const preview = model as PreviewModel;

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
