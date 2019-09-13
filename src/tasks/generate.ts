import { ListrContext, ListrTaskWrapper } from "listr"
import pEachSeries from "p-each-series"
import mongoose from "mongoose"
import { generateData, getRefPaths, log, LogType } from "../utils"

export async function generate(ctx: ListrContext, task: ListrTaskWrapper) {
  const generationPromises = Object.keys(mongoose.models).map(async model => {
    // Get model
    const mongooseModel = mongoose.model(model)
    // Get ref paths
    const refPaths = await getRefPaths(mongooseModel)
    // Here we insert whatever data is available and swap out ids later
    const data = await generateData(mongooseModel, refPaths, ctx.config)

    ctx.cache = { ...ctx.cache, ...data }
    return model
  })
  await pEachSeries(generationPromises, model => {
    task.output = model
  }).catch(err => log(err, LogType.error))
}
