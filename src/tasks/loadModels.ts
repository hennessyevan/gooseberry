import { ListrTaskWrapper } from "listr"
import mongoose from "mongoose"
import { register } from "ts-node"
import { ListrContext } from "../commands/seed"
import { getModels } from "../utils"

export async function loadModels(ctx: ListrContext, task: ListrTaskWrapper) {
  ctx.models = await getModels(ctx.config.modelDir)
  // Connect mongoose
  await mongoose.connect(ctx.config.mongoURI, { useNewUrlParser: true })
  await mongoose.connection.dropDatabase()

  const modelPromises = ctx.models.map(async model => {
    task.output = model
    register({ transpileOnly: true })
    await require(model)
  })

  await Promise.all(modelPromises)
}
