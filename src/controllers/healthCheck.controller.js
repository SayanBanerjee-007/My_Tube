import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import os from 'os'
import mongoose from 'mongoose'

const healthCheck = asyncHandler(async (_, res) => {
  const healthInfo = {
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    loadAverage: os.loadavg(),
    databaseStatus: mongoose.STATES[mongoose.connection.readyState],
  }
  res.status(200).json(new ApiResponse(200, healthInfo, 'OK'))
})

export { healthCheck }
