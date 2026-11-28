import { Html } from '@effect/ui/html'

import { IconBehavior, type IconProps } from '../behaviors/icon'
export {
  hasIcon,
  iconNames,
  type IconName,
  type IconProps,
  type IconSize,
} from '../behaviors/icon'

const tailwind = {
  root: 'inline-block shrink-0 align-middle data-rotation:transition-transform motion-reduce:transition-none',
}
export const Icon = <Msg>(
  h: Html.H<Msg>,
  { className, ...options }: IconProps,
  styles: typeof tailwind = tailwind,
) =>
  IconBehavior(h, {
    ...options,
    className: Html.classNames(styles.root, className),
  })
