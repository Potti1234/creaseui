import { fuzzyScore } from '@/lib/behaviors/text-match'

export const docsSearchFields = (
  page: Readonly<{ title: string; slug: string; description: string }>,
  query: string,
) => {
  const slug = page.slug.replaceAll('-', ' ')
  const containsQuery = (text: string): boolean =>
    fuzzyScore(text, query) >= 0.6
  return {
    searchText: page.title,
    keywords: [slug, ...[page.description].filter(containsQuery)],
    fallbackKeywords: [`${page.title} ${slug} ${page.description}`].filter(
      containsQuery,
    ),
  }
}
