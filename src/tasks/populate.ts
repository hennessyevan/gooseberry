import { Observable } from "rxjs"
import { ListrContext } from "../commands/seed"
import { ListrTaskWrapper } from "listr"
import set from "lodash.set"
import get from "lodash.get"

export function populate(ctx: ListrContext, task: ListrTaskWrapper) {
  if (!ctx.cache) return

  return new Observable(subscriber => {
    Object.values(ctx.cache!).forEach(data => {
      data.$gooseberry.refEntries!.forEach(refEntry => {
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
    subscriber.complete()
  })
}
