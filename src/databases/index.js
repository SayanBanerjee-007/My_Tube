import mongoose from 'mongoose'
import { DATABASE_NAME, MONGODB_URI } from '../constants.js'

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${MONGODB_URI}/${DATABASE_NAME}`
    )
    console.log(`Database Connected at:  ${connectionInstance.connection.host}`)
  } catch (error) {
    console.log('MongoDB Connection FAILED:\n', error)
    process.exit(1)
  }
}

export default connectDB
