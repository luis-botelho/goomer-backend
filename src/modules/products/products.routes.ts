import type { FastifyInstance } from 'fastify';

import {
  createProductController,
  getProductByIdController,
  listProductsController,
} from './products.controller.js';

import {
  CreateProductBodySchema,
  ProductParamsSchema,
  type CreateProductBody,
  type ProductParams,
} from './products.schema.js';

export async function productsRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateProductBody }>(
    '/products',
    {
      schema: {
        body: CreateProductBodySchema,
      },
    },
    createProductController,
  );

  app.get('/products', listProductsController);

  app.get<{ Params: ProductParams }>(
  '/products/:id',
  {
    schema: {
      params: ProductParamsSchema,
    },
  },
  getProductByIdController,
);
  
}