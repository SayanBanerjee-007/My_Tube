import { Router } from 'express'
import {
  getChannelStats,
  getChannelVideos,
} from '../controllers/dashboard.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const dashboardRouter = Router()

dashboardRouter.use(verifyJWT)

dashboardRouter.route('/stats').get(getChannelStats)
dashboardRouter.route('/videos').get(getChannelVideos)

export { dashboardRouter }
