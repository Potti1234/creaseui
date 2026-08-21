import type { Html, HtmlBuilder } from 'foldkit/html';

import type * as State from '@/docs/components/catalog-state';

export type DocsExample = Readonly<{
  title: string;
  description?: string;
  preview: (model: State.Model, h: HtmlBuilder<State.Message>) => Html;
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
  sections?: ReadonlyArray<DocsSection>;
  styling?: string;
  accessibility?: string;
  keyboard?: ReadonlyArray<readonly [key: string, behavior: string]>;
  composition?: string;
  apiHref?: string;
  apiDescription?: string;
}>;

export type PageDefinitions = Readonly<Record<string, PageDefinition>>;
