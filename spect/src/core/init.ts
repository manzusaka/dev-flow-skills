/**
 * `spect init` — scaffolds the openspec/ directory in a project.
 * Simplified from spect: fully non-interactive, no AI-tool slash
 * command generation, no copilot-cloud, no migration. Templates are
 * embedded at build time from spect/assets/openspec.
 *
 * Existing files are preserved unless --force is passed.
 */
import path from 'node:path';
import { promises as fs } from 'node:fs';
import chalk from 'chalk';

import {
  EMBEDDED_CONFIG_YAML,
  EMBEDDED_SCHEMA_YAML,
  EMBEDDED_TEMPLATES,
} from './embedded-assets.js';

export interface InitCommandOptions {
  force?: boolean;
  /** Accepted for call-site compatibility; spect init is always non-interactive. */
  interactive?: boolean;
}

interface PlannedFile {
  relativePath: string;
  content: string;
}

export class InitCommand {
  private readonly force: boolean;

  constructor(options: InitCommandOptions = {}) {
    this.force = options.force === true;
  }

  async execute(targetPath: string): Promise<void> {
    const projectRoot = path.resolve(targetPath);
    await fs.mkdir(projectRoot, { recursive: true });

    const openspecDir = path.join(projectRoot, 'openspec');

    const files: PlannedFile[] = [
      { relativePath: path.join('config.yaml'), content: EMBEDDED_CONFIG_YAML },
      {
        relativePath: path.join('schemas', 'schema.yaml'),
        content: EMBEDDED_SCHEMA_YAML,
      },
      ...Object.entries(EMBEDDED_TEMPLATES).map(([name, content]) => ({
        relativePath: path.join('schemas', 'templates', `${name}.md`),
        content,
      })),
    ];

    const keepDirs = [path.join('specs'), path.join('changes', 'archive')];

    let created = 0;
    let kept = 0;

    for (const file of files) {
      const filePath = path.join(openspecDir, file.relativePath);
      const exists = await fileExists(filePath);
      if (exists && !this.force) {
        console.log(`${chalk.yellow('保留')} ${path.join('openspec', file.relativePath)}`);
        kept += 1;
        continue;
      }
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, file.content, 'utf8');
      console.log(`${chalk.green('创建')} ${path.join('openspec', file.relativePath)}`);
      created += 1;
    }

    for (const dir of keepDirs) {
      const dirPath = path.join(openspecDir, dir);
      await fs.mkdir(dirPath, { recursive: true });
      const gitkeep = path.join(dirPath, '.gitkeep');
      if (!(await fileExists(gitkeep))) {
        await fs.writeFile(gitkeep, '', 'utf8');
      }
    }

    console.log('');
    console.log(`OpenSpec 脚手架已就绪：${openspecDir}`);
    if (created === 0 && kept > 0) {
      console.log('所有文件均已存在，未做修改（使用 --force 覆盖）。');
    }
    console.log('下一步：用 spect new change <name> 创建你的第一个变更。');
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
