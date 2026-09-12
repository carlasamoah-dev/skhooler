/**
 * CORS configuration
 */
import { env } from '../config/env.js';

export const corsOptions = {
  origin: function (origin, callback) {
    if (env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      if (origin === env.CLIENT_URL) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
};
