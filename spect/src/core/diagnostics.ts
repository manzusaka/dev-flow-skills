/**
 * Shared diagnostic envelope for machine-readable error/warning payloads
 * (carried by RootSelectionError, openspec-root inspections, and JSON
 * `status` arrays).
 */

export interface StoreDiagnostic {
  severity: 'error' | 'warning';
  code: string;
  message: string;
  target?: string;
  fix?: string;
}

export function makeStoreDiagnostic(
  severity: 'error' | 'warning',
  code: string,
  message: string,
  options: { target?: string; fix?: string } = {}
): StoreDiagnostic {
  return {
    severity,
    code,
    message,
    ...(options.target ? { target: options.target } : {}),
    ...(options.fix ? { fix: options.fix } : {}),
  };
}
