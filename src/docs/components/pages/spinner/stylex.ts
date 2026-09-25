import * as stylex from '@stylexjs/stylex';
import type { Html, HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import {
  spinnerFixtures,
  type SpinnerFixture,
} from '@/docs/components/pages/spinner/shared';
import * as Icon from '@/lib/icon';
import * as Badge from '@/stylex/badge';
import * as Button from '@/stylex/button';
import * as Empty from '@/stylex/empty';
import * as InputGroup from '@/stylex/input-group';
import * as Item from '@/stylex/item';
import * as Spinner from '@/stylex/spinner';
import { className } from '@/stylex/style';

const styles = stylex.create({
  wrap: { maxWidth: '24rem', width: '100%' },
  wrapMd: { maxWidth: '28rem', width: '100%' },
  column: { gap: '1rem', display: 'flex', flexDirection: 'column', },
  row: { gap: '1.5rem', alignItems: 'center', display: 'flex', },
  rowSm: { gap: '1rem', alignItems: 'center', display: 'flex', },
  centerCol: {
    gap: '1rem',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
  },
  accent: { color: 'var(--primary)' },
  amount: { fontSize: '0.875rem', fontVariantNumeric: 'tabular-nums' },
  itemEnd: { marginInlineStart: 'auto' },
  srOnly: {
    margin: '-1px',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    position: 'absolute',
    whiteSpace: 'nowrap',
    height: '1px',
    width: '1px',
  },
});

const itemView = <Msg>(rtl: boolean, h: HtmlBuilder<Msg>): Html =>
  h.div(
    [
      ...(rtl ? [h.Dir('rtl')] : []),
      h.Class(className(styles.wrap)),
    ],
    [
      Item.item(
        {
          variant: 'muted',
          children: [
            Item.itemMedia(
              {
                children: [
                  Spinner.spinner({ isDecorative: true }, h),
                ],
              },
              h,
            ),
            Item.itemContent(
              {
                children: [
                  Item.itemTitle(
                    {
                      children: [
                        rtl ? 'جاري معالجة الدفع...' : 'Processing payment...',
                      ],
                    },
                    h,
                  ),
                ],
              },
              h,
            ),
            Item.itemContent(
              {
                layoutStyle: styles.itemEnd,
                children: [
                  h.span(
                    [h.Class(className(styles.amount))],
                    [rtl ? '١٠٠.٠٠ دولار' : '$100.00'],
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
  );

const fixtureView = <Msg>(
  fixture: SpinnerFixture,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html => {
  const onInput = (id: string) => (value: string) =>
    onMessageJson(
      JSON.stringify({ _tag: 'ChangedInput', id, value }),
    );
  switch (fixture.kind) {
    case 'item':
      return itemView('rtl' in fixture && fixture.rtl === true, h);
    case 'custom':
      return h.div([h.Class(className(styles.accent))], [
        Spinner.spinner({ label: 'Loading', size: 'lg' }, h),
      ]);
    case 'size':
      return h.div([h.Class(className(styles.row))], [
        Spinner.spinner({ isDecorative: true, size: 'sm' }, h),
        Spinner.spinner({ isDecorative: true, size: 'md' }, h),
        Spinner.spinner({ isDecorative: true, size: 'lg' }, h),
        Spinner.spinner({ isDecorative: true, size: 'xl' }, h),
      ]);
    case 'button':
      return h.div([h.Class(className(styles.centerCol))], [
        Button.button(
          {
            size: 'sm',
            isDisabled: true,
            children: [
              Spinner.spinner(
                { isDecorative: true, dataIcon: 'inline-start' },
                h,
              ),
              'Loading...',
            ],
          },
          h,
        ),
        Button.button(
          {
            variant: 'outline',
            size: 'sm',
            isDisabled: true,
            children: [
              Spinner.spinner(
                { isDecorative: true, dataIcon: 'inline-start' },
                h,
              ),
              'Please wait',
            ],
          },
          h,
        ),
        Button.button(
          {
            variant: 'secondary',
            size: 'sm',
            isDisabled: true,
            children: [
              Spinner.spinner(
                { isDecorative: true, dataIcon: 'inline-start' },
                h,
              ),
              'Processing',
            ],
          },
          h,
        ),
      ]);
    case 'badge':
      return h.div([h.Class(className(styles.rowSm))], [
        Badge.badge(
          {
            children: [
              Spinner.spinner(
                { isDecorative: true, dataIcon: 'inline-start' },
                h,
              ),
              'Syncing',
            ],
          },
          h,
        ),
        Badge.badge(
          {
            variant: 'secondary',
            children: [
              Spinner.spinner(
                { isDecorative: true, dataIcon: 'inline-start' },
                h,
              ),
              'Updating',
            ],
          },
          h,
        ),
        Badge.badge(
          {
            variant: 'outline',
            children: [
              Spinner.spinner(
                { isDecorative: true, dataIcon: 'inline-start' },
                h,
              ),
              'Processing',
            ],
          },
          h,
        ),
      ]);
    case 'inputGroup':
      return h.div([h.Class(className(styles.column, styles.wrapMd))], [
        InputGroup.inputGroup(
          {
            children: [
              InputGroup.inputGroupInput(
                {
                  id: 'spinner-message',
                  value: '',
                  onInput: onInput('spinner-message'),
                  placeholder: 'Send a message...',
                  isDisabled: true,
                },
                h,
              ),
              InputGroup.inputGroupAddon(
                {
                  align: 'inline-end',
                  children: [
                    Spinner.spinner({ isDecorative: true }, h),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
        InputGroup.inputGroup(
          {
            children: [
              InputGroup.inputGroupTextarea(
                {
                  id: 'spinner-message-area',
                  value: '',
                  onInput: onInput('spinner-message-area'),
                  placeholder: 'Send a message...',
                  isDisabled: true,
                },
                h,
              ),
              InputGroup.inputGroupAddon(
                {
                  align: 'block-end',
                  children: [
                    Spinner.spinner({ isDecorative: true }, h),
                    'Validating...',
                    InputGroup.inputGroupButton(
                      {
                        variant: 'default',
                        children: [
                          Icon.arrowUp({}, h),
                          h.span([h.Class(className(styles.srOnly))], ['Send']),
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
      ]);
    case 'empty':
      return Empty.empty(
        {
          children: [
            Empty.emptyHeader(
              {
                children: [
                  Empty.emptyMedia(
                    {
                      variant: 'icon',
                      children: [
                        Spinner.spinner({ isDecorative: true }, h),
                      ],
                    },
                    h,
                  ),
                  Empty.emptyTitle(
                    { children: ['Processing your request'] },
                    h,
                  ),
                  Empty.emptyDescription(
                    {
                      children: [
                        'Please wait while we process your request. Do not refresh the page.',
                      ],
                    },
                    h,
                  ),
                ],
              },
              h,
            ),
            Empty.emptyContent(
              {
                children: [
                  Button.button(
                    { variant: 'outline', size: 'sm', children: ['Cancel'] },
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
};

export const spinnerStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  _model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html =>
  fixtureView(
    spinnerFixtures[exampleIndex] ?? spinnerFixtures[0],
    onMessageJson,
    h,
  );
