import { fileURLToPath } from 'node:url'

export const stylexStyleResolution = 'property-specificity'

// These options define StyleX's compilation semantics and must stay identical
// in the application build and tests. Adapter/runtime concerns remain local to
// vite.config.ts and vitest.config.ts.
export const stylexCompilerOptions = Object.freeze({
  // StyleX resolves theme imports before Vite applies its aliases.
  aliases: Object.freeze({
    '@/*': Object.freeze([fileURLToPath(new URL('./src/*', import.meta.url))]),
  }),
  styleResolution: stylexStyleResolution,
  sxPropName: false,
  useCSSLayers: Object.freeze({
    before: Object.freeze(['base']),
    after: Object.freeze(['utilities']),
    prefix: 'stylex',
  }),
})
