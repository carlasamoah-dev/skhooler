/**
 * Health check routes
 */
import express from 'express';
import { prisma } from '../../config/database.js';
import { redis } from '../../config/redis.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const result = {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    checks: {}
  };

  try {
    const startDB = process.hrtime.bigint();
    await prisma.$queryRaw`SELECT 1`;
    const latencyDB = Number(process.hrtime.bigint() - startDB) / 1000000;
    result.checks.database = { status: 'healthy', latency: latencyDB };
  } catch (error) {
    result.checks.database = { status: 'unhealthy', error: error.message };
    result.status = 'degraded';
  }

  try {
    const startRedis = process.hrtime.bigint();
    await redis.ping();
    const latencyRedis = Number(process.hrtime.bigint() - startRedis) / 1000000;
    result.checks.redis = { status: 'healthy', latency: latencyRedis };
  } catch (error) {
    result.checks.redis = { status: 'unhealthy', error: error.message };
    result.status = 'degraded';
  }

  const memUsage = process.memoryUsage();
  result.checks.memory = {
    status: 'healthy',
    usage: memUsage,
    heapUsed: memUsage.heapUsed,
    heapTotal: memUsage.heapTotal
  };

  if (result.status === 'degraded' && (result.checks.database.status === 'unhealthy' || result.checks.redis.status === 'unhealthy')) {
    return res.status(503).json(result);
  }

  res.json(result);
});

export default router;
