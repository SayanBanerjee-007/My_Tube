import mongoose, { isValidObjectId } from 'mongoose'
import { Playlist } from '../models/playlist.model.js'
import { asyncHandler, ApiError, ApiResponse } from '../utils/index.js'

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body
  if (!name || !description) {
    throw new ApiError(400, 'Name and description are required.')
  }
  const newPlaylist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  })
  return res
    .status(201)
    .json(new ApiResponse(201, newPlaylist, 'Playlist created successfully.'))
})

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, 'Invalid playlist ID.')
  }
  const playlist = await Playlist.findById(playlistId).populate('video')
  if (!playlist) {
    throw new ApiError(404, 'Playlist not found.')
  }
  return res.status(200).json(new ApiResponse(200, playlist, 'Playlist found.'))
})
const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, 'Invalid playlist ID.')
  }
  const playlist = await Playlist.findById(playlistId)
  if (!playlist) {
    throw new ApiError(404, 'Playlist not found.')
  }
  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(401, 'You are not authorized to delete this playlist.')
  }
  await playlist.remove()
  return res.status(200).json(new ApiResponse(200, null, 'Playlist deleted.'))
})
const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params
  const { name, description } = req.body
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, 'Invalid playlist ID.')
  }
  if (!name && !description) {
    throw new ApiError(400, 'Name and description are required.')
  }
  const playlist = await Playlist.findById(playlistId)
  if (!playlist) {
    throw new ApiError(404, 'Playlist not found.')
  }
  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(401, 'You are not authorized to update this playlist.')
  }
  playlist.name = name || playlist.name
  playlist.description = description || playlist.description
  await playlist.save()
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, 'Playlist updated successfully.'))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, 'Invalid playlist or video ID.')
  }
  const playlist = await Playlist.findById(playlistId)
  if (!playlist) {
    throw new ApiError(404, 'Playlist not found.')
  }
  const videoIndex = playlist.videos.findIndex(
    v => v.toString() === videoId.toString()
  )
  if (videoIndex !== -1) {
    throw new ApiError(400, 'Video already in playlist.')
  }
  playlist.videos.push(videoId)
  await playlist.save()
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, 'Video added to playlist.'))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, 'Invalid playlist or video ID.')
  }
  const playlist = await Playlist.findById(playlistId)
  if (!playlist) {
    throw new ApiError(404, 'Playlist not found.')
  }
  const videoIndex = playlist.videos.findIndex(
    v => v.toString() === videoId.toString()
  )
  if (videoIndex === -1) {
    throw new ApiError(400, 'Video not in playlist.')
  }
  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(401, 'You are not authorized to remove this video.')
  }
  playlist.videos.splice(videoIndex, 1)
  await playlist.save()
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, 'Video removed from playlist.'))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, 'Invalid user ID.')
  }
  const playlists = await Playlist.find({ owner: userId }).populate('videos')
  return res
    .status(200)
    .json(new ApiResponse(200, playlists, 'Playlists found.'))
})

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
}
