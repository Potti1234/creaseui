import { UiSchema, type View } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { DropdownMenu, Icon, Menubar } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

type ItemSpec = Readonly<{
  id: string
  label: string
  keys?: string
  disabled?: boolean
  inset?: boolean
  kind?: 'checkbox' | 'radio'
  icon?: string
  destructive?: boolean
  separatorBefore?: boolean
  submenu?: ReadonlyArray<ItemSpec>
}>
type MenuSpec = Readonly<{
  target: string
  label: string
  contentWidth?: '11rem' | '16rem'
  items: ReadonlyArray<ItemSpec>
}>
type Kind = 'demo' | 'checkbox' | 'radio' | 'submenu' | 'icons' | 'rtl'

const specs: Record<Kind, ReadonlyArray<MenuSpec>> = {
  demo: [
    {
      target: 'file',
      label: 'File',
      items: [
        {
          id: 'new-tab',
          label: 'New Tab',
          keys: 'mod+T',
        },
        {
          id: 'new-window',
          label: 'New Window',
          keys: 'mod+N',
        },
        {
          id: 'new-incognito',
          label: 'New Incognito Window',
          disabled: true,
        },
        {
          id: 'share',
          label: 'Share',
          separatorBefore: true,
          submenu: [
            {
              id: 'email-link',
              label: 'Email link',
            },
            {
              id: 'messages',
              label: 'Messages',
            },
            {
              id: 'notes',
              label: 'Notes',
            },
          ],
        },
        {
          id: 'print',
          label: 'Print...',
          keys: 'mod+P',
          separatorBefore: true,
        },
      ],
    },
    {
      target: 'edit',
      label: 'Edit',
      items: [
        {
          id: 'undo',
          label: 'Undo',
          keys: 'mod+Z',
        },
        {
          id: 'redo',
          label: 'Redo',
          keys: 'shift+mod+Z',
        },
        {
          id: 'find',
          label: 'Find',
          separatorBefore: true,
          submenu: [
            {
              id: 'search-the-web',
              label: 'Search the web',
            },
            {
              id: 'find-item',
              label: 'Find...',
              separatorBefore: true,
            },
            {
              id: 'find-next',
              label: 'Find Next',
            },
            {
              id: 'find-previous',
              label: 'Find Previous',
            },
          ],
        },
        {
          id: 'cut',
          label: 'Cut',
          separatorBefore: true,
        },
        {
          id: 'copy',
          label: 'Copy',
        },
        {
          id: 'paste',
          label: 'Paste',
        },
      ],
    },
    {
      target: 'view',
      label: 'View',
      contentWidth: '11rem',
      items: [
        {
          id: 'bookmarks-bar',
          label: 'Bookmarks Bar',
          kind: 'checkbox',
        },
        {
          id: 'full-urls',
          label: 'Full URLs',
          kind: 'checkbox',
        },
        {
          id: 'reload',
          label: 'Reload',
          keys: 'mod+R',
          inset: true,
          separatorBefore: true,
        },
        {
          id: 'force-reload',
          label: 'Force Reload',
          keys: 'shift+mod+R',
          inset: true,
          disabled: true,
        },
        {
          id: 'toggle-fullscreen',
          label: 'Toggle Fullscreen',
          inset: true,
          separatorBefore: true,
        },
        {
          id: 'hide-sidebar',
          label: 'Hide Sidebar',
          inset: true,
          separatorBefore: true,
        },
      ],
    },
    {
      target: 'profiles',
      label: 'Profiles',
      items: [
        {
          id: 'andy',
          label: 'Andy',
          kind: 'radio',
        },
        {
          id: 'benoit',
          label: 'Benoit',
          kind: 'radio',
        },
        {
          id: 'luis',
          label: 'Luis',
          kind: 'radio',
        },
        {
          id: 'edit-profile',
          label: 'Edit...',
          inset: true,
          separatorBefore: true,
        },
        {
          id: 'add-profile',
          label: 'Add Profile...',
          inset: true,
          separatorBefore: true,
        },
      ],
    },
  ],
  rtl: [
    {
      target: 'file',
      label: 'ملف',
      items: [
        {
          id: 'new-tab',
          label: 'علامة تبويب جديدة',
          keys: 'mod+T',
        },
        {
          id: 'new-window',
          label: 'نافذة جديدة',
          keys: 'mod+N',
        },
        {
          id: 'new-incognito',
          label: 'نافذة التصفح المتخفي الجديدة',
          disabled: true,
        },
        {
          id: 'share',
          label: 'مشاركة',
          separatorBefore: true,
          submenu: [
            {
              id: 'email-link',
              label: 'رابط البريد الإلكتروني',
            },
            {
              id: 'messages',
              label: 'الرسائل',
            },
            {
              id: 'notes',
              label: 'الملاحظات',
            },
          ],
        },
        {
          id: 'print',
          label: 'طباعة...',
          keys: 'mod+P',
          separatorBefore: true,
        },
      ],
    },
    {
      target: 'edit',
      label: 'تعديل',
      items: [
        {
          id: 'undo',
          label: 'تراجع',
          keys: 'mod+Z',
        },
        {
          id: 'redo',
          label: 'إعادة',
          keys: 'shift+mod+Z',
        },
        {
          id: 'find',
          label: 'بحث',
          separatorBefore: true,
          submenu: [
            {
              id: 'search-the-web',
              label: 'البحث على الويب',
            },
            {
              id: 'find-item',
              label: 'بحث...',
              separatorBefore: true,
            },
            {
              id: 'find-next',
              label: 'البحث التالي',
            },
            {
              id: 'find-previous',
              label: 'البحث السابق',
            },
          ],
        },
        {
          id: 'cut',
          label: 'قص',
          separatorBefore: true,
        },
        {
          id: 'copy',
          label: 'نسخ',
        },
        {
          id: 'paste',
          label: 'لصق',
        },
      ],
    },
    {
      target: 'view',
      label: 'عرض',
      contentWidth: '11rem',
      items: [
        {
          id: 'bookmarks-bar',
          label: 'شريط الإشارات المرجعية',
          kind: 'checkbox',
        },
        {
          id: 'full-urls',
          label: 'عناوين URL الكاملة',
          kind: 'checkbox',
        },
        {
          id: 'reload',
          label: 'إعادة تحميل',
          keys: 'mod+R',
          inset: true,
          separatorBefore: true,
        },
        {
          id: 'force-reload',
          label: 'إعادة تحميل قسري',
          keys: 'shift+mod+R',
          inset: true,
          disabled: true,
        },
        {
          id: 'toggle-fullscreen',
          label: 'تبديل وضع ملء الشاشة',
          inset: true,
          separatorBefore: true,
        },
        {
          id: 'hide-sidebar',
          label: 'إخفاء الشريط الجانبي',
          inset: true,
          separatorBefore: true,
        },
      ],
    },
    {
      target: 'profiles',
      label: 'الملفات الشخصية',
      items: [
        {
          id: 'andy',
          label: 'Andy',
          kind: 'radio',
        },
        {
          id: 'benoit',
          label: 'Benoit',
          kind: 'radio',
        },
        {
          id: 'luis',
          label: 'Luis',
          kind: 'radio',
        },
        {
          id: 'edit-profile',
          label: 'تعديل...',
          inset: true,
          separatorBefore: true,
        },
        {
          id: 'add-profile',
          label: 'إضافة ملف شخصي...',
          inset: true,
          separatorBefore: true,
        },
      ],
    },
  ],
  checkbox: [
    {
      target: 'view',
      label: 'View',
      contentWidth: '16rem',
      items: [
        {
          id: 'bookmarks-bar',
          label: 'Always Show Bookmarks Bar',
          kind: 'checkbox',
        },
        {
          id: 'full-urls',
          label: 'Always Show Full URLs',
          kind: 'checkbox',
        },
        {
          id: 'reload',
          label: 'Reload',
          keys: 'mod+R',
          inset: true,
          separatorBefore: true,
        },
        {
          id: 'force-reload',
          label: 'Force Reload',
          keys: 'shift+mod+R',
          inset: true,
          disabled: true,
        },
      ],
    },
    {
      target: 'format',
      label: 'Format',
      items: [
        {
          id: 'strikethrough',
          label: 'Strikethrough',
          kind: 'checkbox',
        },
        {
          id: 'code',
          label: 'Code',
          kind: 'checkbox',
        },
        {
          id: 'superscript',
          label: 'Superscript',
          kind: 'checkbox',
        },
      ],
    },
  ],
  radio: [
    {
      target: 'profiles',
      label: 'Profiles',
      items: [
        {
          id: 'andy',
          label: 'Andy',
          kind: 'radio',
        },
        {
          id: 'benoit',
          label: 'Benoit',
          kind: 'radio',
        },
        {
          id: 'luis',
          label: 'Luis',
          kind: 'radio',
        },
        {
          id: 'edit-profile',
          label: 'Edit...',
          inset: true,
          separatorBefore: true,
        },
        {
          id: 'add-profile',
          label: 'Add Profile...',
          inset: true,
          separatorBefore: true,
        },
      ],
    },
    {
      target: 'theme',
      label: 'Theme',
      items: [
        {
          id: 'light',
          label: 'Light',
          kind: 'radio',
        },
        {
          id: 'dark',
          label: 'Dark',
          kind: 'radio',
        },
        {
          id: 'system',
          label: 'System',
          kind: 'radio',
        },
      ],
    },
  ],
  submenu: [
    {
      target: 'file',
      label: 'File',
      items: [
        {
          id: 'share',
          label: 'Share',
          submenu: [
            {
              id: 'email-link',
              label: 'Email link',
            },
            {
              id: 'messages',
              label: 'Messages',
            },
            {
              id: 'notes',
              label: 'Notes',
            },
          ],
        },
        {
          id: 'print',
          label: 'Print...',
          keys: 'mod+P',
          separatorBefore: true,
        },
      ],
    },
    {
      target: 'edit',
      label: 'Edit',
      items: [
        {
          id: 'undo',
          label: 'Undo',
          keys: 'mod+Z',
        },
        {
          id: 'redo',
          label: 'Redo',
          keys: 'shift+mod+Z',
        },
        {
          id: 'find',
          label: 'Find',
          separatorBefore: true,
          submenu: [
            {
              id: 'find-item',
              label: 'Find...',
            },
            {
              id: 'find-next',
              label: 'Find Next',
            },
            {
              id: 'find-previous',
              label: 'Find Previous',
            },
          ],
        },
        {
          id: 'cut',
          label: 'Cut',
          separatorBefore: true,
        },
        {
          id: 'copy',
          label: 'Copy',
        },
        {
          id: 'paste',
          label: 'Paste',
        },
      ],
    },
  ],
  icons: [
    {
      target: 'file',
      label: 'File',
      items: [
        {
          id: 'new-file',
          label: 'New File',
          icon: 'file',
          keys: 'mod+N',
        },
        {
          id: 'open-folder',
          label: 'Open Folder',
          icon: 'folder',
        },
        {
          id: 'save',
          label: 'Save',
          icon: 'save',
          keys: 'mod+S',
          separatorBefore: true,
        },
      ],
    },
    {
      target: 'more',
      label: 'More',
      items: [
        {
          id: 'settings',
          label: 'Settings',
          icon: 'settings',
        },
        {
          id: 'help',
          label: 'Help',
          icon: 'circle-question-mark',
        },
        {
          id: 'delete',
          label: 'Delete',
          icon: 'trash',
          destructive: true,
          separatorBefore: true,
        },
      ],
    },
  ],
}

const keyNames: Readonly<Record<string, string>> = {
  alt: 'Alt',
  option: 'Alt',
  opt: 'Alt',
  shift: 'Shift',
  ctrl: 'Control',
  control: 'Control',
  cmd: 'Meta',
  command: 'Meta',
  meta: 'Meta',
  backspace: 'Backspace',
  delete: 'Delete',
  del: 'Delete',
  enter: 'Enter',
  return: 'Enter',
  escape: 'Escape',
  esc: 'Escape',
  tab: 'Tab',
  space: 'Space',
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  arrowup: 'ArrowUp',
  arrowdown: 'ArrowDown',
  arrowleft: 'ArrowLeft',
  arrowright: 'ArrowRight',
  home: 'Home',
  end: 'End',
  pageup: 'PageUp',
  pagedown: 'PageDown',
}
const glyphs: Readonly<Record<string, string>> = {
  Meta: '⌘',
  Control: '⌃',
  Alt: '⌥',
  Shift: '⇧',
  Backspace: '⌫',
  Delete: '⌦',
  Enter: '↩',
  Escape: '⎋',
  Tab: '⇥',
  Space: '␣',
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  PageUp: '⇞',
  PageDown: '⇟',
  Home: '↖',
  End: '↘',
}
const names: Readonly<Record<string, string>> = {
  Control: 'Ctrl',
  Delete: 'Del',
  Escape: 'Esc',
  ArrowUp: 'Up',
  ArrowDown: 'Down',
  ArrowLeft: 'Left',
  ArrowRight: 'Right',
}
const currentPlatform = (): 'apple' | 'other' =>
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad|iPod/u.test(navigator.platform || navigator.userAgent)
    ? 'apple'
    : 'other'
const toAriaKeyshortcuts = (
  keys: string,
  platform: 'apple' | 'other',
): string =>
  keys
    .split('+')
    .map(key =>
      key.toLowerCase() === 'mod'
        ? platform === 'apple'
          ? 'Meta'
          : 'Control'
        : (keyNames[key.toLowerCase()] ??
          (key.length === 1
            ? key.toUpperCase()
            : key.charAt(0).toUpperCase() + key.slice(1))),
    )
    .join('+')
const formatShortcut = (keys: string): string => {
  const platform = currentPlatform()
  return `\u2066${toAriaKeyshortcuts(keys, platform)
    .split('+')
    .map(key => (platform === 'apple' ? glyphs[key] : names[key]) ?? key)
    .join(platform === 'apple' ? '' : '+')}\u2069`
}

const checkboxIds = new Set([
  'bookmarks-bar',
  'full-urls',
  'strikethrough',
  'code',
  'superscript',
])
const radioField = (value: string): 'user' | 'theme' | undefined =>
  ['andy', 'benoit', 'luis'].includes(value)
    ? 'user'
    : ['light', 'dark', 'system'].includes(value)
      ? 'theme'
      : undefined

const Message = UiSchema.TaggedEnum({
  RequestedOpenMenubar: { menu: Schema.String },
  RequestedCloseMenubar: {},
  RequestedOpenSubmenu: { value: Schema.String },
  RequestedCloseSubmenu: {},
  PickedMenuItem: { value: Schema.String },
})

const MenubarDemo = Html.component({
  name: 'DocsMenubarDemo',
  props: Schema.Struct({
    idPrefix: Schema.String,
    kind: Schema.Literals([
      'demo',
      'checkbox',
      'radio',
      'submenu',
      'icons',
      'rtl',
    ]),
  }),
  model: Schema.Struct({
    openMenu: Schema.NullOr(Schema.String),
    selectedMenu: Schema.NullOr(Schema.String),
    openSubmenu: Schema.NullOr(Schema.String),
    checkedValues: Schema.Array(Schema.String),
    radioUser: Schema.String,
    radioTheme: Schema.String,
  }),
  message: Message,
}).make({
  init: () => ({
    openMenu: null,
    selectedMenu: null,
    openSubmenu: null,
    checkedValues: ['full-urls', 'strikethrough'],
    radioUser: 'benoit',
    radioTheme: 'system',
  }),
  update: {
    RequestedOpenMenubar: ($, { menu }) =>
      $.evolve({ openMenu: menu, selectedMenu: menu, openSubmenu: null }),
    RequestedCloseMenubar: $ => $.evolve({ openMenu: null, openSubmenu: null }),
    RequestedOpenSubmenu: ($, { value }) => $.evolve({ openSubmenu: value }),
    RequestedCloseSubmenu: $ => $.evolve({ openSubmenu: null }),
    PickedMenuItem: ($, { value }) => {
      if (checkboxIds.has(value))
        return $.evolve({
          checkedValues: $.model.checkedValues.includes(value)
            ? $.model.checkedValues.filter(entry => entry !== value)
            : [...$.model.checkedValues, value],
        })
      const field = radioField(value)
      if (field === 'user') return $.evolve({ radioUser: value })
      if (field === 'theme') return $.evolve({ radioTheme: value })
      return $.model
    },
  },
  view: (h, model) => {
    const menus = specs[h.props.kind]
    const appearance = (
      menu: MenuSpec,
      spec: ItemSpec | undefined,
    ): Record<string, unknown> => {
      if (spec === undefined) return {}
      const base = {
        ...(spec.icon === undefined
          ? {}
          : { icon: Icon(h, { name: spec.icon as never, size: 'sm' }) }),
        ...(spec.keys === undefined
          ? {}
          : { keys: spec.keys, shortcut: formatShortcut(spec.keys) }),
        ...(spec.inset === true || spec.kind !== undefined
          ? { inset: true }
          : {}),
        ...(spec.destructive === true ? { tone: 'destructive' as const } : {}),
        ...(spec.separatorBefore === true ? { separatorBefore: true } : {}),
      }
      if (spec.kind === 'checkbox')
        return {
          ...base,
          kind: 'checkbox' as const,
          checked: model.checkedValues.includes(spec.id),
          closeOnClick: false,
        }
      if (spec.kind === 'radio')
        return {
          ...base,
          kind: 'radio' as const,
          selectedValue:
            radioField(spec.id) === 'user' ? model.radioUser : model.radioTheme,
          closeOnClick: false,
        }
      if (spec.submenu !== undefined)
        return {
          ...base,
          kind: 'submenu' as const,
          render: (item: { value: string }, parentMenu: never) =>
            DropdownMenu(h, {
              key: `${h.props.idPrefix}-${menu.target}-${item.value}-submenu`,
              label: spec.label,
              submenuTrigger: h.div.children(
                spec.icon === undefined
                  ? undefined
                  : Icon(h, { name: spec.icon as never, size: 'sm' }),
                spec.label,
                Icon(h, {
                  name: 'chevron-right',
                  size: 'sm',
                  className: 'ml-auto size-4',
                }),
              ),
              parentMenu,
              props: {
                open: model.openSubmenu === spec.id,
                parentItem: item.value,
                items: (spec.submenu ?? []).map(child => ({
                  value: child.id,
                  label: child.label,
                  ...(child.disabled === undefined
                    ? {}
                    : { disabled: child.disabled }),
                })),
              },
              decorateItem: ({ value }) =>
                appearance(
                  menu,
                  spec.submenu?.find(child => child.id === value),
                ) as never,
              onEmit: {
                RequestedOpen: () =>
                  Message.RequestedOpenSubmenu({ value: spec.id }),
                RequestedClose: () => Message.RequestedCloseSubmenu(),
                Picked: ({ value }) => Message.PickedMenuItem({ value }),
                Highlighted: () => undefined,
                RequestedQuery: () => undefined,
                Settled: () => undefined,
              },
            }),
        }
      return base
    }
    return h.div.class('flex flex-col items-center').children(
      Menubar(h, {
        key: `${h.props.idPrefix}-menubar`,
        label: 'Application menu',
        className: 'w-72',
        ...(h.props.kind === 'rtl' ? { direction: 'rtl' as const } : {}),
        openMenu: model.openMenu,
        onOpenChange: menu =>
          menu === null
            ? Message.RequestedCloseMenubar()
            : Message.RequestedOpenMenubar({ menu }),
        onPick: value => Message.PickedMenuItem({ value }),
        menus: menus.map(menu => ({
          id: menu.target,
          label: menu.label,
          selected: model.selectedMenu === menu.target,
          accessibleLabel: `${menu.label} menu`,
          items: menu.items.map(item => ({
            value: item.id,
            label: item.label,
            ...(item.disabled === undefined ? {} : { disabled: item.disabled }),
          })),
          ...(menu.contentWidth === undefined
            ? {}
            : {
                popupClassName: menu.contentWidth === '11rem' ? 'w-44' : 'w-64',
              }),
          decorateItem: ({ value }) =>
            appearance(
              menu,
              menu.items.find(item => item.id === value),
            ) as never,
        })),
      }),
    )
  },
})

const example =
  (kind: Kind): DocsExampleImplementation['view'] =>
  (h, context) =>
    MenubarDemo(h, {
      key: `${context.idPrefix}-menubar-demo`,
      props: { idPrefix: context.idPrefix, kind },
    }) as unknown as View.Input<DocsMessage>

const source = exampleApplicationSource({
  imports: `import { Menubar } from '@/ui/effect/ui'`,
  body: `Menubar(h, {
  key: 'application-menu',
  label: 'Application menu',
  openMenu: model.openMenu,
  onOpenChange,
  onPick,
  menus,
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { Menubar } from '@/ui/effect/ui'\n\nMenubar(h, { key, label, openMenu, onOpenChange, onPick, menus })`,
  examples: [
    { title: 'Basic', view: example('demo'), source },
    { title: 'Checkbox', view: example('checkbox'), source },
    { title: 'Radio', view: example('radio'), source },
    { title: 'Submenu', view: example('submenu'), source },
    { title: 'With Icons', view: example('icons'), source },
    { title: 'RTL', view: example('rtl'), source },
  ],
})
