/**
 * `spect init` — validates the effective OpenSpec contract, then adds only the
 * missing project-local scaffold files. Existing files are never overwritten.
 */
import path from 'node:path';
import os from 'node:os';
import { promises as fs } from 'node:fs';
import chalk from 'chalk';

import {
  EMBEDDED_CONFIG_YAML,
  EMBEDDED_SCHEMA_YAML,
  EMBEDDED_TEMPLATES,
} from './embedded-assets.js';
import { parseProjectConfigStrict } from './project-config.js';
import { getSchemaDir } from './artifact-graph/resolver.js';
import { parseSchema } from './artifact-graph/schema.js';
import type { SchemaYaml } from './artifact-graph/types.js';
import { Validator } from './validation/validator.js';
import { getActiveChangeIds, getSpecIds } from '../utils/item-discovery.js';

export interface InitCommandOptions {
  /** Accepted for call-site compatibility; spect init is always non-interactive. */
  interactive?: boolean;
}

interface PlannedFile {
  relativePath: string;
  content: string;
}

interface InitPlan {
  openspecDir: string;
  files: PlannedFile[];
  keepDirs: string[];
}

const DEFAULT_SCHEMA = 'spec-driven';

export class InitCommand {
  constructor(_options: InitCommandOptions = {}) {}

  async execute(targetPath: string): Promise<void> {
    const projectRoot = path.resolve(targetPath);
    const plan = await createPlan(projectRoot);
    const createdFiles: string[] = [];
    const createdDirs: string[] = [];

    let created = 0;
    try {
      await ensureDirectory(projectRoot, projectRoot, createdDirs);

      for (const file of plan.files) {
        const filePath = path.join(plan.openspecDir, file.relativePath);
        if (await pathExists(filePath)) {
          console.log(`${chalk.yellow('保留')} ${path.join('openspec', file.relativePath)}`);
          continue;
        }
        await ensureDirectory(path.dirname(filePath), projectRoot, createdDirs);
        await fs.writeFile(filePath, file.content, { encoding: 'utf8', flag: 'wx' });
        createdFiles.push(filePath);
        console.log(`${chalk.green('创建')} ${path.join('openspec', file.relativePath)}`);
        created += 1;
      }

      for (const relativeDir of plan.keepDirs) {
        const dirPath = path.join(plan.openspecDir, relativeDir);
        await ensureDirectory(dirPath, projectRoot, createdDirs);
        const gitkeep = path.join(dirPath, '.gitkeep');
        if (!(await pathExists(gitkeep))) {
          await fs.writeFile(gitkeep, '', { encoding: 'utf8', flag: 'wx' });
          createdFiles.push(gitkeep);
          console.log(`${chalk.green('创建')} ${path.relative(projectRoot, gitkeep)}`);
          created += 1;
        }
      }
    } catch (error) {
      await rollbackCreatedPaths(createdFiles, createdDirs);
      throw error;
    }

    console.log('');
    console.log(`OpenSpec 脚手架已就绪：${plan.openspecDir}`);
    if (created === 0) {
      console.log('所有文件均已存在，未做修改。');
    }
    console.log('下一步：用 spect new change <name> 创建你的第一个变更。');
  }
}

async function createPlan(projectRoot: string): Promise<InitPlan> {
  const openspecDir = path.join(projectRoot, 'openspec');
  const configYamlPath = path.join(openspecDir, 'config.yaml');
  const hasConfigYaml = await pathExists(configYamlPath);

  const files: PlannedFile[] = [];
  const configContent = hasConfigYaml
    ? await fs.readFile(configYamlPath, 'utf8')
    : EMBEDDED_CONFIG_YAML;
  if (!hasConfigYaml) {
    files.push({ relativePath: 'config.yaml', content: EMBEDDED_CONFIG_YAML });
  }

  const config = parseProjectConfigStrict(configContent);
  const schemaCandidate = await resolveSchemaCandidate(projectRoot, config.schema, files);
  const schema = parseSchema(schemaCandidate.content);
  await validateTemplates(schema, schemaCandidate.directory, schemaCandidate.embedded, openspecDir, files);
  await validateExistingArtifacts(projectRoot, files);

  return {
    openspecDir,
    files,
    keepDirs: [path.join('specs'), path.join('changes', 'archive')],
  };
}

async function validateExistingArtifacts(
  projectRoot: string,
  plannedFiles: PlannedFile[]
): Promise<void> {
  let validationRoot = projectRoot;
  let temporaryRoot: string | null = null;

  try {
    if (plannedFiles.length > 0) {
      temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'spect-init-validate-'));
      validationRoot = temporaryRoot;
      const sourceOpenSpec = path.join(projectRoot, 'openspec');
      const stagedOpenSpec = path.join(validationRoot, 'openspec');
      if (await pathExists(sourceOpenSpec)) {
        await fs.cp(sourceOpenSpec, stagedOpenSpec, { recursive: true });
      }
      for (const file of plannedFiles) {
        const target = path.join(stagedOpenSpec, file.relativePath);
        if (!(await pathExists(target))) {
          await fs.mkdir(path.dirname(target), { recursive: true });
          await fs.writeFile(target, file.content, 'utf8');
        }
      }
    }

    const [changeIds, specIds] = await Promise.all([
      getActiveChangeIds(validationRoot),
      getSpecIds(validationRoot),
    ]);
    if (changeIds.length === 0 && specIds.length === 0) {
      return;
    }

    const validator = new Validator(true);
    const failures: string[] = [];
    for (const changeId of changeIds) {
      const report = await validator.validateChangeDeltaSpecs(
        path.join(validationRoot, 'openspec', 'changes', changeId),
        {
          mainSpecsDir: path.join(validationRoot, 'openspec', 'specs'),
          projectRoot: validationRoot,
        }
      );
      if (!report.valid) failures.push(`change/${changeId}`);
    }
    for (const specId of specIds) {
      const report = await validator.validateSpec(
        path.join(validationRoot, 'openspec', 'specs', specId, 'spec.md')
      );
      if (!report.valid) failures.push(`spec/${specId}`);
    }
    if (failures.length > 0) {
      throw new Error(`Existing OpenSpec artifacts are invalid: ${failures.join(', ')}`);
    }
  } finally {
    if (temporaryRoot) {
      await fs.rm(temporaryRoot, { recursive: true, force: true });
    }
  }
}

async function resolveSchemaCandidate(
  projectRoot: string,
  schemaName: string,
  files: PlannedFile[]
): Promise<{ content: string; directory: string | null; embedded: boolean }> {
  const schemasDir = path.join(projectRoot, 'openspec', 'schemas');

  if (schemaName === DEFAULT_SCHEMA) {
    const namedSchema = path.join(schemasDir, schemaName, 'schema.yaml');
    const flatSchema = path.join(schemasDir, 'schema.yaml');
    for (const schemaPath of [namedSchema, flatSchema]) {
      if (await pathExists(schemaPath)) {
        return {
          content: await fs.readFile(schemaPath, 'utf8'),
          directory: path.dirname(schemaPath),
          embedded: false,
        };
      }
    }

    files.push({ relativePath: path.join('schemas', 'schema.yaml'), content: EMBEDDED_SCHEMA_YAML });
    return { content: EMBEDDED_SCHEMA_YAML, directory: null, embedded: true };
  }

  const schemaDir = getSchemaDir(schemaName, projectRoot);
  if (!schemaDir) {
    throw new Error(`Schema '${schemaName}' not found for openspec config`);
  }
  return {
    content: await fs.readFile(path.join(schemaDir, 'schema.yaml'), 'utf8'),
    directory: schemaDir,
    embedded: false,
  };
}

async function validateTemplates(
  schema: SchemaYaml,
  schemaDirectory: string | null,
  embedded: boolean,
  openspecDir: string,
  files: PlannedFile[]
): Promise<void> {
  for (const artifact of schema.artifacts) {
    if (embedded) {
      const templateName = artifact.template.replace(/\.md$/u, '');
      const content = EMBEDDED_TEMPLATES[templateName];
      if (content === undefined) {
        throw new Error(`Embedded template is missing: ${artifact.template}`);
      }
      const relativePath = path.join('schemas', 'templates', artifact.template);
      const targetPath = path.join(openspecDir, relativePath);
      if (await pathExists(targetPath)) {
        if (!(await isFile(targetPath))) {
          throw new Error(`Template path is not a file: ${artifact.template}`);
        }
      } else {
        files.push({ relativePath, content });
      }
      continue;
    }

    if (!schemaDirectory) {
      throw new Error('Schema directory is unavailable');
    }
    const templatesDir = path.join(schemaDirectory, 'templates');
    const templatePath = path.resolve(templatesDir, artifact.template);
    if (!isWithin(templatesDir, templatePath) || !(await isFile(templatePath))) {
      throw new Error(`Template '${artifact.template}' is missing for schema '${schema.name}'`);
    }
  }
}

function isWithin(rootPath: string, targetPath: string): boolean {
  const relative = path.relative(rootPath, targetPath);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

async function isFile(targetPath: string): Promise<boolean> {
  try {
    return (await fs.stat(targetPath)).isFile();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw error;
  }
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw error;
  }
}

async function ensureDirectory(
  targetPath: string,
  boundary: string,
  createdDirs: string[]
): Promise<void> {
  const missing: string[] = [];
  let current = targetPath;
  while (isWithin(boundary, current) && !(await pathExists(current))) {
    missing.push(current);
    if (current === boundary) break;
    current = path.dirname(current);
  }
  await fs.mkdir(targetPath, { recursive: true });
  createdDirs.push(...missing.reverse());
}

async function rollbackCreatedPaths(createdFiles: string[], createdDirs: string[]): Promise<void> {
  for (const filePath of createdFiles.reverse()) {
    await fs.rm(filePath, { force: true });
  }
  for (const dirPath of createdDirs.sort((a, b) => b.length - a.length)) {
    try {
      await fs.rmdir(dirPath);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== 'ENOENT' && code !== 'ENOTEMPTY') throw error;
    }
  }
}
