import { Schema, model, Types } from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

const videoSchema = new Schema(
  {
    videoFile: {
      type: String,
      required: [true, 'Video url must be provided.'],
    },
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail url must be provided.'],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
)

videoSchema.plugin(mongooseAggregatePaginate)
const Video = model('User', videoSchema)

export { Video }
