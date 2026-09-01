import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const cliPath = path.resolve(
  import.meta.dirname,
  '..',
  '..',
  'skills',
  'engineering',
  'init-cli',
  'bin',
  'spect'
);

async function makeProject() {
  return mkdtemp(path.join(os.tmpdir(), 'spect-config-filename-test-'));
}

function runCli(projectRoot, ...args) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd: projectRoot,
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' },
  });
}

test('config.yml alone does not qualify a directory as an OpenSpec root', async () => {
  const projectRoot = await makeProject();
  const openspec = path.join(projectRoot, 'openspec');
  await mkdir(openspec);
  await writeFile(path.join(openspec, 'config.yml'), 'schema: spec-driven\n');

  const result = runCli(projectRoot, 'context', '--json');

  assert.notEqual(result.status, 0);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.status[0].code, 'no_openspec_root');
});

test('new change ignores config.yml and creates config.yaml', async () => {
  const projectRoot = await makeProject();
  const openspec = path.join(projectRoot, 'openspec');
  const schemaDir = path.join(openspec, 'schemas', 'custom');
  await mkdir(path.join(schemaDir, 'templates'), { recursive: true });
  await writeFile(path.join(openspec, 'config.yml'), 'schema: unavailable\n');
  await writeFile(
    path.join(schemaDir, 'schema.yaml'),
    'name: custom\nversion: 1\nartifacts:\n' +
      '  - id: proposal\n    generates: proposal.md\n    description: custom proposal\n    template: proposal.md\n    requires: []\n'
  );
  await writeFile(path.join(schemaDir, 'templates', 'proposal.md'), '# Proposal\n');

  const result = runCli(projectRoot, 'new', 'change', 'add-search', '--schema', 'custom');

  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    await readFile(path.join(openspec, 'config.yaml'), 'utf8'),
    'schema: spec-driven\n'
  );
  assert.equal(
    await readFile(path.join(openspec, 'config.yml'), 'utf8'),
    'schema: unavailable\n'
  );
});
