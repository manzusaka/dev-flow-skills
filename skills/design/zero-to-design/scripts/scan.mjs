#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, extname, relative } from 'node:path';

const args = process.argv.slice(2);
let target = null;
let json = false;
let scopes = new Set(['type', 'layout', 'audit']);
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--target' && args[i + 1]) target = args[++i];
  else if (args[i] === '--scope' && args[i + 1]) scopes = new Set(args[++i].split(','));
  else if (args[i] === '--json') json = true;
  else if (args[i] === '--help') {
    console.log('Usage: node scan.mjs --target <file-or-dir> [--scope type,layout,audit] [--json]');
    process.exit(0);
  } else {
    console.error(`Unknown or incomplete argument: ${args[i]}`);
    process.exit(1);
  }
}
if (!target || [...scopes].some((scope) => !['type', 'layout', 'audit'].includes(scope))) {
  console.error('Specify --target and scopes from type,layout,audit.');
  process.exit(1);
}

const root = resolve(target);
const extensions = new Set(['.html', '.htm', '.css', '.js', '.jsx', '.ts', '.tsx', '.vue', '.astro', '.svelte']);
const ignored = new Set(['.git', 'node_modules', 'dist', 'build', '.next', '.nuxt']);
const files = [];
function walk(path) {
  const stat = statSync(path);
  if (stat.isFile()) {
    if (extensions.has(extname(path))) files.push(path);
    return;
  }
  if (!stat.isDirectory()) return;
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    if (entry.isDirectory() && ignored.has(entry.name)) continue;
    if (entry.isSymbolicLink()) continue;
    walk(resolve(path, entry.name));
  }
}
if (!existsSync(root)) {
  console.error(`Target not found: ${root}`);
  process.exit(1);
}
walk(root);
if (!files.length) {
  console.error(`No supported Web source files found: ${root}`);
  process.exit(1);
}

const findings = [];
function add(file, line, id, scope, summary, evidence) {
  findings.push({ id, scope, file: relative(process.cwd(), file), line, severity: 'advisory', summary, evidence });
}
const defaultFonts = /\b(?:Inter|Roboto|Arial|DM Sans|Plus Jakarta Sans|Outfit|Space Grotesk|Space Mono|IBM Plex(?: Sans| Serif| Mono)?|Fraunces|Instrument Serif|Playfair Display|Cormorant|Lora|Crimson|Newsreader|Syne)\b/i;
for (const file of files) {
  const source = readFileSync(file, 'utf8');
  const lines = source.split(/\r?\n/);
  let hasMotion = false;
  let hasReducedMotion = false;
  let hasFocusAlternative = false;
  for (const line of lines) {
    if (/prefers-reduced-motion|accessibilityReduceMotion|reduceMotion/i.test(line)) hasReducedMotion = true;
    if (/@keyframes\b|\banimation(?:-name)?\s*:/.test(line)) hasMotion = true;
    if (/:focus-visible|:focus\b/.test(line) && !/outline\s*:\s*(?:none|0)\b/.test(line)) hasFocusAlternative = true;
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (scopes.has('type')) {
      if (/font-family\s*:/.test(line) && defaultFonts.test(line)) add(file, i + 1, 'default-font', 'type', '使用了本流程默认禁用的模板化字体；确认是否为用户明确指定。', line.trim());
      if (/font-size\s*:\s*(?:[1-9]|10|11)px\b/.test(line)) add(file, i + 1, 'small-font', 'type', '字号小于 12px；检查实际用途与可读性。', line.trim());
      if (/line-height\s*:\s*1(?:\.0)?\s*[;}]/.test(line)) add(file, i + 1, 'tight-line-height', 'type', '行高为 1；检查多行文字与目标语言。', line.trim());
    }
    if (scopes.has('layout')) {
      if (/\bwidth\s*:\s*100vw\b/.test(line)) add(file, i + 1, 'viewport-width', 'layout', '100vw 可能包含滚动条宽度；检查横向溢出。', line.trim());
      if (/\bwidth\s*:\s*(?:[8-9]\d\d|\d{4,})px\b/.test(line) && !/max-width/.test(line)) add(file, i + 1, 'fixed-wide-width', 'layout', '较宽的固定像素宽度；检查窄屏与容器适配。', line.trim());
      if (/overflow-x\s*:\s*hidden\b/.test(line)) add(file, i + 1, 'hidden-horizontal-overflow', 'layout', '隐藏横向溢出可能掩盖布局问题；检查原因。', line.trim());
    }
    if (scopes.has('audit')) {
      if (/outline\s*:\s*(?:none|0)\b/.test(line) && !hasFocusAlternative) add(file, i + 1, 'hidden-focus', 'audit', '移除了 outline，但此文件未见可见焦点替代样式。', line.trim());
      if (/color\s*:\s*#(?:000000|ffffff)\b/i.test(line)) add(file, i + 1, 'pure-color', 'audit', '使用了纯黑或纯白；核对当前设计来源及对比度。', line.trim());
      if (/\btransition\s*:\s*all\b/i.test(line) || /\btransition-all\b/.test(line)) add(file, i + 1, 'broad-transition', 'audit', '过渡作用于所有属性；核对实际需要过渡的属性和运行效果。', line.trim());
    }
  }
  if (scopes.has('audit') && hasMotion && !hasReducedMotion) {
    add(file, 1, 'reduced-motion-missing', 'audit', '此文件有动效，但未见减少动效分支；核对全局样式后再判断。', 'animation / @keyframes');
  }
}

const report = { target: root, scannedFiles: files.length, scopes: [...scopes], findings };
if (json) console.log(JSON.stringify(report, null, 2));
else if (!findings.length) console.log(`zero-to-design scan：已检查 ${files.length} 个文件，未发现机械线索。`);
else {
  console.log(`zero-to-design scan：已检查 ${files.length} 个文件，发现 ${findings.length} 条待核对线索。`);
  for (const finding of findings) console.log(`${finding.file}:${finding.line} [${finding.scope}/${finding.id}] ${finding.summary}`);
}
