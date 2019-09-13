import { Command, flags } from "@oclif/command"
import Listr from "listr"
import mongoose, { Mongoose } from "mongoose"
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

  static flags = {
    help: flags.help({ char: "h" }),
    verbose: flags.boolean({ char: "v", default: false })
  }

  async run() {
    log(`Seeding all collections`)
    const { flags } = this.parse(Seed)

    await new Listr<ListrContext>(
      [
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
      ],
      {
        renderer: flags.verbose ? "verbose" : "default"
      }
    ).run()
    await mongoose.disconnect()
  }
}
