import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { authMiddleware } from './server/middleware/auth.ts';
import { authRouter } from './server/routes/auth.ts';
import { orgsRouter } from './server/routes/organizations.ts';
import { servicesRouter } from './server/routes/services.ts';
import { projectsRouter } from './server/routes/projects.ts';
import { documentsRouter } from './server/routes/documents.ts';
import { messagesRouter } from './server/routes/messages.ts';
import { billingRouter } from './server/routes/billing.ts';
import { supportRouter } from './server/routes/support.ts';
import { integrationsRouter } from './server/routes/integrations.ts';
import { auditRouter } from './server/routes/audit.ts';
import { securityTestsRouter } from './server/routes/security-tests.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // JSON Body Parser (25MB limit for document uploads)
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Basic security headers
  app.use((_req, res, next) => {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Public/Unauthenticated API routes
  app.use('/api/auth', authRouter);

  // Authenticated API routes with RBAC & Tenant Isolation
  app.use('/api/organizations', authMiddleware, orgsRouter);
  app.use('/api/services', authMiddleware, servicesRouter);
  app.use('/api/projects', authMiddleware, projectsRouter);
  app.use('/api/documents', authMiddleware, documentsRouter);
  app.use('/api/messages', authMiddleware, messagesRouter);
  app.use('/api/billing', authMiddleware, billingRouter);
  app.use('/api/support', authMiddleware, supportRouter);
  app.use('/api/integrations', authMiddleware, integrationsRouter);
  app.use('/api/audit-logs', authMiddleware, auditRouter);
  app.use('/api/security-tests', securityTestsRouter);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'operational',
      brand: 'Universal Tech INC',
      version: '2.5.0-enterprise',
      timestamp: new Date().toISOString(),
    });
  });

  // Client SPA integration
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Mount Vite in development mode
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Universal Tech Portal] Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Universal Tech Portal] Failed to start server:', err);
  process.exit(1);
});
