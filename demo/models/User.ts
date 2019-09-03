import * as mongoose from "mongoose"

export const UserModel = mongoose.model(
  "User",
  new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    likedPosts: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Post"
    }
  })
)
