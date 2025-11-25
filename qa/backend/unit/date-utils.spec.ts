import { addBusinessDays, isSameDay, toUtc } from '../../../backend/src/common/utils/date-utils';

describe('date-utils (QA)', () => {
  it('should convert date to UTC while keeping wall clock time', () => {
    const input = new Date('2023-01-15T10:00:00');
    const converted = toUtc(input);
    expect(converted.getUTCHours()).toBe(10);
  });

  it('should detect same calendar day', () => {
    expect(isSameDay(new Date('2024-12-01T00:01:00Z'), new Date('2024-12-01T23:59:59Z'))).toBe(true);
    expect(isSameDay(new Date('2024-12-01'), new Date('2024-12-02'))).toBe(false);
  });

  it('should add business days skipping weekends', () => {
    const start = new Date('2024-01-05'); // Friday
    const result = addBusinessDays(start, 2);
    expect(result.getDay()).toBe(2); // Tuesday
  });
});
