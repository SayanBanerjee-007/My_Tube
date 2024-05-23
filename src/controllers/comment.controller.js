import mongoose from 'mongoose'
import { Comment } from '../models/comment.model.js'
import {
  asyncHandler,
  ApiError,
  ApiResponse,
  paginateArray,
} from '../utils/index.js'
import { Video } from '../models/video.model.js'

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortType = 'desc',
  } = req.query

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, 'Invalid video id.')
  }

  const comments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'owner',

        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: '$owner',
    },
    {
      $lookup: {
        from: 'likes',
        localField: '_id',
        foreignField: 'comment',
        as: 'likes',
      },
    },
    {
      $addFields: {
        likeCount: { $size: '$likes' },
      },
    },
    {
      $sort: {
        [sortBy]: sortType === 'asc' ? 1 : -1,
      },
    },
    {
      $project: {
        likes: 0,
      },
    },
  ])

  const paginatedComments = paginateArray(comments, page, limit)

  return res
    .status(200)
    .json(new ApiResponse(200, paginatedComments, 'Comments fetched.'))
})

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  const { content } = req.body
  const userId = req.user._id

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, 'Invalid video id.')
  }

  if (!content?.trim()) {
    throw new ApiError(400, 'Content is required.')
  }

  const alreadyCommented = await Comment.findOne({
    owner: userId,
    video: videoId,
  })
  if (alreadyCommented) {
    throw new ApiError(400, 'You have already commented on this video.')
  }

  const comment = await Comment.create({
    content: content.trim(),
    owner: userId,
    video: videoId,
  })

  return res.status(201).json(new ApiResponse(201, comment, 'Comment added.'))
})

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params
  const { content } = req.body
  const userId = req.user._id

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, 'Invalid comment id.')
  }
  if (!content?.trim()) {
    throw new ApiError(400, 'Content is required.')
  }

  const comment = await Comment.findById(commentId)
  if (!comment) {
    throw new ApiError(404, 'Comment not found.')
  }

  if (comment.owner.toString() !== userId.toString()) {
    throw new ApiError(403, 'You are not authorized to update this comment.')
  }

  comment.content = content.trim()
  await comment.save()

  return res.status(200).json(new ApiResponse(200, comment, 'Comment updated.'))
})

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params
  const userId = req.user._id

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, 'Invalid comment id.')
  }

  const comment = await Comment.findById(commentId)
  if (!comment) {
    throw new ApiError(404, 'Comment not found.')
  }

  const { _id: videoOwnerId } = await Video.findById(comment.video.toString(), {
    _id: 1,
  })

  if (
    comment.owner.toString() !== userId.toString() &&
    userId.toString() !== videoOwnerId.toString()
  ) {
    throw new ApiError(403, 'You are not authorized to delete this comment.')
  }

  await Comment.deleteOne({ _id: commentId })

  return res.status(200).json(new ApiResponse(200, null, 'Comment deleted.'))
})

export { getVideoComments, addComment, updateComment, deleteComment }
