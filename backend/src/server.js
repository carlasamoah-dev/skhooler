// 1. Import env first (validates environment)
import { env } from './config/env.js'
import { createServer } from 'http'
import app from './app.js'
import { setupSocket } from './config/socket.js'
import { prisma } from './config/database.js'
import { redis } from './config/redis.js'
import { logger } from './utils/logger.js'
import { startWorkers } from './jobs/workers.js'

const httpServer = createServer(app)
const io = setupSocket(httpServer)

// Make io accessible to routes if needed
app.set('io', io)

// Graceful shutdown
const shutdown = async (signal) => {
  logger.info({ signal }, 'Shutdown signal received')
  
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down')
    process.exit(1)
  }, 10000)

  // Stop accepting new connections
  httpServer.close()
  
  // Close Socket.io
  io.close()
  
  // Disconnect database
  await prisma.$disconnect()
  
  // Disconnect Redis
  await redis.quit()
  
  logger.info('Graceful shutdown complete')
  process.exit(0)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception')
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled rejection')
  process.exit(1)
})

httpServer.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Skhooler API server started')
})

// Start background workers
startWorkers()
