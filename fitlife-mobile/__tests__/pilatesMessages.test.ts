import { pickMotivationalMessage } from '../src/data/pilates/messages';

describe('pilatesMessages', () => {
  it('returns first-session message when totalSessions is 0', () => {
    expect(pickMotivationalMessage(0, 0, 0)).toContain('first session');
  });

  it('returns week streak message at 7 days', () => {
    expect(pickMotivationalMessage(7, 60, 8)).toContain('full week streak');
  });

  it('uses API messages when provided', () => {
    const msg = pickMotivationalMessage(1, 10, 2, ['Custom API message']);
    expect(msg).toBe('Custom API message');
  });
});
