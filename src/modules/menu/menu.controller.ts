import type { FastifyReply, FastifyRequest } from 'fastify';

import { getMenuService } from './menu.service.js';

export async function getMenuController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  const menu = await getMenuService();

  return reply.status(200).send(menu);
}