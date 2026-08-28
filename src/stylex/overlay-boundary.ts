/**
 * StyleX themes in Crease may be scoped below the document root. Foldkit's
 * default portal moves anchored content to `document.body`, where inherited
 * theme variables are unavailable. Keep StyleX overlays in the themed subtree
 * so inheritance remains deterministic.
 *
 * If an overlay must escape clipping, introduce an explicit theme-copying
 * portal primitive here first. Components must not opt into the body portal.
 */
export const THEMED_OVERLAY_PORTAL = false as const

export const themedAnchor = <
  const Anchor extends Readonly<Record<string, unknown>>,
>(
  anchor: Anchor,
): Anchor & Readonly<{ portal: false }> => ({
  ...anchor,
  portal: THEMED_OVERLAY_PORTAL,
})

