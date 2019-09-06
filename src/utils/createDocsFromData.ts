import { CacheFile } from "./generateData"
import mongoose from "mongoose"
import { log, LogType } from "./log"

export async function createDocsFromData(data: CacheFile) {
  data &&
    Object.entries(data).forEach(async ([modelName, { data }]) => {
      const model = mongoose.model(modelName)

      Object.values(data).forEach(async doc => {
        await new model(doc).save().catch(error => {
          log(error.message, LogType.error)
        })
      })
    })
}
