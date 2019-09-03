import * as mongoose from "mongoose"

const commentSchema = new mongoose.Schema({
  comment: String,
  linkedTo: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "onModel"
  },
  onModel: String
})

export const PostModel = mongoose.model(
  "Post",
  new mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    tags: [String],
    nested: {
      nested: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    },
    comment: commentSchema
  })
)
