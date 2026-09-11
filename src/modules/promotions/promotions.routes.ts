import type { FastifyInstance } from 'fastify';

import {
  createPromotionController,
  deletePromotionController,
  getPromotionByIdController,
  listPromotionsController,
  updatePromotionController,
} from './promotions.controller.js';

import {
  CreatePromotionBodySchema,
  PromotionParamsSchema,
  UpdatePromotionBodySchema,
  type CreatePromotionBody,
  type PromotionParams,
  type UpdatePromotionBody,
} from './promotions.schema.js';

export async function promotionsRoutes(app: FastifyInstance) {
  app.post<{ Body: CreatePromotionBody }>(
    '/promotions',
    {
      schema: {
        body: CreatePromotionBodySchema,
      },
    },
    createPromotionController,
  );

  app.get('/promotions', listPromotionsController);

  app.get<{ Params: PromotionParams }>(
    '/promotions/:id',
    {
      schema: {
        params: PromotionParamsSchema,
      },
    },
    getPromotionByIdController,
  );

  app.patch<{
    Params: PromotionParams;
    Body: UpdatePromotionBody;
  }>(
    '/promotions/:id',
    {
      schema: {
        params: PromotionParamsSchema,
        body: UpdatePromotionBodySchema,
      },
    },
    updatePromotionController,
  );

  app.delete<{ Params: PromotionParams }>(
    '/promotions/:id',
    {
      schema: {
        params: PromotionParamsSchema,
      },
    },
    deletePromotionController,
  );
}