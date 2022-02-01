import uniqueItemProperties from "../dist/keywords/uniqueItemProperties"
import ajvKeywordsPlugin from "../dist"
import Ajv from "ajv"
import chai from "chai"
chai.should()

describe('keyword "uniqueItemProperties"', () => {
  const ajvs = [
    uniqueItemProperties(new Ajv({$data: true, strict: false})),
    ajvKeywordsPlugin(new Ajv({$data: true, strict: false}), "uniqueItemProperties"),
    ajvKeywordsPlugin(new Ajv({$data: true, strict: false, allErrors: true})),
  ]

  describe("with scalar propery", () => {
    ajvs.forEach((ajv, i) => {
      it(`should return error message with property name #${i}`, () => {
        const invalidData = [{id: 1}, {id: 1}, {id: 3}]
        const validate = ajv.compile({uniqueItemProperties: ["id"]})

        validate(invalidData).should.equal(false)
        if (validate.errors) {
          const error = validate.errors[0]

          error.keyword.should.equal("uniqueItemProperties")
          error.params.keyword.should.equal("uniqueItemProperties")
          error.message?.should.equal("should have unique id")
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
        const validate = ajv.compile({uniqueItemProperties: ["name"]})

        validate(invalidData).should.equal(false)
        if (validate.errors) {
          const error = validate.errors[0]

          error.keyword.should.equal("uniqueItemProperties")
          error.params.keyword.should.equal("uniqueItemProperties")
          error.message?.should.equal("should have unique name")
        }
      })
    })
  })
})
