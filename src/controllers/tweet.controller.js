import mongoose, { isValidObjectId } from 'mongoose'
import { Tweet } from '../models/tweet.model.js'
import { User } from '../models/user.model.js'
import {
  asyncHandler,
  ApiError,
  ApiResponse,
  paginateArray,
} from '../utils/index.js'

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body
  if (!content?.trim()) {
    throw new ApiError(400, 'Content is required.')
  }
  const tweet = await Tweet.create({
    content,
    owner: req.user._id,
  })

  res
    .status(201)
    .json(new ApiResponse(201, tweet, 'Tweet created successfully.'))
})

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params
  const { page = 1, limit = 10 } = req.query
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, 'Invalid user ID.')
  }
  const tweets = await Tweet.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(userId) },
    },
    {
      $lookup: {
        from: 'likes',
        localField: '_id',
        foreignField: 'tweet',
        as: 'likes',
      },
    },
    {
      $addFields: {
        totalLikes: { $size: '$likes' },
      },
    },
    {
      $project: {
        content: 1,
        totalLikes: 1,
        createdAt: 1,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ])

  const paginatedTweets = paginateArray(tweets, +page, +limit, 'tweets')
  res
    .status(200)
    .json(new ApiResponse(200, paginatedTweets, 'Tweets fetched successfully.'))
})

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, 'Invalid tweet ID.')
  }
  const { content } = req.body
  if (!content?.trim()) {
    throw new ApiError(400, 'Content is required.')
  }
  const tweet = await Tweet.findOneAndUpdate(
    {
      _id: tweetId,
      owner: req.user._id,
    },
    {
      $set: { content },
    },
    { new: true }
  )
  if (!tweet) {
    throw new ApiError(404, 'Tweet not found.')
  }
  res
    .status(200)
    .json(new ApiResponse(200, tweet, 'Tweet updated successfully.'))
})

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, 'Invalid tweet ID.')
  }
  const tweet = await Tweet.findOneAndDelete({
    _id: tweetId,
    owner: req.user._id,
  })
  if (!tweet) {
    throw new ApiError(404, 'Tweet not found.')
  }
  res
    .status(200)
    .json(new ApiResponse(200, null, 'Tweet deleted successfully.'))
})

export { createTweet, getUserTweets, updateTweet, deleteTweet }
