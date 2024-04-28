import mongoose, { isValidObjectId } from 'mongoose'
import { Video } from '../models/video.model.js'
import {
  asyncHandler,
  ApiError,
  ApiResponse,
  uploadOnCloudinary,
  deleteFromCloudinary,
  getCurrentUser,
  paginateArray,
} from '../utils/index.js'

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = 'createdAt',
    sortType = 'desc',
    userId,
  } = req.query

  const currentUser = await getCurrentUser(req)

  const videos = await Video.aggregate([
    {
      $match: {
        isPublished: true,
        ...(userId && {
          owner: new mongoose.Types.ObjectId(userId),
          isPublished:
            currentUser?._id.toHexString() === userId
              ? { $exists: true }
              : true,
        }),
        ...(query && {
          $or: [
            {
              title: {
                $regex: query,
                $options: 'i',
              },
            },
            {
              description: {
                $regex: query,
                $options: 'i',
              },
            },
          ],
        }),
      },
    },
    {
      $sort: {
        [sortBy]: sortType === 'desc' ? -1 : 1,
      },
    },
  ])
  const paginatedVideos = paginateArray(videos, +page, +limit, 'videos')

  res
    .status(200)
    .json(new ApiResponse(200, paginatedVideos, 'Videos fetched successfully.'))
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

  if (req.files.videoFile[0].mimetype !== 'video/mp4') {
    throw new ApiError(400, 'Video must be of type mp4.')
  }

  if (
    req.files.thumbnail[0].mimetype !== 'image/jpeg' &&
    req.files.thumbnail[0].mimetype !== 'image/png'
  ) {
    throw new ApiError(400, 'Thumbnail must be an image of type jpeg or png.')
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
    .json(new ApiResponse(201, uploadedVideo, 'Video uploaded successfully.'))
})

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, 'Invalid video id.')
  }

  const currentUser = await getCurrentUser(req)
  console.log('currentUser: ', currentUser)

  let video

  if (!currentUser) {
    video = await Video.findOneAndUpdate(
      { _id: videoId, isPublished: true },
      { $inc: { views: 1 } },
      { new: true }
    )
  } else {
    video = await Video.findById(videoId)
    if (
      video.owner.toString() !== currentUser._id.toString() &&
      video.isPublished
    ) {
      video.views += 1
      await video.save({ validateBeforeSave: false })
    }
  }
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
  if (req.file) {
    if (
      req.file.mimetype !== 'image/jpeg' &&
      req.file.mimetype !== 'image/png'
    ) {
      throw new ApiError(400, 'Thumbnail must be an image of type jpeg or png.')
    }
  }
  if (!req.file && !title?.trim() && !description?.trim()) {
    throw new ApiError(400, 'At least one field must be provided.')
  }
  const video = await Video.findOne({
    _id: videoId,
    owner: req.user._id,
  })
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

  const video = await Video.findOneAndDelete({
    _id: videoId,
    owner: req.user._id,
  })
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
    .status(200)
    .json(new ApiResponse(200, null, 'Video deleted successfully.'))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, 'Invalid video id.')
  }

  const video = await Video.findOne({
    _id: videoId,
    owner: req.user._id,
  })
  video.isPublished = !video.isPublished
  await video.save({ validateBeforeSave: false })

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
