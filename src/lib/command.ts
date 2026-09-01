export const normalizeCommandQuery = (value: string): string =>
  value.trim().toLocaleLowerCase()

export const filterCommandItems = <Item>(
  items: ReadonlyArray<Item>,
  queryValue: string,
  restingInputValue: string,
  itemToSearchText: (item: Item) => string,
): ReadonlyArray<Item> => {
  const query = normalizeCommandQuery(queryValue)
  if (query === '' || queryValue === restingInputValue) return items
  return items.filter((item) =>
    normalizeCommandQuery(itemToSearchText(item)).includes(query),
  )
}
