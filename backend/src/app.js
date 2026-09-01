import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { corsOptions } from './middleware/cors.js'
import { requestLogger } from './middleware/requestLogger.js'
import { backpressureGuard } from './middleware/backpressure.js'
import { globalLimiter } from './middleware/rateLimiter.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import authRoutes from './modules/auth/auth.routes.js'
import healthRoutes from './modules/health/health.routes.js'

const app = express()

// 1. Security headers
app.use(helmet())

// 2. CORS
app.use(cors(corsOptions))

// 3. Body parser with size limit
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 4. Request logging
app.use(requestLogger)

// 5. Backpressure guard
app.use(backpressureGuard)

// 6. Global rate limit
app.use(globalLimiter)

// Routes
app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)

// Error handling (must be last)
app.use(notFoundHandler)
app.use(errorHandler)

export default app
