import { Document, Model, SchemaType, Schema } from "mongoose"

export type RefType = {
  $__gooseberry_path: string
  $__gooseberry_ref?: string
  $__gooseberry_refPath?: string
  $__gooseberry_subDoc?: string
  $__gooseberry_subDocArray?: string
  idRef?: string
}

type PathObjType = SchemaType & {
  instance: string
  path: string
  schema?: Schema & {
    paths: {
      [key: string]: any
    }
  }
  options: {
    ref?: string
    refPath?: string
  }
  caster?: {
    instance: string
    $isArraySubdocument: boolean
  }
}

type SubObjType = Schema & {
  subpaths: {
    path: string
    instance: string
    options: {
      auto?: boolean
      ref?: string
      refPath?: string
    }
    $isUnderneathDocArray?: boolean
  }[]
}

export async function getRefPaths(model: Model<Document>): Promise<RefType[]> {
  const refPaths: RefType[] = []
  const modelHasID = model.schema.get("_id")

  await model.schema.eachPath(async path => {
    // Get path info
    const pathObj = model.schema.path(path) as PathObjType

    // Get all ObjectId types on schema
    if (pathObj.instance === "ObjectID") {
      if (modelHasID && path === "_id") return

      refPaths.push({
        $__gooseberry_path: path,
        $__gooseberry_ref: pathObj.options.ref,
        $__gooseberry_refPath: pathObj.options.refPath
      })
    }

    if (pathObj.instance === "Embedded") {
      const embeddedHasId = pathObj.schema!.get("_id")
      pathObj.schema!.eachPath(innerPath => {
        const innerPathObj = pathObj.schema!.path(innerPath) as PathObjType

        if (innerPathObj.instance === "ObjectID") {
          if (embeddedHasId && innerPath === "_id") return

          refPaths.push({
            $__gooseberry_path: `${path}.${innerPath}`,
            $__gooseberry_ref: innerPathObj.options.ref,
            $__gooseberry_refPath: `${path}.${innerPathObj.options.refPath}`,
            $__gooseberry_subDoc: path
          })
        }
      })
    }

    if (pathObj.instance === "Array" && pathObj.caster) {
      if (pathObj.caster.instance === "ObjectID") {
        refPaths.push({
          $__gooseberry_path: path,
          $__gooseberry_ref: pathObj.options.ref,
          $__gooseberry_refPath: pathObj.options.refPath
        })
      } else if (pathObj.caster.$isArraySubdocument) {
        Object.entries(pathObj.schema!.paths).forEach(([subPath, obj]) => {
          const subDocHasID = obj.options.auto
          if (obj.instance === "ObjectID") {
            if (subDocHasID && obj.path === "_id") return

            refPaths.push({
              $__gooseberry_path: subPath,
              $__gooseberry_ref: obj.options.ref,
              $__gooseberry_refPath: obj.options.refPath,
              $__gooseberry_subDocArray: path
            })
          }
        })
      }
    }
  })

  await Object.entries((model.schema as SubObjType).subpaths).forEach(([path, obj]) => {
    const subDocHasID = obj.options.auto
    if (obj.$isUnderneathDocArray && obj.instance === "ObjectID") {
      if (subDocHasID && obj.path === "_id") return

      refPaths.push({
        $__gooseberry_path: path,
        $__gooseberry_ref: obj.options.ref,
        $__gooseberry_refPath: obj.options.refPath,
        $__gooseberry_subDoc: "comments"
      })
    }
  })

  return refPaths
}
