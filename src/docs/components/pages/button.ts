import type { Html, HtmlBuilder } from 'foldkit/html';

import * as Button from '@/ui/button';
import * as ButtonGroup from '@/ui/button-group';
import * as Spinner from '@/ui/spinner';
import * as State from '@/docs/components/catalog-state';
import { authoredPage, statelessComponentApplication } from '@/docs/components/pages/authored-page';

type Message = State.Message;
const clicked = State.ClickedPreviewAction();

const row = (
  children: ReadonlyArray<Html | string>,
  h: HtmlBuilder<Message>,
): Html => h.div([h.Class('flex flex-wrap items-center justify-center gap-3')], children);

const source = (
  name: string,
  viewBody: string,
  componentImports?: string,
): string =>
  statelessComponentApplication({
    componentName: 'Button',
    componentSlug: 'button',
    exampleName: name,
    viewBody,
    ...(componentImports === undefined ? {} : { componentImports }),
  });

export const buttonPage = authoredPage({
  slug: 'button',
  title: 'Button',
  kind: 'helper',
  definition: {
    kind: 'helper',
    description:
      'Triggers an action or navigates to another resource with shadcn-compatible variants and native button semantics.',
    architecture:
      'Button is a stateless render helper. Dispatch an application Message through onClick and call Button.button directly inside view; it needs no child Model, update delegation, or h.submodel boundary.',
    apiHref: 'https://foldkit.dev/ui/button',
    styling:
      'Variants and sizes are source-owned class recipes. Extend buttonVariants or edit the installed module when the application needs a durable visual variant; use class for a one-off layout adjustment.',
    accessibility:
      'Button preserves native button semantics, defaults to type="button", exposes disabled state through Foldkit’s accessible attributes, and keeps visible keyboard focus treatment.',
    keyboard: [
      ['Enter', 'Activates the focused button.'],
      ['Space', 'Activates the focused button.'],
    ],
    examples: [
      {
        title: 'Basic',
        description:
          'Pass a domain message to onClick. The view stays pure and the update function owns the resulting state change.',
        preview: (_model, h) =>
          Button.button({ onClick: clicked, children: ['Button'] }, h),
        code: source(
          'Basic',
          `Button.button({
  onClick: ClickedExample(),
  children: [\`Clicked \${model.clickCount} times\`],
}, h),`,
        ),
      },
      {
        title: 'Variants',
        description:
          'Use semantic variants to communicate hierarchy without changing the Foldkit message flow.',
        preview: (_model, h) =>
          row(
            [
              Button.button({ onClick: clicked, children: ['Primary'] }, h),
              Button.button(
                { variant: 'secondary', onClick: clicked, children: ['Secondary'] },
                h,
              ),
              Button.button(
                { variant: 'outline', onClick: clicked, children: ['Outline'] },
                h,
              ),
              Button.button(
                { variant: 'ghost', onClick: clicked, children: ['Ghost'] },
                h,
              ),
              Button.button(
                { variant: 'destructive', onClick: clicked, children: ['Delete'] },
                h,
              ),
            ],
            h,
          ),
        code: source(
          'Variants',
          `h.div([h.Class('flex flex-wrap gap-3')], [
  Button.button({ onClick: ClickedExample(), children: ['Primary'] }, h),
  Button.button({ variant: 'secondary', onClick: ClickedExample(), children: ['Secondary'] }, h),
  Button.button({ variant: 'outline', onClick: ClickedExample(), children: ['Outline'] }, h),
  Button.button({ variant: 'ghost', onClick: ClickedExample(), children: ['Ghost'] }, h),
  Button.button({ variant: 'destructive', onClick: ClickedExample(), children: ['Delete'] }, h),
]),`,
        ),
      },
      {
        title: 'Sizes',
        description:
          'Size changes the control’s hit area and density while preserving the same typed Message.',
        preview: (_model, h) =>
          row(
            [
              Button.button({ size: 'sm', onClick: clicked, children: ['Small'] }, h),
              Button.button({ onClick: clicked, children: ['Default'] }, h),
              Button.button({ size: 'lg', onClick: clicked, children: ['Large'] }, h),
              Button.button({ size: 'icon', onClick: clicked, children: ['+'] }, h),
            ],
            h,
          ),
        code: source(
          'Sizes',
          `h.div([h.Class('flex items-center gap-3')], [
  Button.button({ size: 'sm', onClick: ClickedExample(), children: ['Small'] }, h),
  Button.button({ onClick: ClickedExample(), children: ['Default'] }, h),
  Button.button({ size: 'lg', onClick: ClickedExample(), children: ['Large'] }, h),
  Button.button({ size: 'icon', onClick: ClickedExample(), children: ['+'] }, h),
]),`,
        ),
      },
      {
        title: 'Loading',
        description:
          'Disable the button while work is in flight and pair the state with a visible progress label.',
        preview: (_model, h) =>
          Button.button(
            {
              isDisabled: true,
              children: [Spinner.spinner({ class: 'size-4' }, h), 'Please wait'],
            },
            h,
          ),
        code: source(
          'Loading',
          `Button.button({
  isDisabled: true,
  children: [Spinner.spinner({ class: 'size-4' }, h), 'Please wait'],
}, h),`,
          `import * as Spinner from '@/ui/spinner'`,
        ),
      },
      {
        title: 'Button Group',
        description:
          'Group related actions visually while each button continues to dispatch an ordinary application Message.',
        preview: (_model, h) =>
          ButtonGroup.buttonGroup(
            {
              children: [
                Button.button(
                  { variant: 'outline', onClick: clicked, children: ['Back'] },
                  h,
                ),
                Button.button(
                  { variant: 'outline', onClick: clicked, children: ['Next'] },
                  h,
                ),
              ],
            },
            h,
          ),
        code: source(
          'Button Group',
          `ButtonGroup.buttonGroup({
  children: [
    Button.button({ variant: 'outline', onClick: ClickedExample(), children: ['Back'] }, h),
    Button.button({ variant: 'outline', onClick: ClickedExample(), children: ['Next'] }, h),
  ],
}, h),`,
          `import * as ButtonGroup from '@/ui/button-group'`,
        ),
      },
      {
        title: 'As Link',
        description:
          'Use buttonLink for navigation so the rendered element retains link semantics.',
        preview: (_model, h) =>
          Button.buttonLink(
            { href: 'https://foldkit.dev', target: '_blank', children: ['Foldkit docs ↗'] },
            h,
          ),
        code: source(
          'As Link',
          `Button.buttonLink({
  href: 'https://foldkit.dev',
  target: '_blank',
  children: ['Foldkit docs ↗'],
}, h),`,
        ),
      },
      {
        title: 'RTL',
        description:
          'Direction comes from the surrounding document or region; the button requires no alternate state model.',
        preview: (_model, h) =>
          h.div(
            [h.Dir('rtl')],
            [Button.button({ onClick: clicked, children: ['التالي', '←'] }, h)],
          ),
        code: source(
          'RTL',
          `h.div([h.Dir('rtl')], [
  Button.button({ onClick: ClickedExample(), children: ['التالي', '←'] }, h),
]),`,
        ),
      },
    ],
  },
});
