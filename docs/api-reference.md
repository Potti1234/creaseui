# Component API inventory

This file is generated from exported declarations in `src/ui/*.ts`. The web documentation presents the same data beside runnable examples.

## Accordion

Source: [`src/ui/accordion.ts`](../src/ui/accordion.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `AccordionType` | re-export | `export { AccordionType } from '@/lib/accordion-state'` |
| `ChangedValue` | re-export | `export { ChangedValue } from '@/lib/accordion-state'` |
| `Message` | re-export | `export { Message } from '@/lib/accordion-state'` |
| `Model` | re-export | `export { Model } from '@/lib/accordion-state'` |
| `OutMessage` | re-export | `export { OutMessage } from '@/lib/accordion-state'` |
| `ToggledItem` | re-export | `export { ToggledItem } from '@/lib/accordion-state'` |
| `init` | re-export | `export { init } from '@/lib/accordion-state'` |
| `reflect` | re-export | `export { reflect } from '@/lib/accordion-state'` |
| `update` | re-export | `export { update } from '@/lib/accordion-state'` |
| `AccordionInitItem` | re-export | `export { AccordionInitItem } from '@/lib/accordion-state'` |
| `AccordionItem` | re-export | `export { AccordionItem } from '@/lib/accordion-state'` |
| `InitConfig` | re-export | `export { InitConfig } from '@/lib/accordion-state'` |
| `UpdateReturn` | re-export | `export { UpdateReturn } from '@/lib/accordion-state'` |
| `ViewInputs` | type | `ViewInputs = Readonly<{ items: ReadonlyArray<AccordionBehavior.AccordionItem>; class?: string; itemClass?: string; triggerClass?: string; contentClass?: string; }>` |
| `view` | value | `view: value` |
| `AccordionProps` | type | `AccordionProps<Msg> = ViewInputs & Readonly<{ model: AccordionBehavior.Model; toParentMessage: (message: AccordionBehavior.Message) => Msg; }>` |
| `accordion` | function | `accordion<Msg>(props: AccordionProps<Msg>, h: HtmlBuilder<Msg>): Html` |

## Alert Dialog

Source: [`src/ui/alert-dialog.ts`](../src/ui/alert-dialog.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `Model` | value | `Model: value` |
| `Model` | type | `Model = typeof Model.Type` |
| `Message` | value | `Message: value` |
| `Message` | type | `Message = typeof Message.Type` |
| `OutMessage` | value | `OutMessage: value` |
| `OutMessage` | type | `OutMessage = typeof OutMessage.Type` |
| `init` | value | `init: value` |
| `update` | value | `update: value` |
| `open` | value | `open: value` |
| `close` | value | `close: value` |
| `AlertDialogSlots` | type | `AlertDialogSlots = Readonly<{ closeButton: ReadonlyArray<ChildAttribute>; }>` |
| `AlertDialogProps` | type | `AlertDialogProps<Msg> = Readonly<{ model: Model; toParentMessage: (message: Message) => Msg; title: string; description?: string; media?: ReadonlyArray<Html \| string>; actionLabel: string; onAction?: Msg; cancelLabel?: string; size?: 'default' \| 'sm'; actionC…` |
| `alertDialog` | function | `alertDialog<Msg>(props: AlertDialogProps<Msg>, h: HtmlBuilder<Msg>): Html` |

## Alert

Source: [`src/ui/alert.ts`](../src/ui/alert.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `alertVariants` | value | `alertVariants: value` |
| `AlertVariants` | type | `AlertVariants = VariantProps<typeof alertVariants>` |
| `AlertProps` | type | `AlertProps = Slot & Readonly<{ variant?: AlertVariants['variant']; }>` |
| `alert` | function | `alert<Msg>(props: AlertProps, h: HtmlBuilder<Msg>): Html` |
| `alertTitle` | function | `alertTitle<Msg>(props: Slot, h: HtmlBuilder<Msg>): Html` |
| `alertDescription` | function | `alertDescription<Msg>(props: Slot, h: HtmlBuilder<Msg>): Html` |

## Aspect Ratio

Source: [`src/ui/aspect-ratio.ts`](../src/ui/aspect-ratio.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `AspectRatioProps` | type | `AspectRatioProps = Readonly<{ ratio: number; class?: string; children: ReadonlyArray<Html \| string>; }>` |
| `aspectRatio` | function | `aspectRatio<Msg>(props: AspectRatioProps, h: HtmlBuilder<Msg>): Html` |

## Attachment

Source: [`src/ui/attachment.ts`](../src/ui/attachment.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `attachmentVariants` | value | `attachmentVariants: value` |
| `AttachmentState` | type | `AttachmentState = 'idle' \| 'uploading' \| 'processing' \| 'error' \| 'done'` |
| `attachment` | function | `attachment<Msg>(props: ChildrenProps & Readonly<{ state?: AttachmentState; size?: VariantProps<typeof attachmentVariants>['size']; orientation?: VariantProps<typeof attachmentVariants>['orientation']; }>, h: HtmlBuilder<Msg>): Html` |
| `attachmentMedia` | function | `attachmentMedia<Msg>(props: ChildrenProps & Readonly<{ variant?: 'icon' \| 'image' }>, h: HtmlBuilder<Msg>): Html` |
| `attachmentContent` | function | `attachmentContent<Msg>(props: ChildrenProps, h: HtmlBuilder<Msg>): Html` |
| `attachmentActions` | function | `attachmentActions<Msg>(props: ChildrenProps, h: HtmlBuilder<Msg>): Html` |
| `attachmentGroup` | function | `attachmentGroup<Msg>(props: ChildrenProps, h: HtmlBuilder<Msg>): Html` |
| `attachmentTitle` | function | `attachmentTitle<Msg>(props: ChildrenProps, h: HtmlBuilder<Msg>): Html` |
| `attachmentDescription` | function | `attachmentDescription<Msg>(props: ChildrenProps, h: HtmlBuilder<Msg>): Html` |
| `attachmentTrigger` | function | `attachmentTrigger<Msg>(props: Readonly<{ onClick: Msg; label: string; class?: string }>, h: HtmlBuilder<Msg>): Html` |

## Avatar

Source: [`src/ui/avatar.ts`](../src/ui/avatar.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `Model` | value | `Model: value` |
| `Model` | type | `Model = typeof Model.Type` |
| `Loaded` | value | `Loaded: value` |
| `Failed` | value | `Failed: value` |
| `Message` | value | `Message: value` |
| `Message` | type | `Message = typeof Message.Type` |
| `init` | function | `init(): Model` |
| `update` | function | `update(_model: Model, message: Message): Model` |
| `AvatarProps` | type | `AvatarProps = Readonly<{ size?: 'default' \| 'sm' \| 'lg'; class?: string; children: ReadonlyArray<Html \| string>; }>` |
| `avatar` | function | `avatar<Msg>(props: AvatarProps, h: HtmlBuilder<Msg>): Html` |
| `AvatarImageProps` | type | `AvatarImageProps = Readonly<{ src: string; alt: string; class?: string; model?: Model; }>` |
| `avatarImage` | function | `avatarImage<Msg>(props: AvatarImageProps & Readonly<{ toParentMessage?: (message: Message) => Msg }>, h: HtmlBuilder<Msg>): Html` |
| `AvatarFallbackProps` | type | `AvatarFallbackProps = Readonly<{ class?: string; children: ReadonlyArray<Html \| string>; model?: Model; }>` |
| `avatarFallback` | function | `avatarFallback<Msg>(props: AvatarFallbackProps, h: HtmlBuilder<Msg>): Html` |

## Badge

Source: [`src/ui/badge.ts`](../src/ui/badge.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `badgeVariants` | value | `badgeVariants: value` |
| `BadgeVariants` | type | `BadgeVariants = VariantProps<typeof badgeVariants>` |
| `BadgeProps` | type | `BadgeProps = Readonly<{ children: ReadonlyArray<Html \| string>; variant?: BadgeVariants['variant']; class?: string; }>` |
| `badge` | function | `badge<Msg>(props: BadgeProps, h: HtmlBuilder<Msg>): Html` |

## Breadcrumb

Source: [`src/ui/breadcrumb.ts`](../src/ui/breadcrumb.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `BreadcrumbProps` | type | `BreadcrumbProps = Slot` |
| `breadcrumb` | function | `breadcrumb<Msg>(props: BreadcrumbProps, h: HtmlBuilder<Msg>): Html` |
| `breadcrumbList` | function | `breadcrumbList<Msg>(props: Slot, h: HtmlBuilder<Msg>): Html` |
| `breadcrumbItem` | function | `breadcrumbItem<Msg>(props: Slot, h: HtmlBuilder<Msg>): Html` |
| `BreadcrumbLinkProps` | type | `BreadcrumbLinkProps = Slot & Readonly<{ href: string; }>` |
| `breadcrumbLink` | function | `breadcrumbLink<Msg>(props: BreadcrumbLinkProps, h: HtmlBuilder<Msg>): Html` |
| `breadcrumbPage` | function | `breadcrumbPage<Msg>(props: Slot, h: HtmlBuilder<Msg>): Html` |
| `BreadcrumbSeparatorProps` | type | `BreadcrumbSeparatorProps = Readonly<{ class?: string; children?: ReadonlyArray<Html \| string>; }>` |
| `breadcrumbSeparator` | function | `breadcrumbSeparator<Msg>(props: BreadcrumbSeparatorProps = {}, h: HtmlBuilder<Msg>): Html` |
| `BreadcrumbEllipsisProps` | type | `BreadcrumbEllipsisProps = Readonly<{ class?: string; }>` |
| `breadcrumbEllipsis` | function | `breadcrumbEllipsis<Msg>(props: BreadcrumbEllipsisProps = {}, h: HtmlBuilder<Msg>): Html` |

## Bubble

Source: [`src/ui/bubble.ts`](../src/ui/bubble.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `bubbleVariants` | value | `bubbleVariants: value` |
| `BubbleVariant` | type | `BubbleVariant = VariantProps<typeof bubbleVariants>['variant']` |
| `bubbleGroup` | function | `bubbleGroup<Msg>(props: ChildrenProps, h: HtmlBuilder<Msg>): Html` |
| `bubble` | function | `bubble<Msg>(props: ChildrenProps & Readonly<{ variant?: BubbleVariant; align?: 'start' \| 'end' }>, h: HtmlBuilder<Msg>): Html` |
| `bubbleContent` | function | `bubbleContent<Msg>(props: ChildrenProps, h: HtmlBuilder<Msg>): Html` |
| `bubbleReactions` | function | `bubbleReactions<Msg>(props: ChildrenProps & Readonly<{ side?: 'top' \| 'bottom'; align?: 'start' \| 'end' }>, h: HtmlBuilder<Msg>): Html` |

## Button Group

Source: [`src/ui/button-group.ts`](../src/ui/button-group.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `buttonGroupVariants` | value | `buttonGroupVariants: value` |
| `ButtonGroupVariants` | type | `ButtonGroupVariants = VariantProps<typeof buttonGroupVariants>` |
| `ButtonGroupProps` | type | `ButtonGroupProps = Readonly<{ children: ReadonlyArray<Html \| string>; orientation?: ButtonGroupVariants['orientation']; class?: string; }>` |
| `buttonGroup` | function | `buttonGroup<Msg>(props: ButtonGroupProps, h: HtmlBuilder<Msg>): Html` |
| `ButtonGroupSeparatorProps` | type | `ButtonGroupSeparatorProps = Readonly<{ orientation?: 'horizontal' \| 'vertical'; class?: string; }>` |
| `buttonGroupSeparator` | function | `buttonGroupSeparator<Msg>(props: ButtonGroupSeparatorProps = {}, h: HtmlBuilder<Msg>): Html` |
| `ButtonGroupTextProps` | type | `ButtonGroupTextProps = Readonly<{ children: ReadonlyArray<Html \| string>; class?: string; }>` |
| `buttonGroupText` | function | `buttonGroupText<Msg>(props: ButtonGroupTextProps, h: HtmlBuilder<Msg>): Html` |

## Button

Source: [`src/ui/button.ts`](../src/ui/button.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `buttonVariants` | value | `buttonVariants: value` |
| `ButtonVariants` | type | `ButtonVariants = VariantProps<typeof buttonVariants>` |
| `ButtonProps` | type | `ButtonProps<Msg> = ButtonBehaviorProps<Msg> & Readonly<{ variant?: ButtonVariants['variant']; size?: ButtonVariants['size']; class?: string; }>` |
| `button` | function | `button<Msg>(props: ButtonProps<Msg>, h: HtmlBuilder<Msg>): Html` |
| `ButtonLinkProps` | type | `ButtonLinkProps = ButtonLinkBehaviorProps & Readonly<{ variant?: ButtonVariants['variant']; size?: ButtonVariants['size']; class?: string; }>` |
| `buttonLink` | function | `buttonLink<Msg>(props: ButtonLinkProps, h: HtmlBuilder<Msg>): Html` |

## Calendar

Source: [`src/ui/calendar.ts`](../src/ui/calendar.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `Model` | value | `Model: value` |
| `Model` | type | `Model = typeof Model.Type` |
| `Message` | value | `Message: value` |
| `Message` | type | `Message = typeof Message.Type` |
| `OutMessage` | value | `OutMessage: value` |
| `OutMessage` | type | `OutMessage = typeof OutMessage.Type` |
| `init` | value | `init: value` |
| `update` | value | `update: value` |
| `selectDate` | value | `selectDate: value` |
| `focusDate` | value | `focusDate: value` |
| `reflectMinDate` | value | `reflectMinDate: value` |
| `reflectMaxDate` | value | `reflectMaxDate: value` |
| `reflectDisabledDates` | value | `reflectDisabledDates: value` |
| `reflectDisabledDaysOfWeek` | value | `reflectDisabledDaysOfWeek: value` |
| `dropToDays` | value | `dropToDays: value` |
| `CalendarViewOptions` | type | `CalendarViewOptions = Readonly<{ class?: string; }>` |
| `calendarView` | function | `calendarView<Msg>(attributes: CalendarPrimitive.CalendarAttributes, options: CalendarViewOptions, h: HtmlBuilder<Msg>): Html` |
| `CalendarProps` | type | `CalendarProps<Msg> = Readonly<{ model: Model; maybeSelectedDate: Option.Option<FoldkitCalendar.CalendarDate>; toParentMessage: (message: Message) => Msg; class?: string; previousMonthLabel?: string; nextMonthLabel?: string; previousYearsPageLabel?: string; ne…` |
| `calendar` | function | `calendar<Msg>(props: CalendarProps<Msg>, h: HtmlBuilder<Msg>): Html` |

## Card

Source: [`src/ui/card.ts`](../src/ui/card.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `CardProps` | type | `CardProps = Slot & Readonly<{ element?: 'div' \| 'section' \| 'article'; }>` |
| `card` | function | `card<Msg>(props: CardProps, h: HtmlBuilder<Msg>): Html` |
| `cardHeader` | value | `cardHeader: value` |
| `cardTitle` | value | `cardTitle: value` |
| `cardDescription` | value | `cardDescription: value` |
| `cardAction` | value | `cardAction: value` |
| `cardContent` | value | `cardContent: value` |
| `cardFooter` | value | `cardFooter: value` |

## Carousel

Source: [`src/ui/carousel.ts`](../src/ui/carousel.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `Model` | value | `Model: value` |
| `Model` | type | `Model = typeof Model.Type` |
| `Previous` | value | `Previous: value` |
| `Next` | value | `Next: value` |
| `WentTo` | value | `WentTo: value` |
| `Message` | value | `Message: value` |
| `Message` | type | `Message = typeof Message.Type` |
| `init` | function | `init(id: string, count: number, index = 0): Model` |
| `update` | function | `update(model: Model, message: Message): Model` |
| `CarouselProps` | type | `CarouselProps<Msg> = Readonly<{ model: Model; toParentMessage: (message: Message) => Msg; items: ReadonlyArray<Html \| string>; ariaLabel?: string; orientation?: 'horizontal' \| 'vertical'; loop?: boolean; /** Additional Embla options. Component-level options t…` |
| `carousel` | function | `carousel<Msg>(props: CarouselProps<Msg>, h: HtmlBuilder<Msg>): Html` |

## Chart

Source: [`src/ui/chart.ts`](../src/ui/chart.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `ChartSeriesConfig` | type | `ChartSeriesConfig = Readonly<{ label?: Html \| string; color?: string; icon?: Html; }>` |
| `ChartConfig` | type | `ChartConfig = Readonly<Record<string, ChartSeriesConfig>>` |
| `ChartContainerProps` | type | `ChartContainerProps = Readonly<{ config: ChartConfig; children: ReadonlyArray<Html \| string>; class?: string; ariaLabel?: string; }>` |
| `chartContainer` | function | `chartContainer<Msg>(props: ChartContainerProps, h: HtmlBuilder<Msg>): Html` |
| `ChartLegendProps` | type | `ChartLegendProps = Readonly<{ config: ChartConfig; series?: ReadonlyArray<string>; class?: string; }>` |
| `chartLegend` | function | `chartLegend<Msg>(props: ChartLegendProps, h: HtmlBuilder<Msg>): Html` |
| `ChartTooltipItem` | type | `ChartTooltipItem = Readonly<{ key: string; value: Html \| string }>` |
| `chartTooltipContent` | function | `chartTooltipContent<Msg>(props: Readonly<{ config: ChartConfig; label?: Html \| string; items: ReadonlyArray<ChartTooltipItem>; class?: string; }>, h: HtmlBuilder<Msg>): Html` |
| `BarChartDatum` | type | `BarChartDatum = Readonly<{ label: string; value: number; }>` |
| `BarChartProps` | type | `BarChartProps = Readonly<{ data: ReadonlyArray<BarChartDatum>; class?: string; showXAxisLabels?: boolean; isCompact?: boolean; }>` |
| `barChart` | function | `barChart<Msg>(props: BarChartProps, h: HtmlBuilder<Msg>): Html` |
| `AreaChartProps` | type | `AreaChartProps = Readonly<{ data: ReadonlyArray<number>; class?: string; }>` |
| `areaChart` | function | `areaChart<Msg>(props: AreaChartProps, h: HtmlBuilder<Msg>): Html` |
| `InteractiveAreaChartDatum` | type | `InteractiveAreaChartDatum = Readonly<{ label: string; desktop: number; mobile: number; }>` |
| `InteractiveAreaChartProps` | type | `InteractiveAreaChartProps = Readonly<{ data: ReadonlyArray<InteractiveAreaChartDatum>; ariaLabel?: string; class?: string; }>` |
| `interactiveAreaChart` | function | `interactiveAreaChart<Msg>(props: InteractiveAreaChartProps, h: HtmlBuilder<Msg>): Html` |
| `DonutChartProps` | type | `DonutChartProps = Readonly<{ value: number; max: number; label?: string; sublabel?: string; class?: string; }>` |
| `donutChart` | function | `donutChart<Msg>(props: DonutChartProps, h: HtmlBuilder<Msg>): Html` |

## Checkbox

Source: [`src/ui/checkbox.ts`](../src/ui/checkbox.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `CheckboxProps` | type | `CheckboxProps<Msg> = CheckboxBehaviorProps<Msg> & Readonly<{ class?: string }>` |
| `checkbox` | function | `checkbox<Msg>(props: CheckboxProps<Msg>, h: HtmlBuilder<Msg>): Html` |

## Collapsible

Source: [`src/ui/collapsible.ts`](../src/ui/collapsible.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `CollapsibleProps` | type | `CollapsibleProps<Msg> = Readonly<{ id: string; isOpen: boolean; onToggle: (isOpen: boolean) => Msg; trigger: Html \| string; content: Html \| string; isDisabled?: boolean; ariaLabel?: string; class?: string; triggerClass?: string; contentClass?: string; }>` |
| `collapsible` | function | `collapsible<Msg>(props: CollapsibleProps<Msg>, h: HtmlBuilder<Msg>): Html` |

## Combobox

Source: [`src/ui/combobox.ts`](../src/ui/combobox.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `Model` | value | `Model: value` |
| `Model` | type | `Model = typeof Model.Type` |
| `Message` | value | `Message: value` |
| `Message` | type | `Message = typeof Message.Type` |
| `OutMessage` | value | `OutMessage: value` |
| `OutMessage` | type | `OutMessage<Value extends string = string> = ComboboxPrimitive.OutMessage<Value>` |
| `init` | value | `init: value` |
| `ComboboxSize` | type | `ComboboxSize = 'sm' \| 'default'` |
| `ComboboxItemConfig` | type | `ComboboxItemConfig = Readonly<{ content?: Html \| string; searchText?: string; class?: string; isDisabled?: boolean; }>` |
| `ComboboxProps` | type | `ComboboxProps<Item, Value extends string, Msg> = Readonly<{ model: Model; maybeSelectedValue: Option.Option<Value>; restingInputValue: string; toParentMessage: (message: Message) => Msg; items: ReadonlyArray<Item>; itemToValue: (item: Item) => Value; itemToLa…` |
| `ComboboxBundle` | type | `ComboboxBundle<Value extends string> = Readonly<{ update: ReturnType<typeof ComboboxPrimitive.create<Value>>['update']; combobox: <Item, Msg>(props: ComboboxProps<Item, Value, Msg>, h: HtmlBuilder<Msg>) => Html; }>` |
| `create` | function | `create<Value extends string = string>(): ComboboxBundle<Value>` |
| `update` | value | `update: value` |
| `combobox` | value | `combobox: value` |

## Command

Source: [`src/ui/command.ts`](../src/ui/command.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `Model` | value | `Model: value` |
| `Model` | type | `Model = typeof Model.Type` |
| `Message` | value | `Message: value` |
| `Message` | type | `Message = typeof Message.Type` |
| `OutMessage` | value | `OutMessage: value` |
| `OutMessage` | type | `OutMessage<Item extends string = string> = ComboboxPrimitive.OutMessage<Item>` |
| `init` | value | `init: value` |
| `update` | value | `update: value` |
| `CommandItemConfig` | type | `CommandItemConfig = Readonly<{ content: Html \| string; searchText?: string; shortcut?: Html \| string; class?: string; isDisabled?: boolean; }>` |
| `CommandProps` | type | `CommandProps<Item extends string, Msg> = Readonly<{ model: Model; maybeSelectedValue: Option.Option<Item>; restingInputValue: string; toParentMessage: (message: Message) => Msg; items: ReadonlyArray<Item>; itemToConfig: (item: Item) => CommandItemConfig; plac…` |
| `commandGroupHeading` | function | `commandGroupHeading<Msg>(content: Html \| string, className: string \| undefined, h: HtmlBuilder<Msg>): Html` |
| `commandShortcut` | function | `commandShortcut<Msg>(content: Html \| string, className: string \| undefined, h: HtmlBuilder<Msg>): Html` |
| `commandSeparator` | function | `commandSeparator<Msg>(className: string \| undefined, h: HtmlBuilder<Msg>): Html` |
| `commandEmpty` | function | `commandEmpty<Msg>(content: Html \| string, className: string \| undefined, h: HtmlBuilder<Msg>): Html` |
| `CommandBundle` | type | `CommandBundle<Item extends string> = Readonly<{ update: ComboboxPrimitive.Bundle<Item>['update']; selectItem: ComboboxPrimitive.Bundle<Item>['selectItem']; open: ComboboxPrimitive.Bundle<Item>['open']; close: ComboboxPrimitive.Bundle<Item>['close']; command: …` |
| `create` | function | `create<Item extends string = string>(): CommandBundle<Item>` |
| `command` | value | `command: value` |
| `commandPalette` | value | `commandPalette: value` |

## Context Menu

Source: [`src/ui/context-menu.ts`](../src/ui/context-menu.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `Model` | value | `Model: value` |
| `Model` | type | `Model = DropdownMenu.Model` |
| `Message` | value | `Message: value` |
| `Message` | type | `Message = DropdownMenu.Message` |
| `OutMessage` | type | `OutMessage<Item extends string = string> = DropdownMenu.OutMessage<Item>` |
| `init` | value | `init: value` |
| `create` | value | `create: value` |
| `update` | value | `update: value` |
| `open` | value | `open: value` |
| `openAt` | value | `openAt: value` |
| `close` | value | `close: value` |
| `selectItem` | value | `selectItem: value` |
| `ContextMenuItemConfig` | type | `ContextMenuItemConfig<Item extends string = string> = DropdownMenu.DropdownMenuItemConfig<Item>` |
| `ContextMenuProps` | type | `ContextMenuProps<Item extends string, Msg> = Readonly<{ model: Model; toParentMessage: (message: Message) => Msg; trigger: Html \| string; items: ReadonlyArray<Item>; itemToConfig: (item: Item) => ContextMenuItemConfig<Item>; ariaLabel?: string; class?: string…` |
| `contextMenu` | function | `contextMenu<Item extends string, Msg>(props: ContextMenuProps<Item, Msg>, h: HtmlBuilder<Msg>): Html` |

## Data Table

Source: [`src/ui/data-table.ts`](../src/ui/data-table.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `*` | re-export | `export * from '@/lib/data-table-state'` |
| `DataTableColumn` | type | `DataTableColumn<Row> = Readonly<{ key: string; header: string; cell: (row: Row) => Html \| string; sortValue?: (row: Row) => string \| number; isHideable?: boolean; class?: string; }>` |
| `DataTableProps` | type | `DataTableProps<Row, Msg> = Readonly<{ model: Model; toParentMessage: (message: Message) => Msg; rows: ReadonlyArray<Row>; columns: ReadonlyArray<DataTableColumn<Row>>; rowKey: (row: Row) => string; filterText?: (row: Row) => string; filterPlaceholder?: string…` |
| `dataTable` | function | `dataTable<Row, Msg>(props: DataTableProps<Row, Msg>, h: HtmlBuilder<Msg>): Html` |

## Date Picker

Source: [`src/ui/date-picker.ts`](../src/ui/date-picker.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `Model` | value | `Model: value` |
| `Model` | type | `Model = typeof Model.Type` |
| `Message` | value | `Message: value` |
| `Message` | type | `Message = typeof Message.Type` |
| `OutMessage` | value | `OutMessage: value` |
| `OutMessage` | type | `OutMessage = typeof OutMessage.Type` |
| `init` | value | `init: value` |
| `update` | value | `update: value` |
| `open` | value | `open: value` |
| `close` | value | `close: value` |
| `selectDate` | value | `selectDate: value` |
| `clear` | value | `clear: value` |
| `focusDate` | value | `focusDate: value` |
| `reflectMinDate` | value | `reflectMinDate: value` |
| `reflectMaxDate` | value | `reflectMaxDate: value` |
| `reflectDisabledDates` | value | `reflectDisabledDates: value` |
| `reflectDisabledDaysOfWeek` | value | `reflectDisabledDaysOfWeek: value` |
| `triggerId` | value | `triggerId: value` |
| `DatePickerProps` | type | `DatePickerProps<Msg> = Readonly<{ model: Model; maybeSelectedDate: Option.Option<FoldkitCalendar.CalendarDate>; toParentMessage: (message: Message) => Msg; placeholder?: string; formatDate?: (date: FoldkitCalendar.CalendarDate) => string; name?: string; isDis…` |
| `datePicker` | function | `datePicker<Msg>(props: DatePickerProps<Msg>, h: HtmlBuilder<Msg>): Html` |

## Dialog

Source: [`src/ui/dialog.ts`](../src/ui/dialog.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `Model` | value | `Model: value` |
| `Model` | type | `Model = typeof Model.Type` |
| `Message` | value | `Message: value` |
| `Message` | type | `Message = typeof Message.Type` |
| `OutMessage` | value | `OutMessage: value` |
| `OutMessage` | type | `OutMessage = typeof OutMessage.Type` |
| `init` | value | `init: value` |
| `update` | value | `update: value` |
| `open` | value | `open: value` |
| `close` | value | `close: value` |
| `FOOTER_CLASS` | value | `FOOTER_CLASS: value` |
| `DialogSlots` | type | `DialogSlots = Readonly<{ closeButton: ReadonlyArray<ChildAttribute>; initialFocusAttributes: () => ReadonlyArray<ChildAttribute>; }>` |
| `DialogPartProps` | type | `DialogPartProps = Readonly<{ children: ReadonlyArray<Html \| string>; class?: string; }>` |
| `DialogTextPartProps` | type | `DialogTextPartProps = DialogPartProps & Readonly<{ attributes: ReadonlyArray<ChildAttribute> }>` |
| `DialogCloseProps` | type | `DialogCloseProps = Readonly<{ children?: ReadonlyArray<Html \| string>; class?: string; ariaLabel?: string; }>` |
| `dialogHeader` | function | `dialogHeader<Msg>(props: DialogPartProps, h: HtmlBuilder<Msg>): Html` |
| `dialogTitle` | function | `dialogTitle<Msg>(props: DialogTextPartProps, h: HtmlBuilder<Msg>): Html` |
| `dialogDescription` | function | `dialogDescription<Msg>(props: DialogTextPartProps, h: HtmlBuilder<Msg>): Html` |
| `dialogFooter` | function | `dialogFooter<Msg>(props: DialogPartProps, h: HtmlBuilder<Msg>): Html` |
| `DialogParts` | type | `DialogParts<Msg> = Readonly<{ header: (props: DialogPartProps) => Html; title: (props: Omit<DialogTextPartProps, 'attributes'>) => Html; description: (props: Omit<DialogTextPartProps, 'attributes'>) => Html; footer: (props: DialogPartProps) => Html; close: (p…` |
| `DialogProps` | type | `DialogProps<Msg> = Readonly<{ model: Model; toParentMessage: (message: Message) => Msg; title: string; description?: string; content?: (slots: DialogSlots) => ReadonlyArray<Html>; footer?: (slots: DialogSlots) => ReadonlyArray<Html>; /** Replaces the default …` |
| `dialog` | function | `dialog<Msg>(props: DialogProps<Msg>, h: HtmlBuilder<Msg>): Html` |

## Direction

Source: [`src/ui/direction.ts`](../src/ui/direction.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `Direction` | type | `Direction = 'ltr' \| 'rtl'` |
| `direction` | function | `direction<Msg>(props: Readonly<{ direction: Direction; children: ReadonlyArray<Html \| string>; class?: string; }>, h: HtmlBuilder<Msg>): Html` |

## Drawer

Source: [`src/ui/drawer.ts`](../src/ui/drawer.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `Model` | value | `Model: value` |
| `Model` | type | `Model = typeof Model.Type` |
| `GotDialogMessage` | value | `GotDialogMessage: value` |
| `StartedDrag` | value | `StartedDrag: value` |
| `Dragged` | value | `Dragged: value` |
| `EndedDrag` | value | `EndedDrag: value` |
| `Message` | value | `Message: value` |
| `Message` | type | `Message = typeof Message.Type` |
| `OutMessage` | value | `OutMessage: value` |
| `OutMessage` | type | `OutMessage = typeof OutMessage.Type` |
| `init` | function | `init(config: DialogPrimitive.InitConfig): Model` |
| `update` | function | `update(model: Model, message: Message): UpdateReturn` |
| `open` | function | `open(model: Model): UpdateReturn` |
| `close` | function | `close(model: Model): UpdateReturn` |
| `DrawerDirection` | type | `DrawerDirection = 'top' \| 'right' \| 'bottom' \| 'left'` |
| `DrawerSlots` | type | `DrawerSlots = Readonly<{ closeButton: ReadonlyArray<ChildAttribute>; }>` |
| `DrawerProps` | type | `DrawerProps<Msg> = Readonly<{ model: Model; toParentMessage: (message: Message) => Msg; title: string; description?: string; content?: (slots: DrawerSlots) => ReadonlyArray<Html>; footer?: (slots: DrawerSlots) => ReadonlyArray<Html>; direction?: DrawerDirecti…` |
| `drawer` | function | `drawer<Msg>(props: DrawerProps<Msg>, h: HtmlBuilder<Msg>): Html` |

## Dropdown Menu

Source: [`src/ui/dropdown-menu.ts`](../src/ui/dropdown-menu.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `Model` | value | `Model: value` |
| `Model` | type | `Model = typeof Model.Type` |
| `Opened` | value | `Opened: value` |
| `AnchoredAt` | value | `AnchoredAt: value` |
| `OpenedFromContext` | value | `OpenedFromContext: value` |
| `OpenedAt` | value | `OpenedAt: value` |
| `Closed` | value | `Closed: value` |
| `ActivatedItem` | value | `ActivatedItem: value` |
| `OpenedSubmenu` | value | `OpenedSubmenu: value` |
| `ActivatedSubmenuItem` | value | `ActivatedSubmenuItem: value` |
| `ClosedSubmenu` | value | `ClosedSubmenu: value` |
| `SelectedItem` | value | `SelectedItem: value` |
| `Message` | value | `Message: value` |
| `Message` | type | `Message = typeof Message.Type` |
| `Selected` | value | `Selected: value` |
| `OutMessage` | value | `OutMessage: value` |
| `OutMessage` | type | `OutMessage<Item extends string = string> = Readonly<{ _tag: 'Selected'; value: Item; index: number; }>` |
| `init` | function | `init(config: Readonly<{ id: string; isAnimated?: boolean; isModal?: boolean }>): Model` |
| `create` | function | `create<Item extends string = string>(): inferred` |
| `update` | value | `update: value` |
| `open` | value | `open: value` |
| `openAt` | value | `openAt: value` |
| `close` | value | `close: value` |
| `selectItem` | value | `selectItem: value` |
| `DropdownMenuItemConfig` | type | `DropdownMenuItemConfig<Item extends string = string> = Readonly<{ label: Html \| string; icon?: Html; shortcut?: Html \| string; variant?: 'default' \| 'destructive'; kind?: 'item' \| 'checkbox' \| 'radio'; isChecked?: boolean; isInset?: boolean; isDisabled?: bool…` |
| `DropdownMenuSide` | type | `DropdownMenuSide = 'top' \| 'right' \| 'bottom' \| 'left'` |
| `DropdownMenuAlign` | type | `DropdownMenuAlign = 'start' \| 'center' \| 'end'` |
| `DropdownMenuProps` | type | `DropdownMenuProps<Item extends string, Msg> = Readonly<{ model: Model; toParentMessage: (message: Message) => Msg; trigger: Html \| string; triggerClass?: string; triggerTabindex?: number; items: ReadonlyArray<Item>; itemToConfig: (item: Item) => DropdownMenuI…` |
| `dropdownMenu` | function | `dropdownMenu<Item extends string, Msg>(props: DropdownMenuProps<Item, Msg>, h: HtmlBuilder<Msg>): Html` |

## Empty

Source: [`src/ui/empty.ts`](../src/ui/empty.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `empty` | value | `empty: value` |
| `emptyHeader` | value | `emptyHeader: value` |
| `emptyMediaVariants` | value | `emptyMediaVariants: value` |
| `EmptyMediaVariants` | type | `EmptyMediaVariants = VariantProps<typeof emptyMediaVariants>` |
| `EmptyMediaProps` | type | `EmptyMediaProps = SlotProps & Readonly<{ variant?: EmptyMediaVariants['variant']; }>` |
| `emptyMedia` | function | `emptyMedia<Msg>(props: EmptyMediaProps, h: HtmlBuilder<Msg>): Html` |
| `emptyTitle` | value | `emptyTitle: value` |
| `emptyDescription` | value | `emptyDescription: value` |
| `emptyContent` | value | `emptyContent: value` |

## Field

Source: [`src/ui/field.ts`](../src/ui/field.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `ControlFieldParts` | re-export | `export { ControlFieldParts } from '@/lib/field'` |
| `FieldError` | re-export | `export { FieldError } from '@/lib/field'` |
| `FieldSetProps` | type | `FieldSetProps = Slot & Readonly<{ isDisabled?: boolean }>` |
| `fieldSet` | function | `fieldSet<Msg>(props: FieldSetProps, h: HtmlBuilder<Msg>): Html` |
| `FieldLegendProps` | type | `FieldLegendProps = Slot & Readonly<{ variant?: 'legend' \| 'label' }>` |
| `fieldLegend` | function | `fieldLegend<Msg>(props: FieldLegendProps, h: HtmlBuilder<Msg>): Html` |
| `FieldGroupProps` | type | `FieldGroupProps = Slot & Readonly<{ variant?: 'default' \| 'outline' }>` |
| `fieldGroup` | function | `fieldGroup<Msg>(props: FieldGroupProps, h: HtmlBuilder<Msg>): Html` |
| `fieldVariants` | value | `fieldVariants: value` |
| `FieldVariants` | type | `FieldVariants = VariantProps<typeof fieldVariants>` |
| `ControlFieldProps` | type | `ControlFieldProps<Msg> = SharedControlFieldProps<Msg> & Readonly<{ class?: string }>` |
| `controlField` | function | `controlField<Msg>(props: ControlFieldProps<Msg>, h: HtmlBuilder<Msg>): Html` |
| `FieldProps` | type | `FieldProps = Slot & Readonly<{ orientation?: FieldVariants['orientation']; isInvalid?: boolean; isDisabled?: boolean; }>` |
| `field` | function | `field<Msg>(props: FieldProps, h: HtmlBuilder<Msg>): Html` |
| `fieldContent` | function | `fieldContent<Msg>(props: Slot, h: HtmlBuilder<Msg>): Html` |
| `FieldLabelProps` | type | `FieldLabelProps = Slot & Readonly<{ for?: string }>` |
| `fieldLabel` | function | `fieldLabel<Msg>(props: FieldLabelProps, h: HtmlBuilder<Msg>): Html` |
| `fieldTitle` | function | `fieldTitle<Msg>(props: Slot, h: HtmlBuilder<Msg>): Html` |
| `fieldDescription` | function | `fieldDescription<Msg>(props: Slot, h: HtmlBuilder<Msg>): Html` |
| `FieldSeparatorProps` | type | `FieldSeparatorProps = Readonly<{ class?: string; children?: ReadonlyArray<Html \| string>; }>` |
| `fieldSeparator` | function | `fieldSeparator<Msg>(props: FieldSeparatorProps = {}, h: HtmlBuilder<Msg>): Html` |
| `FieldErrorProps` | type | `FieldErrorProps = Readonly<{ class?: string; children?: ReadonlyArray<Html \| string>; errors?: ReadonlyArray<FieldError>; }>` |
| `fieldError` | function | `fieldError<Msg>(props: FieldErrorProps = {}, h: HtmlBuilder<Msg>): Html` |

## Form

Source: [`src/ui/form.ts`](../src/ui/form.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `FormError` | re-export | `export { FormError } from '@/lib/form'` |
| `FormMethod` | re-export | `export { FormMethod } from '@/lib/form'` |
| `formControlIds` | re-export | `export { formControlIds } from '@/lib/form'` |
| `FormProps` | type | `FormProps<Msg> = FormBehaviorProps<Msg> & Readonly<{ class?: string }>` |
| `form` | function | `form<Msg>(props: FormProps<Msg>, h: HtmlBuilder<Msg>): Html` |
| `ErrorSummaryProps` | type | `ErrorSummaryProps = SharedErrorSummaryProps & Readonly<{ class?: string }>` |
| `errorSummary` | function | `errorSummary<Msg>(props: ErrorSummaryProps, h: HtmlBuilder<Msg>): Html` |
| `FormItemProps` | type | `FormItemProps = Slot & Readonly<{ id: string; isInvalid?: boolean; isDisabled?: boolean }>` |
| `formItem` | function | `formItem<Msg>(props: FormItemProps, h: HtmlBuilder<Msg>): Html` |
| `FormLabelProps` | type | `FormLabelProps = Slot & Readonly<{ for: string }>` |
| `formLabel` | function | `formLabel<Msg>(props: FormLabelProps, h: HtmlBuilder<Msg>): Html` |
| `FormDescriptionProps` | type | `FormDescriptionProps = Slot & Readonly<{ id?: string }>` |
| `formDescription` | function | `formDescription<Msg>(props: FormDescriptionProps, h: HtmlBuilder<Msg>): Html` |
| `FormMessageProps` | type | `FormMessageProps = Readonly<{ id?: string; class?: string; message?: string; errors?: ReadonlyArray<Field.FieldError>; }>` |
| `formMessage` | function | `formMessage<Msg>(props: FormMessageProps = {}, h: HtmlBuilder<Msg>): Html` |

## Hover Card

Source: [`src/ui/hover-card.ts`](../src/ui/hover-card.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `Model` | value | `Model: value` |
| `Model` | type | `Model = typeof Model.Type` |
| `Entered` | value | `Entered: value` |
| `Left` | value | `Left: value` |
| `CompletedWaitBeforeClosingHoverCard` | value | `CompletedWaitBeforeClosingHoverCard: value` |
| `Message` | value | `Message: value` |
| `Message` | type | `Message = typeof Message.Type` |
| `InitConfig` | type | `InitConfig = Readonly<{ id: string; closeDelay?: number; showDelay?: number; }>` |
| `init` | function | `init(config: InitConfig): Model` |
| `update` | function | `update(model: Model, message: Message): UpdateReturn` |
| `reflectShowDelay` | function | `reflectShowDelay(model: Model, _showDelay: number): Model` |
| `HoverCardSide` | type | `HoverCardSide = 'top' \| 'right' \| 'bottom' \| 'left'` |
| `HoverCardAlign` | type | `HoverCardAlign = 'start' \| 'center' \| 'end'` |
| `HoverCardProps` | type | `HoverCardProps<Msg> = Readonly<{ model: Model; toParentMessage: (message: Message) => Msg; trigger: Html \| string; content: Html \| string; align?: HoverCardAlign; side?: HoverCardSide; isDisabled?: boolean; ariaLabel?: string; triggerClass?: string; class?: s…` |
| `hoverCard` | function | `hoverCard<Msg>(props: HoverCardProps<Msg>, h: HtmlBuilder<Msg>): Html` |

## Input Group

Source: [`src/ui/input-group.ts`](../src/ui/input-group.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `inputGroup` | function | `inputGroup<Msg>(props: SlotProps, h: HtmlBuilder<Msg>): Html` |
| `inputGroupAddonVariants` | value | `inputGroupAddonVariants: value` |
| `InputGroupAddonVariants` | type | `InputGroupAddonVariants = VariantProps< typeof inputGroupAddonVariants >` |
| `InputGroupAddonProps` | type | `InputGroupAddonProps<Msg = never> = SlotProps & Readonly<{ align?: InputGroupAddonVariants['align']; focusControlId?: string; onFocus?: Msg; }>` |
| `inputGroupAddon` | function | `inputGroupAddon<Msg>(props: InputGroupAddonProps<Msg>, h: HtmlBuilder<Msg>): Html` |
| `inputGroupButtonVariants` | value | `inputGroupButtonVariants: value` |
| `InputGroupButtonVariants` | type | `InputGroupButtonVariants = VariantProps< typeof inputGroupButtonVariants >` |
| `InputGroupButtonProps` | type | `InputGroupButtonProps<Msg> = Omit< ButtonProps<Msg>, 'size' \| 'class' > & Readonly<{ size?: InputGroupButtonVariants['size']; class?: string; }>` |
| `inputGroupButton` | function | `inputGroupButton<Msg>(props: InputGroupButtonProps<Msg>, h: HtmlBuilder<Msg>): Html` |
| `inputGroupText` | function | `inputGroupText<Msg>(props: SlotProps, h: HtmlBuilder<Msg>): Html` |
| `InputGroupInputProps` | type | `InputGroupInputProps<Msg> = Readonly<{ id: string; value: string; onInput: (value: string) => Msg; placeholder?: string; type?: string; name?: string; isDisabled?: boolean; isInvalid?: boolean; class?: string; }>` |
| `inputGroupInput` | function | `inputGroupInput<Msg>(props: InputGroupInputProps<Msg>, h: HtmlBuilder<Msg>): Html` |

## Input Otp

Source: [`src/ui/input-otp.ts`](../src/ui/input-otp.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `InputOtpProps` | type | `InputOtpProps<Msg> = Readonly<{ id: string; value: string; onInput: (value: string) => Msg; length?: number; name?: string; ariaLabel?: string; isDisabled?: boolean; isInvalid?: boolean; class?: string; groupClass?: string; /** Pattern accepted by the control…` |
| `inputOtp` | function | `inputOtp<Msg>(props: InputOtpProps<Msg>, h: HtmlBuilder<Msg>): Html` |
| `inputOtpSeparator` | function | `inputOtpSeparator<Msg>(h: HtmlBuilder<Msg>): Html` |

## Input

Source: [`src/ui/input.ts`](../src/ui/input.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `InputProps` | type | `InputProps<Msg> = InputBehaviorProps<Msg> & Readonly<{ class?: string; }>` |
| `input` | function | `input<Msg>(props: InputProps<Msg>, h: HtmlBuilder<Msg>): Html` |

## Item

Source: [`src/ui/item.ts`](../src/ui/item.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `itemVariants` | value | `itemVariants: value` |
| `ItemVariants` | type | `ItemVariants = VariantProps<typeof itemVariants>` |
| `ItemProps` | type | `ItemProps = SlotProps & Readonly<{ variant?: ItemVariants['variant']; size?: ItemVariants['size']; element?: 'div' \| 'li' \| 'article'; }>` |
| `item` | function | `item<Msg>(props: ItemProps, h: HtmlBuilder<Msg>): Html` |
| `itemMediaVariants` | value | `itemMediaVariants: value` |
| `ItemMediaVariants` | type | `ItemMediaVariants = VariantProps<typeof itemMediaVariants>` |
| `ItemMediaProps` | type | `ItemMediaProps = SlotProps & Readonly<{ variant?: ItemMediaVariants['variant']; }>` |
| `itemMedia` | function | `itemMedia<Msg>(props: ItemMediaProps, h: HtmlBuilder<Msg>): Html` |
| `itemContent` | value | `itemContent: value` |
| `itemTitle` | value | `itemTitle: value` |
| `itemDescription` | function | `itemDescription<Msg>(props: SlotProps, h: HtmlBuilder<Msg>): Html` |
| `itemActions` | value | `itemActions: value` |
| `itemHeader` | value | `itemHeader: value` |
| `itemFooter` | value | `itemFooter: value` |
| `itemGroup` | function | `itemGroup<Msg>(props: SlotProps, h: HtmlBuilder<Msg>): Html` |
| `ItemSeparatorProps` | type | `ItemSeparatorProps = Readonly<{ class?: string; }>` |
| `itemSeparator` | function | `itemSeparator<Msg>(props: ItemSeparatorProps = {}, h: HtmlBuilder<Msg>): Html` |

## Kbd

Source: [`src/ui/kbd.ts`](../src/ui/kbd.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `kbd` | function | `kbd<Msg>(props: Slot, h: HtmlBuilder<Msg>): Html` |
| `kbdGroup` | function | `kbdGroup<Msg>(props: Slot, h: HtmlBuilder<Msg>): Html` |

## Label

Source: [`src/ui/label.ts`](../src/ui/label.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `LabelProps` | type | `LabelProps = Readonly<{ for?: string; class?: string; children: ReadonlyArray<Html \| string>; }>` |
| `label` | function | `label<Msg>(props: LabelProps, h: HtmlBuilder<Msg>): Html` |

## Marker

Source: [`src/ui/marker.ts`](../src/ui/marker.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `markerVariants` | value | `markerVariants: value` |
| `marker` | function | `marker<Msg>(props: ChildrenProps & Readonly<{ variant?: VariantProps<typeof markerVariants>['variant'] }>, h: HtmlBuilder<Msg>): Html` |
| `markerIcon` | function | `markerIcon<Msg>(props: ChildrenProps, h: HtmlBuilder<Msg>): Html` |
| `markerContent` | function | `markerContent<Msg>(props: ChildrenProps, h: HtmlBuilder<Msg>): Html` |

## Menubar

Source: [`src/ui/menubar.ts`](../src/ui/menubar.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `Model` | value | `Model: value` |
| `Model` | type | `Model = MenubarBehavior.Model` |
| `Message` | value | `Message: value` |
| `Message` | type | `Message = MenubarBehavior.Message` |
| `OutMessage` | type | `OutMessage = MenubarBehavior.OutMessage` |
| `init` | value | `init: value` |
| `update` | value | `update: value` |
| `MenubarMenu` | type | `MenubarMenu<Item extends string, Msg> = Readonly<{ id: string label: string model: DropdownMenu.Model toParentMessage: (message: DropdownMenu.Message) => Msg items: ReadonlyArray<Item> itemToConfig: (item: Item) => DropdownMenu.DropdownMenuItemConfig<Item> }>` |
| `MenubarProps` | type | `MenubarProps<Item extends string, Msg> = SharedProps<Item, Msg> & Readonly<{ model: Model toParentMessage: (message: Message) => Msg }>` |
| `menubar` | function | `menubar<Item extends string, Msg>(props: MenubarProps<Item, Msg>, h: HtmlBuilder<Msg>): Html` |
| `menubar` | function | `menubar<Item extends string, Msg>(props: LegacyMenubarProps<Item, Msg>, h: HtmlBuilder<Msg>): Html` |
| `menubar` | function | `menubar<Item extends string, Msg>(props: MenubarProps<Item, Msg> \| LegacyMenubarProps<Item, Msg>, h: HtmlBuilder<Msg>): Html` |

## Message Scroller

Source: [`src/ui/message-scroller.ts`](../src/ui/message-scroller.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `Model` | value | `Model: value` |
| `Model` | type | `Model = typeof Model.Type` |
| `Scrolled` | value | `Scrolled: value` |
| `RequestedScroll` | value | `RequestedScroll: value` |
| `CompletedMessageScrollerScrollTo` | value | `CompletedMessageScrollerScrollTo: value` |
| `Message` | value | `Message: value` |
| `Message` | type | `Message = typeof Message.Type` |
| `init` | function | `init(id: string): Model` |
| `update` | function | `update(model: Model, message: Message): UpdateReturn` |
| `messageScroller` | function | `messageScroller<Msg>(props: ChildrenProps, h: HtmlBuilder<Msg>): Html` |
| `messageScrollerViewport` | function | `messageScrollerViewport<Msg>(props: ChildrenProps & Readonly<{ model: Model; toParentMessage: (message: Message) => Msg; }>, h: HtmlBuilder<Msg>): Html` |
| `messageScrollerContent` | function | `messageScrollerContent<Msg>(props: ChildrenProps, h: HtmlBuilder<Msg>): Html` |
| `messageScrollerItem` | function | `messageScrollerItem<Msg>(props: ChildrenProps & Readonly<{ scrollAnchor?: boolean }>, h: HtmlBuilder<Msg>): Html` |
| `messageScrollerButton` | function | `messageScrollerButton<Msg>(props: Readonly<{ model: Model; toParentMessage: (message: Message) => Msg; direction?: 'start' \| 'end'; class?: string; }>, h: HtmlBuilder<Msg>): Html` |

## Message

Source: [`src/ui/message.ts`](../src/ui/message.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `messageGroup` | function | `messageGroup<Msg>(props: ChildrenProps, h: HtmlBuilder<Msg>): Html` |
| `message` | function | `message<Msg>(props: ChildrenProps & Readonly<{ align?: 'start' \| 'end' }>, h: HtmlBuilder<Msg>): Html` |
| `messageAvatar` | function | `messageAvatar<Msg>(props: ChildrenProps, h: HtmlBuilder<Msg>): Html` |
| `messageContent` | function | `messageContent<Msg>(props: ChildrenProps, h: HtmlBuilder<Msg>): Html` |
| `messageHeader` | function | `messageHeader<Msg>(props: ChildrenProps, h: HtmlBuilder<Msg>): Html` |
| `messageFooter` | function | `messageFooter<Msg>(props: ChildrenProps, h: HtmlBuilder<Msg>): Html` |

## Native Select

Source: [`src/ui/native-select.ts`](../src/ui/native-select.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `NativeSelectOption` | type | `NativeSelectOption = Readonly<{ value: string; label: string; isDisabled?: boolean; }>` |
| `NativeSelectGroup` | type | `NativeSelectGroup = Readonly<{ label: string; options: ReadonlyArray<NativeSelectOption>; isDisabled?: boolean; }>` |
| `NativeSelectOptionProps` | type | `NativeSelectOptionProps = NativeSelectOption & Readonly<{ class?: string; }>` |
| `nativeSelectOption` | function | `nativeSelectOption<Msg>(props: NativeSelectOptionProps, h: HtmlBuilder<Msg>): Html` |
| `NativeSelectOptGroupProps` | type | `NativeSelectOptGroupProps = NativeSelectGroup & Readonly<{ class?: string; }>` |
| `nativeSelectOptGroup` | function | `nativeSelectOptGroup<Msg>(props: NativeSelectOptGroupProps, h: HtmlBuilder<Msg>): Html` |
| `NativeSelectProps` | type | `NativeSelectProps<Msg> = Readonly<{ id: string; value: string; onChange: (value: string) => Msg; options: ReadonlyArray<NativeSelectOption>; groups?: ReadonlyArray<NativeSelectGroup>; label?: string; description?: string; name?: string; size?: 'sm' \| 'default…` |
| `nativeSelect` | function | `nativeSelect<Msg>(props: NativeSelectProps<Msg>, h: HtmlBuilder<Msg>): Html` |

## Navigation Menu

Source: [`src/ui/navigation-menu.ts`](../src/ui/navigation-menu.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `NavigationMenuLayout` | type | `NavigationMenuLayout = 'inline' \| 'scroll' \| 'responsive'` |
| `navigationMenu` | function | `navigationMenu<Msg>(props: Slot & Readonly<{ ariaLabel?: string; direction?: 'ltr' \| 'rtl'; layout?: NavigationMenuLayout }>, h: HtmlBuilder<Msg>): Html` |
| `navigationMenuList` | function | `navigationMenuList<Msg>(props: Slot & Readonly<{ layout?: NavigationMenuLayout }>, h: HtmlBuilder<Msg>): Html` |
| `navigationMenuItem` | function | `navigationMenuItem<Msg>(props: Slot, h: HtmlBuilder<Msg>): Html` |
| `navigationMenuLink` | function | `navigationMenuLink<Msg>(props: Slot & Readonly<{ href: string; isActive?: boolean }>, h: HtmlBuilder<Msg>): Html` |
| `NavigationMenuDisclosureProps` | type | `NavigationMenuDisclosureProps<Msg> = Readonly<{ model: Popover.Model; toParentMessage: (message: Popover.Message) => Msg; label: string; content: Html \| string; class?: string; ariaLabel?: string; pointerIntent?: 'press' \| 'hover-and-press'; }>` |
| `navigationMenuDisclosure` | function | `navigationMenuDisclosure<Msg>(props: NavigationMenuDisclosureProps<Msg>, h: HtmlBuilder<Msg>): Html` |

## Pagination

Source: [`src/ui/pagination.ts`](../src/ui/pagination.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `pagination` | function | `pagination<Msg>(props: SlotProps, h: HtmlBuilder<Msg>): Html` |
| `paginationContent` | function | `paginationContent<Msg>(props: SlotProps, h: HtmlBuilder<Msg>): Html` |
| `paginationItem` | function | `paginationItem<Msg>(props: SlotProps, h: HtmlBuilder<Msg>): Html` |
| `PaginationLinkProps` | type | `PaginationLinkProps = Readonly<{ href: string; children: ReadonlyArray<Html \| string>; isActive?: boolean; size?: ButtonVariants['size']; ariaLabel?: string; class?: string; }>` |
| `paginationLink` | function | `paginationLink<Msg>(props: PaginationLinkProps, h: HtmlBuilder<Msg>): Html` |
| `PaginationDirectionProps` | type | `PaginationDirectionProps = Readonly<{ href: string; class?: string; }>` |
| `paginationPrevious` | function | `paginationPrevious<Msg>(props: PaginationDirectionProps, h: HtmlBuilder<Msg>): Html` |
| `paginationNext` | function | `paginationNext<Msg>(props: PaginationDirectionProps, h: HtmlBuilder<Msg>): Html` |
| `PaginationEllipsisProps` | type | `PaginationEllipsisProps = Readonly<{ class?: string; }>` |
| `paginationEllipsis` | function | `paginationEllipsis<Msg>(props: PaginationEllipsisProps = {}, h: HtmlBuilder<Msg>): Html` |

## Popover

Source: [`src/ui/popover.ts`](../src/ui/popover.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `Model` | value | `Model: value` |
| `Model` | type | `Model = typeof Model.Type` |
| `Message` | value | `Message: value` |
| `Message` | type | `Message = typeof Message.Type` |
| `OutMessage` | value | `OutMessage: value` |
| `OutMessage` | type | `OutMessage = typeof OutMessage.Type` |
| `init` | value | `init: value` |
| `update` | value | `update: value` |
| `open` | value | `open: value` |
| `close` | value | `close: value` |
| `RequestedOpen` | value | `RequestedOpen: value` |
| `RequestedClose` | value | `RequestedClose: value` |
| `PopoverSide` | type | `PopoverSide = 'top' \| 'right' \| 'bottom' \| 'left'` |
| `PopoverAlign` | type | `PopoverAlign = 'start' \| 'center' \| 'end'` |
| `PopoverProps` | type | `PopoverProps<Msg> = Readonly<{ model: Model; toParentMessage: (message: Message) => Msg; trigger: Html \| string; triggerClass?: string; content: Html \| string; align?: PopoverAlign; side?: PopoverSide; class?: string; }>` |
| `popover` | function | `popover<Msg>(props: PopoverProps<Msg>, h: HtmlBuilder<Msg>): Html` |

## Progress

Source: [`src/ui/progress.ts`](../src/ui/progress.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `ProgressProps` | type | `ProgressProps = Readonly<{ /** `null` renders an indeterminate progress indicator. */ value: number \| null; class?: string; }>` |
| `progress` | function | `progress<Msg>(props: ProgressProps, h: HtmlBuilder<Msg>): Html` |

## Radio Group

Source: [`src/ui/radio-group.ts`](../src/ui/radio-group.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `RadioGroupOption` | re-export | `export { RadioGroupOption } from '@/lib/radio-group'` |
| `RadioGroupProps` | type | `RadioGroupProps<Msg> = RadioGroupBehaviorProps<Msg> & Readonly<{ class?: string; }>` |
| `Message` | re-export | `export { Message } from ` |
| `Model` | re-export | `export { Model } from ` |
| `init` | re-export | `export { init } from ` |
| `update` | re-export | `export { update } from ` |
| `OutMessage` | re-export | `export { OutMessage } from ` |
| `radioGroup` | function | `radioGroup<Msg>(props: RadioGroupProps<Msg>, h: HtmlBuilder<Msg>): Html` |

## Resizable

Source: [`src/ui/resizable.ts`](../src/ui/resizable.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `Model` | value | `Model: value` |
| `Model` | type | `Model = typeof Model.Type` |
| `StartedResize` | value | `StartedResize: value` |
| `DraggedResize` | value | `DraggedResize: value` |
| `EndedResize` | value | `EndedResize: value` |
| `NudgedResize` | value | `NudgedResize: value` |
| `Message` | value | `Message: value` |
| `Message` | type | `Message = typeof Message.Type` |
| `init` | function | `init(id: string, firstSize = 50): Model` |
| `update` | function | `update(model: Model, message: Message): Model` |
| `ResizableProps` | type | `ResizableProps<Msg> = Readonly<{ model: Model; toParentMessage: (message: Message) => Msg; first: Html \| string; second: Html \| string; direction?: 'horizontal' \| 'vertical'; withHandle?: boolean; minSize?: number; maxSize?: number; /** Pixel extent of the pa…` |
| `resizable` | function | `resizable<Msg>(props: ResizableProps<Msg>, h: HtmlBuilder<Msg>): Html` |
| `GroupModel` | value | `GroupModel: value` |
| `GroupModel` | type | `GroupModel = typeof GroupModel.Type` |
| `StartedGroupResize` | value | `StartedGroupResize: value` |
| `DraggedGroupResize` | value | `DraggedGroupResize: value` |
| `EndedGroupResize` | value | `EndedGroupResize: value` |
| `NudgedGroupResize` | value | `NudgedGroupResize: value` |
| `GroupMessage` | value | `GroupMessage: value` |
| `GroupMessage` | type | `GroupMessage = typeof GroupMessage.Type` |
| `initGroup` | function | `initGroup(id: string, panelCount: number, sizes?: ReadonlyArray<number>): GroupModel` |
| `updateGroup` | function | `updateGroup(model: GroupModel, message: GroupMessage): GroupModel` |
| `ResizableGroupProps` | type | `ResizableGroupProps<Msg> = Readonly<{ model: GroupModel; toParentMessage: (message: GroupMessage) => Msg; panels: ReadonlyArray<Html \| string>; direction?: 'horizontal' \| 'vertical'; minSize?: number; extent: number; withHandles?: boolean; disabled?: boolean;…` |
| `resizableGroup` | function | `resizableGroup<Msg>(props: ResizableGroupProps<Msg>, h: HtmlBuilder<Msg>): Html` |

## Scroll Area

Source: [`src/ui/scroll-area.ts`](../src/ui/scroll-area.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `ScrollAreaProps` | type | `ScrollAreaProps = Readonly<{ class?: string; children: ReadonlyArray<Html \| string>; orientation?: 'vertical' \| 'horizontal' \| 'both'; ariaLabel?: string; tabIndex?: number; }>` |
| `scrollArea` | function | `scrollArea<Msg>(props: ScrollAreaProps, h: HtmlBuilder<Msg>): Html` |

## Select

Source: [`src/ui/select.ts`](../src/ui/select.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `Model` | value | `Model: value` |
| `Model` | type | `Model = typeof Model.Type` |
| `Message` | value | `Message: value` |
| `Message` | type | `Message = typeof Message.Type` |
| `OutMessage` | value | `OutMessage: value` |
| `OutMessage` | type | `OutMessage<Value extends string = string> = ListboxPrimitive.OutMessage<Value>` |
| `init` | value | `init: value` |
| `SelectSize` | type | `SelectSize = 'sm' \| 'default'` |
| `SelectItemConfig` | type | `SelectItemConfig = Readonly<{ content?: Html \| string; searchText?: string; class?: string; isDisabled?: boolean; }>` |
| `SelectProps` | type | `SelectProps<Item, Value extends string, Msg> = Readonly<{ model: Model; maybeSelectedValue: Option.Option<Value>; toParentMessage: (message: Message) => Msg; items: ReadonlyArray<Item>; itemToValue: (item: Item) => Value; itemToLabel: (item: Item) => string; …` |
| `SelectBundle` | type | `SelectBundle<Value extends string> = Readonly<{ update: ReturnType<typeof ListboxPrimitive.create<Value, Value>>['update']; select: <Item, Msg>(props: SelectProps<Item, Value, Msg>, h: HtmlBuilder<Msg>) => Html; }>` |
| `create` | function | `create<Value extends string = string>(): SelectBundle<Value>` |
| `update` | value | `update: value` |
| `select` | value | `select: value` |

## Separator

Source: [`src/ui/separator.ts`](../src/ui/separator.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `SeparatorProps` | type | `SeparatorProps = Readonly<{ orientation?: 'horizontal' \| 'vertical'; class?: string; }>` |
| `separator` | function | `separator<Msg>(props: SeparatorProps = {}, h: HtmlBuilder<Msg>): Html` |

## Sheet

Source: [`src/ui/sheet.ts`](../src/ui/sheet.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `Model` | value | `Model: value` |
| `Model` | type | `Model = typeof Model.Type` |
| `Message` | value | `Message: value` |
| `Message` | type | `Message = typeof Message.Type` |
| `OutMessage` | value | `OutMessage: value` |
| `OutMessage` | type | `OutMessage = typeof OutMessage.Type` |
| `init` | value | `init: value` |
| `update` | value | `update: value` |
| `open` | value | `open: value` |
| `close` | value | `close: value` |
| `SheetSide` | type | `SheetSide = 'top' \| 'right' \| 'bottom' \| 'left'` |
| `SheetSlots` | type | `SheetSlots = Readonly<{ closeButton: ReadonlyArray<ChildAttribute>; initialFocusAttributes: () => ReadonlyArray<ChildAttribute>; }>` |
| `SheetPartProps` | type | `SheetPartProps = Readonly<{ children: ReadonlyArray<Html \| string>; class?: string; }>` |
| `SheetTextPartProps` | type | `SheetTextPartProps = SheetPartProps & Readonly<{ attributes: ReadonlyArray<ChildAttribute> }>` |
| `SheetCloseProps` | type | `SheetCloseProps = Readonly<{ children?: ReadonlyArray<Html \| string>; class?: string; ariaLabel?: string; }>` |
| `sheetHeader` | function | `sheetHeader<Msg>(props: SheetPartProps, h: HtmlBuilder<Msg>): Html` |
| `sheetTitle` | function | `sheetTitle<Msg>(props: SheetTextPartProps, h: HtmlBuilder<Msg>): Html` |
| `sheetDescription` | function | `sheetDescription<Msg>(props: SheetTextPartProps, h: HtmlBuilder<Msg>): Html` |
| `sheetFooter` | function | `sheetFooter<Msg>(props: SheetPartProps, h: HtmlBuilder<Msg>): Html` |
| `SheetParts` | type | `SheetParts<Msg> = Readonly<{ header: (props: SheetPartProps) => Html; title: (props: Omit<SheetTextPartProps, 'attributes'>) => Html; description: (props: Omit<SheetTextPartProps, 'attributes'>) => Html; footer: (props: SheetPartProps) => Html; close: (props?…` |
| `SheetProps` | type | `SheetProps<Msg> = Readonly<{ model: Model; toParentMessage: (message: Message) => Msg; title: string; description?: string; content?: (slots: SheetSlots) => ReadonlyArray<Html>; footer?: (slots: SheetSlots) => ReadonlyArray<Html>; layout?: (parts: SheetParts<…` |
| `sheet` | function | `sheet<Msg>(props: SheetProps<Msg>, h: HtmlBuilder<Msg>): Html` |

## Sidebar

Source: [`src/ui/sidebar.ts`](../src/ui/sidebar.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `*` | re-export | `export * from '@/lib/sidebar-state'` |
| `SidebarState` | type | `SidebarState = 'expanded' \| 'collapsed'` |
| `SidebarSide` | type | `SidebarSide = 'left' \| 'right'` |
| `SidebarVariant` | type | `SidebarVariant = 'sidebar' \| 'floating' \| 'inset'` |
| `SidebarCollapsible` | type | `SidebarCollapsible = 'offcanvas' \| 'icon' \| 'none'` |
| `SidebarProviderProps` | type | `SidebarProviderProps = Slot & Readonly<{ state?: SidebarState; }>` |
| `sidebarProvider` | function | `sidebarProvider<Msg>(props: SidebarProviderProps, h: HtmlBuilder<Msg>): Html` |
| `SidebarProps` | type | `SidebarProps<Msg> = Slot & Readonly<{ state?: SidebarState; side?: SidebarSide; variant?: SidebarVariant; collapsible?: SidebarCollapsible; isMobileOpen?: boolean; onMobileDismiss?: Msg; }>` |
| `sidebar` | function | `sidebar<Msg>(props: SidebarProps<Msg>, h: HtmlBuilder<Msg>): Html` |
| `SidebarTriggerProps` | type | `SidebarTriggerProps<Msg> = Readonly<{ onClick: Msg; class?: string; }>` |
| `sidebarTrigger` | function | `sidebarTrigger<Msg>(props: SidebarTriggerProps<Msg>, h: HtmlBuilder<Msg>): Html` |
| `SidebarRailProps` | type | `SidebarRailProps<Msg> = Readonly<{ onClick: Msg; }>` |
| `sidebarRail` | function | `sidebarRail<Msg>(props: SidebarRailProps<Msg>, h: HtmlBuilder<Msg>): Html` |
| `sidebarInset` | function | `sidebarInset<Msg>(props: Slot, h: HtmlBuilder<Msg>): Html` |
| `SidebarInputProps` | type | `SidebarInputProps<Msg> = Readonly<{ id?: string; value?: string; onInput?: (value: string) => Msg; placeholder?: string; type?: string; name?: string; isDisabled?: boolean; isInvalid?: boolean; class?: string; }>` |
| `sidebarInput` | function | `sidebarInput<Msg>(props: SidebarInputProps<Msg>, h: HtmlBuilder<Msg>): Html` |
| `sidebarHeader` | value | `sidebarHeader: value` |
| `sidebarFooter` | value | `sidebarFooter: value` |
| `sidebarSeparator` | function | `sidebarSeparator<Msg>(props: Readonly<{ class?: string }> = {}, h: HtmlBuilder<Msg>): Html` |
| `sidebarContent` | value | `sidebarContent: value` |
| `sidebarGroup` | value | `sidebarGroup: value` |
| `sidebarGroupLabel` | value | `sidebarGroupLabel: value` |
| `SidebarActionProps` | type | `SidebarActionProps<Msg> = Slot & Readonly<{ onClick?: Msg; }>` |
| `sidebarGroupAction` | function | `sidebarGroupAction<Msg>(props: SidebarActionProps<Msg>, h: HtmlBuilder<Msg>): Html` |
| `sidebarGroupContent` | value | `sidebarGroupContent: value` |
| `sidebarMenu` | function | `sidebarMenu<Msg>(props: Slot, h: HtmlBuilder<Msg>): Html` |
| `sidebarMenuItem` | function | `sidebarMenuItem<Msg>(props: Slot, h: HtmlBuilder<Msg>): Html` |
| `sidebarMenuButtonVariants` | value | `sidebarMenuButtonVariants: value` |
| `SidebarMenuButtonVariants` | type | `SidebarMenuButtonVariants = VariantProps< typeof sidebarMenuButtonVariants >` |
| `SidebarMenuButtonProps` | type | `SidebarMenuButtonProps<Msg> = Readonly<{ children: ReadonlyArray<Html \| string>; onClick?: Msg; href?: string; isActive?: boolean; variant?: SidebarMenuButtonVariants['variant']; size?: SidebarMenuButtonVariants['size']; tooltip?: string; class?: string; }>` |
| `sidebarMenuButton` | function | `sidebarMenuButton<Msg>(props: SidebarMenuButtonProps<Msg>, h: HtmlBuilder<Msg>): Html` |
| `SidebarMenuActionProps` | type | `SidebarMenuActionProps<Msg> = SidebarActionProps<Msg> & Readonly<{ showOnHover?: boolean; }>` |
| `sidebarMenuAction` | function | `sidebarMenuAction<Msg>(props: SidebarMenuActionProps<Msg>, h: HtmlBuilder<Msg>): Html` |
| `sidebarMenuBadge` | value | `sidebarMenuBadge: value` |
| `SidebarMenuSkeletonProps` | type | `SidebarMenuSkeletonProps = Readonly<{ showIcon?: boolean; widthPercent?: number; class?: string; }>` |
| `sidebarMenuSkeleton` | function | `sidebarMenuSkeleton<Msg>(props: SidebarMenuSkeletonProps = {}, h: HtmlBuilder<Msg>): Html` |
| `sidebarMenuSub` | function | `sidebarMenuSub<Msg>(props: Slot, h: HtmlBuilder<Msg>): Html` |
| `sidebarMenuSubItem` | function | `sidebarMenuSubItem<Msg>(props: Slot, h: HtmlBuilder<Msg>): Html` |
| `SidebarMenuSubButtonProps` | type | `SidebarMenuSubButtonProps<Msg> = Readonly<{ children: ReadonlyArray<Html \| string>; href?: string; onClick?: Msg; size?: 'sm' \| 'md'; isActive?: boolean; class?: string; }>` |
| `sidebarMenuSubButton` | function | `sidebarMenuSubButton<Msg>(props: SidebarMenuSubButtonProps<Msg>, h: HtmlBuilder<Msg>): Html` |

## Skeleton

Source: [`src/ui/skeleton.ts`](../src/ui/skeleton.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `SkeletonProps` | type | `SkeletonProps = Readonly<{ class?: string; }>` |
| `skeleton` | function | `skeleton<Msg>(props: SkeletonProps = {}, h: HtmlBuilder<Msg>): Html` |

## Slider

Source: [`src/ui/slider.ts`](../src/ui/slider.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `Model` | value | `Model: value` |
| `Model` | type | `Model = typeof Model.Type` |
| `Message` | value | `Message: value` |
| `Message` | type | `Message = typeof Message.Type` |
| `OutMessage` | value | `OutMessage: value` |
| `OutMessage` | type | `OutMessage = typeof OutMessage.Type` |
| `init` | value | `init: value` |
| `update` | value | `update: value` |
| `reflectRange` | value | `reflectRange: value` |
| `snapAndClamp` | value | `snapAndClamp: value` |
| `subscriptions` | value | `subscriptions: value` |
| `subscriptionsForRoot` | value | `subscriptionsForRoot: value` |
| `fractionOfValue` | value | `fractionOfValue: value` |
| `SliderProps` | type | `SliderProps<Msg> = Readonly<{ model: Model; value: number; toParentMessage: (message: Message) => Msg; label?: string; ariaLabel?: string; formatValue?: (value: number) => string; isDisabled?: boolean; isReadOnly?: boolean; name?: string; class?: string; }>` |
| `RangeSliderProps` | type | `RangeSliderProps<Msg> = Readonly<{ values: readonly [number, number]; min: number; max: number; step?: number; onInput: (values: readonly [number, number]) => Msg; orientation?: 'horizontal' \| 'vertical'; direction?: 'ltr' \| 'rtl'; ariaLabels?: readonly [stri…` |
| `rangeSlider` | function | `rangeSlider<Msg>(props: RangeSliderProps<Msg>, h: HtmlBuilder<Msg>): Html` |
| `slider` | function | `slider<Msg>(props: SliderProps<Msg>, h: HtmlBuilder<Msg>): Html` |

## Sonner

Source: [`src/ui/sonner.ts`](../src/ui/sonner.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `ToastPayload` | value | `ToastPayload: value` |
| `ToastPayload` | type | `ToastPayload = typeof ToastPayload.Type` |
| `Variant` | value | `Variant: value` |
| `Variant` | type | `Variant = typeof Variant.Type` |
| `Entry` | value | `Entry: value` |
| `Entry` | type | `Entry = typeof Entry.Type` |
| `Model` | value | `Model: value` |
| `Model` | type | `Model = typeof Model.Type` |
| `Dismissed` | value | `Dismissed: value` |
| `CompletedWaitBeforeDismissingSonner` | value | `CompletedWaitBeforeDismissingSonner: value` |
| `Message` | value | `Message: value` |
| `Message` | type | `Message = typeof Message.Type` |
| `DismissedToast` | value | `DismissedToast: value` |
| `OutMessage` | value | `OutMessage: value` |
| `OutMessage` | type | `OutMessage = typeof OutMessage.Type` |
| `init` | function | `init(config: Readonly<{ id: string }>): Model` |
| `update` | function | `update(model: Model, message: Message): UpdateReturn` |
| `ToastInput` | type | `ToastInput = Readonly<{ title: string; description?: string; actionLabel?: string; duration?: Duration.Input; sticky?: boolean; }>` |
| `ShowInput` | type | `ShowInput = ToastInput & Readonly<{ variant: Variant }>` |
| `success` | function | `success(input: ToastInput): ShowInput` |
| `error` | function | `error(input: ToastInput): ShowInput` |
| `info` | function | `info(input: ToastInput): ShowInput` |
| `warning` | function | `warning(input: ToastInput): ShowInput` |
| `show` | function | `show(model: Model, input: ShowInput): UpdateReturn` |
| `dismiss` | function | `dismiss(model: Model, id: string): UpdateReturn` |
| `dismissAll` | function | `dismissAll(model: Model): UpdateReturn` |
| `Added` | value | `Added: value` |
| `SonnerProps` | type | `SonnerProps<Msg> = Readonly<{ model: Model; toParentMessage: (message: Message) => Msg; actionToMessage?: (entry: Entry) => Msg; ariaLabel?: string; class?: string; entryClass?: string; }>` |
| `sonner` | function | `sonner<Msg>(props: SonnerProps<Msg>, h: HtmlBuilder<Msg>): Html` |

## Spinner

Source: [`src/ui/spinner.ts`](../src/ui/spinner.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `SpinnerProps` | type | `SpinnerProps = Readonly<{ class?: string; }>` |
| `spinner` | function | `spinner<Msg>(props: SpinnerProps = {}, h: HtmlBuilder<Msg>): Html` |

## Switch

Source: [`src/ui/switch.ts`](../src/ui/switch.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `SwitchSize` | type | `SwitchSize = 'sm' \| 'default'` |
| `SwitchProps` | type | `SwitchProps<Msg> = SwitchBehaviorProps<Msg> & Readonly<{ size?: SwitchSize; class?: string; }>` |
| `switchControl` | function | `switchControl<Msg>(props: SwitchProps<Msg>, h: HtmlBuilder<Msg>): Html` |
| `switch` | re-export | `export { switchControl as switch } from ` |

## Table

Source: [`src/ui/table.ts`](../src/ui/table.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `table` | function | `table<Msg>(props: SlotProps, h: HtmlBuilder<Msg>): Html` |
| `tableHeader` | value | `tableHeader: value` |
| `tableBody` | value | `tableBody: value` |
| `tableFooter` | value | `tableFooter: value` |
| `tableRow` | value | `tableRow: value` |
| `tableHead` | value | `tableHead: value` |
| `tableCell` | value | `tableCell: value` |
| `tableCaption` | value | `tableCaption: value` |

## Tabs

Source: [`src/ui/tabs.ts`](../src/ui/tabs.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `Model` | value | `Model: value` |
| `Model` | type | `Model = typeof Model.Type` |
| `Message` | value | `Message: value` |
| `Message` | type | `Message = typeof Message.Type` |
| `OutMessage` | value | `OutMessage: value` |
| `OutMessage` | type | `OutMessage<Value extends string = string> = TabsPrimitive.OutMessage<Value>` |
| `init` | value | `init: value` |
| `tabsListVariants` | value | `tabsListVariants: value` |
| `TabsListVariants` | type | `TabsListVariants = VariantProps<typeof tabsListVariants>` |
| `TabsOrientation` | type | `TabsOrientation = 'horizontal' \| 'vertical'` |
| `TabConfig` | type | `TabConfig<Value extends string = string> = Readonly<{ value: Value; label: Html \| string; content: Html \| string; isDisabled?: boolean; }>` |
| `TabsProps` | type | `TabsProps<Value extends string, Msg> = Readonly<{ model: Model; selectedValue: Value; toParentMessage: (message: Message) => Msg; tabs: ReadonlyArray<TabConfig<Value>>; ariaLabel?: string; orientation?: TabsOrientation; direction?: 'ltr' \| 'rtl'; variant?: Ta…` |
| `TabsBundle` | type | `TabsBundle<Value extends string> = Readonly<{ update: ReturnType<typeof TabsPrimitive.create<Value>>['update']; tabs: <Msg>(props: TabsProps<Value, Msg>, h: HtmlBuilder<Msg>) => Html; }>` |
| `create` | function | `create<Value extends string = string>(): TabsBundle<Value>` |
| `update` | value | `update: value` |
| `tabs` | value | `tabs: value` |

## Textarea

Source: [`src/ui/textarea.ts`](../src/ui/textarea.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `TextareaProps` | type | `TextareaProps<Msg> = TextareaBehaviorProps<Msg> & Readonly<{ class?: string; }>` |
| `textarea` | function | `textarea<Msg>(props: TextareaProps<Msg>, h: HtmlBuilder<Msg>): Html` |

## Toast

Source: [`src/ui/toast.ts`](../src/ui/toast.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `*` | re-export | `export * from '@/ui/sonner'` |
| `toast` | re-export | `export { sonner as toast } from '@/ui/sonner'` |

## Toggle Group

Source: [`src/ui/toggle-group.ts`](../src/ui/toggle-group.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `Message` | re-export | `export { Message } from ` |
| `Model` | re-export | `export { Model } from ` |
| `init` | re-export | `export { init } from ` |
| `OutMessage` | re-export | `export { OutMessage } from ` |
| `ToggleGroupItem` | type | `ToggleGroupItem<Value extends string = string> = Readonly<{ value: Value children: ReadonlyArray<Html \| string> ariaLabel?: string isDisabled?: boolean class?: string }>` |
| `ToggleGroupProps` | type | `ToggleGroupProps<Value extends string, Msg> = Readonly<{ model: Model toParentMessage: (message: Message) => Msg ariaLabel: string items: ReadonlyArray<ToggleGroupItem<Value>> direction?: 'ltr' \| 'rtl' arrangement?: 'joined' \| 'wrapped' variant?: ToggleVarian…` |
| `ToggleGroupBundle` | type | `ToggleGroupBundle<Value extends string> = Readonly<{ update: BehaviorBundle<Value>['update'] toggleGroup: <Msg>(props: ToggleGroupProps<Value, Msg>, h: HtmlBuilder<Msg>) => Html }>` |
| `create` | function | `create<Value extends string = string>(): ToggleGroupBundle<Value>` |
| `update` | value | `update: value` |
| `toggleGroup` | function | `toggleGroup<Msg, Value extends string = string>(props: LegacyToggleGroupProps<Value, Msg>, h: HtmlBuilder<Msg>): Html` |
| `toggleGroup` | function | `toggleGroup<Value extends string, Msg>(props: ToggleGroupProps<Value, Msg>, h: HtmlBuilder<Msg>): Html` |
| `toggleGroup` | function | `toggleGroup<Msg>(props: ToggleGroupProps<string, Msg> \| LegacyToggleGroupProps<string, Msg>, h: HtmlBuilder<Msg>): Html` |

## Toggle

Source: [`src/ui/toggle.ts`](../src/ui/toggle.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `toggleVariants` | value | `toggleVariants: value` |
| `ToggleVariants` | type | `ToggleVariants = VariantProps<typeof toggleVariants>` |
| `ToggleProps` | type | `ToggleProps<Msg> = Readonly<{ isPressed: boolean; onToggle: Msg; variant?: ToggleVariants['variant']; size?: ToggleVariants['size']; children: ReadonlyArray<Html \| string>; isDisabled?: boolean; id?: string; ariaLabel?: string; describedBy?: string; class?: s…` |
| `toggle` | function | `toggle<Msg>(props: ToggleProps<Msg>, h: HtmlBuilder<Msg>): Html` |

## Tooltip

Source: [`src/ui/tooltip.ts`](../src/ui/tooltip.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `Model` | value | `Model: value` |
| `Model` | type | `Model = typeof Model.Type` |
| `Message` | value | `Message: value` |
| `Message` | type | `Message = typeof Message.Type` |
| `OutMessage` | value | `OutMessage: value` |
| `OutMessage` | type | `OutMessage = typeof OutMessage.Type` |
| `init` | value | `init: value` |
| `update` | value | `update: value` |
| `reflectShowDelay` | value | `reflectShowDelay: value` |
| `TooltipSide` | type | `TooltipSide = 'top' \| 'right' \| 'bottom' \| 'left'` |
| `TooltipAlign` | type | `TooltipAlign = 'start' \| 'center' \| 'end'` |
| `TooltipProps` | type | `TooltipProps<Msg> = Readonly<{ model: Model; toParentMessage: (message: Message) => Msg; trigger: Html \| string; content: Html \| string; align?: TooltipAlign; side?: TooltipSide; isDisabled?: boolean; ariaLabel?: string; triggerClass?: string; class?: string;…` |
| `tooltip` | function | `tooltip<Msg>(props: TooltipProps<Msg>, h: HtmlBuilder<Msg>): Html` |

## Typography

Source: [`src/ui/typography.ts`](../src/ui/typography.ts)

| Export | Kind | Signature |
| --- | --- | --- |
| `typographyH1` | function | `typographyH1<Msg>(props: TextProps, h: HtmlBuilder<Msg>): Html` |
| `typographyH2` | function | `typographyH2<Msg>(props: TextProps, h: HtmlBuilder<Msg>): Html` |
| `typographyH3` | function | `typographyH3<Msg>(props: TextProps, h: HtmlBuilder<Msg>): Html` |
| `typographyH4` | function | `typographyH4<Msg>(props: TextProps, h: HtmlBuilder<Msg>): Html` |
| `typographyP` | function | `typographyP<Msg>(props: TextProps, h: HtmlBuilder<Msg>): Html` |
| `typographyBlockquote` | function | `typographyBlockquote<Msg>(props: TextProps, h: HtmlBuilder<Msg>): Html` |
| `typographyInlineCode` | function | `typographyInlineCode<Msg>(props: TextProps, h: HtmlBuilder<Msg>): Html` |
| `typographyLead` | function | `typographyLead<Msg>(props: TextProps, h: HtmlBuilder<Msg>): Html` |
| `typographyLarge` | function | `typographyLarge<Msg>(props: TextProps, h: HtmlBuilder<Msg>): Html` |
| `typographySmall` | function | `typographySmall<Msg>(props: TextProps, h: HtmlBuilder<Msg>): Html` |
| `typographyMuted` | function | `typographyMuted<Msg>(props: TextProps, h: HtmlBuilder<Msg>): Html` |
