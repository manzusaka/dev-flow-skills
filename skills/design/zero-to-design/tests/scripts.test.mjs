import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const scripts = resolve(import.meta.dirname, '../scripts');

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'zero-to-design-'));
  mkdirSync(join(root, 'docs/prototype/admin/design'), { recursive: true });
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
    for (const path of ['docs/prototype/admin/design/01-product.md', 'docs/prototype/admin/design/02-references.md', 'docs/prototype/admin/design/03-directions.html', 'docs/prototype/admin/design/web/index.html', 'docs/prototype/admin/design/web/04-home-v1.vue', 'docs/prototype/admin/design/h5/index.html', 'docs/prototype/admin/design/h5/04-home-v1.vue', 'docs/prototype/admin/DESIGN.md', 'docs/prototype/admin/design/tokens.css']) put(root, path);
    put(root, 'AGENTS.md', 'admin：docs/prototype/admin/DESIGN.md 和 docs/prototype/admin/design/tokens.css');
    put(root, 'docs/prototype/admin/design/state.md', `## 当前阶段\n阶段 7\n## 设计端\n- 目录名：admin\n- 中文别名：运营后台\n## 入口模式\nnew-product\n## 设计系统来源\n- 权威来源：docs/prototype/admin/DESIGN.md\n## 文件清单\n- [x] web/index.html\n- [x] web/04-home-v1.vue\n- [x] h5/index.html\n- [x] h5/04-home-v1.vue\n- [x] docs/prototype/admin/DESIGN.md\nstatus: complete\n`);
    const result = run('doctor.mjs', ['--target', root, '--folder', 'admin']);
    assert.equal(result.status, 0);
    assert.deepEqual(result.report.findings, []);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('doctor requires the final document in the selected end', () => {
  const root = fixture();
  try {
    for (const path of ['docs/prototype/admin/design/01-product.md', 'docs/prototype/admin/design/02-references.md', 'docs/prototype/admin/design/03-directions.html', 'docs/prototype/admin/design/tokens.css', 'design/DESIGN.md']) put(root, path);
    put(root, 'AGENTS.md', 'admin：docs/prototype/admin/DESIGN.md 和 docs/prototype/admin/design/tokens.css');
    put(root, 'docs/prototype/admin/design/state.md', `## 当前阶段\n阶段 7\n## 设计端\n- 目录名：admin\n- 中文别名：运营后台\n## 入口模式\nnew-product\n## 设计系统来源\n- 权威来源：docs/prototype/admin/DESIGN.md\n## 文件清单\nstatus: complete\n`);
    const result = run('doctor.mjs', ['--target', root, '--folder', 'admin']);
    assert.equal(result.status, 2);
    assert.ok(result.report.findings.some((finding) => finding.id === 'final-design-missing' && finding.path === 'docs/prototype/admin/DESIGN.md'));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('doctor accepts an existing-system extension with an end draft', () => {
  const root = fixture();
  try {
    put(root, 'DESIGN.md');
    put(root, 'docs/prototype/admin/design/DESIGN.draft.md');
    put(root, 'docs/prototype/admin/design/05-orders-v1.html');
    put(root, 'docs/prototype/admin/design/state.md', `## 当前阶段\n阶段 5\n## 设计端\n- 目录名：admin\n- 中文别名：运营后台\n## 入口模式\nexisting-system\n## 设计系统来源\n- 权威来源：DESIGN.md\n## 文件清单\n- [x] 05-orders-v1.html\n- [ ] 06-polish-log.md\n`);
    const result = run('doctor.mjs', ['--target', root, '--folder', 'admin']);
    assert.equal(result.status, 0);
    assert.deepEqual(result.report.findings, []);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('doctor reports a checked file that is absent', () => {
  const root = fixture();
  try {
    put(root, 'docs/prototype/admin/design/state.md', `## 当前阶段\n阶段 1\n## 设计端\n- 目录名：admin\n- 中文别名：运营后台\n## 入口模式\nnew-product\n## 设计系统来源\n- 权威来源：<待生成>\n## 文件清单\n- [x] 01-product.md\n- [ ] 02-references.md\n`);
    const result = run('doctor.mjs', ['--target', root, '--folder', 'admin']);
    assert.equal(result.status, 2);
    assert.deepEqual(result.report.findings.map((finding) => finding.id), ['checked-file-missing']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('doctor resolves checked version patterns under the selected end', () => {
  const root = fixture();
  try {
    put(root, 'DESIGN.md');
    put(root, 'docs/prototype/admin/design/DESIGN.draft.md');
    put(root, 'docs/prototype/admin/design/05-orders-v2.html');
    put(root, 'docs/prototype/admin/design/state.md', `## 当前阶段\n阶段 5\n## 设计端\n- 目录名：admin\n- 中文别名：运营后台\n## 入口模式\nexisting-system\n## 设计系统来源\n- 权威来源：DESIGN.md\n## 文件清单\n- [x] docs/prototype/admin/design/05-orders-v*.html\n`);
    const result = run('doctor.mjs', ['--target', root, '--folder', 'admin']);
    assert.equal(result.status, 0);
    assert.deepEqual(result.report.findings, []);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('doctor requires an end final document for a completed existing-system flow', () => {
  const root = fixture();
  try {
    put(root, 'DESIGN.md');
    put(root, 'docs/prototype/admin/design/tokens.css');
    put(root, 'AGENTS.md', 'admin：docs/prototype/admin/DESIGN.md 和 docs/prototype/admin/design/tokens.css');
    put(root, 'docs/prototype/admin/design/state.md', `## 当前阶段\n阶段 7\n## 设计端\n- 目录名：admin\n## 入口模式\nexisting-system\n## 设计系统来源\n- 权威来源：docs/prototype/admin/DESIGN.md\n- 原始来源：DESIGN.md\n## 文件清单\nstatus: complete\n`);
    const result = run('doctor.mjs', ['--target', root, '--folder', 'admin']);
    assert.ok(result.report.findings.some((finding) => finding.id === 'final-design-missing'));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('doctor does not use another end when the selected end has no state', () => {
  const root = fixture();
  try {
    put(root, 'docs/prototype/admin/design/state.md');
    const result = run('doctor.mjs', ['--target', root, '--folder', 'user-app']);
    assert.equal(result.status, 2);
    assert.deepEqual(result.report.findings.map((finding) => finding.id), ['state-missing']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('doctor detects a state copied from another end', () => {
  const root = fixture();
  try {
    put(root, 'docs/prototype/admin/design/state.md', `## 当前阶段\n阶段 1\n## 设计端\n- 目录名：user-app\n## 入口模式\nnew-product\n## 设计系统来源\n- 权威来源：<待生成>\n## 文件清单\n`);
    const result = run('doctor.mjs', ['--target', root, '--folder', 'admin']);
    assert.ok(result.report.findings.some((finding) => finding.id === 'end-folder-mismatch'));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('doctor rejects a checked file from another end', () => {
  const root = fixture();
  try {
    put(root, 'docs/prototype/user-app/design/page.md');
    put(root, 'docs/prototype/admin/design/state.md', `## 当前阶段\n阶段 1\n## 设计端\n- 目录名：admin\n## 入口模式\nnew-product\n## 设计系统来源\n- 权威来源：<待生成>\n## 文件清单\n- [x] docs/prototype/user-app/design/page.md\n`);
    const result = run('doctor.mjs', ['--target', root, '--folder', 'admin']);
    assert.ok(result.report.findings.some((finding) => finding.id === 'checked-file-missing'));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('doctor validates the selected end name', () => {
  const result = spawnSync(process.execPath, [join(scripts, 'doctor.mjs'), '--folder', '../admin'], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /--folder/);
});

test('doctor requires AGENTS.md references for the selected end', () => {
  const root = fixture();
  try {
    put(root, 'docs/prototype/admin/DESIGN.md');
    put(root, 'docs/prototype/admin/design/tokens.css');
    put(root, 'AGENTS.md', 'user-app：docs/prototype/user-app/DESIGN.md 和 docs/prototype/user-app/design/tokens.css');
    put(root, 'docs/prototype/admin/design/state.md', `## 当前阶段\n阶段 1\n## 设计端\n- 目录名：admin\n## 入口模式\nnew-product\n## 设计系统来源\n- 权威来源：docs/prototype/admin/DESIGN.md\n## 文件清单\nstatus: complete\n`);
    const result = run('doctor.mjs', ['--target', root, '--folder', 'admin']);
    assert.ok(result.report.findings.some((finding) => finding.id === 'agents-reference-missing'));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('scan reports relevant source clues without claiming rendered failures', () => {
  const root = fixture();
  try {
    put(root, 'docs/prototype/admin/design/page.css', `body { font-family: Inter; width: 100vw; }\nbutton:focus { outline: none; }\n.card { animation: fade 1s; }\n`);
    const result = run('scan.mjs', ['--target', join(root, 'docs/prototype/admin/design/page.css')]);
    assert.equal(result.status, 0);
    assert.deepEqual(new Set(result.report.findings.map((finding) => finding.id)), new Set(['default-font', 'viewport-width', 'hidden-focus', 'reduced-motion-missing']));
    assert.ok(result.report.findings.every((finding) => finding.severity === 'advisory'));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('scan treats broad CSS and utility transitions as advisory clues', () => {
  const root = fixture();
  try {
    put(root, 'docs/prototype/admin/design/page.css', '.card { transition: all 200ms ease; }\n.label { transition: opacity 200ms ease; }\n');
    put(root, 'docs/prototype/admin/design/web/card.vue', '<template><button class="transition-all">打开</button></template>\n');
    const result = run('scan.mjs', ['--target', join(root, 'docs/prototype/admin/design'), '--scope', 'audit']);
    assert.equal(result.status, 0);
    assert.deepEqual(result.report.findings.map((finding) => finding.id), ['broad-transition', 'broad-transition']);
    assert.ok(result.report.findings.every((finding) => finding.scope === 'audit' && finding.severity === 'advisory'));
  } finally { rmSync(root, { recursive: true, force: true }); }
});
