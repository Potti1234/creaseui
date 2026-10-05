export type Renderer = 'tailwind' | 'stylex'

// Replaced by Vite for each independently built site. The fallback keeps
// renderer-neutral unit/Scene tests usable without a Vite environment.
export const renderer: Renderer =
  typeof __CREASEUI_RENDERER__ === 'undefined'
    ? 'tailwind'
    : __CREASEUI_RENDERER__

export const otherRenderer = renderer === 'tailwind' ? 'stylex' : 'tailwind'
export const rendererLabel = renderer === 'tailwind' ? 'Tailwind' : 'StyleX'
export const otherRendererLabel =
  renderer === 'tailwind' ? 'StyleX' : 'Tailwind'

export const siteOrigin = (skin: Renderer): string =>
  skin === 'stylex' ? 'https://stylex.creaseui.com' : 'https://creaseui.com'

export const counterpartUrl = (url: URL): string => {
  const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
  const origin = local
    ? `${url.protocol}//${url.hostname}:${otherRenderer === 'stylex' ? '5174' : '5173'}`
    : siteOrigin(otherRenderer)
  return `${origin}${url.pathname}${url.search}${url.hash}`
}
