import { CacheFile } from "./generateData"
import mongoose from "mongoose"
import { log, LogType } from "./log"
import { ListrTaskWrapper } from "listr"

export async function createDocsFromData(data: CacheFile, task: ListrTaskWrapper) {
  let count = 0
  data &&
    Object.entries(data).forEach(async ([modelName, { data }]) => {
      const model = mongoose.model(modelName)
      task.output = modelName

      Object.values(data).forEach(async doc => {
        await new model(doc).save().catch(error => {
          log(error.message, LogType.error)
        })
        count++
      })
    })

  return count
}
