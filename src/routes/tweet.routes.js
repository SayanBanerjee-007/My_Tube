import { Router } from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from '../controllers/tweet.controller.js'

const tweetRouter = Router()

tweetRouter.route('/').post(verifyJWT, createTweet)
tweetRouter.route('/user/:userId').get(getUserTweets)
tweetRouter
  .route('/:tweetId')
  .patch(verifyJWT, updateTweet)
  .delete(verifyJWT, deleteTweet)

export { tweetRouter }
