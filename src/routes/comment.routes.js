import { Router } from 'express'
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from '../controllers/comment.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const commentRouter = Router()

commentRouter
  .route('/:videoId')
  .get(getVideoComments)
  .post(verifyJWT, addComment)
commentRouter
  .route('/id/:commentId')
  .patch(verifyJWT, updateComment)
  .delete(verifyJWT, deleteComment)

export { commentRouter }
