import type { FastifyInstance } from 'fastify';

import {
  createProductController,
  getProductByIdController,
  listProductsController,
  updateProductController,
} from './products.controller.js';

import {
  CreateProductBodySchema,
  ProductParamsSchema,
  UpdateProductBodySchema,
  type CreateProductBody,
  type ProductParams,
  type UpdateProductBody,
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

  app.patch<{
    Params: ProductParams;
    Body: UpdateProductBody;
  }>(
    '/products/:id',
    {
      schema: {
        params: ProductParamsSchema,
        body: UpdateProductBodySchema,
      },
    },
    updateProductController,
  );

}