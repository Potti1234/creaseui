import * as stylex from '@stylexjs/stylex';
import type { Html, HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { cardFixtures, cardRtlCopy } from '@/docs/components/pages/card/shared';
import * as Badge from '@/stylex/badge';
import * as Button from '@/stylex/button';
import * as Card from '@/stylex/card';
import * as Icon from '@/lib/icon';
import * as Input from '@/stylex/input';
import * as Label from '@/stylex/label';
import * as ToggleGroup from '@/stylex/toggle-group';
import { className } from '@/stylex/style';

const IMAGE_URL = 'https://avatar.vercel.sh/shadcn1';
type SpacingValue = '4' | '5' | '6' | '8';

const styles = stylex.create({
  frame: { maxWidth: '24rem', width: '100%' },
  smallCard: { marginInline: 'auto', maxWidth: '20rem', width: '100%' },
  loginWrap: { display: 'grid', gap: '1rem', justifyItems: 'center', maxWidth: '24rem', width: '100%', marginInline: 'auto' },
  fieldGrid: { display: 'grid', gap: '0.5rem' },
  fieldRow: { display: 'flex', alignItems: 'center' },
  link: {
    color: 'inherit',
    fontSize: '0.875rem',
    marginInlineStart: 'auto',
    textDecorationLine: 'underline',
    textUnderlineOffset: '4px',
  },
  footerCol: { flexDirection: 'column', gap: '0.5rem', display: 'flex', width: '100%' },
  wFull: { width: '100%' },
  list: { display: 'grid', gap: '0.5rem', paddingBlock: '0.5rem', fontSize: '0.875rem', listStyle: 'none', paddingInlineStart: 0 },
  li: { display: 'flex', gap: '0.5rem' },
  liIcon: { marginTop: '0.125rem', flexShrink: 0, color: 'var(--muted-foreground)' },
  edgeCard: { marginInline: 'auto', maxWidth: '24rem', width: '100%' },
  edgeContent: { marginBlockEnd: 'calc(var(--card-spacing, 1.5rem) * -1)' },
  edgeScroll: {
    marginInline: 'calc(var(--card-spacing, 1.5rem) * -1)',
    maxHeight: '12rem',
    overflowY: 'scroll',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: 'var(--border)',
    backgroundColor: 'color-mix(in oklab, var(--muted) 50%, transparent)',
    paddingInline: 'var(--card-spacing, 1.5rem)',
    paddingBlock: '1rem',
    fontSize: '0.875rem',
    lineHeight: 1.6,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  edgeFooterInner: { display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', width: '100%' },
  imageWrap: { position: 'relative', marginInline: 'auto', maxWidth: '24rem', width: '100%' },
  overlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 30,
    aspectRatio: '16 / 9',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  cover: {
    position: 'relative',
    zIndex: 20,
    aspectRatio: '16 / 9',
    width: '100%',
    objectFit: 'cover',
    filter: 'grayscale(100%) brightness(0.6)',
  },
  liMarker: { width: '1rem', height: '1rem' },
  footerPad: { marginBlockEnd: '1.5rem' },
});

type PreviewModel = Readonly<{
  toggleGroup: ToggleGroup.Model;
  spacing: SpacingValue;
  email: string;
  password: string;
}>;

const spacingOptions: ReadonlyArray<{ value: SpacingValue; label: string }> = [
  { value: '4', label: '16px' },
  { value: '5', label: '20px' },
  { value: '6', label: '24px' },
  { value: '8', label: '32px' },
];

const loginCard = <Msg>(
  opts: Readonly<{
    rtl?: boolean;
    email: string;
    password: string;
    onEmail: (value: string) => Msg;
    onPassword: (value: string) => Msg;
  }>,
  h: HtmlBuilder<Msg>,
): Html => {
  const copy = opts.rtl === true
    ? cardRtlCopy
    : {
        title: 'Login to your account',
        description: 'Enter your email below to login to your account',
        signUp: 'Sign Up',
        email: 'Email',
        password: 'Password',
        forgot: 'Forgot your password?',
        login: 'Login',
        google: 'Login with Google',
      };
  return Card.card(
    {
      layoutStyle: styles.frame,
      children: [
        Card.cardHeader({
          children: [
            Card.cardTitle({ children: [copy.title] }, h),
            Card.cardDescription({ children: [copy.description] }, h),
            Card.cardAction({
              children: [Button.button({ variant: 'link', children: [copy.signUp] }, h)],
            }, h),
          ],
        }, h),
        Card.cardContent({
          children: [
            h.div([h.Class(className(styles.fieldGrid))], [
              Label.label({ for: 'card-email', children: [copy.email] }, h),
              Input.input(
                {
                  id: 'card-email',
                  type: 'email',
                  placeholder: 'm@example.com',
                  value: opts.email,
                  onInput: opts.onEmail,
                },
                h,
              ),
            ]),
            h.div([h.Class(className(styles.fieldGrid))], [
              h.div([h.Class(className(styles.fieldRow))], [
                Label.label({ for: 'card-password', children: [copy.password] }, h),
                h.a(
                  [h.Href('#'), h.Class(className(styles.link))],
                  [copy.forgot],
                ),
              ]),
              Input.input(
                {
                  id: 'card-password',
                  type: 'password',
                  value: opts.password,
                  onInput: opts.onPassword,
                },
                h,
              ),
            ]),
          ],
        }, h),
        Card.cardFooter({
          children: [
            h.div([h.Class(className(styles.footerCol))], [
              Button.button({ layoutStyle: styles.wFull, children: [copy.login] }, h),
              Button.button({ variant: 'outline', layoutStyle: styles.wFull, children: [copy.google] }, h),
            ]),
          ],
        }, h),
      ],
    },
    h,
  );
};

export const cardStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const fixture = cardFixtures[exampleIndex] ?? cardFixtures[0];
  const previewModel = model as PreviewModel;
  const inputProps = {
    email: previewModel.email,
    password: previewModel.password,
    onEmail: (value: string) =>
      onMessageJson(JSON.stringify({ _tag: 'ChangedCardEmail', value })),
    onPassword: (value: string) =>
      onMessageJson(JSON.stringify({ _tag: 'ChangedCardPassword', value })),
  };
  switch (fixture.kind) {
    case 'login':
      return loginCard({ ...inputProps }, h);
    case 'rtl':
      return h.div([h.Dir('rtl'), h.Class(className(styles.frame))], [
        loginCard({ rtl: true, ...inputProps }, h),
      ]);
    case 'small':
      return Card.card(
        {
          size: 'sm',
          layoutStyle: styles.smallCard,
          children: [
            Card.cardHeader({
              children: [
                Card.cardTitle({ children: ['Scheduled reports'] }, h),
                Card.cardDescription({
                  children: ['Weekly snapshots. No more manual exports.'],
                }, h),
              ],
            }, h),
            Card.cardContent({
              children: [
                h.ul([h.Class(className(styles.list))], [
                  h.li([h.Class(className(styles.li))], [
                    Icon.icon('chevron-right', { class: className(styles.liIcon, styles.liMarker) }, h),
                    h.span([], ['Choose a schedule (daily, or weekly).']),
                  ]),
                  h.li([h.Class(className(styles.li))], [
                    Icon.icon('chevron-right', { class: className(styles.liIcon, styles.liMarker) }, h),
                    h.span([], ['Send to channels or specific teammates.']),
                  ]),
                  h.li([h.Class(className(styles.li))], [
                    Icon.icon('chevron-right', { class: className(styles.liIcon, styles.liMarker) }, h),
                    h.span([], ['Include charts, tables, and key metrics.']),
                  ]),
                ]),
              ],
            }, h),
            Card.cardFooter({
              children: [
                h.div([h.Class(className(styles.footerCol))], [
                  Button.button({ size: 'sm', layoutStyle: styles.wFull, children: ['Set up scheduled reports'] }, h),
                  Button.button({ variant: 'outline', size: 'sm', layoutStyle: styles.wFull, children: ["See what's new"] }, h),
                ]),
              ],
            }, h),
          ],
        },
        h,
      );
    case 'spacing':
      return h.div([h.Class(className(styles.loginWrap))], [
        ToggleGroup.toggleGroup(
          {
            model: previewModel.toggleGroup,
            toParentMessage: message =>
              onMessageJson(JSON.stringify({ _tag: 'GotCardToggleMessage', message })),
            ariaLabel: 'Card spacing',
            variant: 'outline',
            size: 'sm',
            value: previewModel.spacing,
            items: spacingOptions.map(option => ({
              value: option.value,
              children: [option.label],
            })),
          },
          h,
        ),
        h.div([h.Style({ '--card-spacing': `${Number(previewModel.spacing) * 4}px` })], [
          loginCard({ ...inputProps }, h),
        ]),
      ]);
    case 'edge':
      return Card.card(
        {
          layoutStyle: styles.edgeCard,
          children: [
            Card.cardHeader({
              children: [
                Card.cardTitle({ children: ['Terms of Service'] }, h),
                Card.cardDescription({
                  children: ['Review the terms before accepting the agreement.'],
                }, h),
              ],
            }, h),
            Card.cardContent({
              layoutStyle: styles.edgeContent,
              children: [
                h.div([h.Class(className(styles.edgeScroll))], [
                  h.p([], ['These terms govern your use of the workspace, including access to shared documents, project files, and collaboration tools.']),
                  h.p([], ['You are responsible for the content you upload and for ensuring that your team has the appropriate permissions to view or edit it.']),
                  h.p([], ['We may update features or limits as the service evolves. When those changes materially affect your workflow, we will notify your workspace administrators.']),
                  h.p([], ["By continuing, you agree to keep your account credentials secure and to follow your organization's acceptable use policies."]),
                ]),
              ],
            }, h),
            Card.cardFooter({
              children: [
                h.div([h.Class(className(styles.edgeFooterInner))], [
                  Button.button({ variant: 'outline', children: ['Decline'] }, h),
                  Button.button({ children: ['Accept'] }, h),
                ]),
              ],
            }, h),
          ],
        },
        h,
      );
    case 'image':
      return h.div([h.Class(className(styles.imageWrap))], [
        Card.card(
        {
          density: 'flush',
          children: [
            h.div([h.Class(className(styles.overlay))]),
            h.img([
              h.Src(IMAGE_URL),
              h.Alt('Event cover'),
              h.Class(className(styles.cover)),
            ]),
            Card.cardHeader({
              children: [
                Card.cardAction({
                  children: [Badge.badge({ variant: 'secondary', children: ['Featured'] }, h)],
                }, h),
                Card.cardTitle({ children: ['Design systems meetup'] }, h),
                Card.cardDescription({
                  children: [
                    'A practical talk on component APIs, accessibility, and shipping faster.',
                  ],
                }, h),
              ],
            }, h),
            Card.cardFooter({
              layoutStyle: styles.footerPad,
              children: [Button.button({ layoutStyle: styles.wFull, children: ['View Event'] }, h)],
            }, h),
          ],
        },
        h,
      ),
      ]);
  }
};
