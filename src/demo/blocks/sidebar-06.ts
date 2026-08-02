import { Match as M, Schema as S } from 'effect';
import { Command } from 'foldkit';
import { type Html, type HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';
import { evo } from 'foldkit/struct';

import * as Icon from '@/lib/icon';
import {
  breadcrumb,
  breadcrumbItem,
  breadcrumbLink,
  breadcrumbList,
  breadcrumbPage,
  breadcrumbSeparator,
} from '@/ui/breadcrumb';
import { button } from '@/ui/button';
import {
  card,
  cardContent,
  cardDescription,
  cardHeader,
  cardTitle,
} from '@/ui/card';
import * as DropdownMenu from '@/ui/dropdown-menu';
import { separator } from '@/ui/separator';
import {
  sidebar,
  sidebarContent,
  sidebarFooter,
  sidebarGroup,
  sidebarHeader,
  sidebarInset,
  sidebarInput,
  sidebarMenu,
  sidebarMenuButton,
  sidebarMenuButtonVariants,
  sidebarMenuItem,
  sidebarProvider,
  sidebarRail,
  sidebarTrigger,
} from '@/ui/sidebar';

type NavItem = Readonly<{
  title: string;
  url: string;
  isActive?: boolean;
}>;

type NavSection = Readonly<{
  title: string;
  url: string;
  items: ReadonlyArray<NavItem>;
}>;

// Sample data copied from the source block.
const data = {
  navMain: [
    {
      title: 'Getting Started',
      url: '#',
      items: [
        { title: 'Installation', url: '#' },
        { title: 'Project Structure', url: '#' },
      ],
    },
    {
      title: 'Build Your Application',
      url: '#',
      items: [
        { title: 'Routing', url: '#' },
        { title: 'Data Fetching', url: '#', isActive: true },
        { title: 'Rendering', url: '#' },
        { title: 'Caching', url: '#' },
        { title: 'Styling', url: '#' },
        { title: 'Optimizing', url: '#' },
        { title: 'Configuring', url: '#' },
        { title: 'Testing', url: '#' },
        { title: 'Authentication', url: '#' },
        { title: 'Deploying', url: '#' },
        { title: 'Upgrading', url: '#' },
        { title: 'Examples', url: '#' },
      ],
    },
    {
      title: 'API Reference',
      url: '#',
      items: [
        { title: 'Components', url: '#' },
        { title: 'File Conventions', url: '#' },
        { title: 'Functions', url: '#' },
        { title: 'next.config.js Options', url: '#' },
        { title: 'CLI', url: '#' },
        { title: 'Edge Runtime', url: '#' },
      ],
    },
    {
      title: 'Architecture',
      url: '#',
      items: [
        { title: 'Accessibility', url: '#' },
        { title: 'Fast Refresh', url: '#' },
        { title: 'Next.js Compiler', url: '#' },
        { title: 'Supported Browsers', url: '#' },
        { title: 'Turbopack', url: '#' },
      ],
    },
  ] satisfies ReadonlyArray<NavSection>,
};

const SectionMenu = DropdownMenu.create<string>();

// MODEL

export const Model = S.Struct({
  isSidebarOpen: S.Boolean,
  sectionMenus: S.Array(DropdownMenu.Model),
});
export type Model = typeof Model.Type;

// MESSAGE

export const ToggledSidebar = m('ToggledSidebar');
export const GotSectionMenuMessage = m('GotSectionMenuMessage', {
  index: S.Number,
  message: DropdownMenu.Message,
});

export const Message = S.Union([ToggledSidebar, GotSectionMenuMessage]);
export type Message = typeof Message.Type;

// INIT

export const init = (): Model => ({
  isSidebarOpen: true,
  sectionMenus: data.navMain.map((_, index) =>
    DropdownMenu.init({
      id: `sidebar-06-section-menu-${index}`,
      isAnimated: true,
    }),
  ),
});

// UPDATE

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>];

export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      ToggledSidebar: () => [
        evo(model, { isSidebarOpen: (current) => !current }),
        [],
      ],
      GotSectionMenuMessage: ({ index, message: childMessage }) => {
        const current = model.sectionMenus[index];

        if (current === undefined) {
          return [model, []];
        }

        const [next, commands] = SectionMenu.update(current, childMessage);

        return [
          evo(model, {
            sectionMenus: (menus) =>
              menus.map((menu, menuIndex) =>
                menuIndex === index ? next : menu,
              ),
          }),
          Command.mapMessages(commands, (nextMessage) =>
            GotSectionMenuMessage({
              index,
              message: nextMessage,
            }),
          ),
        ];
      },
    }),
  );

// VIEW

const navMain = (
  models: ReadonlyArray<DropdownMenu.Model>,
  h: HtmlBuilder<Message>,
): Html => {
  return sidebarGroup(
    {
      children: [
        sidebarMenu(
          {
            children: data.navMain.flatMap((item, index) => {
              const model = models[index];

              if (model === undefined) {
                return [];
              }

              return [
                sidebarMenuItem(
                  {
                    children: [
                      DropdownMenu.dropdownMenu<string, Message>(
                        {
                          model,
                          toParentMessage: (message) =>
                            GotSectionMenuMessage({ index, message }),
                          trigger: h.span(
                            [h.Class('contents')],
                            [
                              item.title,
                              Icon.moreHorizontal(
                                {
                                  class: 'ml-auto size-4 shrink-0',
                                },
                                h,
                              ),
                            ],
                          ),
                          triggerClass: sidebarMenuButtonVariants({
                            class:
                              'data-[open]:bg-sidebar-accent data-[open]:text-sidebar-accent-foreground',
                          }),
                          items: item.items.map((subItem) => subItem.title),
                          itemToConfig: (title) => ({ label: title }),
                          side: 'right',
                          align: 'start',
                          ariaLabel: `${item.title} submenu`,
                        },
                        h,
                      ),
                    ],
                  },
                  h,
                ),
              ];
            }),
          },
          h,
        ),
      ],
    },
    h,
  );
};

const sidebarOptInForm = (h: HtmlBuilder<Message>): Html => {
  return card(
    {
      class: 'gap-2 py-4 shadow-none',
      children: [
        cardHeader(
          {
            class: 'px-4',
            children: [
              cardTitle(
                {
                  class: 'text-sm',
                  children: ['Subscribe to our newsletter'],
                },
                h,
              ),
              cardDescription(
                {
                  children: [
                    'Opt-in to receive updates and news about the sidebar.',
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
        cardContent(
          {
            class: 'px-4',
            children: [
              h.form(
                [],
                [
                  h.div(
                    [h.Class('grid gap-2.5')],
                    [
                      sidebarInput(
                        {
                          type: 'email',
                          placeholder: 'Email',
                        },
                        h,
                      ),
                      button(
                        {
                          type: 'submit',
                          size: 'sm',
                          class:
                            'w-full bg-sidebar-primary text-sidebar-primary-foreground shadow-none',
                          children: ['Subscribe'],
                        },
                        h,
                      ),
                    ],
                  ),
                ],
              ),
            ],
          },
          h,
        ),
      ],
    },
    h,
  );
};

const appSidebar = (model: Model, h: HtmlBuilder<Message>): Html => {
  const state = model.isSidebarOpen ? 'expanded' : 'collapsed';

  return sidebar(
    {
      state,
      children: [
        sidebarHeader(
          {
            children: [
              sidebarMenu(
                {
                  children: [
                    sidebarMenuItem(
                      {
                        children: [
                          sidebarMenuButton(
                            {
                              size: 'lg',
                              href: '#',
                              children: [
                                h.div(
                                  [
                                    h.Class(
                                      'flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground',
                                    ),
                                  ],
                                  [
                                    Icon.icon(
                                      'gallery-vertical-end',
                                      { class: 'size-4' },
                                      h,
                                    ),
                                  ],
                                ),
                                h.div(
                                  [
                                    h.Class(
                                      'flex flex-col gap-0.5 leading-none',
                                    ),
                                  ],
                                  [
                                    h.span(
                                      [h.Class('font-medium')],
                                      ['Documentation'],
                                    ),
                                    h.span([], ['v1.0.0']),
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
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
        sidebarContent(
          {
            children: [navMain(model.sectionMenus, h)],
          },
          h,
        ),
        sidebarFooter(
          {
            children: [h.div([h.Class('p-1')], [sidebarOptInForm(h)])],
          },
          h,
        ),
        sidebarRail({ onClick: ToggledSidebar() }, h),
      ],
    },
    h,
  );
};

const pageContent = (h: HtmlBuilder<Message>): Html => {
  return sidebarInset(
    {
      children: [
        h.header(
          [h.Class('flex h-16 shrink-0 items-center gap-2 border-b px-4')],
          [
            sidebarTrigger(
              {
                onClick: ToggledSidebar(),
                class: '-ml-1',
              },
              h,
            ),
            separator(
              {
                orientation: 'vertical',
                class: 'mr-2 data-[orientation=vertical]:h-4',
              },
              h,
            ),
            breadcrumb(
              {
                children: [
                  breadcrumbList(
                    {
                      children: [
                        breadcrumbItem(
                          {
                            class: 'hidden md:block',
                            children: [
                              breadcrumbLink(
                                {
                                  href: '#',
                                  children: ['Build Your Application'],
                                },
                                h,
                              ),
                            ],
                          },
                          h,
                        ),
                        breadcrumbSeparator({ class: 'hidden md:block' }, h),
                        breadcrumbItem(
                          {
                            children: [
                              breadcrumbPage(
                                {
                                  children: ['Data Fetching'],
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
            ),
          ],
        ),
        h.div(
          [h.Class('flex flex-1 flex-col gap-4 p-4')],
          [
            h.div(
              [h.Class('grid auto-rows-min gap-4 md:grid-cols-3')],
              [
                h.div([h.Class('aspect-video rounded-xl bg-muted/50')], []),
                h.div([h.Class('aspect-video rounded-xl bg-muted/50')], []),
                h.div([h.Class('aspect-video rounded-xl bg-muted/50')], []),
              ],
            ),
            h.div(
              [
                h.Class(
                  'min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min',
                ),
              ],
              [],
            ),
          ],
        ),
      ],
    },
    h,
  );
};

export const view = (model: Model, h: HtmlBuilder<Message>): Html => {
  const state = model.isSidebarOpen ? 'expanded' : 'collapsed';

  return sidebarProvider<Message>(
    {
      state,
      children: [appSidebar(model, h), pageContent(h)],
    },
    h,
  );
};

/* Minimal interactive wiring:
   const model = init()
   const [nextModel, commands] = update(model, ToggledSidebar())
   view(nextModel)
*/
