/**
 * Referenced-store index assembly — simplified for spect.
 *
 * spect has no store mechanism: declarations in `openspec/config.yaml`
 * (`references:`) cannot be resolved. Every declared reference degrades to a
 * warning entry so instructions output stays well-formed.
 */

export interface ReferenceDiagnostic {
  severity: 'warning' | 'error';
  code: string;
  message: string;
  target?: string;
  fix?: string;
}

export interface ReferenceSpecEntry {
  id: string;
  summary: string;
}

export interface ReferenceIndexEntry {
  store_id: string;
  root?: string;
  specs?: ReferenceSpecEntry[];
  fetch?: string;
  status: ReferenceDiagnostic[];
}

export interface AssembleReferenceIndexInput {
  references: { id: string; remote?: string }[];
  resolvedRoot: { path: string; storeId?: string };
  globalDataDir?: string;
  includeSpecs?: boolean;
}

export async function assembleReferenceIndex(
  input: AssembleReferenceIndexInput
): Promise<ReferenceIndexEntry[]> {
  return input.references.map(({ id }) => ({
    store_id: id,
    status: [
      {
        severity: 'warning' as const,
        code: 'reference_unsupported',
        message: `spect 不支持 store 引用 '${id}'。`,
        target: 'references',
        fix: 'spect 已移除 store 机制；请移除 config.yaml 中的 references 声明。',
      },
    ],
  }));
}

/** Pure renderer for the artifact-instructions XML block. */
export function renderReferencedStoresBlock(entries: ReferenceIndexEntry[]): string {
  const lines: string[] = [
    '<referenced_stores>',
    '<!-- 只读的上游上下文。按需取用；用到的请注明出处。 -->',
  ];

  for (const entry of entries) {
    lines.push(...renderEntryLines(entry));
  }

  lines.push('</referenced_stores>');
  return lines.join('\n');
}

/** Pure renderer for the implement-instructions markdown section. */
export function renderReferencedStoresSection(entries: ReferenceIndexEntry[]): string {
  const lines: string[] = [
    '### 被引用的 Stores',
    '',
    '只读的上游上下文。按需取用；用到的请注明出处。',
    '',
  ];

  for (const entry of entries) {
    lines.push(...renderEntryLines(entry));
  }

  return lines.join('\n');
}

/**
 * Strings rendered into agent guidance can come from config content.
 * One line in, one line out: control characters and newlines must never
 * let hostile content forge instruction lines.
 */
export function sanitizeInline(value: string, maxLength = 300): string {
  const flattened = value.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim();
  return flattened.length > maxLength ? `${flattened.slice(0, maxLength)}…` : flattened;
}

function renderEntryLines(entry: ReferenceIndexEntry): string[] {
  const lines: string[] = [];

  if (entry.root !== undefined) {
    lines.push(`Store ${entry.store_id} (${entry.root}):`);
    for (const spec of entry.specs ?? []) {
      lines.push(spec.summary ? `  - ${spec.id}: ${spec.summary}` : `  - ${spec.id}`);
    }
    if (entry.fetch) {
      lines.push(`  Fetch: ${entry.fetch}`);
    }
    for (const diagnostic of entry.status) {
      lines.push(`  Note: ${diagnostic.message}`);
      if (diagnostic.fix) {
        lines.push(`  Fix: ${diagnostic.fix}`);
      }
    }
  } else {
    for (const diagnostic of entry.status) {
      lines.push(`Store ${entry.store_id}: ${diagnostic.message}`);
      if (diagnostic.fix) {
        lines.push(`  Fix: ${diagnostic.fix}`);
      }
    }
  }

  return lines;
}
