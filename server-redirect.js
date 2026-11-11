/** Frontend-only wallet host. Does not activate legacy financial/API services. */
import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import helmet from 'helmet';

const root = path.dirname(fileURLToPath(import.meta.url));

export async function createWalletApp({ development = false, publicDir = path.join(root, 'dist/public') } = {}) {
  const app = express();
  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

  // Register before static/SPA middleware for every method, including unknown APIs.
  for (const prefix of ['/api', '/wallet/api', '/dapp/api']) {
    app.use(prefix, (_req, res) => {
      res.status(503).json({ error: 'API unavailable', scope: 'frontend-only' });
    });
  }
  const indexPath = path.join(publicDir, 'index.html');
  app.get('/health', (_req, res) => {
    const available = development || fs.existsSync(indexPath);
    res.status(available ? 200 : 503).json({
      status: available ? 'available' : 'not-built',
      scope: 'frontend-only',
      api: 'unavailable',
    });
  });
  app.get('/', (_req, res) => res.redirect('/dapp'));

  let vite;
  if (development) {
    const { createServer } = await import('vite');
    vite = await createServer({
      configFile: path.join(root, 'vite.config.js'),
      server: { middlewareMode: true },
    });
    app.use(vite.middlewares);
  } else {
    // Vite emits absolute /assets URLs. Serve the build at the origin as well
    // as the historical wallet/dapp aliases; never fall back to HTML for assets.
    const options = { index: false, redirect: false };
    app.use(express.static(publicDir, options));
    app.use('/wallet', express.static(publicDir, options));
    app.use('/dapp', express.static(publicDir, options));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/assets/') || path.extname(req.path) || !req.accepts('html')) return next();
      if (!fs.existsSync(indexPath)) return res.status(503).send('Frontend not built. Run npm run build first.');
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(indexPath);
    });
  }
  app.use((_req, res) => res.status(404).send('Not found'));
  return { app, close: async () => { await vite?.close(); } };
}

export async function startWalletServer({ development = false, port = process.env.PORT ?? 3000, host = '0.0.0.0' } = {}) {
  const parsedPort = Number(port);
  if (!Number.isInteger(parsedPort) || parsedPort < 0 || parsedPort > 65535) throw new Error('Invalid PORT');
  const { app, close } = await createWalletApp({ development });
  const server = app.listen(parsedPort, host, () => {
    console.log(`Aetherion frontend-only wallet listening on port ${server.address().port}; API unavailable`);
  });
  const shutdown = () => server.close(() => { void close(); });
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
  server.once('error', async (error) => {
    console.error(error.message);
    await close();
    process.exitCode = 1;
  });
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await startWalletServer();
}
