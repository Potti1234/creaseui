import type { DocsExample } from '@/docs/components/page-definition';
import { staticComponentApplication } from '@/docs/components/pages/authored-page';

export const alertFixtures = [
  { severity: 'info', announcement: 'static', title: 'Deployment window', description: 'Maintenance is scheduled for Saturday at 02:00 UTC.', icon: 'info' },
  { severity: 'success', announcement: 'status', title: 'Changes saved', description: 'Your workspace settings are now available to every project.', icon: 'circleCheck' },
  { severity: 'warning', announcement: 'status', title: 'Storage nearly full', description: 'This workspace has used 92% of its storage. Archive old build artifacts or increase the storage limit before the next release creates additional logs and source maps.', icon: 'triangleAlert' },
  { severity: 'error', announcement: 'alert', title: 'Upload failed', description: 'Check your connection and try again.', icon: 'octagonX' },
] as const;

const exampleMetadata = [
  { title: 'Static information', description: 'Visible guidance does not announce merely because it rendered.' },
  { title: 'Polite success', description: 'A completed background action uses status semantics.' },
  { title: 'Long warning', description: 'Long warning content preserves icon, title, and description alignment.' },
  { title: 'Urgent error', description: 'Only an urgent newly rendered failure uses assertive alert semantics.' },
] as const;

const source = (index: number, renderer: 'tailwind' | 'stylex'): string => {
  const item = alertFixtures[index] ?? alertFixtures[0];
  const layoutInput = renderer === 'tailwind'
    ? "class: 'max-w-xl',"
    : 'layoutStyle: styles.alert,';
  const stylexImports = renderer === 'stylex'
    ? `import * as stylex from '@stylexjs/stylex'\nimport * as Icon from '@/lib/icon'`
    : `import * as Icon from '@/lib/icon'`;
  const styles = renderer === 'stylex'
    ? `\nconst styles = stylex.create({ alert: { maxWidth: '36rem' } })\n`
    : '';

  return staticComponentApplication({
    componentName: 'Alert',
    componentSlug: 'alert',
    renderer,
    exampleName: item.title,
    componentImports: `${stylexImports}${styles}`,
    viewBody: `Alert.alert({
  severity: '${item.severity}',
  announcement: '${item.announcement}',
  ${layoutInput}
  children: [
    Alert.alertIcon({ children: [Icon.${item.icon}({}, h)] }, h),
    Alert.alertTitle({ children: ['${item.title}'] }, h),
    Alert.alertDescription({ children: ['${item.description}'] }, h),
  ],
}, h)`,
  });
};

export const alertExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => exampleMetadata.map((metadata, index) => ({
  ...metadata,
  code: source(index, renderer),
}));
