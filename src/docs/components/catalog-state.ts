import { Option, Schema as S } from 'effect'
import { Command, Subscription } from 'foldkit'
import * as FoldkitCalendar from 'foldkit/calendar'
import { m } from 'foldkit/message'

import * as AlertDialog from '@/ui/alert-dialog'
import * as Accordion from '@/ui/accordion'
import * as Avatar from '@/ui/avatar'
import * as Calendar from '@/ui/calendar'
import * as Carousel from '@/ui/carousel'
import * as Checkbox from '@/ui/checkbox'
import * as Collapsible from '@/ui/collapsible'
import * as Combobox from '@/ui/combobox'
import * as CommandMenu from '@/ui/command'
import * as ContextMenu from '@/ui/context-menu'
import * as DataTable from '@/ui/data-table'
import * as DatePicker from '@/ui/date-picker'
import * as Dialog from '@/ui/dialog'
import * as Drawer from '@/ui/drawer'
import * as DropdownMenu from '@/ui/dropdown-menu'
import * as HoverCard from '@/ui/hover-card'
import * as MessageScroller from '@/ui/message-scroller'
import * as Popover from '@/ui/popover'
import * as RadioGroup from '@/ui/radio-group'
import * as Resizable from '@/ui/resizable'
import * as Select from '@/ui/select'
import * as Sheet from '@/ui/sheet'
import * as Slider from '@/ui/slider'
import * as Sonner from '@/ui/sonner'
import * as Switch from '@/ui/switch'
import * as Tabs from '@/ui/tabs'
import * as Tooltip from '@/ui/tooltip'

export const TextTarget = S.Literals([
  'cardEmail',
  'fieldName',
  'formEmail',
  'input',
  'inputGroup',
  'inputOtp',
  'labelInput',
  'textarea',
  'dialogName',
  'sheetName',
])
export type TextTarget = typeof TextTarget.Type

export const Model = S.Struct({
  accordion: Accordion.Model,
  accordionMultiple: Accordion.Model,
  cardEmail: S.String,
  fieldName: S.String,
  formEmail: S.String,
  input: S.String,
  inputGroup: S.String,
  inputOtp: S.String,
  labelInput: S.String,
  textarea: S.String,
  dialogName: S.String,
  sheetName: S.String,
  nativeSelect: S.String,
  avatar: Avatar.Model,
  togglePressed: S.Boolean,
  toggleGroupValue: S.String,
  carousel: Carousel.Model,
  carouselCompact: Carousel.Model,
  calendar: Calendar.Model,
  selectedCalendarDate: S.Option(FoldkitCalendar.CalendarDate),
  isCheckboxChecked: S.Boolean,
  isCollapsibleOpen: S.Boolean,
  dataTable: DataTable.Model,
  selectedRadioValue: S.String,
  resizable: Resizable.Model,
  resizableVertical: Resizable.Model,
  slider: Slider.Model,
  sliderValue: S.Number,
  isSwitchChecked: S.Boolean,
  tabs: Tabs.Model,
  selectedTabValue: S.String,
  tabsLine: Tabs.Model,
  selectedLineTabValue: S.String,
  alertDialog: AlertDialog.Model,
  alertDialogConfirmed: S.Boolean,
  alertDialogCompact: AlertDialog.Model,
  combobox: Combobox.Model,
  selectedComboboxValue: S.Option(S.String),
  command: CommandMenu.Model,
  selectedCommandValue: S.Option(S.String),
  contextMenu: ContextMenu.Model,
  datePicker: DatePicker.Model,
  selectedDate: S.Option(FoldkitCalendar.CalendarDate),
  dialog: Dialog.Model,
  dialogSecondary: Dialog.Model,
  drawer: Drawer.Model,
  dropdownMenu: DropdownMenu.Model,
  hoverCard: HoverCard.Model,
  messageScroller: MessageScroller.Model,
  menubarFile: DropdownMenu.Model,
  menubarEdit: DropdownMenu.Model,
  menubarView: DropdownMenu.Model,
  popover: Popover.Model,
  popoverVariants: S.Array(Popover.Model),
  select: Select.Model,
  selectedSelectValue: S.Option(S.String),
  sheet: Sheet.Model,
  sheetVariants: S.Array(Sheet.Model),
  sonner: Sonner.Model,
  toast: Sonner.Model,
  tooltip: Tooltip.Model,
  tooltipVariants: S.Array(Tooltip.Model),
})
export type Model = typeof Model.Type

export const ChangedText = m('ChangedCatalogPreviewText', {
  target: TextTarget,
  value: S.String,
})
export const AccordionTarget = S.Literals(['single', 'multiple'])
export type AccordionTarget = typeof AccordionTarget.Type
export const GotAccordionMessage = m('GotCatalogAccordionMessage', { target: AccordionTarget, message: Accordion.Message })
export const ClickedPreviewAction = m('ClickedCatalogPreviewAction')
export const ChangedNativeSelect = m('ChangedCatalogNativeSelect', { value: S.String })
export const GotAvatarMessage = m('GotCatalogAvatarMessage', { message: Avatar.Message })
export const ToggledPreview = m('ToggledCatalogPreview')
export const ChangedToggleGroup = m('ChangedCatalogToggleGroup', { value: S.String })
export const OverlayTarget = S.Literals(['alertDialog', 'dialog', 'drawer', 'sheet'])
export type OverlayTarget = typeof OverlayTarget.Type
export const OpenedOverlay = m('OpenedCatalogOverlay', { target: OverlayTarget })
export const OpenedSheetVariant = m('OpenedCatalogSheetVariant', { index: S.Number })
export const GotCarouselMessage = m('GotCatalogCarouselMessage', { message: Carousel.Message })
export const GotCarouselCompactMessage = m('GotCatalogCarouselCompactMessage', { message: Carousel.Message })
export const GotCalendarMessage = m('GotCatalogCalendarMessage', { message: Calendar.Message })
export const ToggledCheckbox = m('ToggledCatalogCheckbox', { isChecked: S.Boolean })
export const ToggledCollapsible = m('ToggledCatalogCollapsible', { isOpen: S.Boolean })
export const GotDataTableMessage = m('GotCatalogDataTableMessage', { message: DataTable.Message })
export const SelectedRadioValue = m('SelectedCatalogRadioValue', { value: S.String })
export const GotResizableMessage = m('GotCatalogResizableMessage', { message: Resizable.Message })
export const GotResizableVerticalMessage = m('GotCatalogResizableVerticalMessage', { message: Resizable.Message })
export const GotSliderMessage = m('GotCatalogSliderMessage', { message: Slider.Message })
export const ToggledSwitch = m('ToggledCatalogSwitch', { isChecked: S.Boolean })
export const GotTabsMessage = m('GotCatalogTabsMessage', { message: Tabs.Message })
export const GotTabsLineMessage = m('GotCatalogTabsLineMessage', { message: Tabs.Message })
export const GotAlertDialogMessage = m('GotCatalogAlertDialogMessage', { message: AlertDialog.Message })
export const ConfirmedAlertDialog = m('ConfirmedCatalogAlertDialog')
export const OpenedAlertDialogCompact = m('OpenedCatalogAlertDialogCompact')
export const ConfirmedAlertDialogCompact = m('ConfirmedCatalogAlertDialogCompact')
export const GotAlertDialogCompactMessage = m('GotCatalogAlertDialogCompactMessage', { message: AlertDialog.Message })
export const GotComboboxMessage = m('GotCatalogComboboxMessage', { message: Combobox.Message })
export const GotCommandMessage = m('GotCatalogCommandMessage', { message: CommandMenu.Message })
export const GotContextMenuMessage = m('GotCatalogContextMenuMessage', { message: ContextMenu.Message })
export const GotDatePickerMessage = m('GotCatalogDatePickerMessage', { message: DatePicker.Message })
export const GotDialogMessage = m('GotCatalogDialogMessage', { message: Dialog.Message })
export const OpenedDialogSecondary = m('OpenedCatalogDialogSecondary')
export const GotDialogSecondaryMessage = m('GotCatalogDialogSecondaryMessage', { message: Dialog.Message })
export const GotDrawerMessage = m('GotCatalogDrawerMessage', { message: Drawer.Message })
export const GotDropdownMenuMessage = m('GotCatalogDropdownMenuMessage', { message: DropdownMenu.Message })
export const GotHoverCardMessage = m('GotCatalogHoverCardMessage', { message: HoverCard.Message })
export const GotMessageScrollerMessage = m('GotCatalogMessageScrollerMessage', { message: MessageScroller.Message })
export const MenubarTarget = S.Literals(['file', 'edit', 'view'])
export type MenubarTarget = typeof MenubarTarget.Type
export const GotMenubarMessage = m('GotCatalogMenubarMessage', { target: MenubarTarget, message: DropdownMenu.Message })
export const GotPopoverMessage = m('GotCatalogPopoverMessage', { message: Popover.Message })
export const GotPopoverVariantMessage = m('GotCatalogPopoverVariantMessage', { index: S.Number, message: Popover.Message })
export const GotSelectMessage = m('GotCatalogSelectMessage', { message: Select.Message })
export const GotSheetMessage = m('GotCatalogSheetMessage', { message: Sheet.Message })
export const GotSheetVariantMessage = m('GotCatalogSheetVariantMessage', { index: S.Number, message: Sheet.Message })
export const GotSonnerMessage = m('GotCatalogSonnerMessage', { message: Sonner.Message })
export const GotToastMessage = m('GotCatalogToastMessage', { message: Sonner.Message })
export const NotificationTarget = S.Literals(['sonner', 'toast'])
export type NotificationTarget = typeof NotificationTarget.Type
export const ShowedNotification = m('ShowedCatalogNotification', { target: NotificationTarget, variant: Sonner.Variant, sticky: S.Boolean })
export const GotTooltipMessage = m('GotCatalogTooltipMessage', { message: Tooltip.Message })
export const GotTooltipVariantMessage = m('GotCatalogTooltipVariantMessage', { index: S.Number, message: Tooltip.Message })

export const Message = S.Union([
  GotAccordionMessage,
  ChangedText,
  ClickedPreviewAction,
  ChangedNativeSelect,
  GotAvatarMessage,
  ToggledPreview,
  ChangedToggleGroup,
  OpenedOverlay,
  OpenedSheetVariant,
  GotCarouselMessage,
  GotCarouselCompactMessage,
  GotCalendarMessage,
  ToggledCheckbox,
  ToggledCollapsible,
  GotDataTableMessage,
  SelectedRadioValue,
  GotResizableMessage,
  GotResizableVerticalMessage,
  GotSliderMessage,
  ToggledSwitch,
  GotTabsMessage,
  GotTabsLineMessage,
  GotAlertDialogMessage,
  ConfirmedAlertDialog,
  OpenedAlertDialogCompact,
  ConfirmedAlertDialogCompact,
  GotAlertDialogCompactMessage,
  GotComboboxMessage,
  GotCommandMessage,
  GotContextMenuMessage,
  GotDatePickerMessage,
  GotDialogMessage,
  OpenedDialogSecondary,
  GotDialogSecondaryMessage,
  GotDrawerMessage,
  GotDropdownMenuMessage,
  GotHoverCardMessage,
  GotMessageScrollerMessage,
  GotMenubarMessage,
  GotPopoverMessage,
  GotPopoverVariantMessage,
  GotSelectMessage,
  GotSheetMessage,
  GotSheetVariantMessage,
  GotSonnerMessage,
  GotToastMessage,
  ShowedNotification,
  GotTooltipMessage,
  GotTooltipVariantMessage,
])
export type Message = typeof Message.Type

export const init = (): Model => ({
  accordion: Accordion.init({ id: 'docs-accordion', type: 'single', items: [{ value: 'product', isOpen: true }, { value: 'style' }, { value: 'animation' }] }),
  accordionMultiple: Accordion.init({ id: 'docs-accordion-multiple', type: 'multiple', items: [{ value: 'product', isOpen: true }, { value: 'style', isOpen: true }, { value: 'animation' }] }),
  cardEmail: '',
  fieldName: '',
  formEmail: '',
  input: '',
  inputGroup: '',
  inputOtp: '123',
  labelInput: '',
  textarea: '',
  dialogName: 'Pedro Duarte',
  sheetName: 'Pedro Duarte',
  nativeSelect: 'apple',
  avatar: Avatar.init(),
  togglePressed: true,
  toggleGroupValue: 'center',
  carousel: Carousel.init('docs-carousel', 3),
  carouselCompact: Carousel.init('docs-carousel-compact', 4),
  calendar: Calendar.init({ id: 'docs-calendar', today: { year: 2026, month: 7, day: 28 }, initialViewDate: { year: 2026, month: 7, day: 18 } }),
  selectedCalendarDate: Option.some({ year: 2026, month: 7, day: 18 }),
  isCheckboxChecked: true,
  isCollapsibleOpen: true,
  dataTable: DataTable.init(5),
  selectedRadioValue: 'comfortable',
  resizable: Resizable.init('docs-resizable', 50),
  resizableVertical: Resizable.init('docs-resizable-vertical', 40),
  slider: Slider.init({ id: 'docs-slider', min: 0, max: 100, step: 1 }),
  sliderValue: 50,
  isSwitchChecked: true,
  tabs: Tabs.init({ id: 'docs-tabs' }),
  selectedTabValue: 'account',
  tabsLine: Tabs.init({ id: 'docs-tabs-line' }),
  selectedLineTabValue: 'overview',
  alertDialog: AlertDialog.init({ id: 'docs-alert-dialog', isAnimated: true }),
  alertDialogConfirmed: false,
  alertDialogCompact: AlertDialog.init({ id: 'docs-alert-dialog-compact', isAnimated: true }),
  combobox: Combobox.init({ id: 'docs-combobox', isAnimated: true }),
  selectedComboboxValue: Option.none(),
  command: CommandMenu.init({ id: 'docs-command', isAnimated: true }),
  selectedCommandValue: Option.none(),
  contextMenu: ContextMenu.init({ id: 'docs-context-menu' }),
  datePicker: DatePicker.init({ id: 'docs-date-picker', today: { year: 2026, month: 7, day: 28 }, initialViewDate: { year: 2026, month: 7, day: 18 }, isAnimated: true }),
  selectedDate: Option.some({ year: 2026, month: 7, day: 18 }),
  dialog: Dialog.init({ id: 'docs-dialog', isAnimated: true }),
  dialogSecondary: Dialog.init({ id: 'docs-dialog-secondary', isAnimated: true }),
  drawer: Drawer.init({ id: 'docs-drawer', isAnimated: true }),
  dropdownMenu: DropdownMenu.init({ id: 'docs-dropdown' }),
  hoverCard: HoverCard.init({ id: 'docs-hover-card' }),
  messageScroller: MessageScroller.init('docs-message-scroll'),
  menubarFile: DropdownMenu.init({ id: 'docs-menubar-file' }),
  menubarEdit: DropdownMenu.init({ id: 'docs-menubar-edit' }),
  menubarView: DropdownMenu.init({ id: 'docs-menubar-view' }),
  popover: Popover.init({ id: 'docs-popover', isAnimated: true }),
  popoverVariants: Array.from({ length: 3 }, (_, index) => Popover.init({ id: `docs-popover-variant-${String(index)}`, isAnimated: true })),
  select: Select.init({ id: 'docs-select' }),
  selectedSelectValue: Option.some('apple'),
  sheet: Sheet.init({ id: 'docs-sheet', isAnimated: true }),
  sheetVariants: Array.from({ length: 4 }, (_, index) => Sheet.init({ id: `docs-sheet-variant-${String(index)}`, isAnimated: true })),
  sonner: Sonner.init({ id: 'docs-sonner' }),
  toast: Sonner.init({ id: 'docs-toast' }),
  tooltip: Tooltip.init({ id: 'docs-tooltip', showDelay: 0 }),
  tooltipVariants: Array.from({ length: 4 }, (_, index) => Tooltip.init({ id: `docs-tooltip-variant-${String(index)}`, showDelay: 0 })),
})

/**
 * A docs page renders several instances of the same component model at once.
 * Foldkit submodel slot identity is derived from each child model id, so every
 * example receives a stable, route-local id while messages still update the
 * corresponding canonical field in this parent model.
 */
export const withExampleIds = (model: Model, suffix: string): Model => {
  const id = (value: string): string => `${value}-${suffix}`
  const alertDialogId = id(model.alertDialog.id)
  const dialogId = id(model.dialog.id)
  const drawerDialogId = id(model.drawer.dialog.id)
  const sheetId = id(model.sheet.id)
  return {
    ...model,
    accordion: { ...model.accordion, id: id(model.accordion.id) },
    accordionMultiple: { ...model.accordionMultiple, id: id(model.accordionMultiple.id) },
    carousel: { ...model.carousel, id: id(model.carousel.id) },
    calendar: { ...model.calendar, id: id(model.calendar.id) },
    resizable: { ...model.resizable, id: id(model.resizable.id) },
    slider: { ...model.slider, id: id(model.slider.id) },
    tabs: { ...model.tabs, id: id(model.tabs.id) },
    alertDialog: {
      ...model.alertDialog,
      id: alertDialogId,
      animation: { ...model.alertDialog.animation, id: `${alertDialogId}-panel` },
    },
    combobox: { ...model.combobox, id: id(model.combobox.id) },
    command: { ...model.command, id: id(model.command.id) },
    contextMenu: { ...model.contextMenu, id: id(model.contextMenu.id) },
    datePicker: {
      ...model.datePicker,
      id: id(model.datePicker.id),
      calendar: { ...model.datePicker.calendar, id: id(model.datePicker.calendar.id) },
      popover: {
        ...model.datePicker.popover,
        id: id(model.datePicker.popover.id),
        animation: { ...model.datePicker.popover.animation, id: id(model.datePicker.popover.animation.id) },
      },
    },
    dialog: {
      ...model.dialog,
      id: dialogId,
      animation: { ...model.dialog.animation, id: `${dialogId}-panel` },
    },
    drawer: {
      ...model.drawer,
      dialog: {
        ...model.drawer.dialog,
        id: drawerDialogId,
        animation: { ...model.drawer.dialog.animation, id: `${drawerDialogId}-panel` },
      },
    },
    dropdownMenu: { ...model.dropdownMenu, id: id(model.dropdownMenu.id) },
    hoverCard: { ...model.hoverCard, id: id(model.hoverCard.id) },
    messageScroller: { ...model.messageScroller, id: id(model.messageScroller.id) },
    menubarFile: { ...model.menubarFile, id: id(model.menubarFile.id) },
    menubarEdit: { ...model.menubarEdit, id: id(model.menubarEdit.id) },
    menubarView: { ...model.menubarView, id: id(model.menubarView.id) },
    popover: { ...model.popover, id: id(model.popover.id) },
    popoverVariants: model.popoverVariants.map((popover) => ({ ...popover, id: id(popover.id) })),
    select: { ...model.select, id: id(model.select.id) },
    sheet: {
      ...model.sheet,
      id: sheetId,
      animation: { ...model.sheet.animation, id: `${sheetId}-panel` },
    },
    sheetVariants: model.sheetVariants.map((sheet) => {
      const variantId = id(sheet.id)
      return { ...sheet, id: variantId, animation: { ...sheet.animation, id: `${variantId}-panel` } }
    }),
    sonner: { ...model.sonner, id: id(model.sonner.id) },
    toast: { ...model.toast, id: id(model.toast.id) },
    tooltip: { ...model.tooltip, id: id(model.tooltip.id) },
    tooltipVariants: model.tooltipVariants.map((tooltip) => ({ ...tooltip, id: id(tooltip.id) })),
  }
}

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>]

export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'GotCatalogAccordionMessage': {
      const field = message.target === 'single' ? 'accordion' : 'accordionMultiple'
      const [accordion, commands] = Accordion.update(model[field], message.message)
      return [{ ...model, [field]: accordion }, Command.mapMessages(commands, next => GotAccordionMessage({ target: message.target, message: next }))]
    }
    case 'ClickedCatalogPreviewAction':
      return [model, []]
    case 'ChangedCatalogNativeSelect':
      return [{ ...model, nativeSelect: message.value }, []]
    case 'GotCatalogAvatarMessage':
      return [{ ...model, avatar: Avatar.update(model.avatar, message.message) }, []]
    case 'ToggledCatalogPreview':
      return [{ ...model, togglePressed: !model.togglePressed }, []]
    case 'ChangedCatalogToggleGroup':
      return [{ ...model, toggleGroupValue: message.value }, []]
    case 'OpenedCatalogOverlay': {
      switch (message.target) {
        case 'alertDialog': {
          const [alertDialog, commands] = AlertDialog.open(model.alertDialog)
          return [{ ...model, alertDialog }, Command.mapMessages(commands, next => GotAlertDialogMessage({ message: next }))]
        }
        case 'dialog': {
          const [dialog, commands] = Dialog.open(model.dialog)
          return [{ ...model, dialog }, Command.mapMessages(commands, next => GotDialogMessage({ message: next }))]
        }
        case 'drawer': {
          const [drawer, commands] = Drawer.open(model.drawer)
          return [{ ...model, drawer }, Command.mapMessages(commands, next => GotDrawerMessage({ message: next }))]
        }
        case 'sheet': {
          const [sheet, commands] = Sheet.open(model.sheet)
          return [{ ...model, sheet }, Command.mapMessages(commands, next => GotSheetMessage({ message: next }))]
        }
      }
    }
    case 'OpenedCatalogSheetVariant': {
      const current = model.sheetVariants[message.index]
      if (current === undefined) return [model, []]
      const [sheet, commands] = Sheet.open(current)
      return [
        { ...model, sheetVariants: model.sheetVariants.map((candidate, index) => index === message.index ? sheet : candidate) },
        Command.mapMessages(commands, next => GotSheetVariantMessage({ index: message.index, message: next })),
      ]
    }
    case 'ChangedCatalogPreviewText':
      return [{ ...model, [message.target]: message.value }, []]
    case 'GotCatalogCarouselMessage':
      return [{ ...model, carousel: Carousel.update(model.carousel, message.message) }, []]
    case 'GotCatalogCarouselCompactMessage':
      return [{ ...model, carouselCompact: Carousel.update(model.carouselCompact, message.message) }, []]
    case 'GotCatalogCalendarMessage': {
      const [calendar, commands, maybeSelection] = Calendar.update(model.calendar, message.message)
      const selectedCalendarDate = Option.match(maybeSelection, {
        onNone: () => model.selectedCalendarDate,
        onSome: selection => selection._tag === 'SelectedDate' ? Option.some(selection.date) : model.selectedCalendarDate,
      })
      return [{ ...model, calendar, selectedCalendarDate }, Command.mapMessages(commands, next => GotCalendarMessage({ message: next }))]
    }
    case 'ToggledCatalogCheckbox':
      return [{ ...model, isCheckboxChecked: message.isChecked }, []]
    case 'ToggledCatalogCollapsible':
      return [{ ...model, isCollapsibleOpen: message.isOpen }, []]
    case 'GotCatalogDataTableMessage':
      return [{ ...model, dataTable: DataTable.update(model.dataTable, message.message) }, []]
    case 'SelectedCatalogRadioValue':
      return [{ ...model, selectedRadioValue: message.value }, []]
    case 'GotCatalogResizableMessage':
      return [{ ...model, resizable: Resizable.update(model.resizable, message.message) }, []]
    case 'GotCatalogResizableVerticalMessage':
      return [{ ...model, resizableVertical: Resizable.update(model.resizableVertical, message.message) }, []]
    case 'GotCatalogSliderMessage': {
      const [slider, commands, maybeChange] = Slider.update(model.slider, message.message)
      return [{ ...model, slider, sliderValue: Option.match(maybeChange, { onNone: () => model.sliderValue, onSome: change => change.value }) }, Command.mapMessages(commands, next => GotSliderMessage({ message: next }))]
    }
    case 'ToggledCatalogSwitch':
      return [{ ...model, isSwitchChecked: message.isChecked }, []]
    case 'GotCatalogTabsMessage': {
      const [tabs, commands, maybeSelection] = Tabs.update(model.tabs, message.message)
      return [
        {
          ...model,
          tabs,
          selectedTabValue: Option.match(maybeSelection, {
            onNone: () => model.selectedTabValue,
            onSome: selection => selection.value,
          }),
        },
        Command.mapMessages(commands, next => GotTabsMessage({ message: next })),
      ]
    }
    case 'GotCatalogTabsLineMessage': {
      const [tabsLine, commands, maybeSelection] = Tabs.update(model.tabsLine, message.message)
      return [
        {
          ...model,
          tabsLine,
          selectedLineTabValue: Option.match(maybeSelection, {
            onNone: () => model.selectedLineTabValue,
            onSome: selection => selection.value,
          }),
        },
        Command.mapMessages(commands, next => GotTabsLineMessage({ message: next })),
      ]
    }
    case 'GotCatalogAlertDialogMessage': {
      const [alertDialog, commands] = AlertDialog.update(model.alertDialog, message.message)
      return [{ ...model, alertDialog }, Command.mapMessages(commands, next => GotAlertDialogMessage({ message: next }))]
    }
    case 'ConfirmedCatalogAlertDialog': {
      const [alertDialog, commands] = AlertDialog.close(model.alertDialog)
      return [{ ...model, alertDialog, alertDialogConfirmed: true }, Command.mapMessages(commands, next => GotAlertDialogMessage({ message: next }))]
    }
    case 'OpenedCatalogAlertDialogCompact': {
      const [alertDialogCompact, commands] = AlertDialog.open(model.alertDialogCompact)
      return [{ ...model, alertDialogCompact }, Command.mapMessages(commands, next => GotAlertDialogCompactMessage({ message: next }))]
    }
    case 'ConfirmedCatalogAlertDialogCompact': {
      const [alertDialogCompact, commands] = AlertDialog.close(model.alertDialogCompact)
      return [{ ...model, alertDialogCompact }, Command.mapMessages(commands, next => GotAlertDialogCompactMessage({ message: next }))]
    }
    case 'GotCatalogAlertDialogCompactMessage': {
      const [alertDialogCompact, commands] = AlertDialog.update(model.alertDialogCompact, message.message)
      return [{ ...model, alertDialogCompact }, Command.mapMessages(commands, next => GotAlertDialogCompactMessage({ message: next }))]
    }
    case 'GotCatalogComboboxMessage': {
      const [combobox, commands, maybeSelection] = Combobox.update(model.combobox, message.message)
      const selectedComboboxValue = Option.match(maybeSelection, { onNone: () => model.selectedComboboxValue, onSome: selection => selection._tag === 'Selected' ? Option.some(selection.value) : Option.none() })
      return [{ ...model, combobox, selectedComboboxValue }, Command.mapMessages(commands, next => GotComboboxMessage({ message: next }))]
    }
    case 'GotCatalogCommandMessage': {
      const [command, commands, maybeSelection] = CommandMenu.update(model.command, message.message)
      return [
        {
          ...model,
          command,
          selectedCommandValue: Option.match(maybeSelection, {
            onNone: () => model.selectedCommandValue,
            onSome: selection => selection._tag === 'Selected' ? Option.some(selection.value) : Option.none(),
          }),
        },
        Command.mapMessages(commands, next => GotCommandMessage({ message: next })),
      ]
    }
    case 'GotCatalogContextMenuMessage': {
      const [contextMenu, commands] = ContextMenu.update(model.contextMenu, message.message)
      return [{ ...model, contextMenu }, Command.mapMessages(commands, next => GotContextMenuMessage({ message: next }))]
    }
    case 'GotCatalogDatePickerMessage': {
      const [datePicker, commands, maybeSelection] = DatePicker.update(model.datePicker, message.message)
      const selectedDate = Option.match(maybeSelection, { onNone: () => model.selectedDate, onSome: selection => selection._tag === 'SelectedDate' ? Option.some(selection.date) : selection._tag === 'ClearedDate' ? Option.none() : model.selectedDate })
      return [{ ...model, datePicker, selectedDate }, Command.mapMessages(commands, next => GotDatePickerMessage({ message: next }))]
    }
    case 'GotCatalogDialogMessage': {
      const [dialog, commands] = Dialog.update(model.dialog, message.message)
      return [{ ...model, dialog }, Command.mapMessages(commands, next => GotDialogMessage({ message: next }))]
    }
    case 'OpenedCatalogDialogSecondary': {
      const [dialogSecondary, commands] = Dialog.open(model.dialogSecondary)
      return [{ ...model, dialogSecondary }, Command.mapMessages(commands, next => GotDialogSecondaryMessage({ message: next }))]
    }
    case 'GotCatalogDialogSecondaryMessage': {
      const [dialogSecondary, commands] = Dialog.update(model.dialogSecondary, message.message)
      return [{ ...model, dialogSecondary }, Command.mapMessages(commands, next => GotDialogSecondaryMessage({ message: next }))]
    }
    case 'GotCatalogDrawerMessage': {
      const [drawer, commands] = Drawer.update(model.drawer, message.message)
      return [{ ...model, drawer }, Command.mapMessages(commands, next => GotDrawerMessage({ message: next }))]
    }
    case 'GotCatalogDropdownMenuMessage': {
      const [dropdownMenu, commands] = DropdownMenu.update(model.dropdownMenu, message.message)
      return [{ ...model, dropdownMenu }, Command.mapMessages(commands, next => GotDropdownMenuMessage({ message: next }))]
    }
    case 'GotCatalogHoverCardMessage': {
      const [hoverCard, commands] = HoverCard.update(model.hoverCard, message.message)
      return [{ ...model, hoverCard }, Command.mapMessages(commands, next => GotHoverCardMessage({ message: next }))]
    }
    case 'GotCatalogMessageScrollerMessage': {
      const [messageScroller, commands] = MessageScroller.update(model.messageScroller, message.message)
      return [{ ...model, messageScroller }, Command.mapMessages(commands, next => GotMessageScrollerMessage({ message: next }))]
    }
    case 'GotCatalogMenubarMessage': {
      const field = message.target === 'file' ? 'menubarFile' : message.target === 'edit' ? 'menubarEdit' : 'menubarView'
      const [menu, commands] = DropdownMenu.update(model[field], message.message)
      return [{ ...model, [field]: menu }, Command.mapMessages(commands, next => GotMenubarMessage({ target: message.target, message: next }))]
    }
    case 'GotCatalogPopoverMessage': {
      const [popover, commands] = Popover.update(model.popover, message.message)
      return [{ ...model, popover }, Command.mapMessages(commands, next => GotPopoverMessage({ message: next }))]
    }
    case 'GotCatalogPopoverVariantMessage': {
      const current = model.popoverVariants[message.index]
      if (current === undefined) return [model, []]
      const [popover, commands] = Popover.update(current, message.message)
      return [
        { ...model, popoverVariants: model.popoverVariants.map((candidate, index) => index === message.index ? popover : candidate) },
        Command.mapMessages(commands, next => GotPopoverVariantMessage({ index: message.index, message: next })),
      ]
    }
    case 'GotCatalogSelectMessage': {
      const [select, commands, maybeSelection] = Select.update(model.select, message.message)
      const selectedSelectValue = Option.match(maybeSelection, { onNone: () => model.selectedSelectValue, onSome: selection => selection._tag === 'Selected' ? Option.some(selection.value) : Option.none() })
      return [{ ...model, select, selectedSelectValue }, Command.mapMessages(commands, next => GotSelectMessage({ message: next }))]
    }
    case 'GotCatalogSheetMessage': {
      const [sheet, commands] = Sheet.update(model.sheet, message.message)
      return [{ ...model, sheet }, Command.mapMessages(commands, next => GotSheetMessage({ message: next }))]
    }
    case 'GotCatalogSheetVariantMessage': {
      const current = model.sheetVariants[message.index]
      if (current === undefined) return [model, []]
      const [sheet, commands] = Sheet.update(current, message.message)
      return [
        { ...model, sheetVariants: model.sheetVariants.map((candidate, index) => index === message.index ? sheet : candidate) },
        Command.mapMessages(commands, next => GotSheetVariantMessage({ index: message.index, message: next })),
      ]
    }
    case 'GotCatalogSonnerMessage': {
      const [sonner, commands] = Sonner.update(model.sonner, message.message)
      return [{ ...model, sonner }, Command.mapMessages(commands, next => GotSonnerMessage({ message: next }))]
    }
    case 'GotCatalogToastMessage': {
      const [toast, commands] = Sonner.update(model.toast, message.message)
      return [{ ...model, toast }, Command.mapMessages(commands, next => GotToastMessage({ message: next }))]
    }
    case 'ShowedCatalogNotification': {
      const current = message.target === 'sonner' ? model.sonner : model.toast
      const input = message.variant === 'Success'
        ? Sonner.success({ title: 'Event has been created', description: 'Sunday at 9:00 AM', sticky: message.sticky })
        : message.variant === 'Error'
          ? Sonner.error({ title: 'Could not save changes', description: 'Try again in a moment.', sticky: message.sticky })
          : message.variant === 'Warning'
            ? Sonner.warning({ title: 'Storage almost full', sticky: message.sticky })
            : Sonner.info({ title: 'Scheduled: Catch up', description: 'Friday at 5:57 PM', sticky: message.sticky })
      const [notification, commands] = Sonner.show(current, input)
      return message.target === 'sonner'
        ? [{ ...model, sonner: notification }, Command.mapMessages(commands, next => GotSonnerMessage({ message: next }))]
        : [{ ...model, toast: notification }, Command.mapMessages(commands, next => GotToastMessage({ message: next }))]
    }
    case 'GotCatalogTooltipMessage': {
      const [tooltip, commands] = Tooltip.update(model.tooltip, message.message)
      return [{ ...model, tooltip }, Command.mapMessages(commands, next => GotTooltipMessage({ message: next }))]
    }
    case 'GotCatalogTooltipVariantMessage': {
      const current = model.tooltipVariants[message.index]
      if (current === undefined) return [model, []]
      const [tooltip, commands] = Tooltip.update(current, message.message)
      return [
        { ...model, tooltipVariants: model.tooltipVariants.map((candidate, index) => index === message.index ? tooltip : candidate) },
        Command.mapMessages(commands, next => GotTooltipVariantMessage({ index: message.index, message: next })),
      ]
    }
  }
}

export const subscriptions = Subscription.aggregate<Model, Message>()(
  Subscription.lift({
    sliderPointer: Slider.subscriptions.dragPointer,
    sliderEscape: Slider.subscriptions.dragEscape,
  })<Model, Message>({
    toChildModel: model => model.slider,
    toParentMessage: message => GotSliderMessage({ message }),
  }),
)
