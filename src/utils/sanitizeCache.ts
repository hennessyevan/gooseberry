import { CacheFile } from "./generateData"

export async function sanitizeCache(cache: CacheFile) {
  Object.values(cache).forEach(entry => {
    delete entry.$gooseberry
    Object.values(entry.data).forEach((entry: any) => {
      delete entry.idRef
    })
  })

  return cache
}
