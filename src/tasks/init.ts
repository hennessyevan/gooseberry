import { ListrContext } from "../commands/seed"
import { ListrTaskWrapper } from "listr"
import { parseOptions } from "../utils"
import mongoose from "mongoose"
import input from "listr-input"
import { Observable } from "rxjs"

export async function init(ctx: ListrContext, task: ListrTaskWrapper) {
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
