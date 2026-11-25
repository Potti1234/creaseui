export type Viewport = Readonly<{
  width: number
  height: number
  offsetLeft: number
  offsetTop: number
  scale: number
}>

export const read = (view: Window): Viewport => {
  const visual = view.visualViewport
  return {
    width: visual?.width ?? view.innerWidth,
    height: visual?.height ?? view.innerHeight,
    offsetLeft: visual?.offsetLeft ?? 0,
    offsetTop: visual?.offsetTop ?? 0,
    scale: visual?.scale ?? 1,
  }
}

/** Report the visible viewport immediately and after its geometry changes. */
export const bindViewport = (
  view: Window,
  changed: (state: Viewport) => void,
): (() => void) => {
  const visual = view.visualViewport
  const report = () => changed(read(view))
  report()
  visual?.addEventListener('resize', report)
  visual?.addEventListener('scroll', report)
  view.addEventListener('resize', report)
  return () => {
    visual?.removeEventListener('resize', report)
    visual?.removeEventListener('scroll', report)
    view.removeEventListener('resize', report)
  }
}
