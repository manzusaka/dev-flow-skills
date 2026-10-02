import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const scripts = resolve(import.meta.dirname, '../scripts');

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'zero-to-design-'));
  mkdirSync(join(root, 'docs/prototype/design'), { recursive: true });
  return root;
}

function put(root, path, content = 'content') {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), content);
}

function run(name, args) {
  const result = spawnSync(process.execPath, [join(scripts, name), ...args, '--json'], { encoding: 'utf8' });
  assert.notEqual(result.status, 1, result.stderr);
  return { status: result.status, report: JSON.parse(result.stdout) };
}

test('doctor accepts a completed new-product flow', () => {
  const root = fixture();
  try {
    for (const path of ['docs/prototype/design/01-product.md', 'docs/prototype/design/02-references.md', 'docs/prototype/design/03-directions.html', 'docs/prototype/design/web/index.html', 'docs/prototype/design/web/04-home-v1.vue', 'docs/prototype/design/h5/index.html', 'docs/prototype/design/h5/04-home-v1.vue', 'docs/prototype/DESIGN.md', 'docs/prototype/design/tokens.css']) put(root, path);
    put(root, 'AGENTS.md', '设计系统见 docs/prototype/DESIGN.md');
    put(root, 'docs/prototype/design/state.md', `## 当前阶段\n阶段 7\n## 入口模式\nnew-product\n## 设计系统来源\n- 权威来源：docs/prototype/DESIGN.md\n## 文件清单\n- [x] web/index.html\n- [x] web/04-home-v1.vue\n- [x] h5/index.html\n- [x] h5/04-home-v1.vue\n- [x] docs/prototype/DESIGN.md\nstatus: complete\n`);
    const result = run('doctor.mjs', ['--target', root]);
    assert.equal(result.status, 0);
    assert.deepEqual(result.report.findings, []);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('doctor requires the final document at docs/prototype/DESIGN.md', () => {
  const root = fixture();
  try {
    for (const path of ['docs/prototype/design/01-product.md', 'docs/prototype/design/02-references.md', 'docs/prototype/design/03-directions.html', 'docs/prototype/design/tokens.css', 'design/DESIGN.md']) put(root, path);
    put(root, 'AGENTS.md', '设计系统见 docs/prototype/DESIGN.md');
    put(root, 'docs/prototype/design/state.md', `## 当前阶段\n阶段 7\n## 入口模式\nnew-product\n## 设计系统来源\n- 权威来源：docs/prototype/DESIGN.md\n## 文件清单\nstatus: complete\n`);
    const result = run('doctor.mjs', ['--target', root]);
    assert.equal(result.status, 2);
    assert.ok(result.report.findings.some((finding) => finding.id === 'final-design-missing' && finding.path === 'docs/prototype/DESIGN.md'));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('doctor accepts an existing-system extension without DESIGN.draft.md', () => {
  const root = fixture();
  try {
    put(root, 'DESIGN.md');
    put(root, 'docs/prototype/design/05-orders-v1.html');
    put(root, 'docs/prototype/design/state.md', `## 当前阶段\n阶段 5\n## 入口模式\nexisting-system\n## 设计系统来源\n- 权威来源：DESIGN.md\n## 文件清单\n- [x] 05-orders-v1.html\n- [ ] 06-polish-log.md\n`);
    const result = run('doctor.mjs', ['--target', root]);
    assert.equal(result.status, 0);
    assert.deepEqual(result.report.findings, []);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('doctor reports a checked file that is absent', () => {
  const root = fixture();
  try {
    put(root, 'docs/prototype/design/state.md', `## 当前阶段\n阶段 1\n## 入口模式\nnew-product\n## 设计系统来源\n- 权威来源：<待生成>\n## 文件清单\n- [x] 01-product.md\n- [ ] 02-references.md\n`);
    const result = run('doctor.mjs', ['--target', root]);
    assert.equal(result.status, 2);
    assert.deepEqual(result.report.findings.map((finding) => finding.id), ['checked-file-missing']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('doctor resolves checked version patterns under docs/prototype/design/', () => {
  const root = fixture();
  try {
    put(root, 'DESIGN.md');
    put(root, 'docs/prototype/design/05-orders-v2.html');
    put(root, 'docs/prototype/design/state.md', `## 当前阶段\n阶段 5\n## 入口模式\nexisting-system\n## 设计系统来源\n- 权威来源：DESIGN.md\n## 文件清单\n- [x] docs/prototype/design/05-orders-v*.html\n`);
    const result = run('doctor.mjs', ['--target', root]);
    assert.equal(result.status, 0);
    assert.deepEqual(result.report.findings, []);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('scan reports relevant source clues without claiming rendered failures', () => {
  const root = fixture();
  try {
    put(root, 'docs/prototype/design/page.css', `body { font-family: Inter; width: 100vw; }\nbutton:focus { outline: none; }\n.card { animation: fade 1s; }\n`);
    const result = run('scan.mjs', ['--target', join(root, 'docs/prototype/design/page.css')]);
    assert.equal(result.status, 0);
    assert.deepEqual(new Set(result.report.findings.map((finding) => finding.id)), new Set(['default-font', 'viewport-width', 'hidden-focus', 'reduced-motion-missing']));
    assert.ok(result.report.findings.every((finding) => finding.severity === 'advisory'));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('scan treats broad CSS and utility transitions as advisory clues', () => {
  const root = fixture();
  try {
    put(root, 'docs/prototype/design/page.css', '.card { transition: all 200ms ease; }\n.label { transition: opacity 200ms ease; }\n');
    put(root, 'docs/prototype/design/web/card.vue', '<template><button class="transition-all">打开</button></template>\n');
    const result = run('scan.mjs', ['--target', join(root, 'docs/prototype/design'), '--scope', 'audit']);
    assert.equal(result.status, 0);
    assert.deepEqual(result.report.findings.map((finding) => finding.id), ['broad-transition', 'broad-transition']);
    assert.ok(result.report.findings.every((finding) => finding.scope === 'audit' && finding.severity === 'advisory'));
  } finally { rmSync(root, { recursive: true, force: true }); }
});
