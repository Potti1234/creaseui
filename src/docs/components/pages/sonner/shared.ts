import type { DocsExample } from '@/docs/components/page-definition';
import { foldkitApplication } from '@/docs/components/pages/authored-page';
import type { NotificationConfig } from '@/docs/components/pages/notification-page';

export const sonnerConfig: NotificationConfig = {
  slug: 'sonner',
  title: 'Sonner',
  namespace: 'Sonner',
  kind: 'submodel',
  description:
    'A compatibility skin over the canonical Toast notification Submodel, not a second state engine.',
};

export type SonnerVariant =
  | 'default'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'promise';

export type SonnerButtonSpec = Readonly<{
  label: string;
  variant: SonnerVariant;
  description?: string;
  actionLabel?: string;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}>;

export type SonnerFixture = Readonly<{
  title: string;
  heroOnly?: boolean;
  wrap?: 'start' | 'center';
  buttons: Readonly<[SonnerButtonSpec, ...Array<SonnerButtonSpec>]>;
}>;

export const toastTitle = (variant: SonnerVariant): string => {
  switch (variant) {
    case 'default':
    case 'success':
    case 'promise':
      return 'Event has been created';
    case 'info':
      return 'Be at the area 10 minutes before the event time';
    case 'warning':
      return 'Event start time cannot be earlier than 8am';
    case 'error':
      return 'Event has not been created';
  }
};

export const sonnerFixtures: Readonly<[SonnerFixture, ...Array<SonnerFixture>]> = [
  {
    title: 'Basic',
    heroOnly: true,
    buttons: [
      {
        label: 'Show Toast',
        variant: 'default',
        description: 'Sunday, December 03, 2023 at 9:00 AM',
        actionLabel: 'Undo',
      },
    ],
  },
  {
    title: 'Types',
    buttons: [
      { label: 'Default', variant: 'default' },
      { label: 'Success', variant: 'success' },
      { label: 'Info', variant: 'info' },
      { label: 'Warning', variant: 'warning' },
      { label: 'Error', variant: 'error' },
      { label: 'Promise', variant: 'promise' },
    ],
  },
  {
    title: 'Description',
    buttons: [
      {
        label: 'Show Toast',
        variant: 'default',
        description: 'Monday, January 3rd at 6:00pm',
      },
    ],
  },
  {
    title: 'Position',
    wrap: 'center',
    buttons: [
      { label: 'Top Left', variant: 'default', position: 'top-left' },
      { label: 'Top Center', variant: 'default', position: 'top-center' },
      { label: 'Top Right', variant: 'default', position: 'top-right' },
      { label: 'Bottom Left', variant: 'default', position: 'bottom-left' },
      { label: 'Bottom Center', variant: 'default', position: 'bottom-center' },
      { label: 'Bottom Right', variant: 'default', position: 'bottom-right' },
    ],
  },
];

const factoryName = (variant: SonnerVariant): string =>
  variant === 'promise' ? 'info' : variant === 'default' ? 'plain' : variant;

const showCallEmit = (button: SonnerButtonSpec): string => {
  if (button.variant === 'promise') {
    return `Sonner.show(model.notifications, Sonner.info({
        title: 'Loading...',
        sticky: true,
      }))`;
  }
  const props = [`title: '${toastTitle(button.variant)}'`];
  if (button.description !== undefined) {
    props.push(`description: '${button.description}'`);
  }
  if (button.actionLabel !== undefined) {
    props.push(`actionLabel: '${button.actionLabel}'`);
  }
  if (button.position !== undefined) {
    props.push(`position: '${button.position}'`);
  }
  return `Sonner.show(model.notifications, Sonner.${factoryName(button.variant)}({
        ${props.join(',\n        ')},
      }))`;
};

const buttonEmit = (button: SonnerButtonSpec, index: number): string =>
  `    Button.button({
      onClick: ClickedShow${index}(),
      variant: 'outline',
      children: ['${button.label}'],
    }, h)`;

const emitSource = (fixture: SonnerFixture, isStyleX: boolean): string => {
  const tag = fixture.title.replaceAll(/[^a-zA-Z0-9]/g, '');
  const lib = isStyleX ? 'stylex' : 'ui';
  const hasPromise = fixture.buttons.some(button => button.variant === 'promise');
  const wrapClass = fixture.wrap === 'center' ? 'flex flex-wrap justify-center gap-2' : 'flex flex-wrap gap-2';
  const clickTags = fixture.buttons.map((_, index) => `ClickedShow${index}`);
  return foldkitApplication({
    title: `Sonner — ${fixture.title}`,
    imports: `import { Effect, Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription, Update } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { taggedStruct } from 'foldkit/schema'

import * as Button from '@/${lib}/button'
import * as Sonner from '@/${lib}/sonner'`,
    model: `export const Model = S.Struct({
  notifications: Sonner.Model,${hasPromise ? `
  pendingPromiseId: S.Option(S.String),` : ''}
})
export type Model = typeof Model.Type`,
    messages: `${fixture.buttons
      .map(
        (_, index) =>
          `export const ClickedShow${index} = taggedStruct('ClickedShow${index}${tag}')`,
      )
      .join('\n')}
export const GotSonnerMessage = taggedStruct('GotSonnerMessage${tag}', {
  message: Sonner.Message,
})${hasPromise ? `
export const CompletedPromise = taggedStruct('CompletedPromise${tag}')` : ''}
export const Message = S.Union([${[...clickTags, 'GotSonnerMessage', ...(hasPromise ? ['CompletedPromise'] : [])].join(', ')}])
export type Message = typeof Message.Type`,
    init: `export const init = (): Update.Return<Model, Message> => ({
  model: {
    notifications: Sonner.init({ id: 'sonner-${tag.toLowerCase()}' }),${hasPromise ? `
    pendingPromiseId: Option.none(),` : ''}
  },
})`,
    update: `const mapSonner = (
  model: Model,
  result: ReturnType<typeof Sonner.update>,
): Update.Return<Model, Message> => ({
  model: { ...model, notifications: result.model },
  commands: Command.mapMessages(result.commands ?? [], next =>
    GotSonnerMessage({ message: next })),
})
${hasPromise ? `
const ResolvePromise = Command.define('ResolvePromise', {
  messages: [CompletedPromise],
  execute: Effect.sleep('1200 millis').pipe(Effect.as(CompletedPromise())),
})
` : ''}
export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> => {
  switch (message._tag) {
${fixture.buttons
  .map((button, index) => {
    if (button.variant === 'promise') {
      return `    case 'ClickedShow${index}${tag}': {
      const result = ${showCallEmit(button)}
      const mapped = mapSonner(model, result)
      const next = mapped.model
      const commands = mapped.commands ?? []
      return {
        model: {
          ...next,
          pendingPromiseId: Option.fromNullishOr(
            next.notifications.entries.at(-1)?.id,
          ),
        },
        commands: [...commands, ResolvePromise()],
      }
    }`;
    }
    return `    case 'ClickedShow${index}${tag}':
      return mapSonner(model, ${showCallEmit(button)})`;
  })
  .join('\n')}${hasPromise ? `
    case 'CompletedPromise${tag}':
      return Option.match(model.pendingPromiseId, {
        onNone: () => ({ model }),
        onSome: id =>
          mapSonner(
            { ...model, pendingPromiseId: Option.none() },
            Sonner.updateToast(model.notifications, id, {
              title: 'Event has been created',
              variant: 'Success',
              sticky: false,
              duration: '4 seconds',
            }),
          ),
      })` : ''}
    case 'GotSonnerMessage${tag}':
      return mapSonner(model, Sonner.update(model.notifications, message.message))
  }
}`,
    view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Sonner — ${fixture.title}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    h.div([h.Class('${wrapClass}')], [
${fixture.buttons.map((button, index) => buttonEmit(button, index)).join(',\n')}
    ]),
    Sonner.sonner({
      model: model.notifications,
      toParentMessage: message => GotSonnerMessage({ message }),
      ariaLabel: 'Sonner notifications',
    }, h),
  ]),
})`,
  });
};

export const sonnerExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> =>
  sonnerFixtures.map(fixture => ({
    title: fixture.title,
    ...(fixture.heroOnly === true ? { heroOnly: true } : {}),
    code: emitSource(fixture, renderer === 'stylex'),
  }));
