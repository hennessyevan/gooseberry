import { ListrContext, ListrTaskWrapper } from "listr"
import { from } from "rxjs"
import { map, delay, concatAll } from "rxjs/operators"
import mongoose from "mongoose"
import { getRefPaths, generateData } from "../utils"

export function generate(ctx: ListrContext, task: ListrTaskWrapper) {
  return from(Object.keys(mongoose.models)).pipe(
    map(async model => {
      delay(1000)
      // Get model
      const mongooseModel = mongoose.model(model)
      // Get ref paths
      const refPaths = await getRefPaths(mongooseModel)
      // Here we insert whatever data is available and swap out ids later
      const data = await generateData(mongooseModel, refPaths, ctx.config)

      task.output = model

      ctx.cache = { ...ctx.cache, ...data }
      return model
    }),
    concatAll()
  )
}
