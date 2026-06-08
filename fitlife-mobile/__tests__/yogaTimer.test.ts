import { formatYogaTimerSeconds } from '../src/domain/yogaSessionUtils';

describe('yogaTimer', () => {
  it('formats whole minutes without leading minute zero-padding', () => {
    expect(formatYogaTimerSeconds(120)).toBe('2:00');
    expect(formatYogaTimerSeconds(600)).toBe('10:00');
  });

  it('pads seconds to two digits', () => {
    expect(formatYogaTimerSeconds(61)).toBe('1:01');
    expect(formatYogaTimerSeconds(9)).toBe('0:09');
  });
});
