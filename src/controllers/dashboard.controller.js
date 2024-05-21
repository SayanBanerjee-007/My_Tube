import mongoose from 'mongoose'
import { Video } from '../models/video.model.js'
import { Subscription } from '../models/subscription.model.js'
import { Like } from '../models/like.model.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

  const owner = req.user._id
  const totalVideoViews = await Video.aggregate([
    {
      $match: {
        owner,
      },
    },
    {
      $group: {
        _id: null,
        totalVideoViews: { $sum: '$views' },
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ])
  const totalSubscribers = await Subscription.countDocuments({ channel: owner })
  const totalVideos = await Video.countDocuments({ owner })
  const totalLikes = await Video.aggregate([
    {
      $match: {
        owner,
      },
    },
    {
      $lookup: {
        from: 'likes',
        localField: '_id',
        foreignField: 'video',
        as: 'likes',
      },
    },
    {
      $unwind: '$likes',
    },
    {
      $count: 'totalLikes',
    },
  ])

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalVideoViews: totalVideoViews[0]?.totalVideoViews || 0,
        totalSubscribers,
        totalVideos,
        totalLikes: totalLikes[0]?.totalLikes || 0,
      },
      'Channel stats fetched successfully.'
    )
  )
})

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
})

export { getChannelStats, getChannelVideos }
