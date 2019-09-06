import { Command, flags } from "@oclif/command"
import Listr from "listr"
import input from "listr-input"
import mongoose, { Mongoose } from "mongoose"
import pEachSeries from "p-each-series"
import { Observable } from "rxjs"
import { register } from "ts-node"
import {
  CacheFile,
  createDocsFromData,
  generateData,
  getModels,
  getRefPaths,
  log,
  Options,
  parseOptions,
  populateSmartIds
} from "../utils"
import chalk from "chalk"

export type SmartMapType = {
  pathToEntry: string
  pathToRef: string
  onModel: string
  id: string
  timestamp: number
}

export default class Seed extends Command {
  static description = "describe the command here"

  static examples = [`$ gooseberry seed`, `$ gooseberry seed [collection]`]

  // static args = [{ name: "collection", required: false, description: "Single collection to seed" }]

  static flags = {
    help: flags.help({ char: "h" })
  }

  async run() {
    // const { args, flags } = this.parse(Seed)

    // const { collection } = args
    log(`Seeding all collections`)

    const tasks = new Listr<{
      config: Options
      models: string[]
      mongoose: Mongoose
      cache?: CacheFile
      smartMap: SmartMapType
    }>([
      {
        title: "Initializing",
        task: async (ctx, task) => {
          // Parse config from package.json
          ctx.config = await parseOptions()
          ctx.mongoose = mongoose

          if (ctx.config && !ctx.config.dropDatabase) {
            task.title = "Drop Database?"
            input("Y/n", {
              validate: (value: string) => ["Y", "y", "N", "n", ""].includes(value),
              done: (drop: string) => {
                switch (drop.toUpperCase()) {
                  case "N":
                    ctx.config.dropDatabase = false
                    break
                  default:
                  case "Y":
                    ctx.config.dropDatabase = true
                    break
                }
              }
            })
          }
        }
      },
      {
        title: "Loading models",
        task: async (ctx, task) => {
          // Enumerate models
          ctx.models = await getModels(ctx.config.modelDir)
          // Connect mongoose
          await mongoose.connect(ctx.config.mongoURI, { useNewUrlParser: true })
          await mongoose.connection.dropDatabase()
          // Register models with mongoose
          ctx.models.map(async model => {
            register({ transpileOnly: true })
            await require(model)
            task.output = model
          })
        }
      },
      {
        title: "Generating Primary Data",
        task: async (ctx, task) => {
          const promises = Object.keys(mongoose.models).map(async model => {
            // Get model
            const mongooseModel = mongoose.model(model)
            // Get ref paths
            const refPaths = await getRefPaths(mongooseModel)
            // Here we insert whatever data is available and swap out ids later
            return { data: await generateData(mongooseModel, refPaths, ctx.config), model }
          })
          await pEachSeries(promises, async ({ data, model }) => {
            task.output = model
            ctx.cache = { ...ctx.cache, ...data }
          })
        }
      },
      {
        title: "Populating Smart References",
        task: async ctx => {
          ctx.cache = await populateSmartIds(ctx.cache)
        }
      },
      {
        title: `Feeding ${chalk.green("Gooseberries")} to Mongoose`,
        task: async (ctx, task) => {
          const count = await createDocsFromData(ctx.cache!, task)
          task.output = `🚀 Successfully wrote ${count} documents`
          setTimeout(async () => {
            task.output = "Closing"
            await mongoose.disconnect().then(() => {
              process.exit()
            })
          }, 1500)
        }
      }
    ])

    await tasks.run()
  }
}
