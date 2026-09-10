import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
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
  return mkdtemp(path.join(os.tmpdir(), 'spect-init-test-'));
}

function runInit(projectRoot, ...args) {
  return spawnSync(process.execPath, [cliPath, 'init', projectRoot, ...args], {
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' },
  });
}

async function pathExists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch (error) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
}

async function writeCustomSchema(projectRoot, configName = 'config.yaml') {
  const openspec = path.join(projectRoot, 'openspec');
  const schemaDir = path.join(openspec, 'schemas', 'custom');
  await mkdir(path.join(schemaDir, 'templates'), { recursive: true });
  await writeFile(path.join(openspec, configName), 'schema: custom\n');
  await writeFile(
    path.join(schemaDir, 'schema.yaml'),
    'name: custom\nversion: 1\nartifacts:\n  - id: proposal\n    generates: proposal.md\n    description: custom proposal\n    template: proposal.md\n    requires: []\n'
  );
  await writeFile(path.join(schemaDir, 'templates', 'proposal.md'), '# Proposal\n');
}

test('config.yml is ignored and initialization creates config.yaml', async () => {
  const projectRoot = await makeProject();
  await writeCustomSchema(projectRoot, 'config.yml');

  const result = runInit(projectRoot);

  assert.equal(result.status, 0, result.stderr);
  assert.doesNotMatch(result.stdout, /所有文件均已存在/);
  assert.equal(await readFile(path.join(projectRoot, 'openspec', 'config.yml'), 'utf8'), 'schema: custom\n');
  assert.match(
    await readFile(path.join(projectRoot, 'openspec', 'config.yaml'), 'utf8'),
    /^schema: spec-driven$/m
  );
  assert.equal(await pathExists(path.join(projectRoot, 'openspec', 'schemas', 'schema.yaml')), true);
});

test('invalid existing artifacts fail before default scaffold files are written', async () => {
  const projectRoot = await makeProject();
  const specDir = path.join(projectRoot, 'openspec', 'specs', 'broken');
  await mkdir(specDir, { recursive: true });
  await writeFile(path.join(specDir, 'spec.md'), '# not an OpenSpec spec\n');

  const result = runInit(projectRoot);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /artifact|spec|规范/i);
  assert.equal(await pathExists(path.join(projectRoot, 'openspec', 'config.yaml')), false);
  assert.equal(await pathExists(path.join(projectRoot, 'openspec', 'schemas')), false);
});

test('a new project receives a complete default scaffold and repeated init preserves it', async () => {
  const projectRoot = await makeProject();

  const first = runInit(projectRoot);
  assert.equal(first.status, 0, first.stderr);
  const proposalPath = path.join(
    projectRoot,
    'openspec',
    'schemas',
    'templates',
    'proposal.md'
  );
  const specTemplate = await readFile(
    path.join(projectRoot, 'openspec', 'schemas', 'templates', 'spec.md'),
    'utf8'
  );
  const schema = await readFile(
    path.join(projectRoot, 'openspec', 'schemas', 'schema.yaml'),
    'utf8'
  );
  assert.match(specTemplate, /^## Purpose$/m);
  assert.match(specTemplate, /^### Requirement:/m);
  assert.match(specTemplate, /^#### Scenario:/m);
  assert.match(specTemplate, /^- \*\*当\*\*/m);
  assert.doesNotMatch(specTemplate, /^- \*\*WHEN\*\*/m);
  assert.match(schema, /### Requirement: 用户可以导出数据/);
  assert.match(schema, /#### Scenario: 成功导出/);
  assert.match(schema, /系统必须允许用户以 CSV 格式导出自己的数据/);
  assert.match(schema, /标题下的正文、字段内容、故事标题和 capability 描述使用中文/);
  assert.match(schema, /Purpose、需求名称、规范性正文、场景名称与步骤内容使用中文/);
  assert.doesNotMatch(schema, /The system SHALL allow users/);
  assert.match(schema, /^version: 2$/m);
  assert.match(schema, /^implement:$/m);
  assert.doesNotMatch(schema, /^apply:$/m);
  await writeFile(proposalPath, '# Project-specific proposal\n');

  const second = runInit(projectRoot);

  assert.equal(second.status, 0, second.stderr);
  assert.equal(await readFile(proposalPath, 'utf8'), '# Project-specific proposal\n');
  for (const relativePath of [
    'config.yaml',
    'schemas/schema.yaml',
    'schemas/templates/proposal.md',
    'schemas/templates/spec.md',
    'schemas/templates/design.md',
    'schemas/templates/tasks.md',
    'specs/.gitkeep',
    'changes/archive/.gitkeep',
  ]) {
    assert.equal(await pathExists(path.join(projectRoot, 'openspec', relativePath)), true);
  }
});

test('config.yml is ignored when config.yaml exists', async () => {
  const projectRoot = await makeProject();
  const openspec = path.join(projectRoot, 'openspec');
  await mkdir(openspec, { recursive: true });
  await writeFile(path.join(openspec, 'config.yaml'), 'schema: spec-driven\n');
  await writeFile(path.join(openspec, 'config.yml'), 'schema: [broken\n');

  const result = runInit(projectRoot);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(await readFile(path.join(openspec, 'config.yml'), 'utf8'), 'schema: [broken\n');
  assert.equal(await pathExists(path.join(openspec, 'schemas', 'schema.yaml')), true);
});

test('a malformed existing config fails closed before scaffold writes', async () => {
  const projectRoot = await makeProject();
  const openspec = path.join(projectRoot, 'openspec');
  await mkdir(openspec, { recursive: true });
  await writeFile(path.join(openspec, 'config.yaml'), 'schema: [broken\n');

  const result = runInit(projectRoot);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /config.*YAML/i);
  assert.equal(await pathExists(path.join(openspec, 'schemas')), false);
});

test('an invalid custom schema fails before unrelated defaults are injected', async () => {
  const projectRoot = await makeProject();
  await writeCustomSchema(projectRoot, 'config.yaml');
  const schemaPath = path.join(
    projectRoot,
    'openspec',
    'schemas',
    'custom',
    'schema.yaml'
  );
  await writeFile(
    schemaPath,
    'name: custom\nversion: 1\nartifacts:\n' +
      '  - id: proposal\n    generates: proposal.md\n    description: one\n    template: proposal.md\n    requires: []\n' +
      '  - id: proposal\n    generates: other.md\n    description: two\n    template: proposal.md\n    requires: []\n'
  );

  const result = runInit(projectRoot);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /proposal|schema/i);
  assert.equal(await pathExists(path.join(projectRoot, 'openspec', 'schemas', 'schema.yaml')), false);
});

test('a missing custom template fails before unrelated defaults are injected', async () => {
  const projectRoot = await makeProject();
  await writeCustomSchema(projectRoot, 'config.yaml');
  const templatePath = path.join(
    projectRoot,
    'openspec',
    'schemas',
    'custom',
    'templates',
    'proposal.md'
  );
  await rm(templatePath);

  const result = runInit(projectRoot);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /template/i);
  assert.equal(await pathExists(path.join(projectRoot, 'openspec', 'schemas', 'schema.yaml')), false);
});

test('a mid-write filesystem conflict rolls back files created by this run', async () => {
  const projectRoot = await makeProject();
  const archivePath = path.join(projectRoot, 'openspec', 'changes', 'archive');
  await mkdir(path.dirname(archivePath), { recursive: true });
  await writeFile(archivePath, 'not a directory\n');

  const result = runInit(projectRoot);

  assert.notEqual(result.status, 0);
  assert.equal(await readFile(archivePath, 'utf8'), 'not a directory\n');
  assert.equal(await pathExists(path.join(projectRoot, 'openspec', 'config.yaml')), false);
  assert.equal(await pathExists(path.join(projectRoot, 'openspec', 'schemas')), false);
});

test('--force is rejected and cannot overwrite existing files', async () => {
  const projectRoot = await makeProject();
  await writeCustomSchema(projectRoot, 'config.yaml');

  const result = runInit(projectRoot, '--force');

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /unknown option.*force/i);
  assert.equal(await readFile(path.join(projectRoot, 'openspec', 'config.yaml'), 'utf8'), 'schema: custom\n');
});
