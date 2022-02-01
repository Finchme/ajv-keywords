import type {Plugin} from "ajv"
import getDef from "../definitions/uniqueItemCombinedProperties"

const uniqueItemCombinedProperties: Plugin<undefined> = (ajv) => ajv.addKeyword(getDef())

export default uniqueItemCombinedProperties
module.exports = uniqueItemCombinedProperties
