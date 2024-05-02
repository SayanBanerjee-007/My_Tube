import mongoose, { isValidObjectId } from 'mongoose'
import { Subscription } from '../models/subscription.model.js'
import { asyncHandler, ApiError, ApiResponse } from '../utils/index.js'

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const channels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'channel',
        foreignField: '_id',
        as: 'channel',
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: '$channel',
    },
  ])
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { channels },
        'Subscribed channels list fetched successfully.'
      )
    )
})

const getSubscriberCount = asyncHandler(async (req, res) => {
  const { channelId } = req.params
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, 'Invalid channel ID.')
  }

  const subscriberCount = await Subscription.countDocuments({
    channel: channelId,
  })
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscriberCount },
        'Subscriber count fetched successfully.'
      )
    )
})

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, 'Invalid channel ID.')
  }

  const subscription = await Subscription.findOne({
    channel: channelId,
    subscriber: req.user._id,
  })
  if (subscription) {
    await Subscription.findByIdAndDelete(subscription._id)
    res
      .status(200)
      .json(new ApiResponse(200, null, 'Unsubscribed successfully.'))
  } else {
    await Subscription.create({
      channel: channelId,
      subscriber: req.user._id,
    })
    res.status(200).json(new ApiResponse(200, null, 'Subscribed successfully.'))
  }
})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, 'Invalid channel ID.')
  }
  if (req.user._id.toString() !== channelId) {
    throw new ApiError(403, 'You are not authorized to view this resource.')
  }
  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'subscriber',
        foreignField: '_id',
        as: 'subscriber',
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: '$subscriber',
    },
  ])

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscribers },
        'Subscribers list fetched successfully.'
      )
    )
})

export {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
  getSubscriberCount,
}
