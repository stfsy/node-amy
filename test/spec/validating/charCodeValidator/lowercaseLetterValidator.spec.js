'use strict'

const resolve = require('path').resolve
const LowercaseLetterValidator = require(resolve('lib/validating/charCodeValidator/lowercaseLetterValidator'))

const expect = require('chai').expect

describe('LowercaseLetterValidator', () => {
    describe('.isValid', () => {

        let lowercaseLetterValidator = null

        beforeEach(() => {
            lowercaseLetterValidator = new LowercaseLetterValidator()
        })

        it('should validate all lowercase letters', () => {
            for (let i = 97, n = 122; i < n; i++) {
                const character = String.fromCharCode(i)
                const valid = lowercaseLetterValidator.isValid(character, 0)
                expect(valid).to.equal(true)
            }
        })

        it('should not validate other characters than all lowercase letters', () => {
            for (let i = 32, n = 96; i < n; i++) {
                const character = String.fromCharCode(i)
                const valid = lowercaseLetterValidator.isValid(character, 0)
                expect(valid).to.equal(false)
            }
            
            for (let i = 123, n = 126; i < n; i++) {
                const character = String.fromCharCode(i)
                const valid = lowercaseLetterValidator.isValid(character, 0)
                expect(valid).to.equal(false)
            }
        })
    })
})