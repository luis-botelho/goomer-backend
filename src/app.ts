import Fastify from 'fastify';

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

  return app;
}