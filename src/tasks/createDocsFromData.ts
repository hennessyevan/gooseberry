import { ListrTaskWrapper } from "listr"
import mongoose from "mongoose"
import pEachSeries from "p-each-series"
import { ListrContext } from "../commands/seed"

export async function createDocsFromData(ctx: ListrContext, task: ListrTaskWrapper) {
  if (ctx.cache) {
    let order = Object.keys(ctx.cache)
    if (ctx.config.top) {
      order.sort((a, b) => {
        if (ctx.config.top!.includes(a)) {
          if (ctx.config.top!.includes(b)) {
            if (ctx.config.top!.indexOf(a) < ctx.config.top!.indexOf(b)) {
              return -1
            }
            return 1
          }
          return -1
        }
        return 1
      })
    }
    const creationPromises = order.map(async modelName => {
      const { data } = ctx.cache![modelName]
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
