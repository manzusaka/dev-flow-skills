import { asStatus } from '../commands/shared-output.js';
import { Command } from 'commander';
import ora from 'ora';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { ListCommand } from '../core/list.js';
import { ArchiveCommand, type ArchiveOptions } from '../core/archive.js';
import { resolveRootForCommand, toRootOutput } from '../core/root-selection.js';
import { ValidateCommand } from '../commands/validate.js';
import { ShowCommand } from '../commands/show.js';
import { registerContextCommand } from '../commands/context.js';
import {
  statusCommand,
  instructionsCommand,
  implementInstructionsCommand,
  archiveInstructionsCommand,
  templatesCommand,
  schemasCommand,
  newChangeCommand,
  DEFAULT_SCHEMA,
  type StatusOptions,
  type InstructionsOptions,
  type TemplatesOptions,
  type SchemasOptions,
  type NewChangeOptions,
} from '../commands/workflow/index.js';

const version = process.env.SPECT_VERSION ?? '0.2.0';

function failWithError(
  error: unknown,
  json?: { enabled: boolean | undefined; payload?: Record<string, unknown>; fallbackCode?: string }
): void {
  // The agent contract: every --json failure leaves exactly one JSON
  // document on stdout (the command's null-shape plus a status array).
  if (json?.enabled) {
    console.log(
      JSON.stringify(
        { ...(json.payload ?? {}), status: [asStatus(error, json.fallbackCode ?? 'command_error')] },
        null,
        2
      )
    );
    process.exitCode = 1;
    return;
  }
  ora().fail(`Error: ${(error as Error).message}`);
  const fix = (error as { diagnostic?: { fix?: string } }).diagnostic?.fix;
  if (fix) {
    console.error(`修复：${fix}`);
  }
  process.exitCode = process.exitCode ?? 1;
}

const program = new Command();

program
  .name('spect')
  .description('spectools：精简版 OpenSpec CLI，面向规范驱动开发')
  .version(version, '-V, --version', '输出版本号')
  .helpOption('-h, --help', '显示命令帮助')
  .addHelpCommand('help [command]', '显示命令帮助');

// Global options
program.option('--no-color', '禁用彩色输出');

program.hook('preAction', (thisCommand) => {
  const opts = thisCommand.opts();
  if (opts.color === false) {
    process.env.NO_COLOR = '1';
  }
});

program
  .command('init [path]')
  .description('在项目中初始化 openspec/ 脚手架（非交互）')
  .action(async (targetPath = '.') => {
    try {
      const resolvedPath = path.resolve(targetPath);

      try {
        const stats = await import('fs').then((m) => m.promises.stat(resolvedPath));
        if (!stats.isDirectory()) {
          throw new Error(`路径 "${targetPath}" 不是一个目录`);
        }
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          console.log(`目录 "${targetPath}" 不存在，将被创建。`);
        } else if (error.message && error.message.includes('不是一个目录')) {
          throw error;
        } else {
          throw new Error(`无法访问路径 "${targetPath}": ${error.message}`);
        }
      }

      const { InitCommand } = await import('../core/init.js');
      const initCommand = new InitCommand({
        interactive: false,
      });
      await initCommand.execute(targetPath);
    } catch (error) {
      failWithError(error);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('列出项目（默认显示更改）。使用 --specs 列出规范。')
  .option('--specs', '列出规范而非更改')
  .option('--changes', '明确列出更改（默认）')
  .option('--sort <order>', '排序方式："recent"（默认）或 "name"', 'recent')
  .option('--json', '以 JSON 格式输出（供程序使用）')
  .action(async (options?: { specs?: boolean; changes?: boolean; sort?: string; json?: boolean }) => {
    try {
      const root = await resolveRootForCommand({}, {
        json: options?.json,
        failurePayload: options?.specs ? { specs: [], root: null } : { changes: [], root: null },
        allowImplicitRoot: existsSync(path.join(process.cwd(), 'openspec', 'project.md')),
      });
      if (!root) {
        return;
      }
      const listCommand = new ListCommand();
      const mode: 'changes' | 'specs' = options?.specs ? 'specs' : 'changes';
      const sort = options?.sort === 'name' ? 'name' : 'recent';
      await listCommand.execute(root.path, mode, {
        sort,
        json: options?.json,
        ...(options?.json ? { root: toRootOutput(root) } : {}),
      });
    } catch (error) {
      failWithError(error, {
        enabled: options?.json,
        payload: options?.specs ? { specs: [], root: null } : { changes: [], root: null },
        fallbackCode: 'list_error',
      });
      process.exit(1);
    }
  });

program
  .command('archive [change-name]')
  .description('归档已完成的变更并更新主规范')
  .option('-y, --yes', '跳过确认提示')
  .option('--skip-specs', '跳过规范更新操作（适用于基础设施、工具或纯文档变更）')
  .option('--no-validate', '跳过验证（不推荐，需确认）')
  .option('--json', '以 JSON 格式输出（非交互式）')
  .action(async (changeName?: string, options?: ArchiveOptions) => {
    try {
      const archiveCommand = new ArchiveCommand();
      await archiveCommand.execute(changeName, options);
    } catch (error) {
      failWithError(error);
      process.exit(1);
    }
  });

registerContextCommand(program);

// Top-level validate command
program
  .command('validate [item-name]')
  .description('验证更改和规范')
  .option('--all', '验证所有更改和规范')
  .option('--changes', '验证所有更改')
  .option('--specs', '验证所有规范')
  .option('--archived', '验证已归档的更改是否所有任务已完成（用于 pre-commit lint）')
  .option('--type <type>', '当项目类型不明确时指定类型：change|spec')
  .option('--strict', '启用严格验证模式')
  .option('--json', '以JSON格式输出验证报告')
  .option('--concurrency <n>', '最大并发验证数 (默认为环境变量 OPENSPEC_CONCURRENCY 或 6)')
  .option('--no-interactive', '禁用交互式提示')
  .action(async (itemName?: string, options?: { all?: boolean; changes?: boolean; specs?: boolean; archived?: boolean; type?: string; strict?: boolean; json?: boolean; noInteractive?: boolean; concurrency?: string }) => {
    try {
      const validateCommand = new ValidateCommand();
      await validateCommand.execute(itemName, options);
    } catch (error) {
      failWithError(error, { enabled: options?.json, fallbackCode: 'validate_error' });
      process.exit(1);
    }
  });

// Top-level show command
program
  .command('show [item-name]')
  .description('显示更改或规范')
  .option('--json', '以JSON格式输出')
  .option('--type <type>', '当项目类型不明确时指定类型：change|spec')
  .option('--no-interactive', '禁用交互式提示')
  .option('--deltas-only', '仅显示 deltas（仅 JSON，change）')
  .option('--requirements-only', '--deltas-only 的别名（已弃用，change）')
  .option('--requirements', '仅 JSON：仅显示需求（排除场景）')
  .option('--no-scenarios', '仅 JSON：排除场景内容')
  .option('-r, --requirement <id>', '仅 JSON：按 ID 显示特定需求（从 1 开始）')
  .allowUnknownOption(true)
  .action(async (itemName?: string, options?: { json?: boolean; type?: string; noInteractive?: boolean; [k: string]: any }) => {
    try {
      const showCommand = new ShowCommand();
      await showCommand.execute(itemName, options ?? {});
    } catch (error) {
      failWithError(error, { enabled: options?.json, fallbackCode: 'show_error' });
      process.exit(1);
    }
  });

// Status command
program
  .command('status')
  .description('显示变更的产出物完成状态')
  .option('--change <id>', '要显示状态的变更名称')
  .option('--schema <name>', 'Schema 覆盖（从 config.yaml 自动检测）')
  .option('--json', '以 JSON 格式输出')
  .action(async (options: StatusOptions) => {
    try {
      await statusCommand(options);
    } catch (error) {
      failWithError(error, { enabled: options.json, fallbackCode: 'change_error' });
      process.exit(1);
    }
  });

// Instructions command
program
  .command('instructions [artifact]')
  .description('输出制品、implement 或 archive 的增强指令')
  .option('--change <id>', '变更名称')
  .option('--schema <name>', 'Schema 覆盖（从 config.yaml 自动检测）')
  .option('--json', '以 JSON 格式输出')
  .action(async (artifactId: string | undefined, options: InstructionsOptions) => {
    try {
      if (artifactId === 'apply') {
        throw new Error(
          "'spect instructions apply' 已重命名为 'spect instructions implement'；请使用新命令。"
        );
      } else if (artifactId === 'implement') {
        await implementInstructionsCommand(options);
      } else if (artifactId === 'archive') {
        await archiveInstructionsCommand(options);
      } else {
        await instructionsCommand(artifactId, options);
      }
    } catch (error) {
      failWithError(error, { enabled: options.json, fallbackCode: 'change_error' });
      process.exit(1);
    }
  });

// Templates command
program
  .command('templates')
  .description('显示 Schema 中所有产出物的已解析模板路径')
  .option('--schema <name>', `要使用的 Schema（默认：${DEFAULT_SCHEMA}）`)
  .option('--json', '以 JSON 格式输出产出物 ID 到模板路径的映射')
  .action(async (options: TemplatesOptions) => {
    try {
      await templatesCommand(options);
    } catch (error) {
      failWithError(error);
      process.exit(1);
    }
  });

// Schemas command
program
  .command('schemas')
  .description('列出可用的工作流 Schema 及其描述')
  .option('--json', '以 JSON 格式输出（供 Agent 使用）')
  .action(async (options: SchemasOptions) => {
    try {
      await schemasCommand(options);
    } catch (error) {
      failWithError(error, {
        enabled: options.json,
        payload: { schemas: [], root: null },
        fallbackCode: 'schemas_error',
      });
      process.exit(1);
    }
  });

// New command group with change subcommand
const newCmd = program.command('new').description('创建新项目');

newCmd
  .command('change <name>')
  .description('创建新的变更目录')
  .option('--description <text>', '添加到 README.md 的描述')
  .option('--goal <text>', '随变更存储的可选目标元数据')
  .option('--schema <name>', `要使用的工作流 Schema（默认：${DEFAULT_SCHEMA}）`)
  .option('--json', '以 JSON 格式输出')
  .action(async (name: string, options: NewChangeOptions) => {
    try {
      await newChangeCommand(name, options);
    } catch (error) {
      failWithError(error);
      process.exit(1);
    }
  });

export { program };

export function runCli(argv = process.argv): void {
  program.parse(argv);
}

if (
  process.argv[1] &&
  typeof import.meta.url === 'string' &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  runCli();
}
