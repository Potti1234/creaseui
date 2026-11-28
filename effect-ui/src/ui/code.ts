import { Html } from '@effect/ui/html'

import { CodeBehavior, type CodeProps } from '../behaviors/code'

const tailwind = {
  root: 'rounded-sm bg-muted px-1 font-mono text-sm leading-[inherit] wrap-break-word text-foreground data-[color=secondary]:text-muted-foreground data-[color=inherit]:text-inherit data-[size=inherit]:text-[inherit]',
}

export const Code = <Msg, R = never>(
  h: Html.H<Msg>,
  { className, ...options }: CodeProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) =>
  CodeBehavior(h, {
    ...options,
    className: Html.classNames(styles.root, className),
  })
