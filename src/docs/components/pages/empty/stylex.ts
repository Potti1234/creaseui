import type { Html, HtmlBuilder } from 'foldkit/html';
import * as stylex from '@stylexjs/stylex';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import {
  type EmptyFixture,
  emptyFixtures,
  emptyRtlCopy,
} from '@/docs/components/pages/empty/shared';
import * as Avatar from '@/stylex/avatar';
import * as Button from '@/stylex/button';
import * as Empty from '@/stylex/empty';
import * as Icon from '@/lib/icon';
import * as InputGroup from '@/stylex/input-group';
import * as Kbd from '@/stylex/kbd';
import { className } from '@/stylex/style';

const styles = stylex.create({
  empty: { maxWidth: '36rem', width: '100%' },
  dashedBox: {
    borderColor: 'var(--border)',
    borderStyle: 'dashed',
    borderWidth: '1px',
  },
  backgroundBox: {
    backgroundColor: 'color-mix(in oklab, var(--muted) 30%, transparent)',
    height: '100%',
  },
  avatarSize: { height: '3rem', width: '3rem' },
  actionRow: {
    gap: '0.5rem',
    display: 'flex',
    justifyContent: 'center',
  },
  linkRow: {
    gap: '0.25rem',
    textDecoration: 'underline',
    alignItems: 'center',
    color: 'var(--muted-foreground)',
    display: 'inline-flex',
    fontSize: '0.875rem',
    textUnderlineOffset: '4px',
  },
  inputWidth: { width: '75%' },
  helpLink: { textDecoration: 'underline' },
});

const headerBlock = <Msg>(
  title: string,
  description: string,
  media: Html,
  h: HtmlBuilder<Msg>,
): Html =>
  Empty.emptyHeader(
    {
      children: [
        media,
        Empty.emptyTitle({ children: [title] }, h),
        Empty.emptyDescription({ children: [description] }, h),
      ],
    },
    h,
  );

const avatarNode = <Msg>(
  src: string,
  alt: string,
  fallback: string,
  big: boolean,
  h: HtmlBuilder<Msg>,
): Html =>
  Avatar.avatar(
    {
      ...(big ? { grayscale: true, layoutStyle: styles.avatarSize } : {}),
      children: [
        Avatar.avatarImage({ src, alt, model: { status: 'loaded' } }, h),
        Avatar.avatarFallback({ children: [fallback] }, h),
      ],
    },
    h,
  );

const linkRow = <Msg>(label: string, h: HtmlBuilder<Msg>): Html =>
  h.a([h.Href('#'), h.Class(className(styles.linkRow))], [
    label,
    Icon.icon('arrow-up-right', {}, h),
  ]);

const emptyView = <Msg>(
  fixture: EmptyFixture,
  value: string,
  onInput: (value: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html => {
  const empty = (children: ReadonlyArray<Html>): Html =>
    Empty.empty({ layoutStyle: styles.empty, children }, h);
  const action = (variant: 'default' | 'outline', label: string, icon?: Html): Html =>
    Button.button(
      {
        variant,
        size: 'sm',
        children: icon === undefined ? [label] : [icon, label],
      },
      h,
    );
  switch (fixture.kind) {
    case 'demo':
      return empty([
        headerBlock(
          'No Projects Yet',
          "You haven't created any projects yet. Get started by creating your first project.",
          Empty.emptyMedia({ variant: 'icon', children: [Icon.icon('folder-code', {}, h)] }, h),
          h,
        ),
        Empty.emptyContent(
          {
            children: [
              h.div([h.Class(className(styles.actionRow))], [
                action('default', 'Create Project'),
                action('outline', 'Import Project'),
              ]),
            ],
          },
          h,
        ),
        linkRow('Learn More', h),
      ]);
    case 'outline':
      return h.div([h.Class(className(styles.dashedBox))], [
        empty([
          headerBlock(
            'Cloud Storage Empty',
            'Upload files to your cloud storage to access them anywhere.',
            Empty.emptyMedia({ variant: 'icon', children: [Icon.icon('cloud', {}, h)] }, h),
            h,
          ),
          Empty.emptyContent({ children: [action('outline', 'Upload Files')] }, h),
        ]),
      ]);
    case 'background':
      return h.div([h.Class(className(styles.backgroundBox))], [
        empty([
          headerBlock(
            'No Notifications',
            "You're all caught up. New notifications will appear here.",
            Empty.emptyMedia({ variant: 'icon', children: [Icon.icon('bell', {}, h)] }, h),
            h,
          ),
          Empty.emptyContent(
            { children: [action('outline', 'Refresh', Icon.icon('refresh-ccw', {}, h))] },
            h,
          ),
        ]),
      ]);
    case 'avatar':
      return empty([
        headerBlock(
          'User Offline',
          'This user is currently offline. You can leave a message to notify them or try again later.',
          Empty.emptyMedia(
            {
              variant: 'default',
              children: [
                avatarNode('https://github.com/shadcn.png', '@shadcn', 'LR', true, h),
              ],
            },
            h,
          ),
          h,
        ),
        Empty.emptyContent({ children: [action('default', 'Leave Message')] }, h),
      ]);
    case 'avatarGroup':
      return empty([
        headerBlock(
          'No Team Members',
          'Invite your team to collaborate on this project.',
          Empty.emptyMedia(
            {
              variant: 'default',
              children: [
                Avatar.avatarGroup(
                  {
                    grayscale: true,
                    children: (
                      [
                        ['https://github.com/shadcn.png', '@shadcn', 'CN'],
                        ['https://github.com/maxleiter.png', '@maxleiter', 'LR'],
                        ['https://github.com/evilrabbit.png', '@evilrabbit', 'ER'],
                      ] as const
                    ).map(([src, alt, fb]) => avatarNode(src, alt, fb, false, h)),
                  },
                  h,
                ),
              ],
            },
            h,
          ),
          h,
        ),
        Empty.emptyContent(
          { children: [action('default', 'Invite Members', Icon.icon('plus', {}, h))] },
          h,
        ),
      ]);
    case 'inputGroup':
      return empty([
        Empty.emptyHeader(
          {
            children: [
              Empty.emptyTitle({ children: ['404 - Not Found'] }, h),
              Empty.emptyDescription(
                {
                  children: [
                    "The page you're looking for doesn't exist. Try searching for what you need below.",
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
              InputGroup.inputGroup(
                {
                  layoutStyle: styles.inputWidth,
                  children: [
                    InputGroup.inputGroupInput(
                      {
                        id: 'docs-empty-search',
                        value,
                        onInput,
                        placeholder: 'Try searching for pages...',
                      },
                      h,
                    ),
                    InputGroup.inputGroupAddon({ children: [Icon.icon('search', {}, h)] }, h),
                    InputGroup.inputGroupAddon(
                      { align: 'inline-end', children: [Kbd.kbd({ children: ['/'] }, h)] },
                      h,
                    ),
                  ],
                },
                h,
              ),
              Empty.emptyDescription(
                {
                  children: [
                    h.span(
                      [],
                      [
                        'Need help? ',
                        h.a([h.Href('#'), h.Class(className(styles.helpLink))], ['Contact support']),
                      ],
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
    case 'rtl':
      return h.div([h.Dir('rtl')], [
        empty([
          headerBlock(
            emptyRtlCopy.title,
            emptyRtlCopy.description,
            Empty.emptyMedia({ variant: 'icon', children: [Icon.icon('folder-code', {}, h)] }, h),
            h,
          ),
          Empty.emptyContent(
            {
              children: [
                h.div([h.Class(className(styles.actionRow))], [
                  action('default', emptyRtlCopy.create),
                  action('outline', emptyRtlCopy.import),
                ]),
              ],
            },
            h,
          ),
          linkRow(emptyRtlCopy.learnMore, h),
        ]),
      ]);
  }
};

export const emptyStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  index: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html | undefined => {
  const fixture = emptyFixtures[index];
  if (fixture === undefined) return undefined;
  const { value } = model as { value: string };
  return emptyView(
    fixture,
    value,
    v => onMessageJson(JSON.stringify({ _tag: 'ChangedTextDocsPreview', value: v })),
    h,
  );
};
