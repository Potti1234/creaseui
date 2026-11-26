import type { Html } from '@effect/ui/html'

import { LabelBehavior, type LabelProps } from '../behaviors/label'

const tailwind = {
  root: 'flex items-center gap-2 text-sm leading-none font-medium select-none data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50',
}

export const Label = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    className,
    ...options
  }: LabelProps<NoInfer<Msg>, R> & { readonly className?: string },
  styles: typeof tailwind = tailwind,
) => {
  return LabelBehavior(h, options).class(styles.root, className)
}
