import { ListrContext, ListrTaskWrapper } from "listr"
import mongoose from "mongoose"
import { generateData, getRefPaths } from "../utils"

export async function generate(ctx: ListrContext, task: ListrTaskWrapper) {
  const generationPromises = Object.keys(mongoose.models).map(async model => {
    task.output = model
    // Get model
    const mongooseModel = mongoose.model(model)
    // Get ref paths
    const refPaths = await getRefPaths(mongooseModel)
    // Here we insert whatever data is available and swap out ids later
    const data = await generateData(mongooseModel, refPaths, ctx.config)

    ctx.cache = { ...ctx.cache, ...data }
  })
  await Promise.all(generationPromises)
}
