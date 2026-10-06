import * as stylex from '@stylexjs/stylex'

/* Ancestor scope for the drawer's group-data conditions. The Tailwind
   renderer drives swipe-handle opacity and content opacity/selection off
   group-data-[nested-drawer-open|nested-drawer-swiping|swiping]/drawer-popup
   classes; StyleX expresses the same relationships with when.ancestor on
   this marker, which the popup applies unconditionally. */
export const drawerPopupScope: ReturnType<typeof stylex.defineMarker> =
  stylex.defineMarker()
