import * as stylex from '@stylexjs/stylex';
import type { Html, HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import {
  inputGroupFixtures,
  inputGroupRtlCopy,
} from '@/docs/components/pages/input-group/shared';
import * as Icon from '@/lib/icon';
import * as DropdownMenu from '@/stylex/dropdown-menu';
import * as Field from '@/stylex/field';
import * as InputGroup from '@/stylex/input-group';
import * as Kbd from '@/stylex/kbd';
import * as Popover from '@/stylex/popover';
import * as Spinner from '@/stylex/spinner';
import { className } from '@/stylex/style';

const styles = stylex.create({
  stack: { gap: '1.5rem', display: 'grid', maxWidth: '24rem', width: '100%', },
  stackTight: { gap: '1rem', display: 'grid', maxWidth: '24rem', width: '100%', },
  stackWide: { gap: '1rem', display: 'grid', maxWidth: '28rem', width: '100%', },
  stackLoose: { gap: '2.5rem', display: 'grid', maxWidth: '24rem', width: '100%', },
  group: { maxWidth: '20rem' },
  textXs: { fontSize: '0.75rem' },
  monoText: { fontFamily: 'monospace' },
  codeArea: { minHeight: '200px' },
  push: { marginInlineStart: 'auto' },
  iconButton: {
    borderRadius: 'calc(var(--radius) - 5px)',
    alignItems: 'center',
    color: 'var(--muted-foreground)',
    display: 'flex',
    justifyContent: 'center',
    height: '1.5rem',
    width: '1.5rem',
  },
  popoverContent: {
    gap: '0.25rem',
    display: 'flex',
    flexDirection: 'column',
    fontSize: '0.875rem',
  },
  popoverTitle: { fontWeight: 500 },
  favorite: { fill: 'var(--primary)', stroke: 'var(--primary)' },
  customArea: {
    fieldSizing: 'content',
    borderRadius: '0.375rem',
    paddingBlock: '0.625rem',
    paddingInline: '0.75rem',
    backgroundColor: 'transparent',
    display: 'flex',
    fontSize: '1rem',
    outlineStyle: 'none',
    resize: 'none',
    minHeight: '4rem',
    width: '100%',
  },
});

const FILE_MENU_ITEMS = ['Settings', 'Copy path', 'Open location'] as const;
const SEARCH_MENU_ITEMS = ['Documentation', 'Blog Posts', 'Changelog'] as const;

interface InputGroupPreviewShape {
  readonly values: { readonly [key: string]: string };
  readonly dropdowns: ReadonlyArray<DropdownMenu.Model>;
  readonly popover: Popover.Model;
  readonly isFavorite: boolean;
  readonly isCopied: boolean;
}

export const inputGroupStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  index: number,
  model: unknown,
  onMessageJson: (json: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html => {
  const fixture = inputGroupFixtures[index] ?? inputGroupFixtures[0];
  const m = model as InputGroupPreviewShape;

  const changed = (field: string, value: string): Msg =>
    onMessageJson(JSON.stringify({ _tag: 'ChangedInputValue', field, value }));

  const lbl = (forId: string, text: string): Html =>
    Field.fieldLabel({ for: forId, children: [text] }, h);
  const dsc = (text: string): Html =>
    Field.fieldDescription({ children: [text] }, h);

  const in_ = (
    key: string,
    id: string,
    extras: Partial<Parameters<typeof InputGroup.inputGroupInput<Msg>>[0]> = {},
  ): Html =>
    InputGroup.inputGroupInput({
      id,
      value: m.values[key] ?? '',
      onInput: value => changed(key, value),
      ...extras,
    }, h);

  const area = (
    key: string,
    id: string,
    extras: Partial<Parameters<typeof InputGroup.inputGroupTextarea<Msg>>[0]> = {},
  ): Html =>
    InputGroup.inputGroupTextarea({
      id,
      value: m.values[key] ?? '',
      onInput: value => changed(key, value),
      ...extras,
    }, h);

  const dropdownMenu = (
    dropdownIndex: number,
    ariaLabel: string,
    trigger: Html | string,
    triggerButtonSize: 'icon-xs' | 'xs',
    items: ReadonlyArray<string>,
  ): Html => {
    const dropdown = m.dropdowns[dropdownIndex];
    if (dropdown === undefined) return h.div([], []);
    return DropdownMenu.dropdownMenu({
      model: dropdown,
      toParentMessage: message =>
        onMessageJson(JSON.stringify({ _tag: 'GotDropdownMessage', index: dropdownIndex, message })),
      trigger,
      triggerButtonVariant: 'ghost',
      triggerButtonSize,
      ariaLabel,
      align: 'end',
      items,
      itemToConfig: item => ({ label: item }),
    }, h);
  };

  switch (fixture.kind) {
    case 'demo':
      return InputGroup.inputGroup({
        layoutStyle: styles.group,
        children: [
          in_('demo', 'input-group-demo', { placeholder: 'Search...' }),
          InputGroup.inputGroupAddon({ children: [Icon.icon('search', {}, h)] }, h),
          InputGroup.inputGroupAddon({ align: 'inline-end', children: ['12 results'] }, h),
        ],
      }, h);
    case 'align':
      return h.div([h.Class(className(styles.stackLoose))], [
        Field.field({
          children: [
            lbl('inline-start-input', 'Input'),
            InputGroup.inputGroup({
              children: [
                in_('alignStart', 'inline-start-input', { placeholder: 'Search...' }),
                InputGroup.inputGroupAddon({ align: 'inline-start', children: [Icon.icon('search', {}, h)] }, h),
              ],
            }, h),
            dsc('Icon positioned at the start.'),
          ],
        }, h),
        Field.field({
          children: [
            lbl('inline-end-input', 'Input'),
            InputGroup.inputGroup({
              children: [
                in_('alignEnd', 'inline-end-input', { type: 'password', placeholder: 'Enter password' }),
                InputGroup.inputGroupAddon({ align: 'inline-end', children: [Icon.icon('eye-off', {}, h)] }, h),
              ],
            }, h),
            dsc('Icon positioned at the end.'),
          ],
        }, h),
        Field.fieldGroup({
          children: [
            Field.field({
              children: [
                lbl('block-start-input', 'Input'),
                InputGroup.inputGroup({
                  children: [
                    in_('alignBlockInput', 'block-start-input', { placeholder: 'Enter your name' }),
                    InputGroup.inputGroupAddon({
                      align: 'block-start',
                      children: [InputGroup.inputGroupText({ children: ['Full Name'] }, h)],
                    }, h),
                  ],
                }, h),
                dsc('Header positioned above the input.'),
              ],
            }, h),
            Field.field({
              children: [
                lbl('block-start-textarea', 'Textarea'),
                InputGroup.inputGroup({
                  children: [
                    area('alignBlockTextarea', 'block-start-textarea', { placeholder: "console.log('Hello, world!');", mono: true }),
                    InputGroup.inputGroupAddon({
                      align: 'block-start',
                      children: [
                        Icon.icon('file-code', {}, h),
                        InputGroup.inputGroupText({ children: [h.span([h.Class(className(styles.monoText))], ['script.js'])] }, h),
                        InputGroup.inputGroupButton({ size: 'icon-xs', layoutStyle: styles.push, children: [Icon.icon('copy', {}, h)] }, h),
                      ],
                    }, h),
                  ],
                }, h),
                dsc('Header positioned above the textarea.'),
              ],
            }, h),
          ],
        }, h),
        Field.fieldGroup({
          children: [
            Field.field({
              children: [
                lbl('block-end-input', 'Input'),
                InputGroup.inputGroup({
                  children: [
                    in_('alignBlockEndInput', 'block-end-input', { placeholder: 'Enter amount' }),
                    InputGroup.inputGroupAddon({
                      align: 'block-end',
                      children: [InputGroup.inputGroupText({ children: ['USD'] }, h)],
                    }, h),
                  ],
                }, h),
                dsc('Footer positioned below the input.'),
              ],
            }, h),
            Field.field({
              children: [
                lbl('block-end-textarea', 'Textarea'),
                InputGroup.inputGroup({
                  children: [
                    area('alignBlockEndTextarea', 'block-end-textarea', { placeholder: 'Write a comment...' }),
                    InputGroup.inputGroupAddon({
                      align: 'block-end',
                      children: [
                        InputGroup.inputGroupText({ children: ['0/280'] }, h),
                        InputGroup.inputGroupButton({ variant: 'default', size: 'sm', layoutStyle: styles.push, children: ['Post'] }, h),
                      ],
                    }, h),
                  ],
                }, h),
                dsc('Footer positioned below the textarea.'),
              ],
            }, h),
          ],
        }, h),
      ]);
    case 'icon':
      return h.div([h.Class(className(styles.stack))], [
        InputGroup.inputGroup({
          children: [
            in_('iconSearch', 'icon-search', { placeholder: 'Search...' }),
            InputGroup.inputGroupAddon({ children: [Icon.icon('search', {}, h)] }, h),
          ],
        }, h),
        InputGroup.inputGroup({
          children: [
            in_('iconEmail', 'icon-email', { type: 'email', placeholder: 'Enter your email' }),
            InputGroup.inputGroupAddon({ children: [Icon.icon('mail', {}, h)] }, h),
          ],
        }, h),
        InputGroup.inputGroup({
          children: [
            in_('iconCard', 'icon-card', { placeholder: 'Card number' }),
            InputGroup.inputGroupAddon({ children: [Icon.icon('credit-card', {}, h)] }, h),
            InputGroup.inputGroupAddon({ align: 'inline-end', children: [Icon.icon('check', {}, h)] }, h),
          ],
        }, h),
        InputGroup.inputGroup({
          children: [
            in_('iconCardStar', 'icon-card-star', { placeholder: 'Card number' }),
            InputGroup.inputGroupAddon({
              align: 'inline-end',
              children: [Icon.icon('star', {}, h), Icon.icon('info', {}, h)],
            }, h),
          ],
        }, h),
      ]);
    case 'text':
      return h.div([h.Class(className(styles.stack))], [
        InputGroup.inputGroup({
          children: [
            InputGroup.inputGroupAddon({ children: [InputGroup.inputGroupText({ children: ['$'] }, h)] }, h),
            in_('textAmount', 'text-amount', { placeholder: '0.00' }),
            InputGroup.inputGroupAddon({ align: 'inline-end', children: [InputGroup.inputGroupText({ children: ['USD'] }, h)] }, h),
          ],
        }, h),
        InputGroup.inputGroup({
          children: [
            InputGroup.inputGroupAddon({ children: [InputGroup.inputGroupText({ children: ['https://'] }, h)] }, h),
            in_('textDomain', 'text-domain', { placeholder: 'example.com' }),
            InputGroup.inputGroupAddon({ align: 'inline-end', children: [InputGroup.inputGroupText({ children: ['.com'] }, h)] }, h),
          ],
        }, h),
        InputGroup.inputGroup({
          children: [
            in_('textUsername', 'text-username', { placeholder: 'Enter your username' }),
            InputGroup.inputGroupAddon({ align: 'inline-end', children: [InputGroup.inputGroupText({ children: ['@company.com'] }, h)] }, h),
          ],
        }, h),
        InputGroup.inputGroup({
          children: [
            area('textMessage', 'text-message', { placeholder: 'Enter your message' }),
            InputGroup.inputGroupAddon({
              align: 'block-end',
              children: [
                InputGroup.inputGroupText({
                  children: [h.span([h.Class(className(styles.textXs))], ['120 characters left'])],
                }, h),
              ],
            }, h),
          ],
        }, h),
      ]);
    case 'button':
      return h.div([h.Class(className(styles.stack))], [
        InputGroup.inputGroup({
          children: [
            in_('buttonCopy', 'button-copy', { placeholder: 'https://x.com/shadcn' }),
            InputGroup.inputGroupAddon({
              align: 'inline-end',
              children: [
                InputGroup.inputGroupButton({
                  size: 'icon-xs',
                  ariaLabel: 'Copy',
                  onClick: onMessageJson(JSON.stringify({ _tag: 'ClickedCopy' })),
                  children: [m.isCopied ? Icon.icon('check', {}, h) : Icon.icon('copy', {}, h)],
                }, h),
              ],
            }, h),
          ],
        }, h),
        InputGroup.inputGroup({
          radius: 'full',
          children: [
            Popover.popover({
              model: m.popover,
              toParentMessage: message =>
                onMessageJson(JSON.stringify({ _tag: 'GotPopoverMessage', message })),
              trigger: h.span([h.Class(className(styles.iconButton))], [Icon.icon('info', {}, h)]),
              align: 'start',
              content: h.div([h.Class(className(styles.popoverContent))], [
                h.p([h.Class(className(styles.popoverTitle))], ['Your connection is not secure.']),
                h.p([], ['You should not enter any sensitive information on this site.']),
              ]),
            }, h),
            InputGroup.inputGroupAddon({ children: ['https://'] }, h),
            in_('buttonSecure', 'button-secure'),
            InputGroup.inputGroupAddon({
              align: 'inline-end',
              children: [
                InputGroup.inputGroupButton({
                  size: 'icon-xs',
                  onClick: onMessageJson(JSON.stringify({ _tag: 'ClickedFavorite' })),
                  children: [
                    Icon.icon('star', { class: m.isFavorite ? className(styles.favorite) : '' }, h),
                  ],
                }, h),
              ],
            }, h),
          ],
        }, h),
        InputGroup.inputGroup({
          children: [
            in_('buttonSearch', 'button-search', { placeholder: 'Type to search...' }),
            InputGroup.inputGroupAddon({
              align: 'inline-end',
              children: [InputGroup.inputGroupButton({ variant: 'secondary', children: ['Search'] }, h)],
            }, h),
          ],
        }, h),
      ]);
    case 'kbd':
      return InputGroup.inputGroup({
        layoutStyle: styles.group,
        children: [
          in_('kbd', 'kbd-search', { placeholder: 'Search...' }),
          InputGroup.inputGroupAddon({ children: [Icon.icon('search', {}, h)] }, h),
          InputGroup.inputGroupAddon({ align: 'inline-end', children: [Kbd.kbd({ children: ['⌘K'] }, h)] }, h),
        ],
      }, h);
    case 'dropdown':
      return h.div([h.Class(className(styles.stackTight))], [
        InputGroup.inputGroup({
          children: [
            in_('dropdownFile', 'dropdown-file', { placeholder: 'Enter file name' }),
            InputGroup.inputGroupAddon({
              align: 'inline-end',
              children: [
                dropdownMenu(0, 'More', Icon.icon('ellipsis', { ariaLabel: 'More' }, h), 'icon-xs', FILE_MENU_ITEMS),
              ],
            }, h),
          ],
        }, h),
        InputGroup.inputGroup({
          radius: 'xl',
          children: [
            in_('dropdownQuery', 'dropdown-query', { placeholder: 'Enter search query' }),
            InputGroup.inputGroupAddon({
              align: 'inline-end',
              children: [
                dropdownMenu(1, 'Search in', 'Search In... ⌄', 'xs', SEARCH_MENU_ITEMS),
              ],
            }, h),
          ],
        }, h),
      ]);
    case 'spinner':
      return h.div([h.Class(className(styles.stackTight))], [
        InputGroup.inputGroup({
          children: [
            in_('spinnerSearch', 'spinner-search', { placeholder: 'Searching...' }),
            InputGroup.inputGroupAddon({ align: 'inline-end', children: [Spinner.spinner({ isDecorative: true }, h)] }, h),
          ],
        }, h),
        InputGroup.inputGroup({
          children: [
            in_('spinnerProcessing', 'spinner-processing', { placeholder: 'Processing...' }),
            InputGroup.inputGroupAddon({ children: [Spinner.spinner({ isDecorative: true }, h)] }, h),
          ],
        }, h),
        InputGroup.inputGroup({
          children: [
            in_('spinnerSaving', 'spinner-saving', { placeholder: 'Saving changes...' }),
            InputGroup.inputGroupAddon({
              align: 'inline-end',
              children: [InputGroup.inputGroupText({ children: ['Saving...'] }, h), Spinner.spinner({ isDecorative: true }, h)],
            }, h),
          ],
        }, h),
        InputGroup.inputGroup({
          children: [
            in_('spinnerRefresh', 'spinner-refresh', { placeholder: 'Refreshing data...' }),
            InputGroup.inputGroupAddon({ children: [Spinner.spinner({ isDecorative: true }, h)] }, h),
            InputGroup.inputGroupAddon({
              align: 'inline-end',
              children: [InputGroup.inputGroupText({ children: ['Please wait...'] }, h)],
            }, h),
          ],
        }, h),
      ]);
    case 'textarea':
      return h.div([h.Class(className(styles.stackWide))], [
        InputGroup.inputGroup({
          children: [
            area('textareaCode', 'textarea-code', { placeholder: "console.log('Hello, world!');", layoutStyle: styles.codeArea }),
            InputGroup.inputGroupAddon({
              align: 'block-end',
              children: [
                InputGroup.inputGroupText({ children: ['Line 1, Column 1'] }, h),
                InputGroup.inputGroupButton({ size: 'sm', variant: 'default', layoutStyle: styles.push, children: ['Run ', Icon.icon('corner-down-left', {}, h)] }, h),
              ],
            }, h),
            InputGroup.inputGroupAddon({
              align: 'block-start',
              children: [
                InputGroup.inputGroupText({ children: [Icon.icon('file-code', {}, h), 'script.js'] }, h),
                InputGroup.inputGroupButton({ size: 'icon-xs', layoutStyle: styles.push, children: [Icon.icon('refresh-cw', {}, h)] }, h),
                InputGroup.inputGroupButton({ size: 'icon-xs', children: [Icon.icon('copy', {}, h)] }, h),
              ],
            }, h),
          ],
        }, h),
      ]);
    case 'custom':
      return h.div([h.Class(className(styles.stack))], [
        InputGroup.inputGroup({
          children: [
            h.textarea([
              h.DataAttribute('slot', 'input-group-control'),
              h.Placeholder('Autoresize textarea...'),
              h.Value(m.values['customMessage'] ?? ''),
              h.OnInput(value => changed('customMessage', value)),
              h.Class(className(styles.customArea)),
            ]),
            InputGroup.inputGroupAddon({
              align: 'block-end',
              children: [InputGroup.inputGroupButton({ size: 'sm', variant: 'default', layoutStyle: styles.push, children: ['Submit'] }, h)],
            }, h),
          ],
        }, h),
      ]);
    case 'rtl': {
      const t = inputGroupRtlCopy;
      return h.div([h.Dir('rtl'), h.Class(className(styles.stack))], [
        InputGroup.inputGroup({
          children: [
            in_('rtlSearch', 'rtl-search', { placeholder: t.placeholder }),
            InputGroup.inputGroupAddon({ children: [Icon.icon('search', {}, h)] }, h),
            InputGroup.inputGroupAddon({ align: 'inline-end', children: [t.results] }, h),
          ],
        }, h),
        InputGroup.inputGroup({
          children: [
            in_('rtlSearching', 'rtl-searching', { placeholder: t.searching }),
            InputGroup.inputGroupAddon({ align: 'inline-end', children: [Spinner.spinner({ isDecorative: true }, h)] }, h),
          ],
        }, h),
        InputGroup.inputGroup({
          children: [
            in_('rtlSaving', 'rtl-saving', { placeholder: t.savingChanges }),
            InputGroup.inputGroupAddon({
              align: 'inline-end',
              children: [InputGroup.inputGroupText({ children: [t.saving] }, h), Spinner.spinner({ isDecorative: true }, h)],
            }, h),
          ],
        }, h),
        Field.fieldGroup({
          children: [
            Field.field({
              children: [
                lbl('rtl-textarea', t.textareaLabel),
                InputGroup.inputGroup({
                  children: [
                    area('rtlComment', 'rtl-textarea', { placeholder: t.textareaPlaceholder }),
                    InputGroup.inputGroupAddon({
                      align: 'block-end',
                      children: [
                        InputGroup.inputGroupText({ children: [t.characterCount] }, h),
                        InputGroup.inputGroupButton({ variant: 'default', size: 'sm', layoutStyle: styles.push, children: [t.post] }, h),
                      ],
                    }, h),
                  ],
                }, h),
                dsc(t.textareaDescription),
              ],
            }, h),
          ],
        }, h),
      ]);
    }
  }
};
