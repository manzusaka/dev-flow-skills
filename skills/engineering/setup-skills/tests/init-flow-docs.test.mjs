import assert from 'node:assert/strict';
import { mkdtemp, readFile, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const helperPath = path.resolve(
  import.meta.dirname,
  '..',
  'scripts',
  'init-flow-docs.mjs'
);

async function makeProject() {
  return mkdtemp(path.join(os.tmpdir(), 'init-flow-docs-test-'));
}

function runHelper(projectRoot) {
  return spawnSync(process.execPath, [helperPath, projectRoot], {
    encoding: 'utf8',
  });
}

test('a new project receives an empty glossary and root ADR directory', async () => {
  const projectRoot = await makeProject();

  const result = runHelper(projectRoot);

  assert.equal(result.status, 0, result.stderr);
  const context = await readFile(path.join(projectRoot, 'CONTEXT.md'), 'utf8');
  assert.match(context, /^# Domain Context/m);
  assert.match(context, /^## Language/m);
  assert.doesNotMatch(context, /Business Rules|Domain Invariants/);
  assert.equal((await stat(path.join(projectRoot, 'docs', 'adr'))).isDirectory(), true);
});

test('a context map keeps existing files and still creates the root ADR directory', async () => {
  const projectRoot = await makeProject();
  const existing = '# Existing\n';
  const map = '# Context Map\n';
  await writeFile(path.join(projectRoot, 'CONTEXT.md'), existing);
  await writeFile(path.join(projectRoot, 'CONTEXT-MAP.md'), map);

  const result = runHelper(projectRoot);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(await readFile(path.join(projectRoot, 'CONTEXT.md'), 'utf8'), existing);
  assert.equal(await readFile(path.join(projectRoot, 'CONTEXT-MAP.md'), 'utf8'), map);
  assert.equal((await stat(path.join(projectRoot, 'docs', 'adr'))).isDirectory(), true);
});

test('a context map skips CONTEXT.md creation but still initializes the ADR directory', async () => {
  const projectRoot = await makeProject();
  const map = 'content is deliberately not parsed\n';
  await writeFile(
    path.join(projectRoot, 'CONTEXT-MAP.md'),
    map
  );

  const result = runHelper(projectRoot);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(await readFile(path.join(projectRoot, 'CONTEXT-MAP.md'), 'utf8'), map);
  await assert.rejects(stat(path.join(projectRoot, 'CONTEXT.md')), /ENOENT/);
  assert.equal((await stat(path.join(projectRoot, 'docs', 'adr'))).isDirectory(), true);
});

test('an existing root glossary is preserved across repeated initialization', async () => {
  const projectRoot = await makeProject();
  const existing = '# Existing glossary\n';
  await writeFile(path.join(projectRoot, 'CONTEXT.md'), existing);

  const first = runHelper(projectRoot);
  const second = runHelper(projectRoot);

  assert.equal(first.status, 0, first.stderr);
  assert.equal(second.status, 0, second.stderr);
  assert.equal(await readFile(path.join(projectRoot, 'CONTEXT.md'), 'utf8'), existing);
});
