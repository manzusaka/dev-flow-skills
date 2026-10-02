#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, basename, isAbsolute, relative } from 'node:path';

const args = process.argv.slice(2);
let target = process.cwd();
let json = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--json') json = true;
  else if (args[i] === '--target' && args[i + 1]) target = args[++i];
  else if (args[i] === '--help') {
    console.log('Usage: node doctor.mjs [--target <project-or-workspace>] [--json]');
    process.exit(0);
  } else {
    console.error(`Unknown or incomplete argument: ${args[i]}`);
    process.exit(1);
  }
}

const root = resolve(target);
const designDir = 'docs/prototype/design';
const statePath = resolve(root, designDir, 'state.md');
const findings = [];

function add(id, artifact, path, summary, fix, severity = 'mention') {
  findings.push({ id, artifact, path, severity, summary, fix });
}

function present(path) {
  try { return statSync(path).isFile() && statSync(path).size > 0; }
  catch { return false; }
}

function withinRoot(path) {
  const rel = relative(root, path);
  return rel !== '..' && !rel.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`) && !isAbsolute(rel);
}

function resolveRecord(path) {
  return resolve(root, path);
}

function resolveChecklist(path) {
  return resolve(root, path.startsWith('docs/prototype/') || path.startsWith('design/') ? path : `${designDir}/${path}`);
}

function section(text, names) {
  const escaped = names.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`^##\\s*(?:${escaped.join('|')})\\s*$`, 'im');
  const match = pattern.exec(text);
  if (!match) return null;
  const rest = text.slice(match.index + match[0].length);
  return rest.split(/^##\s+/m, 1)[0];
}

function firstValue(block) {
  return block?.split('\n').map((line) => line.trim()).find((line) => line && !line.startsWith('<!--')) ?? '';
}

function checkedPaths(block) {
  return (block ?? '').split('\n').flatMap((line) => {
    const match = line.match(/^\s*-\s*\[[xX]\]\s*(?:`([^`]+)`|([^\s（(]+))/);
    return match ? [match[1] ?? match[2]] : [];
  });
}

if (!existsSync(root) || !statSync(root).isDirectory()) {
  add('project-missing', 'project', root, '目标项目目录不存在。', '传入现有项目或重启工作区目录。', 'route');
} else if (!present(statePath)) {
  add('state-missing', 'state', statePath, '缺少非空的 docs/prototype/design/state.md。', '按入口模式创建或恢复流程状态。', 'route');
} else {
  const state = readFileSync(statePath, 'utf8');
  const phaseBlock = section(state, ['当前阶段', 'Current Phase']);
  const modeBlock = section(state, ['入口模式', 'Entry Mode']);
  const sourceBlock = section(state, ['设计系统来源', 'Design System Source']);
  const listBlock = section(state, ['文件清单', 'File Checklist']);
  for (const [name, block] of [['当前阶段', phaseBlock], ['入口模式', modeBlock], ['设计系统来源', sourceBlock], ['文件清单', listBlock]]) {
    if (block === null) add('state-section-missing', 'state', statePath, `状态文件缺少“${name}”章节。`, `补全“${name}”及当前值。`);
  }

  const phaseText = firstValue(phaseBlock);
  const phase = /(?:阶段|phase)\s*([1-7])/i.exec(phaseText)?.[1] ?? (/^[1-7]$/.test(phaseText) ? phaseText : null);
  if (phaseBlock !== null && !phase) add('phase-unreadable', 'state', statePath, `无法识别当前阶段：${phaseText || '空值'}。`, '写明“阶段 N”或“Phase N”。');
  const mode = firstValue(modeBlock).toLowerCase();
  const existing = mode.includes('existing-system') || mode.includes('已有系统');
  const complete = /(?:^|\n)\s*(?:status|状态)\s*[:：]\s*complete\b/im.test(state);

  for (const record of checkedPaths(listBlock)) {
    if (/[<>]/.test(record)) {
      add('checklist-placeholder', 'checklist', statePath, `已勾选的路径仍含占位符：${record}。`, '把占位符替换为实际文件路径。');
      continue;
    }
    if (record.includes('*')) {
      const dir = dirname(resolveChecklist(record));
      const pattern = new RegExp(`^${basename(record).replace(/[.+?^${}()|[\]\\]/g, '\\$&').replaceAll('*', '.*')}$`);
      if (!withinRoot(dir) || !existsSync(dir) || !readdirSync(dir).some((name) => pattern.test(name) && present(resolve(dir, name)))) {
        add('checked-file-missing', 'checklist', record, `已勾选但未找到匹配文件：${record}。`, '修正清单或生成对应产物。');
      }
      continue;
    }
    const file = resolveChecklist(record);
    if (!withinRoot(file) || !present(file)) add('checked-file-missing', 'checklist', record, `已勾选但文件不存在或为空：${record}。`, '修正清单或生成对应产物。');
  }

  if (!existing && phase && Number(phase) >= 2 && !present(resolve(root, designDir, '01-product.md'))) {
    add('product-missing', 'phase', `${designDir}/01-product.md`, '阶段 1 产物缺失。', '补齐已完成阶段的产品定义。');
  }
  if (!existing && phase && Number(phase) >= 3 && !present(resolve(root, designDir, '02-references.md'))) {
    add('references-missing', 'phase', `${designDir}/02-references.md`, '阶段 2 产物缺失。', '补齐已完成阶段的参考记录。');
  }
  if (!existing && phase && Number(phase) >= 4 && !present(resolve(root, designDir, '03-directions.html'))) {
    add('directions-missing', 'phase', `${designDir}/03-directions.html`, '阶段 3 产物缺失。', '补齐已完成阶段的方向页。');
  }
  if (!existing && phase && Number(phase) >= 5 && !complete && !present(resolve(root, designDir, 'DESIGN.draft.md'))) {
    add('draft-missing', 'phase', `${designDir}/DESIGN.draft.md`, '阶段 4 后缺少设计草稿。', '从已获批首屏建立 DESIGN.draft.md。');
  }

  const sourceLine = sourceBlock?.split('\n').find((line) => /权威来源|Authoritative Source/i.test(line));
  const source = sourceLine?.split(/[:：]/).slice(1).join(':').trim().replace(/^`|`$/g, '') ?? '';
  if (source && !/[<>]/.test(source) && !/观察基线|observed baseline/i.test(source)) {
    const file = resolveRecord(source);
    if (!withinRoot(file) || !present(file)) add('design-source-missing', 'design-source', source, `权威设计来源不存在或为空：${source}。`, '修正状态中的路径或恢复该文件。');
  } else if (complete) {
    add('design-source-unresolved', 'design-source', statePath, '完成状态未记录可解析的权威设计来源。', '在状态文件中写入实际文件路径。');
  }

  if (complete) {
    if (!existing && !present(resolve(root, 'docs/prototype/DESIGN.md'))) add('final-design-missing', 'final', 'docs/prototype/DESIGN.md', '完成状态缺少最终 DESIGN.md。', '生成并批准最终设计系统文档。');
    if (!existing && !present(resolve(root, designDir, 'tokens.css'))) add('tokens-missing', 'final', `${designDir}/tokens.css`, '完成状态缺少 tokens.css。', '生成非空的设计 tokens。');
    const agentsPath = resolve(root, 'AGENTS.md');
    if (!present(agentsPath) || !/DESIGN\.md|设计系统来源/i.test(readFileSync(agentsPath, 'utf8'))) {
      add('agents-reference-missing', 'final', agentsPath, 'AGENTS.md 未引用设计系统。', '在项目代理指令中链接当前权威来源。');
    }
  }
}

const report = { root, statePath, findings };
if (json) console.log(JSON.stringify(report, null, 2));
else if (!findings.length) console.log('zero-to-design doctor：状态与阶段产物检查通过。');
else for (const finding of findings) console.log(`[${finding.severity}] ${finding.id}: ${finding.summary} ${finding.fix}`);
process.exit(findings.length ? 2 : 0);
