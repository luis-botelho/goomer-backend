import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/modules/menu/menu.repository.js', () => ({
  findMenuData: vi.fn(),
}));

import { findMenuData, type MenuRow } from '../../src/modules/menu/menu.repository.js';
import { getMenuService } from '../../src/modules/menu/menu.service.js';

const activePromotionRow: MenuRow = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Chopp',
  price: '12.00',
  category: 'BEVERAGE',
  currentPrice: '6.00',
  promotionDescription: 'Happy hour',
  promotionPrice: '6.00',
};

const noPromotionRow: MenuRow = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  name: 'Burger',
  price: '25.00',
  category: 'MAIN_COURSE',
  currentPrice: '25.00',
  promotionDescription: null,
  promotionPrice: null,
};

describe('getMenuService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('computes the current weekday and time in HH:mm', async () => {
    const now = new Date('2026-09-09T19:30:00');

    vi.mocked(findMenuData).mockResolvedValue([]);

    await getMenuService(now);

    expect(findMenuData).toHaveBeenCalledWith(now.getDay(), '19:30');
  });

  it('exposes the active promotion price and description', async () => {
    vi.mocked(findMenuData).mockResolvedValue([activePromotionRow]);

    const menu = await getMenuService(new Date('2026-09-09T19:30:00'));

    expect(menu[0].currentPrice).toBe('6.00');
    expect(menu[0].promotion).toEqual({
      description: 'Happy hour',
      promotionalPrice: '6.00',
    });
  });

  it('falls back to the original price and null promotion', async () => {
    vi.mocked(findMenuData).mockResolvedValue([noPromotionRow]);

    const menu = await getMenuService(new Date('2026-09-09T19:30:00'));

    expect(menu[0].currentPrice).toBe('25.00');
    expect(menu[0].promotion).toBeNull();
  });
});