import {
  getSampleSchema,
} from "core/utils"

describe("Straighten sample generation", () => {
  describe("Json sample generator", () => {
    const contentType = "json"
    const expectToBe= (res, value) => expect(res).toEqual(JSON.stringify(value))

    describe("Case primitive schema type", () => {
      describe("Override example", () => {
        const exampleOverride = "This has been overridden!"
        const expectToBeOverridden = (res) => expectToBe(res, exampleOverride)

        it("should use override example over generated sample of schema.", () => {
          // Given
          const res = getSampleSchema({ type: "string" }, contentType, {}, exampleOverride)

          // Then
          expectToBeOverridden(res)
        })
        it("should use override example over schema's example.", () => {
          // Given
          const res = getSampleSchema({
            example: "schema example to override",
            type: "string"
          }, contentType, {}, exampleOverride)

          // Then
          expectToBeOverridden(res)
        })
      })
      describe("Schema's Example", () => {
        const exampleValue = "test"
        const expectToBeExample = (res) => expectToBe(res, exampleValue)

        it("should use schema's example over generated sample of schema.", () => {
          // Given
          const res = getSampleSchema({
            example: exampleValue,
            type: "string"
          }, contentType)

          // Then
          expectToBeExample(res)
        })
      })
      describe("Generated schema's sample", () => {
        const stringSchemaDefault = "string"
        const expectToBeStringDefault = (res) => expectToBe(res, stringSchemaDefault)

        it("should be generated when no override and no example provided", () => {
          // Given
          const res = getSampleSchema({
            type: "string"
          }, contentType)

          // Then
          expectToBeStringDefault(res)
        })
      })
    })

    describe("Case object schema type", () => {
      describe("Override example", () => {
        const exampleOverride = { test: "This has been overridden!" }
        const expectToBeOverridden = (res) => expectToBe(res, exampleOverride)

        it("should use override example over generated sample of schema.", () => {
          // Given
          const res = getSampleSchema({
            type: "object",
            properties: {
              test: {
                type: "string"
              }
            }
          }, contentType, {}, exampleOverride)

          // Then
          expectToBeOverridden(res)
        })
        it("should use override example over schema's example.", () => {
          // Given
          const res = getSampleSchema({
            type: "object",
            example: {
              test: "Should be overridden!"
            }
          }, contentType, {}, exampleOverride)

          // Then
          expectToBeOverridden(res)
        })
      })
      describe("Schema's Example", () => {
        const exampleValue = {test: "test"}
        const expectToBeExample = (res) => expectToBe(res, exampleValue)

        it("should use schema's example over generated sample of schema.", () => {
          // Given
          const res = getSampleSchema({
            example: exampleValue,
            type: "string"
          }, contentType)

          // Then
          expectToBeExample(res)
        })
      })
    })
  })
})
