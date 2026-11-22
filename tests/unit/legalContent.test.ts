import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

/**
 * Task 9 — legal content contract.
 *
 * `astro:content` does not resolve under vitest, so these tests read the raw
 * markdown files and parse the frontmatter with `yaml` (already a
 * devDependency). The build-side rendering of the same data (PUBLICATION
 * BLOCKER markers, lang="de", canonicals) is covered by
 * tests/build/buildOutput.test.ts.
 *
 * Hard rule: NEVER invent legal data. Every legally required Impressum field
 * must carry `value: null` in the frontmatter so the build renders a visible
 * PUBLICATION BLOCKER instead of fabricated data.
 */

interface LegalFrontmatter {
  title: string;
  description: string;
  draftNotice: string;
  sections: { heading: string; fields: { label: string; value: string | null }[]; prose?: string }[];
}

function readLegal(name: string): { raw: string; data: LegalFrontmatter } {
  const path = `src/content/legal/${name}.md`;
  const raw = readFileSync(path, 'utf8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const body = match?.[1];
  if (!body) throw new Error(`No YAML frontmatter found in ${path}`);
  return { raw, data: parse(body) as LegalFrontmatter };
}

/** All fields across all sections as { label, value } pairs. */
function allFields(data: LegalFrontmatter): { label: string; value: string | null }[] {
  return data.sections.flatMap((s) => s.fields);
}

// Every field legally required in an Impressum (§ 5 TMG, § 27a UStG,
// § 18 Abs. 2 MStV). All of them must be present with value: null.
const REQUIRED_IMPRESSUM_LABELS = [
  'Name',
  'Rechtsform',
  'Anschrift',
  'Vertretungsberechtigte Person',
  'Kontakt',
  'Registergericht',
  'Registernummer',
  'USt-IdNr.',
  'Verantwortlich nach § 18 Abs. 2 MStV',
] as const;

describe('src/content/legal/impressum.md', () => {
  const { raw, data } = readLegal('impressum');

  it('has title, description, draftNotice and sections in frontmatter', () => {
    expect(typeof data.title).toBe('string');
    expect(data.title.trim().length).toBeGreaterThan(0);
    expect(typeof data.description).toBe('string');
    expect(data.description.trim().length).toBeGreaterThan(0);
    expect(typeof data.draftNotice).toBe('string');
    expect(data.draftNotice.trim().length).toBeGreaterThan(0);
    expect(Array.isArray(data.sections)).toBe(true);
    expect(data.sections.length).toBeGreaterThan(0);
  });

  it('mentions the governing statutes (§ 5 TMG, § 27a UStG, § 18 Abs. 2 MStV)', () => {
    expect(raw).toContain('§ 5 TMG');
    expect(raw).toContain('§ 27a UStG');
    expect(raw).toContain('§ 18 Abs. 2 MStV');
  });

  it.each(REQUIRED_IMPRESSUM_LABELS)('required field "%s" is present with value: null', (label) => {
    const field = allFields(data).find((f) => f.label === label);
    expect(field, `label "${label}" missing from impressum frontmatter`).toBeDefined();
    expect(field?.value).toBeNull();
  });

  it('has NO invented legal data: every field value is null', () => {
    for (const field of allFields(data)) {
      expect(field.value, `field "${field.label}" must stay null until real data exists`).toBeNull();
    }
  });

  it('draftNotice states the page is a draft and not legally complete', () => {
    expect(data.draftNotice).toContain('Entwurf');
    expect(data.draftNotice).toContain('PUBLICATION BLOCKER');
  });
});

describe('src/content/legal/datenschutz.md', () => {
  const { raw, data } = readLegal('datenschutz');

  it('has title, description, draftNotice and sections in frontmatter', () => {
    expect(typeof data.title).toBe('string');
    expect(data.title.trim().length).toBeGreaterThan(0);
    expect(typeof data.description).toBe('string');
    expect(data.description.trim().length).toBeGreaterThan(0);
    expect(typeof data.draftNotice).toBe('string');
    expect(data.draftNotice.trim().length).toBeGreaterThan(0);
    expect(Array.isArray(data.sections)).toBe(true);
    expect(data.sections.length).toBeGreaterThan(0);
  });

  it('draftNotice states the page is a draft under qualified legal review', () => {
    expect(data.draftNotice).toContain('Entwurf');
    expect(data.draftNotice).toContain('geprüft');
  });

  it('states only facts true of this site: GitHub Pages hosting, no cookies/analytics/trackers, no external services', () => {
    expect(raw).toContain('GitHub Pages');
    expect(raw).toMatch(/keine Cookies/);
    expect(raw).toMatch(/keine Analyse/);
    expect(raw).toMatch(/keine Tracker/);
    expect(raw).toMatch(/keine externen Dienste/);
  });

  it('clearly marks template sections as requiring qualified legal review', () => {
    expect(raw).toMatch(/fachkundig[er]? (rechtlich[er] )?(geprüft|Prüfung)|legal review/i);
  });

  it('carries no invented personal data (no field values at all, or all null)', () => {
    for (const field of allFields(data)) {
      expect(field.value).toBeNull();
    }
  });
});

describe('both legal pages', () => {
  it('both contain a draftNotice banner string', () => {
    for (const name of ['impressum', 'datenschutz']) {
      const { data } = readLegal(name);
      expect(data.draftNotice.trim().length).toBeGreaterThan(0);
    }
  });
});
