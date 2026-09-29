import { Option } from 'effect'
import { Command, Update } from 'foldkit'
import { Popover as PopoverPrimitive } from '@foldkit/ui'

/**
 * Skin-neutral NavigationMenu behavior shared by every Crease renderer.
 *
 * Disclosures stay independent Popover child models in the parent Model;
 * this module supplies the Base UI single-open-value coordination: when one
 * disclosure reports `Opened`, every other open disclosure closes, and the
 * displaced disclosure's `Closed` replaces `Opened` as the emitted
 * OutMessage so a trigger switch reports exactly one state change.
 */

/** Lens + message wiring for one disclosure's Popover child model inside a
 *  parent Model — the same facts `Update.foldChild` needs. */
export type DisclosureLens<ParentModel, ParentMessage> = Readonly<{
  read: (model: ParentModel) => Option.Option<PopoverPrimitive.Model>
  write: (model: ParentModel, next: PopoverPrimitive.Model) => ParentModel
  toParentMessage: (message: PopoverPrimitive.Message) => ParentMessage
}>

const closeSiblings =
  <ParentModel, ParentMessage>(
    siblings: ReadonlyArray<DisclosureLens<ParentModel, ParentMessage>>,
  ) =>
  (
    outMessage: PopoverPrimitive.OutMessage,
  ): Update.StepWithOutMessage<
    ParentModel,
    ParentMessage,
    PopoverPrimitive.OutMessage
  > =>
  model => {
    if (outMessage._tag !== 'Opened') {
      return { model }
    }
    let next = model
    const commands: Array<Command.Command<ParentMessage>> = []
    let closedSibling = false
    for (const sibling of siblings) {
      const maybeSibling = sibling.read(next)
      if (Option.isNone(maybeSibling) || !maybeSibling.value.isOpen) {
        continue
      }
      const closed = PopoverPrimitive.update(
        maybeSibling.value,
        PopoverPrimitive.Message.RequestedClose(),
      )
      next = sibling.write(next, closed.model)
      /* Focus stays on the trigger that just opened — the displaced sibling
         must not restore focus to its own trigger. */
      commands.push(
        ...Command.mapMessages(
          (closed.commands ?? []).filter(
            command => command.name !== PopoverPrimitive.FocusButton.name,
          ),
          sibling.toParentMessage,
        ),
      )
      closedSibling = closedSibling || closed.outMessage?._tag === 'Closed'
    }
    return closedSibling
      ? {
          model: next,
          commands,
          outMessage: PopoverPrimitive.OutMessage.Closed(),
        }
      : { model: next, commands }
  }

type FoldConfig<ParentModel, ParentMessage> = Readonly<{
  disclosure: DisclosureLens<ParentModel, ParentMessage>
  siblings: ReadonlyArray<DisclosureLens<ParentModel, ParentMessage>>
}>

/**
 * `Update.foldChild` for one navigation-menu disclosure. Sibling disclosures
 * close when this one opens; every other child OutMessage passes through to
 * the parent unchanged.
 */
export const foldDisclosure = <ParentModel, ParentMessage>(
  config: FoldConfig<ParentModel, ParentMessage>,
) =>
  Update.foldChild({
    update: PopoverPrimitive.update,
    read: config.disclosure.read,
    write: config.disclosure.write,
    toParentMessage: config.disclosure.toParentMessage,
    toParentOutMessage: outMessage => outMessage,
    foldOutMessage: closeSiblings(config.siblings),
  })

/**
 * `Update.foldChildStep` counterpart of `foldDisclosure` for no-input Popover
 * entry points (`PopoverPrimitive.open`, `PopoverPrimitive.close`) driven
 * programmatically by the parent.
 */
export const foldDisclosureStep = <ParentModel, ParentMessage>(
  config: FoldConfig<ParentModel, ParentMessage> &
    Readonly<{
      update: (
        model: PopoverPrimitive.Model,
      ) => Update.ReturnWithOutMessage<
        PopoverPrimitive.Model,
        PopoverPrimitive.Message,
        PopoverPrimitive.OutMessage
      >
    }>,
) =>
  Update.foldChildStep({
    update: config.update,
    read: config.disclosure.read,
    write: config.disclosure.write,
    toParentMessage: config.disclosure.toParentMessage,
    toParentOutMessage: outMessage => outMessage,
    foldOutMessage: closeSiblings(config.siblings),
  })
