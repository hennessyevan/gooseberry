import { Command, flags } from "@oclif/command"
import Listr from "listr"
import { Mongoose } from "mongoose"
import { generate, init, loadModels, populate, createDocsFromData } from "../tasks"
import { CacheFile, log, Options } from "../utils"
import chalk from "chalk"

export type SmartMapType = {
  pathToEntry: string
  pathToRef: string
  onModel: string
  id: string
  timestamp: number
}

export type ListrContext = {
  config: Options
  models: string[]
  mongoose: Mongoose
  cache?: CacheFile
  smartMap: SmartMapType
}

export default class Seed extends Command {
  static description = "describe the command here"

  static examples = [`$ gooseberry seed`, `$ gooseberry seed [collection]`]

  // static args = [{ name: "collection", required: false, description: "Single collection to seed" }]

  static flags = {
    help: flags.help({ char: "h" })
  }

  async run() {
    log(`Seeding all collections`)

    return new Listr<ListrContext>([
      {
        title: "Initializing",
        task: init
      },
      {
        title: "Loading models",
        task: loadModels
      },
      {
        title: "Transforming Seed Data",
        task: generate
      },
      {
        title: "Populating Smart References",
        task: populate
      },
      {
        title: `Feeding ${chalk.green("Gooseberries")} to Mongoose`,
        task: createDocsFromData
      }
    ])
      .run()
      .then(ctx => {
        ctx.mongoose.disconnect().then(() => {
          process.exit()
        })
      })
  }
}
