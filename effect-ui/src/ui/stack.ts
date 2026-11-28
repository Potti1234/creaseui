import type { Html } from '@effect/ui/html'

import { StackBehavior, type StackProps } from '../behaviors/stack'
export {
  StackBehavior as Stack,
  StackItemBehavior as StackItem,
} from '../behaviors/stack'

export const HStack = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Omit<StackProps<NoInfer<Msg>, R>, 'direction'>,
) => StackBehavior(h, { ...options, direction: 'horizontal' })

export const VStack = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Omit<StackProps<NoInfer<Msg>, R>, 'direction'>,
) => StackBehavior(h, { ...options, direction: 'vertical' })
