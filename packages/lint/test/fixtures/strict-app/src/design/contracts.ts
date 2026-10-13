export type ComponentLayoutStyle = Readonly<Record<string, string | number>> & {
  readonly __brand: 'ComponentLayoutStyle'
}
export const layoutStyle = (style: Record<string, string | number>) =>
  style as ComponentLayoutStyle
