import { ListrTaskWrapper } from "listr"
import mongoose from "mongoose"
import { register } from "ts-node"
import { ListrContext } from "../commands/seed"
import { getModels, log, LogType } from "../utils"
import pEachSeries from "p-each-series"

export async function loadModels(ctx: ListrContext, task: ListrTaskWrapper) {
  ctx.models = await getModels(ctx.config.modelDir)
  // Connect mongoose
  await mongoose.connect(ctx.config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  await mongoose.connection.dropDatabase()

  const modelPromises = ctx.models.map(async model => {
    register({ transpileOnly: true })
    await require(model)
    return model
  })

  await pEachSeries(modelPromises, model => {
    task.output = model
  }).catch(err => task.report({ ...err, message: `${err.message} at Model Loading` }))
}
