import { test } from "@oclif/test"
import { MongoMemoryServer } from "mongodb-memory-server"
import mongoose, { Mongoose, ConnectionOptions } from "mongoose"
import { Context } from "fancy-test/lib/types"

type GBTest = {
  mongoServer: MongoMemoryServer
  mongoose: Mongoose
}

export default test.register("initDB", (opts?: ConnectionOptions) => {
  return {
    async run(ctx: Context & GBTest) {
      ctx.mongoServer = new MongoMemoryServer()
      const mongoURI = await ctx.mongoServer.getConnectionString()
      ctx.mongoose = await mongoose.connect(mongoURI, { ...opts, useNewUrlParser: true })
    },
    async finally(ctx) {
      await ctx.mongoose.disconnect()
      await ctx.mongoServer.stop()
    }
  }
})
