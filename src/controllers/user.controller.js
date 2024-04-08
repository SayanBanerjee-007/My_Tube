import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'
import {
  ApiResponse,
  ApiError,
  asyncHandler,
  uploadOnCloudinary,
} from '../utils/index.js'
import { REFRESH_TOKEN_SECRET, cookieOptions } from '../constants.js'
import { deleteFromCloudinary } from '../utils/cloudinary.js'
import mongoose from 'mongoose'

const generateAccessTokenAndRefreshToken = async user => {
  try {
    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }
  } catch (error) {
    throw new ApiError(
      500,
      'Something went wrong while generating access token and refresh token.'
    )
  }
}

const userRegister = asyncHandler(async (req, res) => {
  const { username, email, fullName, password } = req.body
  if (
    [username, email, fullName, password].some(
      field => field?.trim() === '' || field === undefined
    )
  ) {
    throw new ApiError(400, 'All fields are required.')
  }
  const doesUserExist = await User.findOne({
    $or: [
      {
        username,
      },
      {
        email,
      },
    ],
  })
  if (doesUserExist) {
    throw new ApiError(409, 'User with same username or email already exists.')
  }

  // Avatar checks and upload
  if (!req.files || !Array.isArray(req.files.avatar)) {
    throw new ApiError(400, 'Avatar is required.')
  }
  const avatarLocalPath = req.files.avatar[0].path
  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar is required.')
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  if (!avatar && !avatar.url) {
    throw new ApiError(400, 'Avatar is required.')
  }

  // Upload coverImage if given
  let coverImage
  if (Array.isArray(req.files.coverImage)) {
    const coverImageLocalPath = req.files.coverImage[0].path
    coverImage = await uploadOnCloudinary(coverImageLocalPath)
  }

  const user = await User.create({
    username: username.toLowerCase(),
    email,
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || '',
    password,
  })

  const createdUser = await User.findById(user._id).select(
    '-password -refreshToken'
  )

  if (!createdUser) {
    throw new ApiError(
      500,
      'Something went wrong while registering. Please try again.'
    )
  }
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, 'User registered successfully'))
})

const userLogin = asyncHandler(async (req, res) => {
  const { usernameEmail, password } = req.body
  if (
    [usernameEmail, password].some(
      field => field?.trim() === '' || field === undefined
    )
  ) {
    throw new ApiError(400, 'Both fields are required.')
  }

  const user = await User.findOne({
    $or: [{ username: usernameEmail }, { email: usernameEmail }],
  })
  if (!user) {
    // throw new ApiError(404, 'User not found.') // Changed due to security reasons
    throw new ApiError(401, 'Invalid user Credentials.')
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password)
  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Invalid user Credentials.')
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user)

  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })

  user.refreshToken = user.password = undefined

  return res
    .status(200)
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user, accessToken, refreshToken },
        'Login successful'
      )
    )
})

const userLogout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  )

  return res
    .status(200)
    .clearCookie('accessToken', cookieOptions)
    .clearCookie('refreshToken', cookieOptions)
    .json(new ApiResponse(200, {}, 'Logout successfully.'))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken
  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Unauthorized access.')
  }
  const decodedRefreshToken = jwt.verify(
    incomingRefreshToken,
    REFRESH_TOKEN_SECRET
  )
  if (
    !decodedRefreshToken ||
    typeof decodedRefreshToken !== 'object' ||
    !decodedRefreshToken._id
  ) {
    throw new ApiError(401, 'Invalid refresh Token.')
  }
  const user = await User.findById(decodedRefreshToken._id)
  if (
    !user ||
    !user.refreshToken ||
    user.refreshToken !== incomingRefreshToken
  ) {
    throw new ApiError(401, 'Invalid refresh Token.')
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user)

  res
    .status(200)
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken },
        'Access token refreshed successfully.'
      )
    )
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (
    [currentPassword, newPassword].some(
      field => field?.trim() === '' || field === undefined
    )
  ) {
    throw new ApiError(400, 'Both fields are required.')
  }

  const isPasswordCorrect = await req.user.isPasswordCorrect(currentPassword)
  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Invalid current password.')
  }

  req.user.password = newPassword
  await req.user.save({ validateBeforeSave: false })

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Password changed successfully.'))
})

const getCurrentUser = asyncHandler(async (req, res) => {
  req.user.refreshToken = req.user.password = undefined
  return res
    .status(200)
    .json(
      new ApiResponse(200, req.user, 'Current user retrieved successfully.')
    )
})

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body
  console.log(fullName, email)
  if (!fullName && !email) {
    throw new ApiError(
      400,
      'At least one field (fullName or email) is required.'
    )
  }

  if (fullName) {
    req.user.fullName = fullName
  }

  if (email) {
    req.user.email = email
  }

  await req.user.save()

  return res
    .status(200)
    .json(
      new ApiResponse(200, req.user, 'Account details updated successfully.')
    )
})

const updateUserAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Avatar is required.')
  }
  const avatarLocalPath = req.file.path
  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar is required.')
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  if (!avatar) {
    throw new ApiError(400, 'Avatar is required.')
  }

  const deletionResponse = await deleteFromCloudinary(req.user.avatar)
  if (!deletionResponse) {
    throw new ApiError(
      500,
      'Something went wrong while deleting previous avatar image.'
    )
  }
  req.user.avatar = avatar.url
  await req.user.save({ validateBeforeSave: false })

  req.user.refreshToken = req.user.password = undefined
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, 'Avatar updated successfully.'))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Cover image is required.')
  }
  const coverImageLocalPath = req.file.path
  if (!coverImageLocalPath) {
    throw new ApiError(400, 'Cover image is required.')
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  if (!coverImage) {
    throw new ApiError(400, 'Cover image is required.')
  }

  if (req.user.coverImage) {
    const deletionResponse = await deleteFromCloudinary(req.user.coverImage)
    if (!deletionResponse) {
      throw new ApiError(
        500,
        'Something went wrong while deleting previous cover image.'
      )
    }
  }
  req.user.coverImage = coverImage.url
  await req.user.save({ validateBeforeSave: false })

  req.user.refreshToken = req.user.password = undefined
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, 'Cover image updated successfully.'))
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params
  if (!username?.trim()) {
    throw new ApiError(400, 'Username is required.')
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: 'subscriptions',
        localField: '_id',
        foreignField: 'channel',
        as: 'subscribers',
      },
    },
    {
      $lookup: {
        from: 'subscriptions',
        localField: '_id',
        foreignField: 'subscriber',
        as: 'subscribedTo',
      },
    },
    {
      $addFields: {
        subscriberCount: { $size: '$subscribers' },
        subscribedToCount: { $size: '$subscribedTo' },
        isSubscribed: {
          $cond: {
            if: {
              $in: [req.user?._id, '$subscribers.subscriber'],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscriberCount: 1,
        subscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ])

  if (!channel || channel.length === 0) {
    throw new ApiError(404, 'Channel not found.')
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channel[0],
        'Channel profile retrieved successfully.'
      )
    )
})

const getUserWatchHistory = asyncHandler(async (req, res) => {
  const watchHistory = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: 'videos',
        localField: 'watchHistory',
        foreignField: '_id',
        as: 'watchHistory',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'owner',
              foreignField: '_id',
              as: 'owner',
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: '$owner',
              },
            },
          },
        ],
      },
    },
    {
      $project: {
        watchHistory: 1,
      },
    },
  ])
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        watchHistory[0],
        'Watch history fetched successfully.'
      )
    )
})

export {
  userRegister,
  userLogin,
  userLogout,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getUserWatchHistory,
}
