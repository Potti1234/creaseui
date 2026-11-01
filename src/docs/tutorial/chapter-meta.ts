export type TutorialChapterId =
  | 'short'
  | '01'
  | '02'
  | '03'
  | '04'
  | '05'
  | '06'
  | '07'
  | '08'
  | '09'
  | '10'
  | '11'
  | '12'
  | '13'
  | '14'
  | '15'

/* Chapter metadata, free of essay imports so the docs-search index and its
   e2e spec can enumerate chapters without loading the vendored apps. */
export type TutorialChapterMeta = Readonly<{
  id: TutorialChapterId
  title: string
  summary: string
  /* The creaseui-demo git tag holding the app at the end of the chapter;
     null when the chapter has no tag (the short overview, chapter 1). */
  tag: string | null
}>

export const TUTORIAL_CHAPTERS: ReadonlyArray<TutorialChapterMeta> = [
  {
    id: 'short',
    title: 'crease in one page',
    summary:
      'The steps of building a design system on crease, in the order the guide takes them.',
    tag: null,
  },
  {
    id: '01',
    title: 'What crease is, and what you will build',
    summary:
      "crease's three parts, which layers you write, the renderers, the finished app.",
    tag: null,
  },
  {
    id: '02',
    title: 'Install crease and build a first slice',
    summary:
      'The registry, the strict lint and the receipt, and three views built quickly.',
    tag: 'chapter-02',
  },
  {
    id: '03',
    title: 'Write down principles and decisions',
    summary:
      'A product brief and ten decisions, each naming the code that enforces it.',
    tag: 'chapter-03',
  },
  {
    id: '04',
    title: 'Generate the theme',
    summary: 'The preset compiler, a dark mode, and what tokens cannot decide.',
    tag: 'chapter-04',
  },
  {
    id: '05',
    title: 'Customize a component and reduce its API',
    summary: 'One row variant added, 44 of 48 button combinations removed.',
    tag: 'chapter-05',
  },
  {
    id: '06',
    title: 'Contracts and boundaries',
    summary:
      'One way into each component, and feature changes kept apart from system changes.',
    tag: 'chapter-06',
  },
  {
    id: '07',
    title: 'Compose named product patterns',
    summary:
      'One row, one collection, one picker, the full sidebar, and a rule that makes them the only way.',
    tag: 'chapter-07',
  },
  {
    id: '08',
    title: 'Saving, validation and workflows',
    summary:
      'The composer with a draft, browser storage, an issue page and the command menu.',
    tag: 'chapter-08',
  },
  {
    id: '09',
    title: 'Verify the whole system',
    summary:
      'Tests, lint fixtures and a browser check, each tested by breaking the app.',
    tag: 'chapter-09',
  },
  {
    id: '10',
    title: 'Configure the product policy',
    summary:
      'Three layers of rules, narrowing in the receipt, and where configuration ends.',
    tag: 'chapter-10',
  },
  {
    id: '11',
    title: 'Write a product lint rule',
    summary:
      'One primary action per file, with tests that fail when the rule stops reporting.',
    tag: 'chapter-11',
  },
  {
    id: '12',
    title: 'Feature work by agents',
    summary:
      'Three agents build the same view; where they differ becomes a decision.',
    tag: 'chapter-12',
  },
  {
    id: '13',
    title: 'A design-system change, with an agent',
    summary:
      'A board proposal, reviewed, changed by an agent within a scope, and adopted.',
    tag: 'chapter-13',
  },
  {
    id: '14',
    title: 'Evolve an API and migrate its callers',
    summary:
      'Deprecate, migrate, remove: three commits that each pass every check.',
    tag: 'chapter-14',
  },
  {
    id: '15',
    title: 'Take in changes from crease upstream',
    summary:
      'Find the changes that reach the app, merge each kind, and delete the workarounds.',
    tag: 'chapter-15',
  },
]
