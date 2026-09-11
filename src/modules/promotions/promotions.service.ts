import { NotFoundError } from '../../shared/errors/not-found-error.js';
import { ValidationError } from '../../shared/errors/validation-error.js';
import { findProductById } from '../products/products.repository.js';

import type {
  CreatePromotionBody,
  PromotionScheduleInput,
  UpdatePromotionBody,
} from './promotions.schema.js';

import {
  createPromotionWithSchedules,
  deletePromotion,
  findAllPromotions,
  findPromotionById,
  updatePromotion,
  type Promotion,
} from './promotions.repository.js';

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);

  return hours * 60 + minutes;
}

function validateSchedules(
  schedules: PromotionScheduleInput[],
): void {
  for (const schedule of schedules) {
    const start = timeToMinutes(schedule.startTime);
    const end = timeToMinutes(schedule.endTime);

    if (end <= start) {
      throw new ValidationError(
        `Schedule end time must be after start time (${schedule.startTime} → ${schedule.endTime})`,
      );
    }

    if (end - start < 15) {
      throw new ValidationError(
        `Schedule window must be at least 15 minutes long (${schedule.startTime} → ${schedule.endTime})`,
      );
    }
  }
}

export async function createPromotionService(
  input: CreatePromotionBody,
): Promise<Promotion> {
  const product = await findProductById(input.productId);

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  validateSchedules(input.schedules);

  return createPromotionWithSchedules({
    productId: input.productId,
    description: input.description,
    promotionalPrice: input.promotionalPrice,
    schedules: input.schedules,
  });
}

export async function listPromotionsService(): Promise<Promotion[]> {
  return findAllPromotions();
}

export async function getPromotionByIdService(
  id: string,
): Promise<Promotion> {
  const promotion = await findPromotionById(id);

  if (!promotion) {
    throw new NotFoundError('Promotion not found');
  }

  return promotion;
}

export async function updatePromotionService(
  id: string,
  input: UpdatePromotionBody,
): Promise<Promotion> {
  if (input.schedules) {
    validateSchedules(input.schedules);
  }

  const promotion = await updatePromotion(id, {
    description: input.description,
    promotionalPrice: input.promotionalPrice,
    schedules: input.schedules,
  });

  if (!promotion) {
    throw new NotFoundError('Promotion not found');
  }

  return promotion;
}

export async function deletePromotionService(
  id: string,
): Promise<void> {
  const deleted = await deletePromotion(id);

  if (!deleted) {
    throw new NotFoundError('Promotion not found');
  }
}