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
import groupRoutes from './modules/group/group.routes.js'
import postRoutes from './modules/post/post.routes.js'
import courseRoutes from './modules/course/course.routes.js'
import eventRoutes from './modules/event/event.routes.js'
import notificationRoutes from './modules/notification/notification.routes.js'
import billingRoutes from './modules/billing/billing.routes.js'
import searchRoutes from './modules/search/search.routes.js'
import integrationRoutes from './modules/integration/integration.routes.js'
import { groupAnalyticsRoutes, adminAnalyticsRoutes } from './modules/analytics/analytics.routes.js'
import uploadRoutes from './modules/upload/upload.routes.js'
import userRoutes from './modules/user/user.routes.js'

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
app.use('/api/groups', groupRoutes)
app.use('/api/groups/:slug/posts', postRoutes)
app.use('/api/groups/:slug/courses', courseRoutes)
app.use('/api/groups/:slug/events', eventRoutes)
app.use('/api/groups/search-global', searchRoutes)
app.use('/api/groups/:slug/search', searchRoutes)
app.use('/api/groups/:slug/integrations', integrationRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/billing', billingRoutes)
app.use('/api/groups/:slug/analytics', groupAnalyticsRoutes)
app.use('/api/admin/analytics', adminAnalyticsRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/users', userRoutes)

// Error handling (must be last)
app.use(notFoundHandler)
app.use(errorHandler)

export default app
