import { ListrTaskWrapper } from "listr"
import mongoose from "mongoose"
import { ListrContext } from "../commands/seed"
import { log, LogType } from "../utils/log"

export async function createDocsFromData(ctx: ListrContext, task: ListrTaskWrapper) {
  if (ctx.cache) {
    const creationPromises = Object.entries(ctx.cache).map(async ([modelName, { data }]) => {
      const model = mongoose.model(modelName)
      task.output = modelName

      const mongoosePromises = Object.values(data).map(
        async doc =>
          await new model(doc).save().catch(error => {
            log(error.message, LogType.error)
          })
      )
      await Promise.all(mongoosePromises)
    })
    await Promise.all(creationPromises)
  }
}
