import { ListrTaskWrapper } from "listr"
import mongoose from "mongoose"
import pEachSeries from "p-each-series"
import { ListrContext } from "../commands/seed"

export async function createDocsFromData(ctx: ListrContext, task: ListrTaskWrapper) {
  if (ctx.cache) {
    const creationPromises = Object.entries(ctx.cache).map(async ([modelName, { data }]) => {
      const model = mongoose.model(modelName)
      task.output = modelName

      const mongoosePromises = Object.values(data).map(
        async doc =>
          await new model(doc).save().catch(err => {
            task.report({ ...err, message: `${err.message} at Mongoose Save` })
          })
      )
      await pEachSeries(mongoosePromises, () => {}).catch(err =>
        task.report({ ...err, message: `${err.message} at Mongoose` })
      )
      return modelName
    })
    await pEachSeries(creationPromises, model => console.log(model)).catch(err =>
      task.report({ ...err, message: `${err.message} at Document Creation` })
    )
  }
}
