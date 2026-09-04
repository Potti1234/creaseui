import type { Html, HtmlBuilder } from 'foldkit/html';

import { cardFixtures } from '@/docs/components/pages/card/shared';
import * as Card from '@/ui/card';

export type CardStaticPreview = <Msg>(model: Readonly<Record<string, never>>, h: HtmlBuilder<Msg>) => Html;
export const cardTailwindPreviews: ReadonlyArray<CardStaticPreview> = cardFixtures.map((_fixture, index) => <Msg>(_model: Readonly<Record<string, never>>, h: HtmlBuilder<Msg>) => index === 0
  ? Card.card({ element: 'article', class: 'w-full max-w-sm', children: [Card.cardHeader({ children: [Card.cardTitle({ element: 'h2', children: ['Release notes'] }, h), Card.cardDescription({ children: ['Crease UI 0.1.0'] }, h)] }, h), Card.cardContent({ children: ['A source-owned component library for Foldkit applications.'] }, h)] }, h)
  : Card.card({ class: 'w-full max-w-sm', children: [Card.cardHeader({ children: [Card.cardTitle({ children: ['Deploy project'] }, h), Card.cardDescription({ children: ['Production is ready.'] }, h)] }, h), Card.cardContent({ children: ['All checks passed.'] }, h), Card.cardFooter({ class: 'justify-end text-sm font-medium', children: ['Ready to deploy'] }, h)] }, h));
