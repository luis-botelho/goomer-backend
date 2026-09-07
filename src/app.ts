import Fastify from 'fastify';
import { productsRoutes } from './modules/products/products.routes.js';

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
  
  return app;
}