import * as path from "path"
import { log, LogType } from "."

export type Options = {
  modelDir: string
  mongoURI: string
  dataDir: string
  dropDatabase?: boolean
}

export async function parseOptions(): Promise<Options> {
  try {
    const config = await require(path.join(process.cwd(), "package.json"))
    if (config.gooseberry) {
      if (
        !config.gooseberry.modelDir ||
        !config.gooseberry.mongoURI ||
        !config.gooseberry.dataDir
      ) {
        throw log(
          `Expected a complete config but got ${JSON.stringify(config.gooseberry, null, 3)}`,
          LogType.error
        )
      }

      return config.gooseberry
    } else {
      throw log("You must supply a gooseberry config in package.json", LogType.error)
    }
  } catch (error) {
    throw log(error, LogType.error)
  }
}
