import { Router } from 'express'
import {
  getSubscribedChannels,
  getSubscriberCount,
  getUserChannelSubscribers,
  toggleSubscription,
} from '../controllers/subscription.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const subscriptionRouter = Router()

subscriptionRouter.route('/').get(verifyJWT, getSubscribedChannels)
subscriptionRouter
  .route('/channel/:channelId')
  .get(getSubscriberCount)
  .post(verifyJWT, toggleSubscription)
subscriptionRouter.route('/user/:subscriberId').get(getUserChannelSubscribers)

export { subscriptionRouter }
