#!/usr/bin/env node

import { copyFile, mkdir, stat } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function usage() {
  console.error('Usage: node init-flow-docs.mjs <project-root>');
}

async function isDirectory(targetPath) {
  try {
    return (await stat(targetPath)).isDirectory();
  } catch {
    return false;
  }
}

async function exists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

async function main() {
  if (process.argv.length !== 3) {
    usage();
    process.exitCode = 2;
    return;
  }

  const projectRoot = path.resolve(process.argv[2]);
  if (!(await isDirectory(projectRoot))) {
    throw new Error(`Project root does not exist: ${projectRoot}`);
  }

  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const contextSource = path.resolve(scriptDir, '..', 'assets', 'CONTEXT.md');
  const contextTarget = path.join(projectRoot, 'CONTEXT.md');
  const contextMapTarget = path.join(projectRoot, 'CONTEXT-MAP.md');

  if (await exists(contextMapTarget)) {
    throw new Error('已存在 CONTEXT-MAP.md，项目可能运行过其他初始化工具；停止执行。');
  }

  await mkdir(path.join(projectRoot, 'docs', 'adr'), { recursive: true });

  try {
    await copyFile(contextSource, contextTarget, constants.COPYFILE_EXCL);
    console.log('Created CONTEXT.md from template.');
  } catch (error) {
    if (error?.code !== 'EEXIST') {
      throw error;
    }
    console.log('Preserved existing CONTEXT.md.');
  }

  console.log(`Flow docs initialized at ${projectRoot}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
