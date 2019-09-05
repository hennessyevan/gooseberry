import * as path from "path"
import { log } from "./"
import { LogType } from "./log"
import globby = require("globby")

export async function getModels(modelDir: string, collection?: string): Promise<string[]> {
  try {
    try {
      // Get models
      if (!modelDir) {
        throw new Error(
          "No models path. Add a path to your models directory in package.json -> gooseberry.modelDir"
        )
      }
      return await globby(path.join(process.cwd(), modelDir + "/**/*.(js|ts)"))
    } catch (error) {
      throw new Error(error)
    }
  } catch (err) {
    throw log(err, LogType.error)
  }
}
