import type { Html } from '@effect/ui/html'

import { Typography } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './typography.css'

const typ = <Msg>(
  h: Html.H<Msg>,
  variant:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'p'
    | 'blockquote'
    | 'inline-code'
    | 'lead'
    | 'large'
    | 'small'
    | 'muted',
  children: NonNullable<Parameters<typeof Typography<Msg>>[1]['children']>,
) => Typography(h, { variant, children })

const EN = {
  title: 'Taxing Laughter: The Joke Tax Chronicles',
  lead: 'Once upon a time, in a far-off land, there was a very lazy king who spent all day lounging on his throne. One day, his advisors came to him with a problem: the kingdom was running out of money.',
  kingsPlan: 'The King’s Plan',
  kingThought: 'The king thought long and hard, and finally came up with',
  brilliantPlan: 'a brilliant plan',
  taxJokes: ': he would tax the jokes in the kingdom.',
  blockquote:
    '“After all,” he said, “everyone enjoys a good joke, so it’s only fair that they should pay for the privilege.”',
  jokeTax: 'The Joke Tax',
  subjectsNotAmused:
    'The king’s subjects were not amused. They grumbled and complained, but the king was firm:',
  list: [
    '1st level of puns: 5 gold coins',
    '2nd level of jokes: 10 gold coins',
    '3rd level of one-liners: 20 gold coins',
  ],
  stoppedTelling:
    'As a result, people stopped telling jokes, and the kingdom fell into a gloom. But there was one person who refused to let the king’s foolishness get him down: a court jester named Jokester.',
  jokestersRevolt: 'Jokester’s Revolt',
  sneaking:
    'Jokester began sneaking into the castle in the middle of the night and leaving jokes all over the place: under the king’s pillow, in his soup, even in the royal toilet. The king was furious, but he couldn’t seem to stop Jokester.',
  discovered:
    'And then, one day, the people of the kingdom discovered that the jokes left by Jokester were so funny that they couldn’t help but laugh. And once they started laughing, they couldn’t stop.',
  peoplesRebellion: 'The People’s Rebellion',
  uplifted:
    'The people of the kingdom, feeling uplifted by the laughter, started to tell jokes and puns again, and soon the entire kingdom was in on the joke.',
  treasury: 'King’s Treasury',
  happiness: 'People’s happiness',
  rows: [
    ['Empty', 'Overflowing'],
    ['Modest', 'Satisfied'],
    ['Full', 'Ecstatic'],
  ],
  realized:
    'The king, seeing how much happier his subjects were, realized the error of his ways and repealed the joke tax. Jokester was declared a hero, and the kingdom lived happily ever after.',
  moral:
    'The moral of the story is: never underestimate the power of a good laugh and always be careful of bad ideas.',
} as const

const AR = {
  title: 'فرض الضرائب على الضحك: سجلات ضريبة النكتة',
  lead: 'في قديم الزمان، في أرض بعيدة، كان هناك ملك كسول جداً يقضي يومه كله مستلقياً على عرشه. في أحد الأيام، جاءه مستشاروه بمشكلة: المملكة كانت تنفد من المال.',
  kingsPlan: 'خطة الملك',
  kingThought: 'فكر الملك طويلاً وبجد، وأخيراً توصل إلى',
  brilliantPlan: 'خطة عبقرية',
  taxJokes: ': سيفرض ضريبة على النكات في المملكة.',
  blockquote:
    '"في النهاية،" قال، "الجميع يستمتع بنكتة جيدة، لذا من العدل أن يدفعوا مقابل هذا الامتياز."',
  jokeTax: 'ضريبة النكتة',
  subjectsNotAmused:
    'لم يكن رعايا الملك سعداء. تذمروا واشتكوا، لكن الملك كان حازماً:',
  list: [
    'المستوى الأول من التورية: 5 قطع ذهبية',
    'المستوى الثاني من النكات: 10 قطع ذهبية',
    'المستوى الثالث من النكات القصيرة: 20 قطعة ذهبية',
  ],
  stoppedTelling:
    'نتيجة لذلك، توقف الناس عن رواية النكات، وغرقت المملكة في الكآبة. لكن كان هناك شخص واحد رفض أن تحبطه حماقة الملك: مهرج البلاط المسمى المازح.',
  jokestersRevolt: 'ثورة المازح',
  sneaking:
    'بدأ المازح يتسلل إلى القلعة في منتصف الليل ويترك النكات في كل مكان: تحت وسادة الملك، في حسائه، حتى في المرحاض الملكي. كان الملك غاضباً، لكنه لم يستطع إيقاف المازح.',
  discovered:
    'وبعد ذلك، في يوم من الأيام، اكتشف سكان المملكة أن النكات التي تركها المازح كانت مضحكة جداً لدرجة أنهم لم يستطيعوا منع أنفسهم من الضحك. وبمجرد أن بدأوا بالضحك، لم يستطيعوا التوقف.',
  peoplesRebellion: 'ثورة الشعب',
  uplifted:
    'شعر سكان المملكة بالبهجة من الضحك، وبدأوا في رواية النكات والتورية مرة أخرى، وسرعان ما أصبحت المملكة بأكملها جزءاً من النكتة.',
  treasury: 'خزينة الملك',
  happiness: 'سعادة الشعب',
  rows: [
    ['فارغة', 'فائضة'],
    ['متواضعة', 'راضٍ'],
    ['ممتلئة', 'منتشٍ'],
  ],
  realized:
    'الملك، عندما رأى مدى سعادة رعاياه، أدرك خطأ طرقه وألغى ضريبة النكتة. أُعلن المازح بطلاً، وعاشت المملكة في سعادة دائمة.',
  moral:
    'مغزى القصة هو: لا تستهن أبداً بقوة الضحك الجيد وكن دائماً حذراً من الأفكار السيئة.',
}

const article =
  (rtl: boolean): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>) => {
    const a = rtl ? AR : EN
    return h.article
      .class('typography-docs-article')
      .attr('dir', rtl ? 'rtl' : 'ltr')
      .children(
        typ(h, 'h1', [a.title]),
        typ(h, 'lead', [a.lead]),
        typ(h, 'h2', [a.kingsPlan]),
        typ(h, 'p', [
          a.kingThought,
          ' ',
          h.a
            .class('typography-docs-link')
            .attr('href', '#')
            .children(a.brilliantPlan),
          a.taxJokes,
        ]),
        typ(h, 'blockquote', [a.blockquote]),
        typ(h, 'h3', [a.jokeTax]),
        typ(h, 'p', [a.subjectsNotAmused]),
        h.ul
          .class('typography-docs-list')
          .children(a.list.map(item => h.li.children(item))),
        typ(h, 'p', [a.stoppedTelling]),
        typ(h, 'h3', [a.jokestersRevolt]),
        typ(h, 'p', [a.sneaking]),
        typ(h, 'p', [a.discovered]),
        typ(h, 'h3', [a.peoplesRebellion]),
        typ(h, 'p', [a.uplifted]),
        h.div
          .class('typography-docs-table-wrap')
          .children(
            h.table
              .class('typography-docs-table')
              .children(
                h.thead.children(
                  h.tr.children(
                    h.th.children(a.treasury),
                    h.th.children(a.happiness),
                  ),
                ),
                h.tbody.children(
                  a.rows.map(([left, right]) =>
                    h.tr.children(h.td.children(left), h.td.children(right)),
                  ),
                ),
              ),
          ),
        typ(h, 'p', [a.realized]),
        typ(h, 'p', [a.moral]),
      )
  }

const single =
  (
    variant: Parameters<typeof typ>[1],
    text: string,
  ): DocsExampleImplementation['view'] =>
  h =>
    typ(h, variant, [text])

const table: DocsExampleImplementation['view'] = h =>
  h.div
    .class('typography-docs-table-wrap')
    .children(
      h.table
        .class('typography-docs-table')
        .children(
          h.thead.children(
            h.tr.children(
              h.th.children(EN.treasury),
              h.th.children(EN.happiness),
            ),
          ),
          h.tbody.children(
            EN.rows.map(([left, right]) =>
              h.tr.children(h.td.children(left), h.td.children(right)),
            ),
          ),
        ),
    )

const list: DocsExampleImplementation['view'] = h =>
  h.ul
    .class('typography-docs-list')
    .children(EN.list.map(item => h.li.children(item)))

const source = exampleApplicationSource({
  imports: `import { Typography } from '@/ui/effect/ui'
import './typography.css'`,
  body: `Typography(h, {
  variant: 'h1',
  children: ['Taxing Laughter: The Joke Tax Chronicles'],
})`,
})

const examples: ReadonlyArray<
  readonly [string, DocsExampleImplementation['view']]
> = [
  ['Basic', article(false)],
  ['h1', single('h1', 'Taxing Laughter: The Joke Tax Chronicles')],
  ['h2', single('h2', 'The People of the Kingdom')],
  ['h3', single('h3', 'The Joke Tax')],
  ['h4', single('h4', 'People stopped telling jokes')],
  [
    'p',
    single(
      'p',
      'The king, seeing how much happier his subjects were, realized the error of his ways and repealed the joke tax.',
    ),
  ],
  [
    'blockquote',
    single(
      'blockquote',
      '“After all,” he said, “everyone enjoys a good joke, so it’s only fair that they should pay for the privilege.”',
    ),
  ],
  ['table', table],
  ['list', list],
  ['Inline code', single('inline-code', '@/ui/alert-dialog')],
  [
    'Lead',
    single(
      'lead',
      'A modal dialog that interrupts the user with important content and expects a response.',
    ),
  ],
  ['Large', single('large', 'Are you absolutely sure?')],
  ['Small', single('small', 'Email address')],
  ['Muted', single('muted', 'Enter your email address.')],
  ['RTL', article(true)],
]

export const componentDocs = defineComponentDocs({
  usage: `import { Typography } from '@/ui/effect/ui'

Typography(h, { variant: 'h1', children: ['Heading'] })`,
  examples: examples.map(([title, view]) => ({ title, view, source })),
})
