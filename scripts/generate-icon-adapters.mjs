import fs from 'node:fs';
import path from 'node:path';

import { XMLParser } from 'fast-xml-parser';

const root = process.cwd();
const write = process.argv.includes('--write');
const mapping = JSON.parse(
  fs.readFileSync(path.join(root, 'scripts/icon-adapter-map.json'), 'utf8'),
);

const libraries = {
  lucide: { set: 'lucide', title: 'Lucide' },
  hugeicons: { set: 'hugeicons', title: 'Hugeicons' },
  tabler: { set: 'tabler', title: 'Tabler Icons' },
  phosphor: { set: 'ph', title: 'Phosphor Icons' },
  remixicon: { set: 'ri', title: 'Remix Icon' },
};

const parser = new XMLParser({
  preserveOrder: true,
  ignoreAttributes: false,
  attributeNamePrefix: '',
});

const iconNames = Object.keys(mapping).sort();
const allowedTags = new Set(['circle', 'ellipse', 'g', 'path', 'rect']);

const parseChildren = (items) =>
  items.flatMap((item) => {
    const tag = Object.keys(item).find((key) => key !== ':@');
    if (tag === undefined || tag === '#text') return [];
    if (!allowedTags.has(tag)) {
      throw new Error(`Unsupported SVG element <${tag}> in icon adapter`);
    }
    const attributes = Object.fromEntries(
      Object.entries(item[':@'] ?? {}).map(([key, value]) => [
        key,
        String(value),
      ]),
    );
    return [[tag, attributes, parseChildren(item[tag] ?? [])]];
  });

const iconModule = (library) => `import type { Attribute, Html, HtmlBuilder } from 'foldkit/html';

import { iconNodes } from '@/lib/icon-nodes';
import { cn } from '@/lib/utils';

type IconTag = 'circle' | 'ellipse' | 'g' | 'path' | 'rect';
type IconAttributes = Readonly<Record<string, string>>;
type IconNode = readonly [IconTag, IconAttributes, ReadonlyArray<IconNode>];
type IconDefinition = Readonly<{
  width: number;
  height: number;
  nodes: ReadonlyArray<IconNode>;
}>;

export type IconConfig = Readonly<{
  class?: string;
  ariaLabel?: string;
}>;

const nodeView = <Msg>(h: HtmlBuilder<Msg>, node: IconNode): Html => {
  const attributes: ReadonlyArray<Attribute<Msg>> = Object.entries(node[1]).map(
    ([key, value]) => h.Attribute(key, value),
  );
  const children = node[2].map((child) => nodeView(h, child));
  switch (node[0]) {
    case 'circle': return h.circle(attributes, children);
    case 'ellipse': return h.ellipse(attributes, children);
    case 'g': return h.g(attributes, children);
    case 'path': return h.path(attributes, children);
    case 'rect': return h.rect(attributes, children);
  }
};

export const icon = <Msg>(
  name: string,
  config: IconConfig,
  h: HtmlBuilder<Msg>,
): Html => {
  const definition = (iconNodes as Readonly<Record<string, IconDefinition>>)[name];
  const width = definition?.width ?? 24;
  const height = definition?.height ?? 24;
  return h.svg(
    [
      h.Xmlns('http://www.w3.org/2000/svg'),
      h.ViewBox(\`0 0 \${width} \${height}\`),
      h.Class(cn('crease-icon crease-icon-${library}', \`crease-icon-\${name}\`, config.class)),
      ...(config.ariaLabel === undefined
        ? [h.AriaHidden(true)]
        : [h.Role('img'), h.AriaLabel(config.ariaLabel)]),
    ],
    (definition?.nodes ?? []).map((child) => nodeView(h, child)),
  );
};

const named =
  (name: string) =>
  <Msg>(config: IconConfig, h: HtmlBuilder<Msg>): Html =>
    icon(name, config, h);

export const arrowLeft = named('arrow-left');
export const arrowRight = named('arrow-right');
export const arrowDown = named('arrow-down');
export const calendarIcon = named('calendar');
export const check = named('check');
export const chevronDown = named('chevron-down');
export const chevronLeft = named('chevron-left');
export const chevronRight = named('chevron-right');
export const chevronUp = named('chevron-up');
export const chevronsUpDown = named('chevrons-up-down');
export const circleCheck = named('circle-check');
export const circleIcon = named('circle');
export const codeXml = named('code-xml');
export const gripVertical = named('grip-vertical');
export const info = named('info');
export const loaderCircle = named('loader-circle');
export const minus = named('minus');
export const moreHorizontal = named('ellipsis');
export const octagonX = named('octagon-x');
export const panelLeft = named('panel-left');
export const plus = named('plus');
export const search = named('search');
export const triangleAlert = named('triangle-alert');
export const x = named('x');
`;

const desired = new Map();
const registryItems = [];

for (const [library, config] of Object.entries(libraries)) {
  const sourcePath = path.join(
    root,
    'node_modules',
    '@iconify-json',
    config.set,
    'icons.json',
  );
  const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const nodes = {};
  for (const name of iconNames) {
    const sourceName = mapping[name][library];
    const definition = source.icons[sourceName];
    if (definition === undefined) {
      throw new Error(`${library} is missing mapped icon ${sourceName} (${name})`);
    }
    const document = parser.parse(`<root>${definition.body}</root>`);
    nodes[name] = {
      width: definition.width ?? source.width,
      height: definition.height ?? source.height,
      nodes: parseChildren(document[0].root),
    };
  }

  const directory = path.join(root, 'registry', 'icons', library);
  desired.set(
    path.join(directory, 'icon-nodes.ts'),
    `// Generated by npm run icons:adapters:generate. Do not edit manually.\nexport const iconNodes = ${JSON.stringify(nodes, null, 2)} as const;\n`,
  );
  desired.set(path.join(directory, 'icon.ts'), iconModule(library));
  registryItems.push({
    name: `icons-${library}`,
    type: 'registry:lib',
    title: `${config.title} adapter for Foldkit`,
    description: `${config.title} icons rendered with Foldkit native SVG constructors.`,
    registryDependencies: ['Potti1234/creaseui/utils'],
    files: [
      {
        path: `${library}/icon.ts`,
        type: 'registry:lib',
        target: '@lib/icon.ts',
      },
      {
        path: `${library}/icon-nodes.ts`,
        type: 'registry:lib',
        target: '@lib/icon-nodes.ts',
      },
    ],
  });
}

desired.set(
  path.join(root, 'registry', 'icons', 'registry.json'),
  `${JSON.stringify(
    {
      $schema: 'https://ui.shadcn.com/schema/registry.json',
      items: registryItems,
    },
    null,
    2,
  )}\n`,
);

const stale = [];
for (const [file, content] of desired) {
  const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  if (current === content) continue;
  if (write) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  } else {
    stale.push(path.relative(root, file));
  }
}

if (stale.length > 0) {
  console.error(`Icon adapters are stale:\n${stale.map((file) => `- ${file}`).join('\n')}`);
  console.error('Run npm run icons:adapters:generate.');
  process.exitCode = 1;
} else {
  console.log(`${write ? 'Generated' : 'Verified'} ${Object.keys(libraries).length} icon adapters (${iconNames.length} icons each).`);
}
