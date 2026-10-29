export type ComponentLayoutStyle = Readonly<Record<string, string | number>> & {
  readonly __brand: 'ComponentLayoutStyle'
}
export const layoutStyle = (style: Record<string, string | number>) =>
  style as ComponentLayoutStyle

export const BUTTON_VARIANTS = ['default', 'outline', 'ghost'] as const
export const BUTTON_SIZES = ['default', 'sm', 'icon', 'icon-sm'] as const
export const INPUT_LEVELS = [4] as const
export const INPUT_DISABLED = [false] as const
