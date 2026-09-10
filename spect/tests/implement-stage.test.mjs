import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
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

function runCli(projectRoot, ...args) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd: projectRoot,
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' },
  });
}

async function makeReadyProject() {
  const projectRoot = await mkdtemp(path.join(os.tmpdir(), 'spect-implement-stage-'));
  const init = runCli(projectRoot, 'init', projectRoot);
  assert.equal(init.status, 0, init.stderr);

  const created = runCli(projectRoot, 'new', 'change', 'rename-stage');
  assert.equal(created.status, 0, created.stderr);

  const changeDir = path.join(projectRoot, 'openspec', 'changes', 'rename-stage');
  await mkdir(changeDir, { recursive: true });
  await writeFile(
    path.join(changeDir, '.openspec.yaml'),
    'schema: spec-driven\nskip_specs: true\n'
  );
  await writeFile(path.join(changeDir, 'proposal.md'), '## Why\n\nRename the stage.\n');
  await writeFile(path.join(changeDir, 'design.md'), '## Decisions\n\nUse implement.\n');
  await writeFile(
    path.join(changeDir, 'tasks.md'),
    '## 1. Rename\n\n- [x] 1.1 Complete one task\n- [ ] 1.2 Complete the rename\n'
  );

  return projectRoot;
}

test('status exposes the implement stage contract', async () => {
  const projectRoot = await makeReadyProject();

  const result = runCli(projectRoot, 'status', '--change', 'rename-stage', '--json');

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.implementRequires, ['tasks']);
  assert.equal(Object.hasOwn(payload, 'applyRequires'), false);
  assert.match(payload.nextSteps.join('\n'), /spect instructions implement/);
  assert.doesNotMatch(payload.nextSteps.join('\n'), /instructions apply/);
});

test('instructions implement reports task progress and operation guidance', async () => {
  const projectRoot = await makeReadyProject();
  await writeFile(
    path.join(projectRoot, 'openspec', 'config.yaml'),
    'schema: spec-driven\noperations:\n  implement:\n    guidance:\n      - Keep the summary concise\n'
  );

  const result = runCli(
    projectRoot,
    'instructions',
    'implement',
    '--change',
    'rename-stage',
    '--json'
  );

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.state, 'ready');
  assert.deepEqual(payload.progress, { total: 2, complete: 1, remaining: 1 });
  assert.deepEqual(payload.operationGuidance, ['Keep the summary concise']);
});

test('instructions apply fails with an explicit migration message', async () => {
  const projectRoot = await makeReadyProject();

  const result = runCli(projectRoot, 'instructions', 'apply', '--change', 'rename-stage');

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /instructions apply.*instructions implement/s);
});

test('a legacy schema apply key fails with an explicit migration message', async () => {
  const projectRoot = await makeReadyProject();
  const schemaPath = path.join(projectRoot, 'openspec', 'schemas', 'schema.yaml');
  const schema = await readFile(schemaPath, 'utf8');
  const legacySchema = schema.replace(/^implement:$/m, 'apply:');
  assert.notEqual(legacySchema, schema);
  await writeFile(schemaPath, legacySchema);

  const result = runCli(projectRoot, 'status', '--change', 'rename-stage');

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /apply:.*implement:/s);
});

test('a legacy operations.apply key fails with an explicit migration message', async () => {
  const projectRoot = await makeReadyProject();
  await writeFile(
    path.join(projectRoot, 'openspec', 'config.yaml'),
    'schema: spec-driven\noperations:\n  apply:\n    guidance:\n      - Legacy guidance\n'
  );

  const result = runCli(projectRoot, 'context');

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /operations\.apply.*operations\.implement/s);
});

test('a version 1 schema remains valid when it uses implement', async () => {
  const projectRoot = await makeReadyProject();
  const schemaPath = path.join(projectRoot, 'openspec', 'schemas', 'schema.yaml');
  const schema = await readFile(schemaPath, 'utf8');
  const versionOneSchema = schema.replace(/^version: 2$/m, 'version: 1');
  assert.notEqual(versionOneSchema, schema);
  await writeFile(schemaPath, versionOneSchema);

  const result = runCli(projectRoot, 'status', '--change', 'rename-stage', '--json');

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout).implementRequires, ['tasks']);
});
