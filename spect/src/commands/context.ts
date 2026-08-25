/**
 * `spect context` (simplified from spect): prints the resolved
 * OpenSpec root's working context as an agent brief (JSON) or a human
 * listing. spect has no stores, so the working set is always the root alone.
 */
import { Command } from 'commander';

import {
  resolveRootForCommand,
  type ResolvedOpenSpecRoot,
} from '../core/root-selection.js';
import { readProjectConfig } from '../core/project-config.js';
import { emitFailure, printJson } from './shared-output.js';

const FAILURE_PAYLOAD = { root: null };

interface ContextBrief {
  root: { path: string; source: string };
  schema: string | null;
  context: string | null;
  references: string[];
}

function buildBrief(root: ResolvedOpenSpecRoot): ContextBrief {
  const projectConfig = readProjectConfig(root.path);
  return {
    root: { path: root.path, source: root.source },
    schema: projectConfig?.schema ?? null,
    context: projectConfig?.context ?? null,
    references: (projectConfig?.references ?? []).map((entry) => entry.id),
  };
}

function printHumanBrief(brief: ContextBrief): void {
  console.log(`OpenSpec 根目录：${brief.root.path}（${brief.root.source}）`);
  console.log(`Schema：${brief.schema ?? '未配置'}`);
  if (brief.references.length > 0) {
    console.log(`引用（spect 不支持 store，仅作提示）：${brief.references.join(', ')}`);
  }
  if (brief.context) {
    console.log('');
    console.log(brief.context);
  }
}

export function registerContextCommand(program: Command): void {
  program
    .command('context')
    .description('打印已解析 OpenSpec 根目录的工作上下文')
    .option('--json', '以 JSON 格式输出代理简报')
    .action(async (options: { json?: boolean }) => {
      try {
        const root = await resolveRootForCommand(
          {},
          { json: options.json, failurePayload: FAILURE_PAYLOAD, allowImplicitRoot: false }
        );
        if (!root) {
          return;
        }

        const brief = buildBrief(root);
        if (options.json) {
          printJson(brief);
        } else {
          printHumanBrief(brief);
        }
      } catch (error) {
        emitFailure(options.json, FAILURE_PAYLOAD, error, 'context_failed');
      }
    });
}
