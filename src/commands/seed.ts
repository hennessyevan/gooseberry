import { Command, flags } from "@oclif/command"
import pEachSeries from "p-each-series"
import input from "listr-input"
import { register } from "ts-node"
import {
  getModels,
  parseOptions,
  log,
  getRefPaths,
  generateData,
  Options,
  CacheFile,
  populateSmartIds,
  createDocsFromData,
  sanitizeCache
} from "../utils"
import mongoose, { Mongoose } from "mongoose"
import Listr from "listr"
import loadJsonFile = require("load-json-file")
import gooseberryStatics from "../gooseberry-statics"
import loadFile from "load-any-file"

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
        task: async ctx => {
          // Parse config from package.json
          ctx.config = await parseOptions()
          ctx.mongoose = mongoose
        }
      },
      {
        title: "Drop Database?",
        task: ctx =>
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
          }),
        enabled: ctx => ctx.config && !ctx.config.dropDatabase
      },
      {
        title: "Loading models",
        task: async ctx => {
          // Enumerate models
          ctx.models = await getModels(ctx.config.modelDir)
          // Connect mongoose
          await mongoose.connect(ctx.config.mongoURI, { useNewUrlParser: true })
          await mongoose.connection.dropDatabase()
          // Register models with mongoose
          await ctx.models.map(model => {
            register({ transpileOnly: true })
            require(model)
          })
          // Load existing cache or return
          await loadJsonFile<SmartMapType>(gooseberryStatics.smartMap)
            .then(doc => (ctx.smartMap = doc))
            .catch(() => ctx.smartMap)
        }
      },
      {
        title: "Generating Primary Data",
        task: async ctx => {
          const promises: Promise<CacheFile | undefined>[] = Object.keys(mongoose.models).map(
            async model => {
              // Get model
              const mongooseModel = mongoose.model(model)
              // Get ref paths
              const refPaths = await getRefPaths(mongooseModel)

              // Here we insert whatever data is available and swap out ids later
              return await generateData(mongooseModel, refPaths, ctx.config, ctx.smartMap)
            }
          )
          await pEachSeries(promises, async data => (ctx.cache = { ...ctx.cache, ...data }))
        }
      },
      {
        title: "Populating Smart References",
        task: async ctx => {
          ctx.cache = await populateSmartIds(ctx.cache)
        }
      },
      {
        title: "Feeding data berries to Mongoose",
        task: async ctx => {
          ctx.cache = await sanitizeCache(ctx.cache!)
          await createDocsFromData(ctx.cache)
          setTimeout(() => {
            mongoose.disconnect()
          }, 500)
        }
      }
    ])

    await tasks.run()
  }
}
