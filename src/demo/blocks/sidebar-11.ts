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
import * as Collapsible from '@/ui/collapsible';
import { separator } from '@/ui/separator';
import {
  sidebar,
  sidebarContent,
  sidebarGroup,
  sidebarGroupContent,
  sidebarGroupLabel,
  sidebarInset,
  sidebarMenu,
  sidebarMenuBadge,
  sidebarMenuButton,
  sidebarMenuButtonVariants,
  sidebarMenuItem,
  sidebarMenuSub,
  sidebarProvider,
  sidebarRail,
  sidebarTrigger,
} from '@/ui/sidebar';

type Change = Readonly<{
  file: string;
  state: string;
}>;

type TreeItem = string | ReadonlyArray<TreeItem>;

const data = {
  changes: [
    { file: 'README.md', state: 'M' },
    { file: 'api/hello/route.ts', state: 'U' },
    { file: 'app/layout.tsx', state: 'M' },
  ] satisfies ReadonlyArray<Change>,
  tree: [
    [
      'app',
      [
        'api',
        ['hello', ['route.ts']],
        'page.tsx',
        'layout.tsx',
        ['blog', ['page.tsx']],
      ],
    ],
    [
      'components',
      ['ui', 'button.tsx', 'card.tsx'],
      'header.tsx',
      'footer.tsx',
    ],
    ['lib', ['util.ts']],
    ['public', 'favicon.ico', 'vercel.svg'],
    '.eslintrc.json',
    '.gitignore',
    'next.config.js',
    'tailwind.config.js',
    'package.json',
    'README.md',
  ] satisfies ReadonlyArray<TreeItem>,
};

type FolderEntry = Readonly<{
  path: string;
  isOpen: boolean;
}>;

const folderEntries = (
  items: ReadonlyArray<TreeItem>,
  parentPath = '',
): ReadonlyArray<FolderEntry> =>
  items.flatMap((item) => {
    if (typeof item === 'string') {
      return [];
    }

    const [name, ...children] = item;

    if (typeof name !== 'string' || children.length === 0) {
      return [];
    }

    const path = parentPath === '' ? name : `${parentPath}/${name}`;

    return [
      {
        path,
        isOpen: name === 'components' || name === 'ui',
      },
      ...folderEntries(children, path),
    ];
  });

// MODEL

export const Model = S.Struct({
  isSidebarOpen: S.Boolean,
  folders: S.Record(S.String, S.Boolean),
});
export type Model = typeof Model.Type;

// MESSAGE

export const ToggledSidebar = m('ToggledSidebar');
export const ToggledFolder = m('ToggledFolder', {
  path: S.String,
  isOpen: S.Boolean,
});

export const Message = S.Union([ToggledSidebar, ToggledFolder]);
export type Message = typeof Message.Type;

// INIT

export const init = (): Model => ({
  isSidebarOpen: true,
  folders: folderEntries(data.tree).reduce<Readonly<Record<string, boolean>>>(
    (models, entry) => ({
      ...models,
      [entry.path]: entry.isOpen,
    }),
    {},
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
      ToggledFolder: ({ path, isOpen }) => {
        if (model.folders[path] === undefined) {
          return [model, []];
        }
        return [
          evo(model, {
            folders: (folders) => ({
              ...folders,
              [path]: isOpen,
            }),
          }),
          [],
        ];
      },
    }),
  );

// VIEW

const treeItem = (
  item: TreeItem,
  parentPath: string,
  folders: Readonly<Record<string, boolean>>,
  h: HtmlBuilder<Message>,
): Html => {
  const parts = typeof item === 'string' ? [item] : item;
  const [name, ...children] = parts;

  if (typeof name !== 'string') {
    return h.div([], []);
  }

  if (children.length === 0) {
    return sidebarMenuButton(
      {
        isActive: name === 'button.tsx',
        class: 'data-[active]:bg-transparent',
        children: [Icon.icon('file', {}, h), name],
      },
      h,
    );
  }

  const path = parentPath === '' ? name : `${parentPath}/${name}`;
  const isOpen = folders[path];

  if (isOpen === undefined) {
    return h.div([], []);
  }

  return sidebarMenuItem(
    {
      children: [
        Collapsible.collapsible(
          {
            id: `sidebar-11-tree-${path.replace(/[/.]/g, '-')}`,
            isOpen,
            onToggle: (nextIsOpen) =>
              ToggledFolder({ path, isOpen: nextIsOpen }),
            class: 'group/collapsible',
            triggerClass: sidebarMenuButtonVariants(),
            trigger: h.span(
              [h.Class('contents')],
              [
                Icon.chevronRight(
                  {
                    class: `size-4 shrink-0 transition-transform${
                      isOpen ? ' rotate-90' : ''
                    }`,
                  },
                  h,
                ),
                Icon.icon('folder', { class: 'size-4 shrink-0' }, h),
                name,
              ],
            ),
            content: sidebarMenuSub(
              {
                children: children.map((child) =>
                  treeItem(child, path, folders, h),
                ),
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
};

const changes = (h: HtmlBuilder<Message>): Html => {
  return sidebarGroup(
    {
      children: [
        sidebarGroupLabel({ children: ['Changes'] }, h),
        sidebarGroupContent(
          {
            children: [
              sidebarMenu(
                {
                  children: data.changes.map((item) =>
                    sidebarMenuItem(
                      {
                        children: [
                          sidebarMenuButton(
                            {
                              children: [Icon.icon('file', {}, h), item.file],
                            },
                            h,
                          ),
                          sidebarMenuBadge({ children: [item.state] }, h),
                        ],
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
        ),
      ],
    },
    h,
  );
};

const files = (
  folders: Readonly<Record<string, boolean>>,
  h: HtmlBuilder<Message>,
): Html =>
  sidebarGroup<Message>(
    {
      children: [
        sidebarGroupLabel({ children: ['Files'] }, h),
        sidebarGroupContent(
          {
            children: [
              sidebarMenu(
                {
                  children: data.tree.map((item) =>
                    treeItem(item, '', folders, h),
                  ),
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

const appSidebar = (model: Model, h: HtmlBuilder<Message>): Html => {
  const state = model.isSidebarOpen ? 'expanded' : 'collapsed';

  return sidebar<Message>(
    {
      state,
      children: [
        sidebarContent(
          {
            children: [changes(h), files(model.folders, h)],
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
                                  children: ['components'],
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
                            class: 'hidden md:block',
                            children: [
                              breadcrumbLink(
                                {
                                  href: '#',
                                  children: ['ui'],
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
                                  children: ['button.tsx'],
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
