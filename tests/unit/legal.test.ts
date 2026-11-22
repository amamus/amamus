import { describe, expect, it } from 'vitest';
import { legalField, hasBlockers } from '../../src/utils/legal';

describe('legalField', () => {
  it('returns ok with the value for a non-empty string', () => {
    expect(legalField('Example GmbH', 'Company name')).toEqual({ status: 'ok', value: 'Example GmbH' });
  });
  it('returns missing for null', () => {
    expect(legalField(null, 'Address')).toEqual({ status: 'missing', label: 'Address' });
  });
  it('returns missing for undefined', () => {
    expect(legalField(undefined, 'Address')).toEqual({ status: 'missing', label: 'Address' });
  });
  it('returns missing for a whitespace-only string', () => {
    expect(legalField('  ', 'Address')).toEqual({ status: 'missing', label: 'Address' });
  });
});

describe('hasBlockers', () => {
  it('is true when any field is missing', () => {
    expect(
      hasBlockers([legalField('Example GmbH', 'Company name'), legalField(null, 'Address')])
    ).toBe(true);
  });
  it('is false when all fields are ok', () => {
    expect(
      hasBlockers([legalField('Example GmbH', 'Company name'), legalField('Main Street 1', 'Address')])
    ).toBe(false);
  });
  it('is false for an empty list', () => {
    expect(hasBlockers([])).toBe(false);
  });
});
