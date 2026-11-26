import type { ComponentDocsModule } from './types'

const modules = import.meta.glob('./pages/*.ts', { eager: true }) as Record<
  string,
  { readonly componentDocs?: ComponentDocsModule }
>

export const componentDocsPages: Readonly<Record<string, ComponentDocsModule>> =
  Object.fromEntries(
    Object.entries(modules).flatMap(([path, module]) => {
      const slug = /^\.\/pages\/(.+)\.ts$/.exec(path)?.[1]
      return slug === undefined || module.componentDocs === undefined
        ? []
        : [[slug, module.componentDocs]]
    }),
  )
