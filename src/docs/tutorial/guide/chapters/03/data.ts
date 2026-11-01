import atChapter03 from '../../generated/03/principles.md?raw'
import atChapter07 from '../../generated/03/principles-chapter-07.md?raw'

/* The decisions of design-system/principles.md, parsed from the file at two
   tags. A decision is "planned" while its enforcing place still names a
   chapter that has not built it ("… (chapter 8)"). */

export type Decision = Readonly<{
  id: string
  text: string
  principle: string
  enforcedAt03: string
  enforcedAt07: string
}>

type Row = Readonly<{
  id: string
  text: string
  principle: string
  enforced: string
}>

const parse = (markdown: string): ReadonlyArray<Row> => {
  const rows: Array<Row> = []
  let principle = ''
  for (const line of markdown.replace(/\r/gu, '').split('\n')) {
    const heading = /^## \d+\. (.+)$/u.exec(line)
    if (heading !== null) principle = heading[1] ?? ''
    const row = /^\| (D\d+)\. (.+?) \| (.+) \|$/u.exec(line)
    if (row !== null)
      rows.push({
        id: row[1] ?? '',
        text: row[2] ?? '',
        principle,
        enforced: row[3] ?? '',
      })
  }
  return rows
}

const rows03 = parse(atChapter03)
const rows07 = parse(atChapter07)

export const DECISIONS: ReadonlyArray<Decision> = rows03.map(row => ({
  id: row.id,
  text: row.text,
  principle: row.principle,
  enforcedAt03: row.enforced,
  enforcedAt07:
    rows07.find(each => each.id === row.id)?.enforced ?? row.enforced,
}))

export const isPlanned = (enforced: string): boolean =>
  /\(chapter \d+\)/u.test(enforced)

export const enforcedCount = (pick: (decision: Decision) => string): number =>
  DECISIONS.filter(decision => !isPlanned(pick(decision))).length
