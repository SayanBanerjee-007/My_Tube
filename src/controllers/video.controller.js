import mongoose, { isValidObjectId } from 'mongoose'
import { Video } from '../models/video.model.js'
import { User } from '../models/user.model.js'
import {
  asyncHandler,
  ApiError,
  ApiResponse,
  uploadOnCloudinary,
} from '../utils/index.js'
import { deleteFromCloudinary } from '../utils/cloudinary.js'

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
  //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body
  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(400, 'Title and description must be provided.')
  }
  if (
    !req.files ||
    !Array.isArray(req.files.videoFile) ||
    !Array.isArray(req.files.thumbnail)
  ) {
    throw new ApiError(400, 'Video and thumbnail must be provided.')
  }

  const videoLocalPath = req.files.videoFile[0].path
  const thumbnailLocalPath = req.files.thumbnail[0].path

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, 'Video and thumbnail must be provided.')
  }

  const [videoFile, thumbnail] = await Promise.all([
    uploadOnCloudinary(videoLocalPath),
    uploadOnCloudinary(thumbnailLocalPath),
  ])

  if (!videoFile?.url || !thumbnail?.url) {
    await Promise.all([
      deleteFromCloudinary(videoFile?.url),
      deleteFromCloudinary(thumbnail?.url),
    ])
    throw new ApiError(500, 'Error uploading video and thumbnail.')
  }

  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    owner: req.user._id,
    title,
    description,
    duration: videoFile.duration,
    isPublished: false,
  })

  const uploadedVideo = await Video.findById(video._id)
  if (!uploadedVideo) {
    await Promise.all([
      deleteFromCloudinary(videoFile.url),
      deleteFromCloudinary(thumbnail.url),
    ])
    throw new ApiError(500, 'Error fetching uploaded video. Please try again.')
  }

  res
    .status(201)
    .json(new ApiResponse(201, UploadedVideo, 'Video uploaded successfully.'))
})

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, 'Invalid video id.')
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $inc: { views: 1 },
    },
    { new: true }
  )
  if (!video) {
    throw new ApiError(404, 'Video not found.')
  }
  res
    .status(200)
    .json(new ApiResponse(200, video, 'Video fetched successfully.'))
})

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, 'Invalid video id.')
  }
  const { title, description } = req.body
  if (!req.file && !title?.trim() && !description?.trim()) {
    throw new ApiError(400, 'At least one field must be provided.')
  }
  const video = await Video.findById(videoId)
  if (!video) {
    throw new ApiError(404, 'Video not found.')
  }
  if (title?.trim()) {
    video.title = title
  }
  if (description?.trim()) {
    video.description = description
  }
  if (req.file?.path) {
    try {
      const thumbnail = await uploadOnCloudinary(req.file.path)
      if (!thumbnail?.url) {
        throw new Error('Error uploading thumbnail.')
      }
      await deleteFromCloudinary(video.thumbnail)
      video.thumbnail = thumbnail.url
    } catch (error) {
      throw new ApiError(500, 'Error uploading thumbnail.')
    }
  }
  try {
    await video.save({ validateBeforeSave: false })
  } catch (error) {
    throw new ApiError(500, 'Error saving video.')
  }

  res
    .status(200)
    .json(new ApiResponse(200, video, 'Video updated successfully.'))
})

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, 'Invalid video id.')
  }

  const video = await Video.findById(videoId)
  if (!video) {
    throw new ApiError(404, 'Video not found.')
  }

  try {
    await Promise.all([
      deleteFromCloudinary(video.videoFile),
      deleteFromCloudinary(video.thumbnail),
    ])
  } catch (error) {
    throw new ApiError(500, 'Error deleting video files from Cloudinary.')
  }

  try {
    await Video.findByIdAndDelete(videoId)
  } catch (error) {
    throw new ApiError(500, 'Error deleting video from the database.')
  }

  res
    .status(204)
    .json(new ApiResponse(204, null, 'Video deleted successfully.'))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, 'Invalid video id.')
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: { $not: '$isPublished' },
      },
    },
    { new: true }
  )
  if (!video) {
    throw new ApiError(404, 'Video not found.')
  }

  res
    .status(200)
    .json(new ApiResponse(200, video, 'Publish status toggled successfully.'))
})

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
}
