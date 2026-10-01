import { authoredPage } from '@/docs/components/pages/authored-page';
import { appShellExamples } from '@/docs/components/pages/app-shell/shared';
import { appShellTailwindPreviews } from '@/docs/components/pages/app-shell/tailwind';

const tailwindExamples = appShellExamples('tailwind').map((example, index) => ({
  ...example,
  staticPreview: (appShellTailwindPreviews[index] ?? appShellTailwindPreviews[0])!,
}));

export const appShellPage = authoredPage({
  slug: 'app-shell',
  title: 'App Shell',
  kind: 'recipe',
  previewMode: 'static',
  definition: {
    kind: 'recipe',
    description:
      'Application scaffold with a skip link, optional banner and top-nav header, an optional side-nav panel, and a scrollable <main> content area.',
    architecture:
      'AppShell is a stateless render helper. `height: "fill"` pins the shell to the viewport and scrolls the content internally; `"auto"` grows with content and keeps the header and side nav sticky while the page scrolls. Variants control how nav areas contrast with content.',
    apiHref:
      'https://github.com/facebook/astryx/tree/main/packages/core/src/AppShell',
    styling:
      'The nav slots take arbitrary markup — pass your app\'s top-nav and side-nav composition. `contentPadding` uses the spacing scale; the elevated variant adds the 28px page-radius corner when both navs are present.',
    accessibility:
      'The shell renders a skip-to-content link targeting <main> (a tabIndex={-1} focus target, per WCAG 2.4.1). The header region is a `banner` landmark and <main> carries the page content.',
    examples: tailwindExamples,
    stylexExamples: appShellExamples('stylex'),
  },
});
