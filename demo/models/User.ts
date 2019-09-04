import * as mongoose from "mongoose"

const RoleSchema = new mongoose.Schema(
  {
    level: {
      type: Number,
      required: true,
      enum: [1, 2, 3]
    },
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "domain"
    },
    domain: String
  },
  {
    _id: false
  }
)

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
    },
    nested: {
      nested: {
        nested: {
          nested: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
          }
        }
      }
    },
    roles: [RoleSchema]
  })
)
