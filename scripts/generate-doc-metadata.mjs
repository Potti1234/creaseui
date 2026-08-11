import fs from 'node:fs';
import path from 'node:path';

import ts from 'typescript';

const root = process.cwd();
const write = process.argv.includes('--write');
const registry = JSON.parse(
  fs.readFileSync(path.join(root, 'src/ui/registry.json'), 'utf8'),
);
const exampleSource = fs.readFileSync(
  path.join(root, 'src/docs/components/generated-example-sources.ts'),
  'utf8',
);

const normalize = (value) => value.replace(/\s+/g, ' ').trim();
const shorten = (value, limit = 260) =>
  value.length <= limit ? value : `${value.slice(0, limit - 1)}…`;
const hasExport = (node) =>
  node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ??
  false;

const parameters = (node, sourceFile) =>
  node.parameters
    .map((parameter) => normalize(parameter.getText(sourceFile)))
    .join(', ');
const typeParameters = (node, sourceFile) =>
  node.typeParameters === undefined
    ? ''
    : `<${node.typeParameters.map((item) => normalize(item.getText(sourceFile))).join(', ')}>`;

const apiFor = (file) => {
  const source = fs.readFileSync(file, 'utf8');
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const api = [];
  for (const statement of sourceFile.statements) {
    if (!hasExport(statement) && !ts.isExportDeclaration(statement)) continue;
    if (ts.isExportDeclaration(statement)) {
      const moduleName = statement.moduleSpecifier?.getText(sourceFile) ?? '';
      if (statement.exportClause === undefined) {
        api.push({
          name: '*',
          kind: 're-export',
          signature: `export * from ${moduleName}`,
        });
      } else if (ts.isNamedExports(statement.exportClause)) {
        for (const element of statement.exportClause.elements) {
          api.push({
            name: element.name.text,
            kind: 're-export',
            signature: `export { ${normalize(element.getText(sourceFile))} } from ${moduleName}`,
          });
        }
      }
      continue;
    }
    if (ts.isTypeAliasDeclaration(statement)) {
      api.push({
        name: statement.name.text,
        kind: 'type',
        signature: shorten(
          `${statement.name.text}${typeParameters(statement, sourceFile)} = ${normalize(statement.type.getText(sourceFile))}`,
        ),
      });
      continue;
    }
    if (ts.isInterfaceDeclaration(statement)) {
      api.push({
        name: statement.name.text,
        kind: 'interface',
        signature: shorten(normalize(statement.getText(sourceFile))),
      });
      continue;
    }
    if (ts.isFunctionDeclaration(statement) && statement.name !== undefined) {
      api.push({
        name: statement.name.text,
        kind: 'function',
        signature: shorten(
          `${statement.name.text}${typeParameters(statement, sourceFile)}(${parameters(statement, sourceFile)}): ${statement.type?.getText(sourceFile) ?? 'inferred'}`,
        ),
      });
      continue;
    }
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name)) continue;
        const initializer = declaration.initializer;
        const callable =
          initializer !== undefined &&
          (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer));
        api.push({
          name: declaration.name.text,
          kind: callable ? 'function' : 'value',
          signature: shorten(
            callable
              ? `${declaration.name.text}${typeParameters(initializer, sourceFile)}(${parameters(initializer, sourceFile)}): ${initializer.type?.getText(sourceFile) ?? 'inferred'}`
              : `${declaration.name.text}: ${declaration.type?.getText(sourceFile) ?? 'value'}`,
          ),
        });
      }
    }
  }
  return api;
};

const exampleKeys = new Set(
  [...exampleSource.matchAll(/^  "([^"]+)":/gm)].map((match) => match[1]),
);
const components = registry.items.map((item) => {
  const file = path.join(root, 'src/ui', item.files[0].path);
  const prefix = `${item.name}/`;
  const standaloneDocs = path.join(
    root,
    'src/docs/components',
    `${item.name}.ts`,
  );
  const standaloneExamples = fs.existsSync(standaloneDocs)
    ? [
        ...fs
          .readFileSync(standaloneDocs, 'utf8')
          .matchAll(/^\s{10}title: '([^']+)',/gm),
      ].map((match) => match[1])
    : [];
  return {
    slug: item.name,
    title: item.title,
    description: item.description,
    docs: `/docs/components/${item.name}`,
    source: `src/ui/${item.files[0].path}`,
    install: `npx shadcn@latest add Potti1234/creaseui/${item.name}`,
    dependencies: [...(item.dependencies ?? []), ...(item.registryDependencies ?? [])],
    examples:
      standaloneExamples.length > 0
        ? standaloneExamples
        : [...exampleKeys]
            .filter((key) => key.startsWith(prefix))
            .map((key) => key.slice(prefix.length)),
    api: apiFor(file),
  };
});

const metadata = {
  $schema: './docs-index.schema.json',
  generatedFrom: ['src/ui/registry.json', 'src/ui/*.ts'],
  componentCount: components.length,
  components,
};

const generatedApi = `// Generated by npm run docs:metadata:generate. Do not edit manually.\nexport type ApiEntry = Readonly<{ name: string; kind: string; signature: string }>;\nexport const componentApi: Readonly<Record<string, ReadonlyArray<ApiEntry>>> = ${JSON.stringify(
  Object.fromEntries(components.map((component) => [component.slug, component.api])),
  null,
  2,
)};\n`;

const llms = `# crease/ui\n\n> The shadcn/ui design language rebuilt as source-owned Foldkit components. No React or JSX.\n\n## Primary documentation\n\n- Architecture: /docs/architecture.md\n- Registry installation: /docs/registry.md\n- Create presets: /docs/create-presets.md\n- Component parity: /docs/component-parity.md\n- Machine-readable component index: /docs-index.json\n- Complete API inventory: /llms-full.txt\n\n## Components\n\n${components
  .map(
    (component) =>
      `- ${component.title}: ${component.docs} — install with \`${component.install}\``,
  )
  .join('\n')}\n`;

const llmsFull = `${llms}\n## API inventory\n\n${components
  .map(
    (component) =>
      `### ${component.title}\n\n${component.description}\n\nSource: \`${component.source}\`\n\nExamples: ${component.examples.join(', ')}\n\n${component.api
        .map((entry) => `- \`${entry.signature}\` (${entry.kind})`)
        .join('\n')}`,
  )
  .join('\n\n')}\n`;

const apiMarkdown = `# Component API inventory\n\nThis file is generated from exported declarations in \`src/ui/*.ts\`. The web documentation presents the same data beside runnable examples.\n\n${components
  .map(
    (component) =>
      `## ${component.title}\n\nSource: [\`${component.source}\`](../${component.source})\n\n| Export | Kind | Signature |\n| --- | --- | --- |\n${component.api.map((entry) => `| \`${entry.name}\` | ${entry.kind} | \`${entry.signature.replaceAll('|', '\\|')}\` |`).join('\n')}`,
  )
  .join('\n\n')}\n`;

const desired = new Map([
  [path.join(root, 'public/docs-index.json'), `${JSON.stringify(metadata, null, 2)}\n`],
  [
    path.join(root, 'public/llms.txt'),
    llms.replace(
      '## Primary documentation',
      '## Primary documentation\n\n- Getting started: /docs/getting-started.md',
    ),
  ],
  [path.join(root, 'public/llms-full.txt'), llmsFull],
  [path.join(root, 'src/docs/generated-component-api.ts'), generatedApi],
  [path.join(root, 'docs/api-reference.md'), apiMarkdown],
]);

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
  console.error(`Documentation metadata is stale:\n${stale.map((file) => `- ${file}`).join('\n')}`);
  console.error('Run npm run docs:metadata:generate.');
  process.exitCode = 1;
} else {
  console.log(`${write ? 'Generated' : 'Verified'} API and discovery metadata for ${components.length} components.`);
}
