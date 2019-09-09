import { ListrTaskWrapper } from "listr"
import get from "lodash.get"
import set from "lodash.set"
import { ListrContext } from "../commands/seed"

export async function populate(ctx: ListrContext, task: ListrTaskWrapper) {
  if (!ctx.cache) return

  const populationPromises = Object.values(ctx.cache!).map(async data => {
    data.$gooseberry.refEntries!.forEach(refEntry => {
      task.output = refEntry.onModel
      if (Array.isArray(refEntry.pathToRef)) {
        const idsAtRef = refEntry.pathToRef.map(pathToRef => get(ctx.cache!, pathToRef + "_id"))
        set(ctx.cache!, refEntry.pathToEntry, idsAtRef)
        return
      }

      const idAtRef = get(ctx.cache, refEntry.pathToRef + "_id") as any

      if (idAtRef) {
        set(ctx.cache!, refEntry.pathToEntry, idAtRef)
      }
    })
  })

  await Promise.all(populationPromises)
}
