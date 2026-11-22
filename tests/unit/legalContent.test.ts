import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { siteConfig } from '../../src/config/site.config';

/**
 * Task 9 — legal content contract.
 *
 * `astro:content` does not resolve under vitest, so these tests read the raw
 * markdown files and parse the frontmatter with `yaml` (already a
 * devDependency). The build-side rendering of the same data (PUBLICATION
 * BLOCKER markers, lang="de", canonicals) is covered by
 * tests/build/buildOutput.test.ts.
 *
 * Hard rule: NEVER invent legal data. Legally required Impressum fields are
 * either filled with owner-provided, verified values (see
 * PROVIDED_IMPRESSUM_FIELDS) or carry `value: null` so the build renders a
 * visible PUBLICATION BLOCKER instead of fabricated data.
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
// § 18 Abs. 2 MStV). All of them must be present; any field not listed in
// PROVIDED_IMPRESSUM_FIELDS must carry value: null (rendered as a visible
// PUBLICATION BLOCKER) until the owner supplies verified data.
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

// Fields filled with owner-provided data on 2026-11-22 (contact email,
// address, and the § 18 Abs. 2 MStV responsible person with address).
// Exact expected values — the test fails if anyone edits them silently.
const PROVIDED_IMPRESSUM_FIELDS: Record<string, string> = {
  Anschrift: 'Weserstr. 44d, 10247 Berlin, Germany',
  Kontakt: 'postmaster@amamus.net',
  'Verantwortlich nach § 18 Abs. 2 MStV': 'David Walter, Weserstr. 44d, 10247 Berlin, Germany',
};

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

  it.each(REQUIRED_IMPRESSUM_LABELS)('required field "%s" is present', (label) => {
    const field = allFields(data).find((f) => f.label === label);
    expect(field, `label "${label}" missing from impressum frontmatter`).toBeDefined();
  });

  it('provided fields hold exactly the owner-supplied values; every other field stays null (no invented data)', () => {
    for (const field of allFields(data)) {
      if (field.label in PROVIDED_IMPRESSUM_FIELDS) {
        expect(field.value, `field "${field.label}" was changed`).toBe(PROVIDED_IMPRESSUM_FIELDS[field.label]);
      } else {
        expect(field.value, `field "${field.label}" must stay null until real data exists`).toBeNull();
      }
    }
  });

  it('impressum Kontakt matches siteConfig.contact.email', () => {
    const kontakt = allFields(data).find((f) => f.label === 'Kontakt');
    expect(kontakt?.value).toBe(siteConfig.contact.email);
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
