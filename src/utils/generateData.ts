import { ObjectId } from "bson"
import fs from "fs"
import globby from "globby"
import loadFile from "load-any-file"
import merge from "lodash.merge"
import { Document, Model } from "mongoose"
import * as path from "path"
import { RefType } from "./getRefPaths"
import { log, LogType } from "./log"
import { Options } from "./parseOptions"
import get from "lodash.get"
import { SmartMapType } from "../commands/seed"

export async function generateData(
  model: Model<Document>,
  refPaths: RefType[],
  config: Options,
  smartMap: SmartMapType
) {
  const dataDirPath = path.join(process.cwd(), config.dataDir)

  if (!fs.existsSync(dataDirPath)) {
    log(`No path found for ${dataDirPath}`, LogType.error)
  }

  let returnData: CacheFile = {}
  for await (const filePath of globby.stream(
    dataDirPath + `/${model.collection.collectionName}.(json|yml|js|ts)`
  )) {
    try {
      const data = loadFile(filePath as string)
      if (data) {
        if (Array.isArray(data)) {
          returnData = merge(
            returnData,
            await generateFromArray(data, model, refPaths, filePath as string, smartMap)
          )
        } else {
          throw new Error(`Data must be exported as an array`)
        }
      } else {
        throw new Error(`No data found for path ${filePath}`)
      }
    } catch (error) {
      throw new Error(`${error} from ${filePath}`)
    }
    return returnData
  }
}

export type CacheFile = {
  [key: string]: {
    data: {
      [key: string]: any
    }
    $gooseberry: {
      refEntries?: RefEntry[]
      filePath?: string
    }
  }
}

export type RefEntry = {
  pathToEntry: string
  pathToRef: string | string[]
  onModel: string
}

async function generateFromArray(
  data: any[],
  model: Model<Document>,
  refs: RefType[],
  filePath: string,
  smartMap: SmartMapType
) {
  const collectionName = model.modelName
  const refEntries: RefEntry[] = []
  const cacheData: CacheFile = {
    [collectionName]: {
      data: {},
      $gooseberry: {}
    }
  }
  data.forEach((entry, i) => {
    // Assign internal ref based on id from data
    const $__gooseberry_id = entry._id || entry.id || `${collectionName}${i}`
    delete entry.id

    // Transform string refs to gooseberry objects
    refs.forEach(ref => {
      if (ref.$__gooseberry_subDocArray) {
        const subdocs = get<any[]>(entry, ref.$__gooseberry_subDocArray, [])

        subdocs.forEach((subEntry, i) => {
          const refValue = get(subEntry, ref.$__gooseberry_path)
          if (!refValue) return
          if (!ref.$__gooseberry_ref) {
            ref.$__gooseberry_ref = subEntry[ref.$__gooseberry_refPath!]
          }

          refEntries.push({
            pathToEntry: `${collectionName}.data[${$__gooseberry_id}][${ref.$__gooseberry_subDocArray}][${i}][${ref.$__gooseberry_path}]`,
            pathToRef: `${ref.$__gooseberry_ref}.data[${refValue}]`,
            onModel: ref.$__gooseberry_ref!
          })
        })
        return
      }

      const refValue = get(entry, ref.$__gooseberry_path)

      if (!refValue) return

      if (!ref.$__gooseberry_ref) {
        ref.$__gooseberry_ref = get(entry, ref.$__gooseberry_refPath!)
      }

      if (ref.$__gooseberry_isArray && Array.isArray(refValue)) {
        refEntries.push({
          pathToEntry: `${collectionName}.data[${$__gooseberry_id}][${ref.$__gooseberry_path}]`,
          pathToRef: refValue.map(value => `${ref.$__gooseberry_ref}.data[${value}]`),
          onModel: ref.$__gooseberry_ref!
        })
        return
      }

      if (ref.$__gooseberry_subDoc) {
        refEntries.push({
          pathToEntry: `${collectionName}.data[${$__gooseberry_id}][${ref.$__gooseberry_path}]`,
          pathToRef: `${ref.$__gooseberry_ref}.data[${refValue}]`,
          onModel: ref.$__gooseberry_ref!
        })
        return
      }

      refEntries.push({
        pathToEntry: `${collectionName}.data[${$__gooseberry_id}][${ref.$__gooseberry_path}]`,
        pathToRef: `${ref.$__gooseberry_ref}.data[${refValue}]`,
        onModel: ref.$__gooseberry_ref!
      })
    })

    entry._id = new ObjectId()

    // Return transformed entry
    cacheData[collectionName].data[$__gooseberry_id] = entry
  })
  cacheData[collectionName].$gooseberry = {
    refEntries,
    filePath
  }

  return cacheData
}
