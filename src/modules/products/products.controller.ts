import type { FastifyReply, FastifyRequest } from 'fastify';

import type { CreateProductBody } from './products.schema.js';
import {
  createProductService,
  listProductsService,
} from './products.service.js';


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

export async function listProductsController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  const products = await listProductsService();

  return reply.status(200).send(products);
}