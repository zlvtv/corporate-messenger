import { formatCount } from './formatCount';

describe('formatCount', () => {
  test('pluralizes correctly in Russian', () => {
    expect(formatCount(1, 'участник', 'участника', 'участников')).toBe('1 участник');
    expect(formatCount(2, 'участник', 'участника', 'участников')).toBe('2 участника');
    expect(formatCount(5, 'участник', 'участника', 'участников')).toBe('5 участников');
    expect(formatCount(21, 'участник', 'участника', 'участников')).toBe('21 участник');
    expect(formatCount(25, 'участник', 'участника', 'участников')).toBe('25 участников');
  });
});
