import type { DocsExample } from '@/docs/components/page-definition';
import {
  foldkitApplication,
  staticComponentApplication,
} from '@/docs/components/pages/authored-page';

export type CardFixture = Readonly<{
  title: string;
  description: string;
  kind: 'login' | 'small' | 'spacing' | 'edge' | 'image' | 'rtl';
}>;

export const cardFixtures: Readonly<
  [CardFixture, ...Array<CardFixture>]
> = [
  {
    title: 'Basic',
    description:
      'A card with a header action, labeled inputs, and stacked footer buttons.',
    kind: 'login',
  },
  {
    title: 'Size',
    description:
      'Use the `size="sm"` prop to set the size of the card to small. The small size variant uses smaller spacing.',
    kind: 'small',
  },
  {
    title: 'Spacing',
    description:
      'Use the `--card-spacing` CSS variable to control the spacing between sections and the inset of card parts.',
    kind: 'spacing',
  },
  {
    title: 'Edge to Edge',
    description:
      'Use negative margins with `-mx-(--card-spacing)` to make content go edge to edge while keeping it aligned with the card inset. When the edge-to-edge content sits above a footer, use `-mb-(--card-spacing)` on `CardContent` to remove the section gap.',
    kind: 'edge',
  },
  {
    title: 'Image',
    description: 'Add an image before the card header to create a card with an image.',
    kind: 'image',
  },
  {
    title: 'RTL',
    description:
      'The card layout mirrors automatically for right-to-left languages when `dir="rtl"` is set.',
    kind: 'rtl',
  },
];

const IMAGE_URL = 'https://avatar.vercel.sh/shadcn1';

export const cardRtlCopy = {
  title: 'تسجيل الدخول إلى حسابك',
  description: 'أدخل بريدك الإلكتروني أدناه لتسجيل الدخول إلى حسابك',
  signUp: 'إنشاء حساب',
  email: 'البريد الإلكتروني',
  password: 'كلمة المرور',
  forgot: 'نسيت كلمة المرور؟',
  login: 'تسجيل الدخول',
  google: 'تسجيل الدخول باستخدام Google',
} as const;

const ui = (renderer: 'tailwind' | 'stylex'): string =>
  renderer === 'stylex' ? 'stylex' : 'ui';

/** Source for the login card content (Basic, Spacing, RTL fixtures). */
const loginCardSource = (
  opts: Readonly<{
    rtl: boolean;
    spacingVar?: 'none' | 'static' | 'dynamic';
    renderer: 'tailwind' | 'stylex';
  }>,
): string => {
  const copy = opts.rtl
    ? {
        title: cardRtlCopy.title,
        description: cardRtlCopy.description,
        signUp: cardRtlCopy.signUp,
        email: cardRtlCopy.email,
        password: cardRtlCopy.password,
        forgot: cardRtlCopy.forgot,
        login: cardRtlCopy.login,
        google: cardRtlCopy.google,
      }
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
  const spacingPart =
    opts.spacingVar === 'static'
      ? ' [--card-spacing:--spacing(4)]'
      : '';
  const cardClass =
    opts.renderer === 'tailwind'
      ? opts.spacingVar === 'dynamic'
        ? `class: \`w-full max-w-sm [--card-spacing:--spacing(\${model.spacing})]\`,`
        : `class: 'w-full max-w-sm${spacingPart}',`
      : `layoutStyle: styles.card,`;
  const inputBlock = (
    id: string,
    label: string,
    opts2: Readonly<{ type: string; placeholder?: string; row?: 'split' }>,
  ): string => `h.div([h.Class('grid gap-2')], [
          ${
            opts2.row === 'split'
              ? `h.div([h.Class('flex items-center')], [
            Label.label({ for: '${id}', children: ['${label}'] }, h),
            h.a([h.Href('#'), h.Class('ml-auto inline-block text-sm underline-offset-4 hover:underline')], ['${copy.forgot}']),
          ]),`
              : `Label.label({ for: '${id}', children: ['${label}'] }, h),`
          }
          Input.input({ id: '${id}', type: '${opts2.type}', value: model.${id === 'card-email' ? 'email' : 'password'}, onInput: value => Changed${id === 'card-email' ? 'Email' : 'Password'}({ value }),${opts2.placeholder === undefined ? '' : ` placeholder: '${opts2.placeholder}',`} }, h),
        ])`;

  return `Card.card({
  ${cardClass}
  children: [
    Card.cardHeader({ children: [
      Card.cardTitle({ children: ['${copy.title}'] }, h),
      Card.cardDescription({ children: ['${copy.description}'] }, h),
      Card.cardAction({ children: [
        Button.button({ variant: 'link', children: ['${copy.signUp}'] }, h),
      ] }, h),
    ] }, h),
    Card.cardContent({ children: [
      ${inputBlock('card-email', copy.email, { type: 'email', placeholder: 'm@example.com' })},
      ${inputBlock('card-password', copy.password, { type: 'password', row: 'split' })},
    ] }, h),
    Card.cardFooter({ class: 'flex-col gap-2', children: [
      Button.button({ class: 'w-full', children: ['${copy.login}'] }, h),
      Button.button({ variant: 'outline', class: 'w-full', children: ['${copy.google}'] }, h),
    ] }, h),
  ],
}, h)`;
};

const smallCardSource = (renderer: 'tailwind' | 'stylex'): string => `Card.card({
  size: 'sm',
  ${renderer === 'tailwind' ? `class: 'mx-auto w-full max-w-xs',` : `layoutStyle: styles.smallCard,`}
  children: [
    Card.cardHeader({ children: [
      Card.cardTitle({ children: ['Scheduled reports'] }, h),
      Card.cardDescription({ children: ['Weekly snapshots. No more manual exports.'] }, h),
    ] }, h),
    Card.cardContent({ children: [
      h.ul([h.Class('grid gap-2 py-2 text-sm')], [
        h.li([h.Class('flex gap-2')], [
          Icon.icon('chevron-right', { class: 'mt-0.5 size-4 shrink-0 text-muted-foreground' }, h),
          h.span([], ['Choose a schedule (daily, or weekly).']),
        ]),
        h.li([h.Class('flex gap-2')], [
          Icon.icon('chevron-right', { class: 'mt-0.5 size-4 shrink-0 text-muted-foreground' }, h),
          h.span([], ['Send to channels or specific teammates.']),
        ]),
        h.li([h.Class('flex gap-2')], [
          Icon.icon('chevron-right', { class: 'mt-0.5 size-4 shrink-0 text-muted-foreground' }, h),
          h.span([], ['Include charts, tables, and key metrics.']),
        ]),
      ]),
    ] }, h),
    Card.cardFooter({ class: 'flex-col gap-2', children: [
      Button.button({ size: 'sm', class: 'w-full', children: ['Set up scheduled reports'] }, h),
      Button.button({ variant: 'outline', size: 'sm', class: 'w-full', children: ["See what's new"] }, h),
    ] }, h),
  ],
}, h)`;

const edgeCardSource = (renderer: 'tailwind' | 'stylex'): string => `Card.card({
  ${renderer === 'tailwind' ? `class: 'mx-auto w-full max-w-sm',` : `layoutStyle: styles.edgeCard,`}
  children: [
    Card.cardHeader({ children: [
      Card.cardTitle({ children: ['Terms of Service'] }, h),
      Card.cardDescription({ children: ['Review the terms before accepting the agreement.'] }, h),
    ] }, h),
    Card.cardContent({ class: '-mb-(--card-spacing)', children: [
      h.div([h.Class('-mx-(--card-spacing) max-h-48 space-y-4 overflow-y-scroll border-t bg-muted/50 px-(--card-spacing) py-4 text-sm leading-relaxed')], [
        h.p([], ['These terms govern your use of the workspace, including access to shared documents, project files, and collaboration tools.']),
        h.p([], ['You are responsible for the content you upload and for ensuring that your team has the appropriate permissions to view or edit it.']),
        h.p([], ['We may update features or limits as the service evolves. When those changes materially affect your workflow, we will notify your workspace administrators.']),
        h.p([], ["By continuing, you agree to keep your account credentials secure and to follow your organization's acceptable use policies."]),
      ]),
    ] }, h),
    Card.cardFooter({ class: 'justify-end gap-2', children: [
      Button.button({ variant: 'outline', children: ['Decline'] }, h),
      Button.button({ children: ['Accept'] }, h),
    ] }, h),
  ],
}, h)`;

const imageCardSource = (renderer: 'tailwind' | 'stylex'): string => `Card.card({
  ${renderer === 'tailwind' ? `class: 'relative mx-auto w-full max-w-sm pt-0',` : `layoutStyle: styles.imageCard,`}
  children: [
    h.div([h.Class('absolute inset-0 z-30 aspect-video bg-black/35')]),
    h.img([
      h.Src('${IMAGE_URL}'),
      h.Alt('Event cover'),
      h.Class('relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40'),
    ]),
    Card.cardHeader({ children: [
      Card.cardAction({ children: [
        Badge.badge({ variant: 'secondary', children: ['Featured'] }, h),
      ] }, h),
      Card.cardTitle({ children: ['Design systems meetup'] }, h),
      Card.cardDescription({ children: ['A practical talk on component APIs, accessibility, and shipping faster.'] }, h),
    ] }, h),
    Card.cardFooter({ children: [
      Button.button({ class: 'w-full', children: ['View Event'] }, h),
    ] }, h),
  ],
}, h)`;

const fixtureImports = (
  fixture: CardFixture,
  renderer: 'tailwind' | 'stylex',
): string => {
  const base = [
    `import * as Button from '@/${ui(renderer)}/button'`,
    `import * as Input from '@/${ui(renderer)}/input'`,
    `import * as Label from '@/${ui(renderer)}/label'`,
  ];
  switch (fixture.kind) {
    case 'small':
      return [`import * as Icon from '@/lib/icon'`, `import * as Button from '@/${ui(renderer)}/button'`].join('\n');
    case 'edge':
      return `import * as Button from '@/${ui(renderer)}/button'`;
    case 'image':
      return [`import * as Badge from '@/${ui(renderer)}/badge'`, `import * as Button from '@/${ui(renderer)}/button'`].join('\n');
    default:
      return base.join('\n');
  }
};

const loginModel = `export const Model = S.Struct({ email: S.String, password: S.String })
export type Model = typeof Model.Type`;
const loginMessages = `import { taggedStruct } from 'foldkit/schema'
export const ChangedEmail = taggedStruct('ChangedEmail', { value: S.String })
export const ChangedPassword = taggedStruct('ChangedPassword', { value: S.String })
export const Message = S.Union([ChangedEmail, ChangedPassword])
export type Message = typeof Message.Type`;
const loginInit = `export const init = (): Update.Return<Model, Message> => ({ model: { email: '', password: '' } })`;
const loginUpdate = `export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> => {
  switch (message._tag) {
    case 'ChangedEmail':
      return { model: { ...model, email: message.value } }
    case 'ChangedPassword':
      return { model: { ...model, password: message.value } }
  }
}`;

const viewWrapper = (body: string): string => `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Card — Login',
  body: h.main(
    [h.Class('flex min-h-screen items-center justify-center p-8')],
    [
      ${body.split('\n').join('\n      ')}
    ],
  ),
})`;

const source = (
  index: number,
  renderer: 'tailwind' | 'stylex',
): string => {
  const fixture = cardFixtures[index] ?? cardFixtures[0];
  const imports = [
    `import { Schema as S } from 'effect'`,
    `import { Command, Runtime, Subscription, Update } from 'foldkit'`,
    `import { type Document, type HtmlBuilder } from 'foldkit/html'`,
    `import * as Card from '@/${ui(renderer)}/card'`,
    fixtureImports(fixture, renderer),
  ].join('\n');

  switch (fixture.kind) {
    case 'login':
    case 'rtl':
      return foldkitApplication({
        title: `Card — ${fixture.title}`,
        imports,
        model: loginModel,
        messages: loginMessages,
        init: loginInit,
        update: loginUpdate,
        view: viewWrapper(
          `h.div(${fixture.kind === 'rtl' ? `[h.Dir('rtl'), h.Class('w-full max-w-sm')]` : `[]`}, [
        ${loginCardSource({ rtl: fixture.kind === 'rtl', spacingVar: 'none', renderer }).split('\n').join('\n        ')},
      ])`,
        ),
      });
    case 'spacing': {
      return foldkitApplication({
        title: 'Card — Spacing',
        imports: [
          imports,
          `import * as ToggleGroup from '@/${ui(renderer)}/toggle-group'`,
          `import { Option } from 'effect'`,
        ].join('\n'),
        model: `export const Model = S.Struct({
  email: S.String,
  password: S.String,
  spacing: S.Literals(['4', '5', '6', '8']),
  toggleGroup: ToggleGroup.Model,
})
export type Model = typeof Model.Type

export const spacingOptions = [
  { value: '4', label: '16px' },
  { value: '5', label: '20px' },
  { value: '6', label: '24px' },
  { value: '8', label: '32px' },
] as const`,
        messages: `import { taggedStruct } from 'foldkit/schema'
export const ChangedEmail = taggedStruct('ChangedEmail', { value: S.String })
export const ChangedPassword = taggedStruct('ChangedPassword', { value: S.String })
export const GotToggleGroupMessage = taggedStruct('GotToggleGroupMessage', { message: ToggleGroup.Message })
export const Message = S.Union([ChangedEmail, ChangedPassword, GotToggleGroupMessage])
export type Message = typeof Message.Type`,
        init: `export const init = (): Update.Return<Model, Message> => ({
  model: {
    email: '',
    password: '',
    spacing: '4',
    toggleGroup: ToggleGroup.init({ id: 'card-spacing' }),
  },
})`,
        update: `const SpacingToggleGroup = ToggleGroup.create<string>()

export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> => {
  switch (message._tag) {
    case 'ChangedEmail':
      return { model: { ...model, email: message.value } }
    case 'ChangedPassword':
      return { model: { ...model, password: message.value } }
    case 'GotToggleGroupMessage': {
      const result = SpacingToggleGroup.update(model.toggleGroup, message.message)
      const selection = Option.fromNullishOr(result.outMessage)
      return {
        model: {
          ...model,
          toggleGroup: result.model,
          spacing: Option.match(selection, {
            onNone: () => model.spacing,
            onSome: next => next.value as Model['spacing'],
          }),
        },
        commands: Command.mapMessages(
          result.commands ?? [],
          next => GotToggleGroupMessage({ message: next }),
        ),
      }
    }
  }
}`,
        view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Card — Spacing',
  body: h.main(
    [h.Class('flex min-h-screen items-center justify-center p-8')],
    [
      h.div([h.Class('grid w-full max-w-sm gap-4')], [
        SpacingToggleGroup.toggleGroup({
          model: model.toggleGroup,
          toParentMessage: message => GotToggleGroupMessage({ message }),
          ariaLabel: 'Card spacing',
          variant: 'outline',
          size: 'sm',
          value: model.spacing,
          items: spacingOptions.map(option => ({ value: option.value, children: [option.label] })),
        }, h),
        ${
          renderer === 'tailwind'
            ? loginCardSource({ rtl: false, spacingVar: 'dynamic', renderer }).split('\n').join('\n        ')
            : `h.div([h.Style({ '--card-spacing': \`\${Number(model.spacing) * 4}px\` })], [
          ${loginCardSource({ rtl: false, spacingVar: 'none', renderer }).split('\n').join('\n          ')},
        ])`
        },
      ]),
    ],
  ),
})`,
      });
    }
    case 'small':
      return staticComponentApplication({
        componentName: 'Card',
        componentSlug: 'card',
        renderer,
        exampleName: fixture.title,
        componentImports: fixtureImports(fixture, renderer),
        viewBody: smallCardSource(renderer),
      });
    case 'edge':
      return staticComponentApplication({
        componentName: 'Card',
        componentSlug: 'card',
        renderer,
        exampleName: fixture.title,
        componentImports: fixtureImports(fixture, renderer),
        viewBody: edgeCardSource(renderer),
      });
    case 'image':
      return staticComponentApplication({
        componentName: 'Card',
        componentSlug: 'card',
        renderer,
        exampleName: fixture.title,
        componentImports: fixtureImports(fixture, renderer),
        viewBody: imageCardSource(renderer),
      });
  }
};

export const cardExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => cardFixtures.map((fixture, index) => ({
  title: fixture.title,
  description: fixture.description,
  code: source(index, renderer),
}));
