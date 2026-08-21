import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';

import ts from 'typescript';

import { authoredPages } from '../src/docs/components/pages/index.ts';

const compilerOptions = (): ts.CompilerOptions => {
  const configPath = ts.findConfigFile(process.cwd(), ts.sys.fileExists, 'tsconfig.json');
  assert.ok(configPath, 'tsconfig.json was not found');
  const parsed = ts.getParsedCommandLineOfConfigFile(configPath, {}, {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: diagnostic => {
      throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    },
  });
  assert.ok(parsed, 'tsconfig.json could not be parsed');
  return { ...parsed.options, noEmit: true, incremental: false };
};

describe('copyable documentation applications', () => {
  it('typecheck against the real Foldkit and Crease UI APIs', () => {
    const sources = new Map<string, string>();
    for (const page of Object.values(authoredPages)) {
      page.definition.examples.forEach((example, index) => {
        const filename = resolve(
          'src',
          'docs',
          '__example_check__',
          `${page.slug}-${String(index)}.ts`,
        );
        sources.set(filename, example.code);
      });
    }

    const options = compilerOptions();
    const host = ts.createCompilerHost(options);
    const originalFileExists = host.fileExists.bind(host);
    const originalReadFile = host.readFile.bind(host);
    const originalGetSourceFile = host.getSourceFile.bind(host);
    host.fileExists = filename => sources.has(resolve(filename)) || originalFileExists(filename);
    host.readFile = filename => sources.get(resolve(filename)) ?? originalReadFile(filename);
    host.getSourceFile = (filename, languageVersion, onError, shouldCreateNewSourceFile) => {
      const source = sources.get(resolve(filename));
      return source === undefined
        ? originalGetSourceFile(filename, languageVersion, onError, shouldCreateNewSourceFile)
        : ts.createSourceFile(filename, source, languageVersion, true, ts.ScriptKind.TS);
    };

    const program = ts.createProgram({ rootNames: [...sources.keys()], options, host });
    const diagnostics = ts.getPreEmitDiagnostics(program).filter(
      diagnostic => diagnostic.file !== undefined && sources.has(resolve(diagnostic.file.fileName)),
    );
    const report = diagnostics.map(diagnostic => {
      const file = diagnostic.file!;
      const position = file.getLineAndCharacterOfPosition(diagnostic.start ?? 0);
      return `${file.fileName}:${String(position.line + 1)}:${String(position.character + 1)} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`;
    });
    assert.deepEqual(report, []);
  });
});
