import express, { Application } from 'express'
import cors from 'cors'
import compression from 'compression'
import path from 'path'
import 'express-async-errors'
import { env } from './config/env'
import { errorHandler } from './middleware/errorHandler'
import { httpLogger } from './middleware/logger'
import { systemRouter } from './modules/system'
import { authRouter } from './modules/auth'
import { articleRouter } from './modules/articles'
import { tagRouter } from './modules/tags'
import { userRouter } from './modules/users'
import { settingsRouter } from './modules/settings'
import { mediaRouter } from './modules/media'
import { exportRouter } from './modules/export'

export const createApp = (): Application => {
  const app = express()

  app.use(httpLogger)

  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN,
      credentials: env.CORS_ORIGIN !== '*',
    })
  )

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(compression())

  // Serve uploaded files
  app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)))

  // API routes
  const api = env.API_PREFIX

  app.use(`${api}`, systemRouter)
  app.use(`${api}/auth`, authRouter)
  app.use(`${api}/articles`, articleRouter)
  app.use(`${api}/tags`, tagRouter)
  app.use(`${api}/users`, userRouter)
  app.use(`${api}/settings`, settingsRouter)
  app.use(`${api}/media`, mediaRouter)
  app.use(`${api}/export`, exportRouter)

  app.use(errorHandler)

  return app
}
