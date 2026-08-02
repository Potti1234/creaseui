import { type Html, type HtmlBuilder } from 'foldkit/html';

import * as State from '@/docs/components/catalog-state';

export type DocsExample = Readonly<{
  title: string;
  description?: string;
  preview: (model: State.Model, h: HtmlBuilder<State.Message>) => Html;
  code: string;
  previewClass?: string;
}>;

export type PageDefinition = Readonly<{
  description: string;
  examples: ReadonlyArray<DocsExample>;
  composition?: string;
  apiHref?: string;
  apiDescription?: string;
}>;

export type PageDefinitions = Readonly<Record<string, PageDefinition>>;
