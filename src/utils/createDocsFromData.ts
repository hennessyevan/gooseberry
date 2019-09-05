import { CacheFile } from "./generateData"
import mongoose from "mongoose"

export async function createDocsFromData(data: CacheFile) {
  data &&
    Object.entries(data).forEach(async ([modelName, { data }]) => {
      const model = mongoose.model(modelName)

      Object.values(data).forEach(async doc => {
        const info = await new model(doc).save()
      })
    })
}
