import { Schema, model } from 'mongoose'

const likeSchema = new Schema(
  {
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
      required: true,
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      required: true,
    },
    tweet: {
      type: Schema.Types.ObjectId,
      ref: 'Tweet',
      required: true,
    },
  },
  { timestamps: true }
)

const Like = model('Like', likeSchema)

export { Like }
