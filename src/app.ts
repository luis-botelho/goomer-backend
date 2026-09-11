import Fastify from 'fastify';
import { menuRoutes } from './modules/menu/menu.routes.js';
import { productsRoutes } from './modules/products/products.routes.js';
import { promotionsRoutes } from './modules/promotions/promotions.routes.js';
import { errorHandler } from './shared/errors/error-handler.js';

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.get('/health', async () => {
    return {
      status: 'ok',
    };
  });

  app.register(productsRoutes);
  app.register(promotionsRoutes);
  app.register(menuRoutes);
  app.setErrorHandler(errorHandler);

  return app;
}