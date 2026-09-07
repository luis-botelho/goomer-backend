import type { FastifyReply, FastifyRequest } from 'fastify';

import type { CreateProductBody } from './products.schema.js';
import { createProductService } from './products.service.js';

type CreateProductRequest = FastifyRequest<{
  Body: CreateProductBody;
}>;

export async function createProductController(
  request: CreateProductRequest,
  reply: FastifyReply,
) {
  const product = await createProductService(request.body);

  return reply.status(201).send(product);
}