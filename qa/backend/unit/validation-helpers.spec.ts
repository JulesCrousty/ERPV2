import { ensureRequired, hasPermission, normalizeIdentifier } from '../../../backend/src/common/utils/validation-helpers';

describe('validation-helpers (QA)', () => {
  it('should throw when required fields are missing', () => {
    expect(() => ensureRequired({ id: 1, name: '' }, ['name'])).toThrow('Missing required fields: name');
  });

  it('should normalize identifiers for analytics and workflow', () => {
    expect(normalizeIdentifier('   fi workflow 01 ')).toBe('FI-WORKFLOW-01');
  });

  it('should check permissions including wildcard', () => {
    expect(hasPermission(['FI.APPROVE'], 'FI.APPROVE')).toBe(true);
    expect(hasPermission(['*'], 'ANY')).toBe(true);
    expect(hasPermission(['FI.CREATE'], 'MM.CREATE')).toBe(false);
  });
});
