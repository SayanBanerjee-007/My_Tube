import { Router } from 'express'
import {
  createPlaylist,
  getPlaylistVideosById,
  updatePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  getUserPlaylists,
} from '../controllers/playlist.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const playlistRouter = Router()

playlistRouter.use(verifyJWT)

playlistRouter.route('/').post(createPlaylist)

playlistRouter
  .route('/:playlistId')
  .get(getPlaylistVideosById)
  .patch(updatePlaylist)
  .delete(deletePlaylist)

playlistRouter.route('/add/:videoId/:playlistId').patch(addVideoToPlaylist)
playlistRouter
  .route('/remove/:videoId/:playlistId')
  .patch(removeVideoFromPlaylist)

playlistRouter.route('/user/:userId').get(getUserPlaylists)

export { playlistRouter }
