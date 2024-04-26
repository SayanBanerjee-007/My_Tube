import jwt from 'jsonwebtoken'
import { ApiError, asyncHandler } from './index.js'
import { ACCESS_TOKEN_SECRET } from '../constants.js'
import { User } from '../models/user.model.js'

const getCurrentUser = async req => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return null
    }
    const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET)
    const user = await User.findById(decodedToken?._id)
    if (!user) {
      return null
    }
    return user
  } catch (error) {
    throw new ApiError(
      error.statusCode,
      error.message || 'Invalid access token.'
    )
  }
}

export { getCurrentUser }
