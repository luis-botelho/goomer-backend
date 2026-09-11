import type { FastifyReply, FastifyRequest } from 'fastify';

import type {
  CreatePromotionBody,
  PromotionParams,
  UpdatePromotionBody,
} from './promotions.schema.js';

import {
  createPromotionService,
  deletePromotionService,
  getPromotionByIdService,
  listPromotionsService,
  updatePromotionService,
} from './promotions.service.js';

type CreatePromotionRequest = FastifyRequest<{
  Body: CreatePromotionBody;
}>;

type GetPromotionByIdRequest = FastifyRequest<{
  Params: PromotionParams;
}>;

type UpdatePromotionRequest = FastifyRequest<{
  Params: PromotionParams;
  Body: UpdatePromotionBody;
}>;

type DeletePromotionRequest = FastifyRequest<{
  Params: PromotionParams;
}>;

export async function createPromotionController(
  request: CreatePromotionRequest,
  reply: FastifyReply,
) {
  const promotion = await createPromotionService(request.body);

  return reply.status(201).send(promotion);
}

export async function listPromotionsController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  const promotions = await listPromotionsService();

  return reply.status(200).send(promotions);
}

export async function getPromotionByIdController(
  request: GetPromotionByIdRequest,
  reply: FastifyReply,
) {
  const promotion = await getPromotionByIdService(request.params.id);

  return reply.status(200).send(promotion);
}

export async function updatePromotionController(
  request: UpdatePromotionRequest,
  reply: FastifyReply,
) {
  const promotion = await updatePromotionService(
    request.params.id,
    request.body,
  );

  return reply.status(200).send(promotion);
}

export async function deletePromotionController(
  request: DeletePromotionRequest,
  reply: FastifyReply,
) {
  await deletePromotionService(request.params.id);

  return reply.status(204).send();
}