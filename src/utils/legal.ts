/**
 * Legal/contact field status helpers.
 *
 * Missing legal or contact information is a PUBLICATION BLOCKER: it must be
 * surfaced as an explicit marker, never papered over with invented data.
 * `legalField` classifies a raw value; `hasBlockers` tells the build/pages
 * whether any required field is still missing.
 */

export type LegalFieldStatus = { status: 'ok'; value: string } | { status: 'missing'; label: string };

/** Classify a required legal/contact field. Whitespace-only counts as missing. */
export function legalField(value: string | null | undefined, label: string): LegalFieldStatus {
  if (value !== null && value !== undefined && value.trim() !== '') {
    return { status: 'ok', value };
  }
  return { status: 'missing', label };
}

/** True when at least one field is a publication blocker. */
export function hasBlockers(fields: LegalFieldStatus[]): boolean {
  return fields.some((f) => f.status === 'missing');
}
