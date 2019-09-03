import { CacheFile } from "./generateData"
import get from "lodash.get"
import set from "lodash.set"

export type IdMapType = {
  [key: string]: any
}

export async function populateSmartIds(cache: CacheFile | undefined) {
  if (!cache) return
  const idMap: IdMapType = {}

  Object.values(cache).forEach(data => {
    data.$gooseberry.refEntries!.forEach(refEntry => {
      const idAtRef = get(cache, refEntry.pathToRef + "_id") as any

      if (idAtRef) {
        idMap[`${get(cache, refEntry.pathToEntry)}`] = {
          ...refEntry,
          id: idAtRef,
          timestamp: new Date().getTime()
        }

        set(cache, refEntry.pathToEntry, idAtRef)
      }
    })
  })

  return cache
}
