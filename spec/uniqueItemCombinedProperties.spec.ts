import uniqueItemCombinedProperties from "../dist/keywords/uniqueItemCombinedProperties"
import ajvKeywordsPlugin from "../dist"
import Ajv from "ajv"
import chai from "chai"
chai.should()

describe('keyword "uniqueItemCombinedProperties"', () => {
  const ajvs = [
    uniqueItemCombinedProperties(new Ajv({$data: true, strict: false})),
    ajvKeywordsPlugin(new Ajv({$data: true, strict: false}), "uniqueItemCombinedProperties"),
    ajvKeywordsPlugin(new Ajv({$data: true, strict: false, allErrors: true})),
  ]

  describe("with scalar propery", () => {
    ajvs.forEach((ajv, i) => {
      it(`should return error message with property name #${i}`, () => {
        const invalidData = [{id: 1}, {id: 1}, {id: 3}]
        const validate = ajv.compile({uniqueItemCombinedProperties: ["id"]})

        validate(invalidData).should.equal(false)
        if (validate.errors) {
          const error = validate.errors[0]

          error.keyword.should.equal("uniqueItemCombinedProperties")
          error.params.keyword.should.equal("uniqueItemCombinedProperties")
          error.message?.should.equal(
            "should NOT have duplicate items property id (items ## 0 and 1 are identical)"
          )
        }
      })
    })
  })

  describe("with non scalar propery", () => {
    ajvs.forEach((ajv, i) => {
      it(`should return error message with property name #${i}`, () => {
        const invalidData = [
          {name: {firstName: "John", lastName: "Doe"}},
          {name: {firstName: "John", lastName: "Doe"}},
          {name: {firstName: "Lorem", lastName: "Ipsum"}},
        ]
        const validate = ajv.compile({uniqueItemCombinedProperties: ["name"]})

        validate(invalidData).should.equal(false)
        if (validate.errors) {
          const error = validate.errors[0]

          error.keyword.should.equal("uniqueItemCombinedProperties")
          error.params.keyword.should.equal("uniqueItemCombinedProperties")
          error.message?.should.equal(
            "should NOT have duplicate items property name (items ## 0 and 1 are identical)"
          )
        }
      })
    })
  })
})
