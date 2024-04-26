import { Router } from 'express'
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from '../controllers/video.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { upload } from '../middlewares/multer.middleware.js'

const videoRouter = Router()

videoRouter
  .route('/')
  .get(getAllVideos)
  .post(
    verifyJWT,
    upload.fields([
      {
        name: 'videoFile',
        maxCount: 1,
      },
      {
        name: 'thumbnail',
        maxCount: 1,
      },
    ]),
    publishAVideo
  )

videoRouter
  .route('/:videoId')
  .get(getVideoById)
  .patch(verifyJWT, upload.single('thumbnail'), updateVideo)
  .delete(verifyJWT, deleteVideo)

videoRouter
  .route('/toggle/publish/:videoId')
  .patch(verifyJWT, togglePublishStatus)

export { videoRouter }
