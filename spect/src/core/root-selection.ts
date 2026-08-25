/**
 * OpenSpec root resolution for spect commands (simplified from spect).
 *
 * spect has no store support: the root is always the nearest ancestor
 * containing a qualifying `openspec/` directory (planning shape or a config
 * file), with an implicit cwd fallback when commands allow it.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

import { findRepoPlanningRootSync, type PlanningHome } from './planning-home.js';
import { classifyOpenSpecDir } from './project-config.js';
import { FileSystemUtils } from '../utils/file-system.js';

export type OpenSpecRootSource = 'nearest' | 'implicit';

export interface StoreSelectorOptions {
  store?: string;
  storePath?: string;
}

export interface ResolveOpenSpecRootOptions extends StoreSelectorOptions {
  startPath?: string;
  allowImplicitRoot?: boolean;
  globalDataDir?: string;
}

export interface ResolvedOpenSpecRoot {
  path: string;
  changesDir: string;
  specsDir: string;
  archiveDir: string;
  defaultSchema: 'spec-driven';
  source: OpenSpecRootSource;
  storeId?: string;
}

export interface RootSelectionDiagnostic {
  severity: 'error';
  code: string;
  message: string;
  target?: string;
  fix?: string;
}

export class RootSelectionError extends Error {
  readonly diagnostic: RootSelectionDiagnostic;

  constructor(
    message: string,
    code: string,
    options: { target?: string; fix?: string } = {}
  ) {
    super(message);
    this.name = 'RootSelectionError';
    this.diagnostic = {
      severity: 'error',
      code,
      message,
      ...options,
    };
  }
}

export function isRootSelectionError(error: unknown): error is RootSelectionError {
  return error instanceof RootSelectionError;
}

function makeRoot(rootPath: string, source: OpenSpecRootSource): ResolvedOpenSpecRoot {
  return {
    path: rootPath,
    changesDir: path.join(rootPath, 'openspec', 'changes'),
    specsDir: path.join(rootPath, 'openspec', 'specs'),
    archiveDir: path.join(rootPath, 'openspec', 'changes', 'archive'),
    defaultSchema: 'spec-driven',
    source,
  };
}

function canonicalDirectory(startPath: string): string {
  const resolved = path.resolve(startPath);

  try {
    const stats = fs.statSync(resolved);
    const dir = stats.isDirectory() ? resolved : path.dirname(resolved);
    return FileSystemUtils.canonicalizeExistingPath(dir);
  } catch {
    return resolved;
  }
}

/**
 * The nearest-root walk, qualified: an `openspec/` DIRECTORY alone is not a
 * root — it must carry a planning shape (specs/ or changes/) or a config file.
 */
function findQualifyingRootSync(startPath: string): string | null {
  let candidate = findRepoPlanningRootSync(startPath);
  while (candidate) {
    const { hasPlanningShape, pointer } = classifyOpenSpecDir(candidate);
    if (hasPlanningShape || pointer.filePath) {
      return candidate;
    }
    const parent = path.dirname(candidate);
    if (parent === candidate) {
      return null;
    }
    candidate = findRepoPlanningRootSync(parent);
  }
  return null;
}

export async function resolveOpenSpecRoot(
  options: ResolveOpenSpecRootOptions = {}
): Promise<ResolvedOpenSpecRoot> {
  const startPath = options.startPath ?? process.cwd();
  const nearestRoot = findQualifyingRootSync(startPath);
  if (nearestRoot) {
    return makeRoot(nearestRoot, 'nearest');
  }

  if (options.allowImplicitRoot === false) {
    throw new RootSelectionError(
      '在当前目录中未找到 OpenSpec 根目录。',
      'no_openspec_root',
      { target: 'openspec.root', fix: '运行 spect init 在此创建根目录。' }
    );
  }

  return makeRoot(canonicalDirectory(startPath), 'implicit');
}

// -----------------------------------------------------------------------------
// Output helpers
// -----------------------------------------------------------------------------

export interface RootOutput {
  path: string;
  source: OpenSpecRootSource;
  store_id?: string;
}

export function toRootOutput(root: ResolvedOpenSpecRoot): RootOutput {
  return {
    path: root.path,
    source: root.source,
  };
}

/** spect has no stores; kept for API compatibility with upstream callers. */
export function isStoreSelectedRoot(
  root: ResolvedOpenSpecRoot
): root is ResolvedOpenSpecRoot & { storeId: string } {
  void root;
  return false;
}

export function emitStoreRootBanner(root: ResolvedOpenSpecRoot): void {
  void root;
}

export function withStoreFlag(root: ResolvedOpenSpecRoot, command: string): string {
  void root;
  return command;
}

/**
 * Compatibility bridge for workflow code that still expects a PlanningHome.
 * The planning home is always repo-shaped.
 */
export function toPlanningHome(root: ResolvedOpenSpecRoot): PlanningHome {
  return {
    kind: 'repo',
    root: root.path,
    changesDir: root.changesDir,
    defaultSchema: root.defaultSchema,
  };
}

/**
 * CLI adapter shared by the supported commands. In JSON mode a resolution
 * failure is reported as a machine-readable payload on stdout with a non-zero
 * exit code; the caller must return when this resolves to null.
 */
export async function resolveRootForCommand(
  selector: StoreSelectorOptions,
  output: {
    json?: boolean;
    failurePayload?: Record<string, unknown>;
    allowImplicitRoot?: boolean;
  } = {}
): Promise<ResolvedOpenSpecRoot | null> {
  void selector;
  try {
    return await resolveOpenSpecRoot({
      ...(output.allowImplicitRoot !== undefined
        ? { allowImplicitRoot: output.allowImplicitRoot }
        : {}),
    });
  } catch (error) {
    if (output.json && isRootSelectionError(error)) {
      console.log(
        JSON.stringify(
          { ...(output.failurePayload ?? {}), status: [error.diagnostic] },
          null,
          2
        )
      );
      process.exitCode = 1;
      return null;
    }

    throw error;
  }
}
