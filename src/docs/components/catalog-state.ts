import { Schema as S } from 'effect'
import { Command, Subscription } from 'foldkit'
import { m } from 'foldkit/message'

import * as AlertDialog from '@/ui/alert-dialog'
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
  togglePressed: S.Boolean,
  toggleGroupValue: S.String,
  carousel: Carousel.Model,
  checkbox: Checkbox.Model,
  collapsible: Collapsible.Model,
  dataTable: DataTable.Model,
  radioGroup: RadioGroup.Model,
  resizable: Resizable.Model,
  slider: Slider.Model,
  switchControl: Switch.Model,
  tabs: Tabs.Model,
  alertDialog: AlertDialog.Model,
  combobox: Combobox.Model,
  command: CommandMenu.Model,
  contextMenu: ContextMenu.Model,
  datePicker: DatePicker.Model,
  dialog: Dialog.Model,
  drawer: Drawer.Model,
  dropdownMenu: DropdownMenu.Model,
  hoverCard: HoverCard.Model,
  messageScroller: MessageScroller.Model,
  menubarFile: DropdownMenu.Model,
  menubarEdit: DropdownMenu.Model,
  menubarView: DropdownMenu.Model,
  popover: Popover.Model,
  select: Select.Model,
  sheet: Sheet.Model,
  sonner: Sonner.Model,
  toast: Sonner.Model,
  tooltip: Tooltip.Model,
})
export type Model = typeof Model.Type

export const ChangedText = m('ChangedCatalogPreviewText', {
  target: TextTarget,
  value: S.String,
})
export const ClickedPreviewAction = m('ClickedCatalogPreviewAction')
export const ChangedNativeSelect = m('ChangedCatalogNativeSelect', { value: S.String })
export const ToggledPreview = m('ToggledCatalogPreview')
export const ChangedToggleGroup = m('ChangedCatalogToggleGroup', { value: S.String })
export const OverlayTarget = S.Literals(['alertDialog', 'dialog', 'drawer', 'sheet'])
export type OverlayTarget = typeof OverlayTarget.Type
export const OpenedOverlay = m('OpenedCatalogOverlay', { target: OverlayTarget })
export const GotCarouselMessage = m('GotCatalogCarouselMessage', { message: Carousel.Message })
export const GotCheckboxMessage = m('GotCatalogCheckboxMessage', { message: Checkbox.Message })
export const GotCollapsibleMessage = m('GotCatalogCollapsibleMessage', { message: Collapsible.Message })
export const GotDataTableMessage = m('GotCatalogDataTableMessage', { message: DataTable.Message })
export const GotRadioGroupMessage = m('GotCatalogRadioGroupMessage', { message: RadioGroup.Message })
export const GotResizableMessage = m('GotCatalogResizableMessage', { message: Resizable.Message })
export const GotSliderMessage = m('GotCatalogSliderMessage', { message: Slider.Message })
export const GotSwitchMessage = m('GotCatalogSwitchMessage', { message: Switch.Message })
export const GotTabsMessage = m('GotCatalogTabsMessage', { message: Tabs.Message })
export const GotAlertDialogMessage = m('GotCatalogAlertDialogMessage', { message: AlertDialog.Message })
export const GotComboboxMessage = m('GotCatalogComboboxMessage', { message: Combobox.Message })
export const GotCommandMessage = m('GotCatalogCommandMessage', { message: CommandMenu.Message })
export const GotContextMenuMessage = m('GotCatalogContextMenuMessage', { message: ContextMenu.Message })
export const GotDatePickerMessage = m('GotCatalogDatePickerMessage', { message: DatePicker.Message })
export const GotDialogMessage = m('GotCatalogDialogMessage', { message: Dialog.Message })
export const GotDrawerMessage = m('GotCatalogDrawerMessage', { message: Drawer.Message })
export const GotDropdownMenuMessage = m('GotCatalogDropdownMenuMessage', { message: DropdownMenu.Message })
export const GotHoverCardMessage = m('GotCatalogHoverCardMessage', { message: HoverCard.Message })
export const GotMessageScrollerMessage = m('GotCatalogMessageScrollerMessage', { message: MessageScroller.Message })
export const MenubarTarget = S.Literals(['file', 'edit', 'view'])
export type MenubarTarget = typeof MenubarTarget.Type
export const GotMenubarMessage = m('GotCatalogMenubarMessage', { target: MenubarTarget, message: DropdownMenu.Message })
export const GotPopoverMessage = m('GotCatalogPopoverMessage', { message: Popover.Message })
export const GotSelectMessage = m('GotCatalogSelectMessage', { message: Select.Message })
export const GotSheetMessage = m('GotCatalogSheetMessage', { message: Sheet.Message })
export const GotSonnerMessage = m('GotCatalogSonnerMessage', { message: Sonner.Message })
export const GotToastMessage = m('GotCatalogToastMessage', { message: Sonner.Message })
export const GotTooltipMessage = m('GotCatalogTooltipMessage', { message: Tooltip.Message })

export const Message = S.Union([
  ChangedText,
  ClickedPreviewAction,
  ChangedNativeSelect,
  ToggledPreview,
  ChangedToggleGroup,
  OpenedOverlay,
  GotCarouselMessage,
  GotCheckboxMessage,
  GotCollapsibleMessage,
  GotDataTableMessage,
  GotRadioGroupMessage,
  GotResizableMessage,
  GotSliderMessage,
  GotSwitchMessage,
  GotTabsMessage,
  GotAlertDialogMessage,
  GotComboboxMessage,
  GotCommandMessage,
  GotContextMenuMessage,
  GotDatePickerMessage,
  GotDialogMessage,
  GotDrawerMessage,
  GotDropdownMenuMessage,
  GotHoverCardMessage,
  GotMessageScrollerMessage,
  GotMenubarMessage,
  GotPopoverMessage,
  GotSelectMessage,
  GotSheetMessage,
  GotSonnerMessage,
  GotToastMessage,
  GotTooltipMessage,
])
export type Message = typeof Message.Type

export const init = (): Model => ({
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
  togglePressed: true,
  toggleGroupValue: 'center',
  carousel: Carousel.init('docs-carousel', 3),
  checkbox: Checkbox.init({ id: 'docs-checkbox', isChecked: true }),
  collapsible: Collapsible.init({ id: 'docs-collapsible', isOpen: true }),
  dataTable: DataTable.init(5),
  radioGroup: RadioGroup.init({ id: 'docs-radio', selectedValue: 'comfortable' }),
  resizable: Resizable.init('docs-resizable', 50),
  slider: Slider.init({ id: 'docs-slider', min: 0, max: 100, step: 1, initialValue: 50 }),
  switchControl: Switch.init({ id: 'docs-switch', isChecked: true }),
  tabs: Tabs.init({ id: 'docs-tabs', activeIndex: 0 }),
  alertDialog: AlertDialog.init({ id: 'docs-alert-dialog', isAnimated: true }),
  combobox: Combobox.init({ id: 'docs-combobox', isAnimated: true }),
  command: CommandMenu.init({ id: 'docs-command', isAnimated: true }),
  contextMenu: ContextMenu.init({ id: 'docs-context-menu' }),
  datePicker: DatePicker.init({ id: 'docs-date-picker', today: { year: 2026, month: 7, day: 28 }, initialSelectedDate: { year: 2026, month: 7, day: 18 }, isAnimated: true }),
  dialog: Dialog.init({ id: 'docs-dialog', isAnimated: true }),
  drawer: Drawer.init({ id: 'docs-drawer', isAnimated: true }),
  dropdownMenu: DropdownMenu.init({ id: 'docs-dropdown' }),
  hoverCard: HoverCard.init({ id: 'docs-hover-card' }),
  messageScroller: MessageScroller.init('docs-message-scroll'),
  menubarFile: DropdownMenu.init({ id: 'docs-menubar-file' }),
  menubarEdit: DropdownMenu.init({ id: 'docs-menubar-edit' }),
  menubarView: DropdownMenu.init({ id: 'docs-menubar-view' }),
  popover: Popover.init({ id: 'docs-popover', isAnimated: true }),
  select: Select.init({ id: 'docs-select', selectedItem: 'apple' }),
  sheet: Sheet.init({ id: 'docs-sheet', isAnimated: true }),
  sonner: Sonner.show(Sonner.init({ id: 'docs-sonner' }), Sonner.success({ title: 'Event has been created', description: 'Sunday, December 03, 2023 at 9:00 AM', sticky: true }))[0],
  toast: Sonner.show(Sonner.init({ id: 'docs-toast' }), Sonner.info({ title: 'Scheduled: Catch up', description: 'Friday, February 10, 2023 at 5:57 PM', sticky: true }))[0],
  tooltip: Tooltip.init({ id: 'docs-tooltip', showDelay: 0 }),
})

/**
 * A docs page renders several instances of the same component model at once.
 * Foldkit submodel slot identity is derived from each child model id, so every
 * example receives a stable, route-local id while messages still update the
 * corresponding canonical field in this parent model.
 */
export const withExampleIds = (model: Model, suffix: string): Model => {
  const id = (value: string): string => `${value}-${suffix}`
  return {
    ...model,
    carousel: { ...model.carousel, id: id(model.carousel.id) },
    checkbox: { ...model.checkbox, id: id(model.checkbox.id) },
    collapsible: { ...model.collapsible, id: id(model.collapsible.id) },
    radioGroup: { ...model.radioGroup, id: id(model.radioGroup.id) },
    resizable: { ...model.resizable, id: id(model.resizable.id) },
    slider: { ...model.slider, id: id(model.slider.id) },
    switchControl: { ...model.switchControl, id: id(model.switchControl.id) },
    tabs: { ...model.tabs, id: id(model.tabs.id) },
    alertDialog: {
      ...model.alertDialog,
      id: id(model.alertDialog.id),
      animation: { ...model.alertDialog.animation, id: id(model.alertDialog.animation.id) },
    },
    combobox: { ...model.combobox, id: id(model.combobox.id) },
    command: { ...model.command, id: id(model.command.id) },
    contextMenu: { ...model.contextMenu, id: id(model.contextMenu.id) },
    datePicker: {
      ...model.datePicker,
      id: id(model.datePicker.id),
      calendar: { ...model.datePicker.calendar, id: id(model.datePicker.calendar.id) },
    },
    dialog: {
      ...model.dialog,
      id: id(model.dialog.id),
      animation: { ...model.dialog.animation, id: id(model.dialog.animation.id) },
    },
    drawer: {
      ...model.drawer,
      dialog: {
        ...model.drawer.dialog,
        id: id(model.drawer.dialog.id),
        animation: { ...model.drawer.dialog.animation, id: id(model.drawer.dialog.animation.id) },
      },
    },
    dropdownMenu: { ...model.dropdownMenu, id: id(model.dropdownMenu.id) },
    hoverCard: { ...model.hoverCard, id: id(model.hoverCard.id) },
    messageScroller: { ...model.messageScroller, id: id(model.messageScroller.id) },
    menubarFile: { ...model.menubarFile, id: id(model.menubarFile.id) },
    menubarEdit: { ...model.menubarEdit, id: id(model.menubarEdit.id) },
    menubarView: { ...model.menubarView, id: id(model.menubarView.id) },
    popover: { ...model.popover, id: id(model.popover.id) },
    select: { ...model.select, id: id(model.select.id) },
    sheet: {
      ...model.sheet,
      id: id(model.sheet.id),
      animation: { ...model.sheet.animation, id: id(model.sheet.animation.id) },
    },
    sonner: { ...model.sonner, id: id(model.sonner.id) },
    toast: { ...model.toast, id: id(model.toast.id) },
    tooltip: { ...model.tooltip, id: id(model.tooltip.id) },
  }
}

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>]

export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'ClickedCatalogPreviewAction':
      return [model, []]
    case 'ChangedCatalogNativeSelect':
      return [{ ...model, nativeSelect: message.value }, []]
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
    case 'ChangedCatalogPreviewText':
      return [{ ...model, [message.target]: message.value }, []]
    case 'GotCatalogCarouselMessage':
      return [{ ...model, carousel: Carousel.update(model.carousel, message.message) }, []]
    case 'GotCatalogCheckboxMessage': {
      const [checkbox, commands] = Checkbox.update(model.checkbox, message.message)
      return [{ ...model, checkbox }, Command.mapMessages(commands, next => GotCheckboxMessage({ message: next }))]
    }
    case 'GotCatalogCollapsibleMessage': {
      const [collapsible, commands] = Collapsible.update(model.collapsible, message.message)
      return [{ ...model, collapsible }, Command.mapMessages(commands, next => GotCollapsibleMessage({ message: next }))]
    }
    case 'GotCatalogDataTableMessage':
      return [{ ...model, dataTable: DataTable.update(model.dataTable, message.message) }, []]
    case 'GotCatalogRadioGroupMessage': {
      const [radioGroup, commands] = RadioGroup.update(model.radioGroup, message.message)
      return [{ ...model, radioGroup }, Command.mapMessages(commands, next => GotRadioGroupMessage({ message: next }))]
    }
    case 'GotCatalogResizableMessage':
      return [{ ...model, resizable: Resizable.update(model.resizable, message.message) }, []]
    case 'GotCatalogSliderMessage': {
      const [slider, commands] = Slider.update(model.slider, message.message)
      return [{ ...model, slider }, Command.mapMessages(commands, next => GotSliderMessage({ message: next }))]
    }
    case 'GotCatalogSwitchMessage': {
      const [switchControl, commands] = Switch.update(model.switchControl, message.message)
      return [{ ...model, switchControl }, Command.mapMessages(commands, next => GotSwitchMessage({ message: next }))]
    }
    case 'GotCatalogTabsMessage': {
      const [tabs, commands] = Tabs.update(model.tabs, message.message)
      return [{ ...model, tabs }, Command.mapMessages(commands, next => GotTabsMessage({ message: next }))]
    }
    case 'GotCatalogAlertDialogMessage': {
      const [alertDialog, commands] = AlertDialog.update(model.alertDialog, message.message)
      return [{ ...model, alertDialog }, Command.mapMessages(commands, next => GotAlertDialogMessage({ message: next }))]
    }
    case 'GotCatalogComboboxMessage': {
      const [combobox, commands] = Combobox.update(model.combobox, message.message)
      return [{ ...model, combobox }, Command.mapMessages(commands, next => GotComboboxMessage({ message: next }))]
    }
    case 'GotCatalogCommandMessage': {
      const [command, commands] = CommandMenu.update(model.command, message.message)
      return [{ ...model, command }, Command.mapMessages(commands, next => GotCommandMessage({ message: next }))]
    }
    case 'GotCatalogContextMenuMessage': {
      const [contextMenu, commands] = ContextMenu.update(model.contextMenu, message.message)
      return [{ ...model, contextMenu }, Command.mapMessages(commands, next => GotContextMenuMessage({ message: next }))]
    }
    case 'GotCatalogDatePickerMessage': {
      const [datePicker, commands] = DatePicker.update(model.datePicker, message.message)
      return [{ ...model, datePicker }, Command.mapMessages(commands, next => GotDatePickerMessage({ message: next }))]
    }
    case 'GotCatalogDialogMessage': {
      const [dialog, commands] = Dialog.update(model.dialog, message.message)
      return [{ ...model, dialog }, Command.mapMessages(commands, next => GotDialogMessage({ message: next }))]
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
    case 'GotCatalogSelectMessage': {
      const [select, commands] = Select.update(model.select, message.message)
      return [{ ...model, select }, Command.mapMessages(commands, next => GotSelectMessage({ message: next }))]
    }
    case 'GotCatalogSheetMessage': {
      const [sheet, commands] = Sheet.update(model.sheet, message.message)
      return [{ ...model, sheet }, Command.mapMessages(commands, next => GotSheetMessage({ message: next }))]
    }
    case 'GotCatalogSonnerMessage': {
      const [sonner, commands] = Sonner.update(model.sonner, message.message)
      return [{ ...model, sonner }, Command.mapMessages(commands, next => GotSonnerMessage({ message: next }))]
    }
    case 'GotCatalogToastMessage': {
      const [toast, commands] = Sonner.update(model.toast, message.message)
      return [{ ...model, toast }, Command.mapMessages(commands, next => GotToastMessage({ message: next }))]
    }
    case 'GotCatalogTooltipMessage': {
      const [tooltip, commands] = Tooltip.update(model.tooltip, message.message)
      return [{ ...model, tooltip }, Command.mapMessages(commands, next => GotTooltipMessage({ message: next }))]
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
