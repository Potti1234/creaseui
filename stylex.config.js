export const stylexStyleResolution = 'property-specificity'

export const stylexCompilerOptions = Object.freeze({
  styleResolution: stylexStyleResolution,
  sxPropName: false,
  useCSSLayers: Object.freeze({
    before: Object.freeze(['base']),
    after: Object.freeze(['utilities']),
    prefix: 'stylex',
  }),
})
