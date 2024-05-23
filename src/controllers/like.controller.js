import { isValidObjectId } from 'mongoose'
import { Like } from '../models/like.model.js'
import {
  asyncHandler,
  ApiError,
  ApiResponse,
  paginateArray,
} from '../utils/index.js'
import { Video } from '../models/video.model.js'
import { Comment } from '../models/comment.model.js'
import { Tweet } from '../models/tweet.model.js'

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, 'Invalid video id.')
  }

  const video = await Video.findById(videoId)
  if (!video || video.isPublished === false) {
    throw new ApiError(404, 'Video not found.')
  }

  const likedBy = req.user._id
  const like = await Like.findOne({ likedBy, video: videoId })

  if (like) {
    await Like.deleteOne({ _id: like._id })
    return res.status(200).json(new ApiResponse(200, null, 'Video disliked.'))
  }

  await Like.create({ likedBy, video: videoId })
  res.status(201).json(new ApiResponse(201, null, 'Video liked.'))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, 'Invalid comment id.')
  }

  const comment = await Comment.findById(commentId)
  if (!comment) {
    throw new ApiError(404, 'Comment not found.')
  }

  const likedBy = req.user._id
  const like = await Like.findOne({ likedBy, comment: commentId })

  if (like) {
    await Like.deleteOne({ _id: like._id })
    return res.status(200).json(new ApiResponse(200, null, 'Comment disliked.'))
  }

  await Like.create({ likedBy, comment: commentId })
  res.status(201).json(new ApiResponse(201, null, 'Comment liked.'))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, 'Invalid tweet id.')
  }

  const tweet = await Tweet.findById(tweetId)
  if (!tweet) {
    throw new ApiError(404, 'Tweet not found.')
  }

  const likedBy = req.user._id
  const like = await Like.findOne({ likedBy, tweet: tweetId })

  if (like) {
    await Like.deleteOne({ _id: like._id })
    return res.status(200).json(new ApiResponse(200, null, 'Tweet disliked.'))
  }

  await Like.create({ likedBy, tweet: tweetId })
  res.status(201).json(new ApiResponse(201, null, 'Tweet liked.'))
})

const getLikedVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query
  const likedBy = req.user._id
  const like = await Like.find({ likedBy, video: { $exists: true } })
    .populate('video')
    .sort({ createdAt: -1 })

  const videos = like.map(l => l.video)

  const paginatedVideos = paginateArray(videos, page, limit)

  return res
    .status(200)
    .json(new ApiResponse(200, paginatedVideos, 'Liked videos fetched.'))
})

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos }
