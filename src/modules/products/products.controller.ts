import type { FastifyReply, FastifyRequest } from 'fastify';

import type {
  CreateProductBody,
  ProductParams,
} from './products.schema.js';

import {
  createProductService,
  getProductByIdService,
  listProductsService,
} from './products.service.js';

type CreateProductRequest = FastifyRequest<{
  Body: CreateProductBody;
}>;

type GetProductByIdRequest = FastifyRequest<{
  Params: ProductParams;
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

export async function getProductByIdController(
  request: GetProductByIdRequest,
  reply: FastifyReply,
) {
  const product = await getProductByIdService(request.params.id);

  return reply.status(200).send(product);
}