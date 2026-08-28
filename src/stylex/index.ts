/**
 * Collision-safe public catalog for the complete StyleX component family.
 *
 * Component modules intentionally export common Elm names such as `Model`,
 * `Message`, `init`, and `update`, so flat star exports would be ambiguous.
 */
export * as Accordion from './accordion.js'
export * as AlertDialog from './alert-dialog.js'
export * as Alert from './alert.js'
export * as AspectRatio from './aspect-ratio.js'
export * as Attachment from './attachment.js'
export * as Avatar from './avatar.js'
export * as Badge from './badge.js'
export * as Breadcrumb from './breadcrumb.js'
export * as Bubble from './bubble.js'
export * as ButtonGroup from './button-group.js'
export * as Button from './button.js'
export * as Calendar from './calendar.js'
export * as Card from './card.js'
export * as Carousel from './carousel.js'
export * as Chart from './chart.js'
export * as Checkbox from './checkbox.js'
export * as Collapsible from './collapsible.js'
export * as Combobox from './combobox.js'
export * as Command from './command.js'
export * as ContextMenu from './context-menu.js'
export * as DataTable from './data-table.js'
export * as DatePicker from './date-picker.js'
export * as Dialog from './dialog.js'
export * as Direction from './direction.js'
export * as Drawer from './drawer.js'
export * as DropdownMenu from './dropdown-menu.js'
export * as Empty from './empty.js'
export * as Field from './field.js'
export * as Form from './form.js'
export * as HoverCard from './hover-card.js'
export * as InputGroup from './input-group.js'
export * as InputOtp from './input-otp.js'
export * as Input from './input.js'
export * as Item from './item.js'
export * as Kbd from './kbd.js'
export * as Label from './label.js'
export * as Marker from './marker.js'
export * as Menubar from './menubar.js'
export * as MessageScroller from './message-scroller.js'
export * as Message from './message.js'
export * as NativeSelect from './native-select.js'
export * as NavigationMenu from './navigation-menu.js'
export * as Pagination from './pagination.js'
export * as Popover from './popover.js'
export * as Progress from './progress.js'
export * as RadioGroup from './radio-group.js'
export * as Resizable from './resizable.js'
export * as ScrollArea from './scroll-area.js'
export * as Select from './select.js'
export * as Separator from './separator.js'
export * as Sheet from './sheet.js'
export * as Sidebar from './sidebar.js'
export * as Skeleton from './skeleton.js'
export * as Slider from './slider.js'
export * as Sonner from './sonner.js'
export * as Spinner from './spinner.js'
export * as Switch from './switch.js'
export * as Table from './table.js'
export * as Tabs from './tabs.js'
export * as Textarea from './textarea.js'
export * as Toast from './toast.js'
export * as ToggleGroup from './toggle-group.js'
export * as Toggle from './toggle.js'
export * as Tooltip from './tooltip.js'
export * as Typography from './typography.js'

/** Canonical registry order. Additions and removals are checked in CI. */
export const STYLEX_COMPONENT_NAMES = [
  'accordion',
  'alert-dialog',
  'alert',
  'aspect-ratio',
  'attachment',
  'avatar',
  'badge',
  'breadcrumb',
  'bubble',
  'button-group',
  'button',
  'calendar',
  'card',
  'carousel',
  'chart',
  'checkbox',
  'collapsible',
  'combobox',
  'command',
  'context-menu',
  'data-table',
  'date-picker',
  'dialog',
  'direction',
  'drawer',
  'dropdown-menu',
  'empty',
  'field',
  'form',
  'hover-card',
  'input-group',
  'input-otp',
  'input',
  'item',
  'kbd',
  'label',
  'marker',
  'menubar',
  'message-scroller',
  'message',
  'native-select',
  'navigation-menu',
  'pagination',
  'popover',
  'progress',
  'radio-group',
  'resizable',
  'scroll-area',
  'select',
  'separator',
  'sheet',
  'sidebar',
  'skeleton',
  'slider',
  'sonner',
  'spinner',
  'switch',
  'table',
  'tabs',
  'textarea',
  'toast',
  'toggle-group',
  'toggle',
  'tooltip',
  'typography',
] as const

export type StyleXComponentName = (typeof STYLEX_COMPONENT_NAMES)[number]

