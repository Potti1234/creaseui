import type { Html, HtmlBuilder } from 'foldkit/html';

export type DocsExample = Readonly<{
  title: string;
  description?: string;
  staticPreview?: (model: Readonly<Record<string, never>>, h: HtmlBuilder<never>) => Html;
  code: string;
  previewClass?: string;
}>;

export type ComponentKind = 'helper' | 'submodel' | 'recipe';

export type DocsSection = Readonly<{
  id: string;
  title: string;
  description: string;
  code?: string;
}>;

export type PageDefinition = Readonly<{
  description: string;
  examples: ReadonlyArray<DocsExample>;
  kind?: ComponentKind;
  architecture?: string;
  usage?: string;
  sections?: ReadonlyArray<DocsSection>;
  styling?: string;
  accessibility?: string;
  keyboard?: ReadonlyArray<readonly [key: string, behavior: string]>;
  composition?: string;
  apiHref?: string;
  apiDescription?: string;
}>;

export type PageDefinitions = Readonly<Record<string, PageDefinition>>;
