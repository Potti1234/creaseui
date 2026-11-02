/* Defensive CSS checks (defensivecss.dev) for the stylesheet audit:
   registered component CSS plus the html/body scrollbar-gutter policy.
   Wired into createCssAudit in ./css.js. */

const BARE_VAR = /var\(\s*(--[\w-]+)\s*\)/gu
const URL_VALUE = /url\(/iu
const SCROLLING_PROP = /^overflow(-x|-y)?$/u
const SCROLL_ROOT = /^(?:html|body|:root|#root|#app)$/u
const AUTO_FIT = /repeat\(\s*auto-fit\b/iu

const hasHoverMedia = node => {
  let parent = node.parent
  while (parent !== undefined) {
    if (
      parent.type === 'atrule' &&
      parent.name.toLowerCase() === 'media' &&
      /\(\s*hover\s*:\s*hover\s*\)/iu.test(parent.params)
    )
      return true
    parent = parent.parent
  }
  return false
}

/* `options.declared(name)` reports whether a custom property is guaranteed
   (declared in the project's stylesheets or the audited file itself). */
export const createDefensiveCss = options => {
  const declared = options?.declared ?? (() => true)

  /* Registered (owned) stylesheet checks: run per rule node. */
  const checkOwnedRule = (file, rule, selectors, add) => {
    const decls = []
    rule.each(child => {
      if (child.type === 'decl') decls.push(child)
    })
    const hasDecl = prop =>
      decls.some(decl => decl.prop.toLowerCase() === prop.toLowerCase())

    /* defensive-hover-media: raw :hover outside @media (hover:hover) sticks
       on touch devices. */
    if (
      selectors.some(selector => /:hover\b/u.test(selector)) &&
      !hasHoverMedia(rule)
    )
      add(
        file,
        rule,
        'violation',
        'selector uses :hover outside `@media (hover: hover)` — touch devices keep the hover state stuck; wrap it (defensive-hover-media)',
      )

    for (const decl of decls) {
      const prop = decl.prop.toLowerCase()
      const { value } = decl

      /* defensive-prefer-overflow-auto */
      if (SCROLLING_PROP.test(prop) && value.trim().toLowerCase() === 'scroll')
        add(
          file,
          decl,
          'violation',
          `\`${prop}: scroll\` shows disabled scrollbars when nothing overflows; use \`${prop}: auto\` (defensive-prefer-overflow-auto)`,
        )

      /* defensive-auto-fill-not-fit */
      if (AUTO_FIT.test(value))
        add(
          file,
          decl,
          'violation',
          '`repeat(auto-fit, …)` collapses empty tracks and stretches real items; use `auto-fill` (defensive-auto-fill-not-fit)',
        )

      /* defensive-css-var-fallback: skip the token layer itself (`--x:` decl
         values are wiring, not reads). */
      if (!prop.startsWith('--'))
        for (const match of value.matchAll(BARE_VAR))
          if (!declared(match[1]))
            add(
              file,
              decl,
              'violation',
              `reads var(${match[1]}) without a fallback and no project stylesheet defines it; add a fallback: var(${match[1]}, <default>) (defensive-css-var-fallback)`,
            )

      /* defensive-background-repeat */
      if (
        URL_VALUE.test(value) &&
        /^background(-image)?$/u.test(prop) &&
        !hasDecl('background-repeat')
      )
        add(
          file,
          decl,
          'violation',
          'background `url()` without `background-repeat` tiles by default; set `background-repeat` explicitly (defensive-background-repeat)',
        )
    }
  }

  /* Global stylesheets: the scrollbar-gutter rule lives here because only
     base CSS may select html/body/:root. */
  const checkScrollRoot = (file, rule, selectors, add) => {
    if (!selectors.some(selector => SCROLL_ROOT.test(selector.trim()))) return
    const decls = []
    rule.each(child => {
      if (child.type === 'decl') decls.push(child)
    })
    const overflowY = decls.find(
      decl =>
        /^overflow(-y)?$/u.test(decl.prop) &&
        /^(?:auto|scroll)\b/iu.test(decl.value.trim()),
    )
    if (
      overflowY !== undefined &&
      !decls.some(decl => decl.prop.toLowerCase() === 'scrollbar-gutter')
    )
      add(
        file,
        overflowY,
        'violation',
        'page root scrolls without `scrollbar-gutter: stable` — the layout shifts when the scrollbar appears (defensive-scrollbar-gutter)',
      )
  }

  return { checkOwnedRule, checkScrollRoot }
}
