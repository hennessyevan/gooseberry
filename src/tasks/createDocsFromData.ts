import { ListrTaskWrapper } from "listr"
import mongoose from "mongoose"
import { from } from "rxjs"
import { concatMap, endWith, map } from "rxjs/operators"
import { ListrContext } from "../commands/seed"
import { log, LogType } from "../utils/log"

export function createDocsFromData(ctx: ListrContext, task: ListrTaskWrapper) {
  if (ctx.cache) {
    return from(Object.entries(ctx.cache)).pipe(
      concatMap(([modelName, { data }]) => {
        const model = mongoose.model(modelName)
        task.output = modelName

        return from(Object.values(data)).pipe(
          map(doc =>
            new model(doc).save().catch(error => {
              log(error.message, LogType.error)
            })
          )
        )
      }),
      endWith(() => {
        mongoose.connection.close().then(() => {
          process.exit()
        })
      })
    )
  }
}
