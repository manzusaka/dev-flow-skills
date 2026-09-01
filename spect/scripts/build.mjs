#!/usr/bin/env node
/**
 * spect 构建管线：
 * 1. embed-schemas.mjs：从 skills/engineering/init-cli/assets/schemas 生成内嵌模板模块
 * 2. esbuild：把 src/cli/index.ts 打包成单文件 ESM（含 node shebang）
 * 3. 拷贝产物到 skills/engineering/init-cli/bin/spect（随 npx skills add 分发）
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdirSync, writeFileSync, chmodSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const here = path.dirname(fileURLToPath(import.meta.url));
const spectDir = path.resolve(here, '..');
const repoRoot = path.resolve(spectDir, '..');
const skillBinDir = path.join(repoRoot, 'skills', 'engineering', 'init-cli', 'bin');
const outFile = path.join(skillBinDir, 'spect');

const pkg = JSON.parse(readFileSync(path.join(spectDir, 'package.json'), 'utf8'));

// 1. Embed schema assets (single source of truth: init-cli skill assets)
execFileSync(process.execPath, [path.join(here, 'embed-schemas.mjs')], {
  cwd: spectDir,
  stdio: 'inherit',
});

// 2. Bundle
const result = await esbuild.build({
  entryPoints: [path.join(spectDir, 'src', 'cli', 'main.ts')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node22',
  outfile: outFile,
  banner: { js: '#!/usr/bin/env node' },
  define: { 'process.env.SPECT_VERSION': JSON.stringify(pkg.version) },
  metafile: true,
  minify: false,
  logLevel: 'info',
});

chmodSync(outFile, 0o755);

const inputs = Object.keys(result.metafile.inputs);
console.log(`bundled ${inputs.length} modules -> ${path.relative(repoRoot, outFile)}`);
