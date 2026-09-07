import type { FastifyInstance } from 'fastify';

import {
  createProductController,
  listProductsController,
} from './products.controller.js';
import {
  CreateProductBodySchema,
  type CreateProductBody,
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
}