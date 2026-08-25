/**
 * Shared JSON/failure output plumbing. One definition of the failure
 * contract: exit code 1, 错误:/修复: lines in human mode, a status
 * array in JSON mode.
 */

export interface SpectDiagnostic {
  severity: 'error' | 'warning';
  code: string;
  message: string;
  target?: string;
  fix?: string;
}

export function printJson(payload: unknown): void {
  console.log(JSON.stringify(payload, null, 2));
}

export function asErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * @inquirer prompts reject with ExitPromptError on Ctrl-C; commands
 * translate that to `Cancelled.` + exit 130.
 */
export function isPromptCancellationError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'ExitPromptError' ||
      error.message.includes('force closed the prompt with SIGINT'))
  );
}

export function asStatus(error: unknown, fallbackCode: string): SpectDiagnostic {
  // RootSelectionError (and siblings) carry a diagnostic envelope;
  // duck-type it once, here.
  const diagnostic = (error as { diagnostic?: SpectDiagnostic }).diagnostic;
  if (diagnostic && typeof diagnostic.code === 'string') {
    return diagnostic;
  }
  return {
    severity: 'error',
    code: fallbackCode,
    message: asErrorMessage(error),
  };
}

export function emitFailure(
  json: boolean | undefined,
  payload: Record<string, unknown>,
  error: unknown,
  fallbackCode: string
): void {
  if (!json && isPromptCancellationError(error)) {
    console.error('已取消。');
    process.exitCode = 130;
    return;
  }

  const status = asStatus(error, fallbackCode);
  if (json) {
    const prior = Array.isArray(payload.status) ? payload.status : [];
    printJson({ ...payload, status: [...prior, status] });
    process.exitCode = 1;
    return;
  }
  console.error(`错误：${status.message}`);
  if (status.fix) {
    console.error(`修复：${status.fix}`);
  }
  process.exitCode = 1;
}
