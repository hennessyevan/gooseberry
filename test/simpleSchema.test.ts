import mongoose from "mongoose"
import { test, expect } from "@oclif/test"

const Schema = mongoose.Schema
const Post = mongoose.model(
  "post",
  new Schema({
    title: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "user"
    }
  })
)

const User = mongoose.model(
  "user",
  new Schema({
    firstName: String,
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "post"
      }
    ]
  })
)

describe("Cross-Model ID Population", () => {
  it("Recursively assigns the correct IDs to the smart ID fields", () => {})
})
