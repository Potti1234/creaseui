import { interactionPreviewProgram } from '@/docs/components/pages/authored-page';
import { emptyFixtures } from '@/docs/components/pages/empty/shared';
import * as Button from '@/ui/button';
import * as Empty from '@/ui/empty';

export const emptyTailwindPreviewProgram = interactionPreviewProgram('empty', (index, interaction, h) => {
  const fixture = emptyFixtures[index] ?? emptyFixtures[0];
  return Empty.empty({ class: `w-full max-w-xl${fixture.bordered ? ' border' : ''}`, children: [
    Empty.emptyHeader({ children: [Empty.emptyMedia({ variant: 'icon', children: [fixture.icon] }, h), Empty.emptyTitle({ children: [fixture.heading] }, h), Empty.emptyDescription({ children: [fixture.copy] }, h)] }, h),
    Empty.emptyContent({ children: [Button.button({ ...(fixture.outline ? { variant: 'outline' as const } : {}), onClick: interaction, children: [fixture.action] }, h)] }, h),
  ] }, h);
});
