import fs from 'fs'
import { v2 as cloudinary } from 'cloudinary'
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from '../constants.js'

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
})

const uploadOnCloudinary = async filePath => {
  try {
    if (!filePath) return null
    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: 'auto',
    })
    console.log('File is uploaded successfully. Response:\n', response)
    return response
  } catch (error) {
    console.log('File is not uploaded successfully. Error:\n', error)
  } finally {
    fs.unlinkSync(filePath)
  }
}

const deleteFromCloudinary = async url => {
  try {
    if (!url || typeof url !== 'string') return null
    const publicId = url.split('/').at(-1).split('.')[0]
    const response = await cloudinary.uploader.destroy(publicId)
    console.log('Image is deleted successfully. Response:\n', response)
    return response
  } catch (error) {
    console.log('Image is not deleted successfully. Error:\n', error)
  }
}

export { uploadOnCloudinary, deleteFromCloudinary }
