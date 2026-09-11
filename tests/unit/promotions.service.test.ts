import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/modules/products/products.repository.js', () => ({
  findProductById: vi.fn(),
}));

vi.mock('../../src/modules/promotions/promotions.repository.js', () => ({
  createPromotionWithSchedules: vi.fn(),
  findAllPromotions: vi.fn(),
  findPromotionById: vi.fn(),
  updatePromotion: vi.fn(),
  deletePromotion: vi.fn(),
}));

import type { Product } from '../../src/modules/products/products.repository.js';
import { findProductById } from '../../src/modules/products/products.repository.js';

import {
  createPromotionWithSchedules,
  deletePromotion,
  findPromotionById,
  type Promotion,
  updatePromotion,
} from '../../src/modules/promotions/promotions.repository.js';

import {
  createPromotionService,
  deletePromotionService,
  getPromotionByIdService,
  updatePromotionService,
} from '../../src/modules/promotions/promotions.service.js';

import { NotFoundError } from '../../src/shared/errors/not-found-error.js';
import { ValidationError } from '../../src/shared/errors/validation-error.js';

const productId = '550e8400-e29b-41d4-a716-446655440001';
const promotionId = '550e8400-e29b-41d4-a716-446655440002';

const product: Product = {
  id: productId,
  name: 'Chopp',
  price: '12.00',
  category: 'BEVERAGE',
  visible: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const promotion: Promotion = {
  id: promotionId,
  productId,
  description: 'Happy hour',
  promotionalPrice: '6.00',
  schedules: [{ id: 's', weekday: 3, startTime: '18:00', endTime: '20:00' }],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const validInput = {
  productId,
  description: 'Happy hour',
  promotionalPrice: 6,
  schedules: [{ weekday: 3, startTime: '18:00', endTime: '20:00' }],
};

describe('createPromotionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws NotFoundError when the product does not exist', async () => {
    vi.mocked(findProductById).mockResolvedValue(null);

    await expect(createPromotionService(validInput)).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(createPromotionWithSchedules).not.toHaveBeenCalled();
  });

  it('throws ValidationError when a window ends before it starts', async () => {
    vi.mocked(findProductById).mockResolvedValue(product);

    await expect(
      createPromotionService({
        ...validInput,
        schedules: [{ weekday: 3, startTime: '20:00', endTime: '18:00' }],
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('throws ValidationError when a window is shorter than 15 minutes', async () => {
    vi.mocked(findProductById).mockResolvedValue(product);

    await expect(
      createPromotionService({
        ...validInput,
        schedules: [{ weekday: 3, startTime: '18:00', endTime: '18:10' }],
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('accepts a window of exactly 15 minutes', async () => {
    vi.mocked(findProductById).mockResolvedValue(product);
    vi.mocked(createPromotionWithSchedules).mockResolvedValue(promotion);

    await createPromotionService({
      ...validInput,
      schedules: [{ weekday: 3, startTime: '18:00', endTime: '18:15' }],
    });

    expect(createPromotionWithSchedules).toHaveBeenCalled();
  });

  it('creates the promotion for an existing product', async () => {
    vi.mocked(findProductById).mockResolvedValue(product);
    vi.mocked(createPromotionWithSchedules).mockResolvedValue(promotion);

    const result = await createPromotionService(validInput);

    expect(createPromotionWithSchedules).toHaveBeenCalledWith(validInput);
    expect(result).toEqual(promotion);
  });
});

describe('getPromotionByIdService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the promotion when it exists', async () => {
    vi.mocked(findPromotionById).mockResolvedValue(promotion);

    const result = await getPromotionByIdService(promotionId);

    expect(findPromotionById).toHaveBeenCalledWith(promotionId);
    expect(result).toEqual(promotion);
  });

  it('throws NotFoundError when the promotion does not exist', async () => {
    vi.mocked(findPromotionById).mockResolvedValue(null);

    await expect(
      getPromotionByIdService(promotionId),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('updatePromotionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws ValidationError before touching the database on invalid windows', async () => {
    await expect(
      updatePromotionService(promotionId, {
        schedules: [{ weekday: 3, startTime: '18:00', endTime: '18:10' }],
      }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(updatePromotion).not.toHaveBeenCalled();
  });

  it('throws NotFoundError when the promotion does not exist', async () => {
    vi.mocked(updatePromotion).mockResolvedValue(null);

    await expect(
      updatePromotionService(promotionId, { description: 'Nova' }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('replaces schedules when provided', async () => {
    const newSchedules = [
      { weekday: 5, startTime: '18:00', endTime: '22:00' },
    ];

    vi.mocked(updatePromotion).mockResolvedValue({
      ...promotion,
      schedules: [{ id: 's2', ...newSchedules[0] }],
    });

    const result = await updatePromotionService(promotionId, {
      schedules: newSchedules,
    });

    expect(updatePromotion).toHaveBeenCalledWith(promotionId, {
      description: undefined,
      promotionalPrice: undefined,
      schedules: newSchedules,
    });
    expect(result.schedules).toHaveLength(1);
  });
});

describe('deletePromotionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws NotFoundError when the promotion does not exist', async () => {
    vi.mocked(deletePromotion).mockResolvedValue(false);

    await expect(deletePromotionService(promotionId)).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('resolves when the promotion is deleted', async () => {
    vi.mocked(deletePromotion).mockResolvedValue(true);

    await expect(
      deletePromotionService(promotionId),
    ).resolves.toBeUndefined();
  });
});