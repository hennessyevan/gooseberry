import { ListrTaskWrapper } from "listr"
import mongoose from "mongoose"
import { from } from "rxjs"
import { concatAll, map } from "rxjs/operators"
import { register } from "ts-node"
import { getModels } from "../utils"
import { ListrContext } from "../commands/seed"

export async function loadModels(ctx: ListrContext, task: ListrTaskWrapper) {
  ctx.models = await getModels(ctx.config.modelDir)
  // Connect mongoose
  await mongoose.connect(ctx.config.mongoURI, { useNewUrlParser: true })
  await mongoose.connection.dropDatabase()

  return from(ctx.models).pipe(
    map(model => {
      task.output = model
      register({ transpileOnly: true })
      require(model)
      return model
    }),
    concatAll()
  )
}
