import { Match as M, Option, Schema as S } from "effect";
import { Command } from "foldkit";
import * as CalendarDate from "foldkit/calendar";
import type { Html, HtmlBuilder } from "foldkit/html";
import { m } from "foldkit/message";
import { data as docs } from "@/demo/blocks/sidebar-01";
import { data as app } from "@/demo/blocks/sidebar-07";
import { data as mail } from "@/demo/blocks/sidebar-09";
import { data as workspace } from "@/demo/blocks/sidebar-10";
import { data as files } from "@/demo/blocks/sidebar-11";
import { data as settings } from "@/demo/blocks/sidebar-13";
import { badge } from "@/stylex/badge";
import { checkbox } from "@/stylex/checkbox";
import { button } from "@/stylex/button";
import * as Calendar from "@/stylex/calendar";
import * as Dialog from "@/stylex/dialog";
import * as Popover from "@/stylex/popover";
import { collapsible } from "@/stylex/collapsible";
import { input } from "@/stylex/input";
import { box, inline, stack, text } from "@/stylex/composition";
import { icon } from "@/stylex/composition/icon";
import {
  settingsLayout,
  blockCenter,
  blockHeader,
  blockLabel,
  blockPage,
  blockSkeleton,
  mailItem,
  mailPanel,
} from "@/stylex/composition/sidebar-block";
import * as Sidebar from "@/stylex/sidebar";

export const Model = S.Struct({
  isOpen: S.Boolean,
  isMobileOpen: S.Boolean,
  active: S.String,
  query: S.String,
  expanded: S.Record(S.String, S.Boolean),
  calendar: Calendar.Model,
  selectedDate: S.Option(CalendarDate.CalendarDate),
  dialog: Dialog.Model,
  popover: Popover.Model,
  submenus: S.Array(Popover.Model),
});
export type Model = typeof Model.Type;
export const ToggledSidebar = m("ToggledStyleXSidebar");
export const ToggledMobile = m("ToggledStyleXMobileSidebar");
export const SelectedItem = m("SelectedStyleXSidebarItem", { label: S.String });
export const ChangedSearch = m("ChangedStyleXSidebarSearch", {
  value: S.String,
});
export const ChangedGroup = m("ChangedStyleXSidebarGroup", {
  id: S.String,
  isOpen: S.Boolean,
});
export const GotCalendar = m("GotStyleXSidebarCalendar", {
  message: Calendar.Message,
});
export const GotDialog = m("GotStyleXSidebarDialog", {
  message: Dialog.Message,
});
export const OpenedDialog = m("OpenedStyleXSidebarDialog");
export const GotSubmenu = m("GotStyleXSidebarSubmenu", {
  index: S.Number,
  message: Popover.Message,
});
export const GotPopover = m("GotStyleXSidebarPopover", {
  message: Popover.Message,
});
export const Message = S.Union([
  ToggledSidebar,
  ToggledMobile,
  SelectedItem,
  ChangedSearch,
  ChangedGroup,
  GotCalendar,
  GotDialog,
  OpenedDialog,
  GotPopover,
  GotSubmenu,
]);
export type Message = typeof Message.Type;
export const init = (): Model => ({
  isOpen: true,
  isMobileOpen: false,
  active: "Data Fetching",
  query: "",
  expanded: {
    Playground: true,
    "Build Your Application": true,
    components: true,
    "components/ui": true,
  },
  calendar: Calendar.init({
    id: "stylex-sidebar-calendar",
    today: { year: 2024, month: 10, day: 15 },
  }),
  selectedDate: Option.none(),
  dialog: Dialog.init({
    id: "stylex-sidebar-settings",
    isOpen: false,
    isAnimated: true,
  }),
  submenus: docs.navMain.map((_, index) =>
    Popover.init({ id: "stylex-submenu-" + index }),
  ),
  popover: Popover.init({ id: "stylex-sidebar-popover" }),
});
type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>];
export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      ToggledStyleXSidebar: () => [{ ...model, isOpen: !model.isOpen }, []],
      ToggledStyleXMobileSidebar: () => [
        { ...model, isMobileOpen: !model.isMobileOpen },
        [],
      ],
      SelectedStyleXSidebarItem: ({ label }) => [
        { ...model, active: label },
        [],
      ],
      ChangedStyleXSidebarSearch: ({ value }) => [
        { ...model, query: value },
        [],
      ],
      ChangedStyleXSidebarGroup: ({ id, isOpen }) => [
        { ...model, expanded: { ...model.expanded, [id]: isOpen } },
        [],
      ],
      GotStyleXSidebarCalendar: ({ message: child }) => {
        const [calendar, commands, selection] = Calendar.update(
          model.calendar,
          child,
        );
        return [
          {
            ...model,
            calendar,
            selectedDate: Option.match(selection, {
              onNone: () => model.selectedDate,
              onSome: (s) =>
                s._tag === "SelectedDate"
                  ? Option.some(s.date)
                  : model.selectedDate,
            }),
          },
          Command.mapMessages(commands, (message) => GotCalendar({ message })),
        ];
      },
      GotStyleXSidebarDialog: ({ message: child }) => {
        const [dialog, commands] = Dialog.update(model.dialog, child);
        return [
          { ...model, dialog },
          Command.mapMessages(commands, (message) => GotDialog({ message })),
        ];
      },
      OpenedStyleXSidebarDialog: () => {
        const [dialog, commands] = Dialog.open(model.dialog);
        return [
          { ...model, dialog },
          Command.mapMessages(commands, (message) => GotDialog({ message })),
        ];
      },
      GotStyleXSidebarSubmenu: ({ index, message: child }) => {
        const current = model.submenus[index];
        if (current === undefined) return [model, []];
        const [popover, commands] = Popover.update(current, child);
        return [
          {
            ...model,
            submenus: model.submenus.map((p, i) => (i === index ? popover : p)),
          },
          Command.mapMessages(commands, (message) =>
            GotSubmenu({ index, message }),
          ),
        ];
      },
      GotStyleXSidebarPopover: ({ message: child }) => {
        const [popover, commands] = Popover.update(model.popover, child);
        return [
          { ...model, popover },
          Command.mapMessages(commands, (message) => GotPopover({ message })),
        ];
      },
    }),
  );

const item = (
  label: string,
  model: Model,
  h: HtmlBuilder<Message>,
  name?: string,
  collapsed = false,
): Html =>
  Sidebar.sidebarMenuItem(
    {
      children: [
        Sidebar.sidebarMenuButton(
          {
            children: [
              ...(name === undefined ? [] : [icon({ name }, h)]),
              ...(collapsed ? [] : [blockLabel(label, h)]),
            ],
            tooltip: label,
            isActive: model.active === label,
            onClick: SelectedItem({ label }),
          },
          h,
        ),
      ],
    },
    h,
  );
const subItems = (
  labels: ReadonlyArray<string>,
  model: Model,
  h: HtmlBuilder<Message>,
): Html =>
  Sidebar.sidebarMenuSub(
    {
      children: labels
        .filter((label) =>
          label.toLowerCase().includes(model.query.toLowerCase()),
        )
        .map((label) =>
          Sidebar.sidebarMenuSubItem(
            {
              children: [
                Sidebar.sidebarMenuSubButton(
                  {
                    children: [label],
                    href: "#",
                    isActive: model.active === label,
                    onClick: SelectedItem({ label }),
                  },
                  h,
                ),
              ],
            },
            h,
          ),
        ),
    },
    h,
  );
const group = (
  title: string,
  children: ReadonlyArray<Html>,
  h: HtmlBuilder<Message>,
): Html =>
  Sidebar.sidebarGroup(
    {
      children: [
        Sidebar.sidebarGroupLabel({ children: [title] }, h),
        Sidebar.sidebarMenu({ children }, h),
      ],
    },
    h,
  );
const expandable = (
  id: string,
  label: string,
  content: Html,
  model: Model,
  h: HtmlBuilder<Message>,
  initiallyOpen = false,
  name?: string,
): Html =>
  collapsible(
    {
      variant: "sidebar",
      id: "stylex-group-" + id.replaceAll(/[^a-z0-9]/gi, "-"),
      isOpen: model.expanded[id] ?? initiallyOpen,
      onToggle: (isOpen) => ChangedGroup({ id, isOpen }),
      trigger: inline(
        {
          align: "center",
          gap: "sm",
          children: [
            ...(name === undefined ? [] : [icon({ name }, h)]),
            blockLabel(label, h),
            icon(
              {
                name:
                  (model.expanded[id] ?? initiallyOpen)
                    ? "chevron-down"
                    : "chevron-right",
              },
              h,
            ),
          ],
        },
        h,
      ),
      content,
    },
    h,
  );
const user = (h: HtmlBuilder<Message>, collapsed: boolean): Html =>
  Sidebar.sidebarFooter(
    {
      children: [
        Sidebar.sidebarMenu(
          {
            children: [
              Sidebar.sidebarMenuItem(
                {
                  children: [
                    Sidebar.sidebarMenuButton(
                      {
                        children: [
                          badge({ children: ["CN"], variant: "secondary" }, h),
                          ...(collapsed
                            ? []
                            : [
                                stack(
                                  {
                                    gap: "none",
                                    children: [
                                      text(
                                        {
                                          children: ["shadcn"],
                                          variant: "label",
                                        },
                                        h,
                                      ),
                                      text(
                                        {
                                          children: ["m@example.com"],
                                          variant: "caption",
                                        },
                                        h,
                                      ),
                                    ],
                                  },
                                  h,
                                ),
                              ]),
                        ],
                        tooltip: "shadcn account",
                        size: "lg",
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
const brand = (
  label: string,
  detail: string,
  h: HtmlBuilder<Message>,
  collapsed: boolean,
): Html =>
  Sidebar.sidebarHeader(
    {
      children: [
        Sidebar.sidebarMenu(
          {
            children: [
              Sidebar.sidebarMenuItem(
                {
                  children: [
                    Sidebar.sidebarMenuButton(
                      {
                        children: [
                          collapsed
                            ? icon({ name: "gallery-vertical-end" }, h)
                            : badge(
                                {
                                  children: [
                                    icon({ name: "gallery-vertical-end" }, h),
                                  ],
                                },
                                h,
                              ),
                          ...(collapsed
                            ? []
                            : [
                                stack(
                                  {
                                    gap: "none",
                                    children: [
                                      text(
                                        { children: [label], variant: "label" },
                                        h,
                                      ),
                                      text(
                                        {
                                          children: [detail],
                                          variant: "caption",
                                        },
                                        h,
                                      ),
                                    ],
                                  },
                                  h,
                                ),
                              ]),
                        ],
                        size: "lg",
                        tooltip: label,
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
const search = (model: Model, h: HtmlBuilder<Message>): Html =>
  Sidebar.sidebarHeader(
    {
      children: [
        input(
          {
            id: "sidebar-search",
            label: "Search",
            value: model.query,
            onInput: (value) => ChangedSearch({ value }),
            placeholder: "Search the docs…",
          },
          h,
        ),
      ],
    },
    h,
  );

const documentation = (
  id: string,
  model: Model,
  h: HtmlBuilder<Message>,
): ReadonlyArray<Html> => [
  ...(id === "14"
    ? []
    : [
        brand(
          "Documentation",
          id === "01" || id === "02" ? "v1.0.1" : "v1.0.0",
          h,
          false,
        ),
      ]),
  ...(["01", "02", "05"].includes(id) ? [search(model, h)] : []),
  Sidebar.sidebarContent(
    {
      children: docs.navMain.map((g, index) => {
        const labels = g.items.map((i) => i.title);
        if (id === "02" || id === "05")
          return expandable(
            g.title,
            g.title,
            subItems(labels, model, h),
            model,
            h,
            id === "02",
          );
        if (id === "06") {
          const submenu = model.submenus[index];
          return submenu === undefined
            ? h.empty
            : Popover.popover(
                {
                  variant: "sidebar",
                  model: submenu,
                  toParentMessage: (message) => GotSubmenu({ index, message }),
                  trigger: inline(
                    {
                      width: "full",
                      align: "center",
                      justify: "between",
                      children: [
                        blockLabel(g.title, h),
                        icon({ name: "ellipsis" }, h),
                      ],
                    },
                    h,
                  ),
                  content: subItems(labels, model, h),
                  side: "right",
                  align: "start",
                },
                h,
              );
        }
        if (id === "01")
          return group(
            g.title,
            labels
              .filter((l) =>
                l.toLowerCase().includes(model.query.toLowerCase()),
              )
              .map((l) => item(l, model, h)),
            h,
          );
        return group(g.title, [subItems(labels, model, h)], h);
      }),
    },
    h,
  ),
  ...(id === "06"
    ? [
        Sidebar.sidebarFooter(
          {
            children: [
              box(
                {
                  surface: "card",
                  radius: "lg",
                  padding: "md",
                  children: [
                    stack(
                      {
                        gap: "sm",
                        children: [
                          text(
                            {
                              children: ["Subscribe to our newsletter"],
                              variant: "label",
                            },
                            h,
                          ),
                          text(
                            {
                              children: [
                                "Opt-in to receive updates and news about the sidebar.",
                              ],
                              tone: "secondary",
                            },
                            h,
                          ),
                          input(
                            {
                              id: "newsletter-email",
                              label: "Email",
                              value: model.query,
                              onInput: (value) => ChangedSearch({ value }),
                              placeholder: "Email",
                            },
                            h,
                          ),
                          button({ children: ["Subscribe"] }, h),
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
      ]
    : []),
];
const application = (
  id: string,
  model: Model,
  h: HtmlBuilder<Message>,
): ReadonlyArray<Html> => {
  const collapsed = !model.isOpen && !model.isMobileOpen;
  return [
    brand("Acme Inc", "Enterprise", h, collapsed),
    Sidebar.sidebarContent(
      {
        children: [
          ...(collapsed
            ? []
            : [Sidebar.sidebarGroupLabel({ children: ["Platform"] }, h)]),
          ...app.navMain.map((g) =>
            collapsed
              ? item(g.title, model, h, g.icon, true)
              : expandable(
                  g.title,
                  g.title,
                  subItems(
                    g.items.map((i) => i.title),
                    model,
                    h,
                  ),
                  model,
                  h,
                  false,
                  g.icon,
                ),
          ),
          ...(collapsed
            ? []
            : [
                group(
                  "Projects",
                  app.projects.map((p) => item(p.name, model, h, p.icon)),
                  h,
                ),
              ]),
          ...(["08", "16"].includes(id)
            ? [
                group(
                  "",
                  [
                    item("Support", model, h, "life-buoy", collapsed),
                    item("Feedback", model, h, "send", collapsed),
                  ],
                  h,
                ),
              ]
            : []),
        ],
      },
      h,
    ),
    user(h, collapsed),
  ];
};
const workspaceNav = (
  model: Model,
  h: HtmlBuilder<Message>,
): ReadonlyArray<Html> => [
  brand("Acme Inc", "Workspace", h, false),
  group(
    "",
    workspace.navMain.map((i) =>
      item(i.title, model, h, i.icon === "home" ? "house" : i.icon),
    ),
    h,
  ),
  Sidebar.sidebarContent(
    {
      children: [
        group(
          "Favorites",
          workspace.favorites.map((f) =>
            item(f.emoji + " " + f.name, model, h),
          ),
          h,
        ),
        group(
          "Workspaces",
          workspace.workspaces.map((w) =>
            expandable(
              w.name,
              w.emoji + " " + w.name,
              subItems(
                w.pages.map((p) => p.emoji + " " + p.name),
                model,
                h,
              ),
              model,
              h,
            ),
          ),
          h,
        ),
        group(
          "",
          workspace.navSecondary.map((i) => item(i.title, model, h, i.icon)),
          h,
        ),
      ],
    },
    h,
  ),
];
type TreeItem = string | ReadonlyArray<TreeItem>;
const tree = (
  entries: ReadonlyArray<TreeItem>,
  model: Model,
  h: HtmlBuilder<Message>,
  parent = "",
): Html =>
  Sidebar.sidebarMenu(
    {
      children: entries.map((entry) => {
        if (typeof entry === "string") return item(entry, model, h, "file");
        const [name, ...children] = entry;
        if (typeof name !== "string") return h.empty;
        const path = parent ? parent + "/" + name : name;
        return expandable(
          path,
          name,
          Sidebar.sidebarMenuSub(
            { children: [tree(children, model, h, path)] },
            h,
          ),
          model,
          h,
          false,
          "folder",
        );
      }),
    },
    h,
  );
const calendarNav = (
  model: Model,
  h: HtmlBuilder<Message>,
): ReadonlyArray<Html> => [
  user(h, false),
  Sidebar.sidebarContent(
    {
      children: [
        Calendar.calendar(
          {
            model: model.calendar,
            maybeSelectedDate: model.selectedDate,
            toParentMessage: (message) => GotCalendar({ message }),
          },
          h,
        ),
        group(
          "My Calendars",
          ["Personal", "Work", "Family"].map((label) =>
            Sidebar.sidebarMenuItem(
              {
                children: [
                  checkbox(
                    {
                      id: "calendar-" + label,
                      label,
                      isChecked:
                        model.expanded["calendar-" + label] ??
                        label !== "Family",
                      onToggle: (isOpen) =>
                        ChangedGroup({ id: "calendar-" + label, isOpen }),
                    },
                    h,
                  ),
                ],
              },
              h,
            ),
          ),
          h,
        ),
        group("Favorites", [], h),
        group("Other", [], h),
      ],
    },
    h,
  ),
  Sidebar.sidebarFooter(
    {
      children: [
        button(
          {
            children: ["New Calendar"],
            leadingIcon: icon({ name: "plus" }, h),
            variant: "ghost",
          },
          h,
        ),
      ],
    },
    h,
  ),
];
const trigger = (h: HtmlBuilder<Message>): Html =>
  Sidebar.sidebarTrigger(
    { onClick: ToggledSidebar(), onMobileClick: ToggledMobile() },
    h,
  );
const settingsContent = (model: Model, h: HtmlBuilder<Message>): Html =>
  settingsLayout(
    Sidebar.sidebar(
      {
        collapsible: "none",
        children: [
          Sidebar.sidebarContent(
            {
              children: [
                group(
                  "",
                  settings.nav.map((i) => item(i.name, model, h, i.icon)),
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
    [
      blockHeader(
        [
          text({ children: ["Settings"], tone: "secondary" }, h),
          text(
            {
              children: [
                model.active === "Data Fetching"
                  ? "Messages & media"
                  : model.active,
              ],
            },
            h,
          ),
        ],
        false,
        h,
      ),
      blockSkeleton("document", h),
    ],
    h,
  );

export const view = (
  model: Model,
  id: string,
  h: HtmlBuilder<Message>,
): Html => {
  if (id === "13")
    return blockCenter(
      [
        button({ children: ["Open Dialog"], onClick: OpenedDialog() }, h),
        Dialog.dialog(
          {
            size: "settings",
            model: model.dialog,
            toParentMessage: (message) => GotDialog({ message }),
            title: "Settings",
            description: "Customize your settings here.",
            content: () => [settingsContent(model, h)],
          },
          h,
        ),
      ],
      h,
      OpenedDialog(),
    );
  const state = model.isOpen ? "expanded" : "collapsed";
  const isApp = ["07", "08", "16"].includes(id);
  const title =
    id === "09"
      ? "Inbox"
      : id === "11"
        ? "button.tsx"
        : id === "12"
          ? "October 2024"
          : id === "10" || id === "15"
            ? "Project Management & Task Tracking"
            : model.active;
  const navigation =
    id === "09"
      ? [
          brand("Acme Inc", "Enterprise", h, !model.isMobileOpen),
          Sidebar.sidebarContent(
            {
              children: [
                Sidebar.sidebarMenu(
                  {
                    children: mail.navMain.map((i) =>
                      item(i.title, model, h, i.icon, !model.isMobileOpen),
                    ),
                  },
                  h,
                ),
              ],
            },
            h,
          ),
          user(h, !model.isMobileOpen),
        ]
      : id === "11"
        ? [
            Sidebar.sidebarContent(
              {
                children: [
                  group(
                    "Changes",
                    files.changes.map((c) =>
                      item(c.file + " " + c.state, model, h, "file"),
                    ),
                    h,
                  ),
                  group("Files", [tree(files.tree, model, h)], h),
                ],
              },
              h,
            ),
          ]
        : id === "12"
          ? calendarNav(model, h)
          : id === "10" || id === "15"
            ? workspaceNav(model, h)
            : isApp
              ? application(id, model, h)
              : documentation(id, model, h);
  const nav = Sidebar.sidebar(
    {
      state,
      belowHeader: id === "16",
      side: id === "14" ? "right" : "left",
      variant: id === "04" ? "floating" : id === "08" ? "inset" : "sidebar",
      collapsible: isApp || id === "09" ? "icon" : "offcanvas",
      isMobileOpen: model.isMobileOpen,
      onMobileDismiss: ToggledMobile(),
      children: navigation,
    },
    h,
  );
  const main = Sidebar.sidebarInset(
    {
      variant: id === "08" ? "inset" : "sidebar",
      state,
      children: [
        ...(id === "16"
          ? []
          : [
              blockHeader(
                [
                  ...(id === "14" ? [] : [trigger(h)]),
                  box(
                    {
                      visibility: "desktop",
                      children: [
                        text(
                          {
                            children: [
                              id === "09"
                                ? "All Inboxes"
                                : id === "11"
                                  ? "components › ui"
                                  : "Build Your Application",
                            ],
                            tone: "secondary",
                          },
                          h,
                        ),
                      ],
                    },
                    h,
                  ),
                  text({ children: [title], variant: "label" }, h),
                  ...(id === "14" ? [trigger(h)] : []),
                  ...(id === "10"
                    ? [
                        Popover.popover(
                          {
                            model: model.popover,
                            toParentMessage: (message) =>
                              GotPopover({ message }),
                            trigger: icon(
                              { ariaLabel: "Page actions", name: "ellipsis" },
                              h,
                            ),
                            content: Sidebar.sidebar(
                              {
                                collapsible: "none",
                                children: documentation("03", model, h),
                              },
                              h,
                            ),
                            align: "end",
                          },
                          h,
                        ),
                      ]
                    : []),
                ],
                false,
                h,
              ),
            ]),
        blockSkeleton(
          id === "02" || id === "09"
            ? "rows"
            : id === "12"
              ? "calendar"
              : id === "10" || id === "15"
                ? "document"
                : "cards",
          h,
        ),
      ],
    },
    h,
  );
  const sideMail =
    id === "09" && model.isOpen
      ? [
          mailPanel(
            [
              search(model, h),
              ...mail.mails
                .filter((m) =>
                  (m.name + " " + m.subject)
                    .toLowerCase()
                    .includes(model.query.toLowerCase()),
                )
                .map((m) =>
                  mailItem(
                    [
                      inline(
                        {
                          justify: "between",
                          children: [
                            text({ children: [m.name], variant: "label" }, h),
                            text({ children: [m.date], variant: "caption" }, h),
                          ],
                        },
                        h,
                      ),
                      text({ children: [m.subject], variant: "label" }, h),
                      text({ children: [m.teaser], variant: "caption" }, h),
                    ],
                    SelectedItem({ label: m.subject }),
                    h,
                  ),
                ),
            ],
            h,
          ),
        ]
      : [];
  const right =
    id === "15"
      ? [
          Sidebar.sidebar(
            {
              side: "right",
              collapsible: "offcanvas",
              children: calendarNav(model, h),
            },
            h,
          ),
        ]
      : [];
  return blockPage(
    [
      ...(id === "16"
        ? [
            blockHeader(
              [
                trigger(h),
                text(
                  {
                    children: ["Build Your Application › Data Fetching"],
                    variant: "label",
                  },
                  h,
                ),
              ],
              true,
              h,
            ),
          ]
        : []),
      Sidebar.sidebarProvider(
        {
          state,
          belowHeader: id === "16",
          ...(id === "09" ? { width: "3rem" } : {}),
          children:
            id === "14" ? [main, nav] : [nav, ...sideMail, main, ...right],
        },
        h,
      ),
    ],
    h,
  );
};
