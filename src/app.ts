import Fastify from 'fastify';
import { productsRoutes } from './modules/products/products.routes.js';
import { errorHandler } from './shared/errors/error-handler.js';

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  // Rota temporária apenas para provar que a aplicação está funcionando.
  app.get('/health', async () => {
    return {
      status: 'ok',
    };
  });

  app.register(productsRoutes);
  app.setErrorHandler(errorHandler);
  
  return app;
}