import type { FastifyInstance } from 'fastify';

import { getMenuController } from './menu.controller.js';

export async function menuRoutes(app: FastifyInstance) {
  app.get('/menu', getMenuController);
}