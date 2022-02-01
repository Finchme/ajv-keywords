import type {FuncKeywordDefinition, AnySchemaObject} from "ajv"
import equal = require("fast-deep-equal")

const SCALAR_TYPES = ["number", "integer", "string", "boolean", "null"]

export default function getDef(): FuncKeywordDefinition {
  return {
    keyword: "uniqueItemCombinedProperties",
    type: "array",
    schemaType: "array",
    errors: true,
    compile(keys: string[], parentSchema: AnySchemaObject) {
      const updated_keys: string[][] = []
      for (let z = 0; z < keys.length; z++) {
        updated_keys[z] = keys[z].split(",")
      }
      const scalar = getScalarKeys(updated_keys, parentSchema)

      // eslint-disable-next-line complexity
      return function validate(data): boolean {
        if (data.length > 1) {
          for (let k = 0; k < updated_keys.length; k++) {
            let i
            const curr_keys = updated_keys[k]
            if (scalar[k]) {
              const hash: Record<string, any> = {}
              const hash_indexes: Record<string, any> = {}
              for (i = data.length; i--; ) {
                if (!data[i] || typeof data[i] != "object") continue
                let force_break = false
                const prop_list = []
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for (let y = 0; y < curr_keys.length; y++) {
                  let prop = data[i][curr_keys[y]]
                  if (prop && typeof prop == "object") {
                    force_break = true
                    continue
                  }
                  if (typeof prop == "string") prop = '"' + prop
                  prop_list.push(prop)
                }
                if (force_break) continue
                if (hash[prop_list.toString()]) {
                  ;(validate as any).errors = constructError(curr_keys, [
                    i,
                    hash_indexes[prop_list.toString()],
                  ])
                  return false
                }
                hash[prop_list.toString()] = true
                hash_indexes[prop_list.toString()] = i
              }
            } else {
              for (i = data.length; i--; ) {
                if (!data[i] || typeof data[i] != "object") continue
                for (let j = i; j--; ) {
                  if (data[j] && typeof data[j] == "object") {
                    let is_match = true
                    // eslint-disable-next-line @typescript-eslint/prefer-for-of
                    for (let x = 0; x < curr_keys.length; x++) {
                      if (!equal(data[i][curr_keys[x]], data[j][curr_keys[x]])) {
                        is_match = false
                        break
                      }
                    }
                    if (is_match) {
                      ;(validate as any).errors = constructError(curr_keys, [j, i])
                      return false
                    }
                  }
                }
              }
            }
          }
        }
        return true
      }
    },
    metaSchema: {
      type: "array",
      items: {type: "string"},
    },
  }
}

function getScalarKeys(keys: string[][], schema: AnySchemaObject): boolean[] {
  return keys.map((key) => {
    const t = schema.items?.properties?.[key.toString()]?.type
    return Array.isArray(t)
      ? !t.includes("object") && !t.includes("array")
      : SCALAR_TYPES.includes(t)
  })
}

function constructError(keys: string[], indexes: number[]): any {
  const keyword = "uniqueItemCombinedProperties"
  return [
    {
      keyword,
      params: {keyword},
      message:
        "should NOT have duplicate items property " +
        keys.toString() +
        " (items ## " +
        indexes.join(" and ") +
        " are identical)",
    },
  ]
}

module.exports = getDef
