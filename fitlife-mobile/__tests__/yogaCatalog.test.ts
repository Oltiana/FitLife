import { YOGA_CATALOG } from '../src/data/discoverCatalog';

describe('yogaCatalog', () => {
  it('has discover yoga items with required fields', () => {
    expect(YOGA_CATALOG.length).toBeGreaterThan(0);
    for (const item of YOGA_CATALOG) {
      expect(item.modality).toBe('yoga');
      expect(item.id).toMatch(/^yg-/);
      expect(item.title.trim().length).toBeGreaterThan(0);
      expect(item.minutes).toBeGreaterThan(0);
      expect(item.tags.length).toBeGreaterThan(0);
    }
  });

  it('uses unique yoga catalog ids', () => {
    const ids = YOGA_CATALOG.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('includes common yoga styles in tags', () => {
    const allTags = YOGA_CATALOG.flatMap((i) => i.tags.map((t) => t.toLowerCase()));
    expect(allTags.some((t) => t.includes('vinyasa') || t.includes('yin'))).toBe(
      true,
    );
  });

  it('keeps session lengths in a reasonable range', () => {
    for (const item of YOGA_CATALOG) {
      expect(item.minutes).toBeGreaterThanOrEqual(15);
      expect(item.minutes).toBeLessThanOrEqual(60);
    }
  });
});
