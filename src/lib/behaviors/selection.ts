import { Option, Schema } from 'effect'

const modelSchema = <Key extends string>(key: Schema.Codec<Key>) =>
  Schema.Struct({
    values: Schema.Array(key),
    maybeAnchor: Schema.Option(Schema.Struct({ key, base: Schema.Array(key) })),
  })

export const Model = modelSchema(Schema.String)
export type Model<Key extends string = string> = ReturnType<
  typeof modelSchema<Key>
>['Type']

type Policy<Key extends string> = Readonly<{
  multiple?: boolean
  isSelectable?: (key: Key) => boolean
}>

type Collection<Key extends string> = Policy<Key> &
  Readonly<{ order: ReadonlyArray<Key> }>

type Range<Key extends string> = Collection<Key> &
  Readonly<{ from?: Key; additive?: boolean }>

const sameOrder = <Key>(
  before: ReadonlyArray<Key>,
  after: ReadonlyArray<Key>,
): boolean =>
  before.length === after.length &&
  before.every((key, index) => key === after[index])

const addKeys = <Key>(
  base: ReadonlyArray<Key>,
  additions: ReadonlyArray<Key>,
): ReadonlyArray<Key> => [...new Set([...base, ...additions])]

export const create = <Key extends string = string>() => {
  const init = (values: ReadonlyArray<Key> = []): Model<Key> => ({
    values: [...values],
    maybeAnchor: Option.none(),
  })

  const isSelected = (model: Model<Key>, key: Key): boolean =>
    model.values.includes(key)

  const setAnchor = (model: Model<Key>, key: Key | null): Model<Key> => ({
    ...model,
    maybeAnchor:
      key === null ? Option.none() : Option.some({ key, base: model.values }),
  })

  const withValues = (
    model: Model<Key>,
    values: ReadonlyArray<Key>,
  ): Model<Key> =>
    sameOrder(model.values, values) ? model : { ...model, values }

  const reflect = (
    model: Model<Key>,
    values: ReadonlyArray<Key>,
  ): Model<Key> => {
    if (sameOrder(model.values, values)) return model
    const members = new Set(values)
    const previous = new Set(model.values)
    const sameMembers =
      previous.size === members.size &&
      [...previous].every(key => members.has(key))
    return sameMembers ? { ...model, values: [...values] } : init(values)
  }

  const choose = (
    model: Model<Key>,
    key: Key,
    { isSelectable }: Policy<Key> = {},
  ): Model<Key> =>
    isSelectable?.(key) === false
      ? model
      : setAnchor(withValues(model, [key]), key)

  const toggle = (
    model: Model<Key>,
    key: Key,
    { multiple, isSelectable }: Policy<Key> = {},
  ): Model<Key> => {
    if (isSelectable?.(key) === false) return model
    const selected = isSelected(model, key)
    if (!multiple && (!selected || model.values.length !== 1))
      return choose(model, key)
    const values = selected
      ? model.values.filter(value => value !== key)
      : [...model.values, key]
    return setAnchor(withValues(model, values), key)
  }

  const extend = (
    model: Model<Key>,
    key: Key,
    inputs: Range<Key>,
  ): Model<Key> => {
    if (!inputs.multiple) return choose(model, key, inputs)
    const { order, from, additive = true, isSelectable } = inputs
    const end = order.indexOf(key)
    if (end === -1) return model
    const previous = Option.getOrUndefined(model.maybeAnchor)
    const anchor =
      previous !== undefined && order.includes(previous.key)
        ? previous
        : {
            key: from !== undefined && order.includes(from) ? from : key,
            base: model.values,
          }
    const anchored =
      anchor === previous
        ? model
        : { ...model, maybeAnchor: Option.some(anchor) }
    const start = order.indexOf(anchor.key)
    const range = order
      .slice(Math.min(start, end), Math.max(start, end) + 1)
      .filter(value => isSelectable?.(value) !== false)
    return withValues(anchored, addKeys(additive ? anchor.base : [], range))
  }

  const toggleAll = (
    model: Model<Key>,
    { order, multiple, isSelectable }: Collection<Key>,
  ): Model<Key> => {
    if (!multiple) return model
    const available = new Set(
      order.filter(key => isSelectable?.(key) !== false),
    )
    if (available.size === 0) return model
    const selected = new Set(model.values)
    const values = [...available].every(key => selected.has(key))
      ? model.values.filter(key => !available.has(key))
      : addKeys(model.values, [...available])
    return {
      ...model,
      values,
      maybeAnchor:
        values.length === 0
          ? Option.none()
          : Option.map(model.maybeAnchor, ({ key }) => ({ key, base: values })),
    }
  }

  return {
    init,
    isSelected,
    setAnchor,
    reflect,
    choose,
    toggle,
    extend,
    toggleAll,
  }
}
