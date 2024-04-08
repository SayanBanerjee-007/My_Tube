import { Router } from 'express'
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getUserWatchHistory,
  refreshAccessToken,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  userLogin,
  userLogout,
  userRegister,
} from '../controllers/user.controller.js'
import { upload } from '../middlewares/multer.middleware.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const userRouter = Router()

// Controllers
userRouter.route('/register').post(
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    {
      name: 'coverImage',
      maxCount: 1,
    },
  ]),
  userRegister
)
userRouter.route('/login').post(userLogin)
userRouter.route('/logout').delete(verifyJWT, userLogout)
userRouter.route('/refresh-access-token').post(refreshAccessToken)
userRouter
  .route('/change-current-password')
  .post(verifyJWT, changeCurrentPassword)
userRouter.route('/get-current-user').get(verifyJWT, getCurrentUser)
userRouter
  .route('/update-account-details')
  .patch(verifyJWT, updateAccountDetails)
userRouter
  .route('/update-user-avatar')
  .patch(verifyJWT, upload.single('avatar'), updateUserAvatar)
userRouter
  .route('/update-user-cover-image')
  .patch(verifyJWT, upload.single('coverImage'), updateUserCoverImage)
userRouter.route('/channel/:username').get(getUserChannelProfile)
userRouter.route('/get-user-watch-history').get(verifyJWT, getUserWatchHistory)

export { userRouter }
