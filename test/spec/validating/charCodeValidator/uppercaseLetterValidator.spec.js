'use strict'

const resolve = require('path').resolve
const UppercaseLetterValidator = require(resolve('lib/validating/charCodeValidator/uppercaseLetterValidator'))

const expect = require('chai').expect

describe('UppercaseLetterValidator', () => {
    describe('.isValid', () => {

        let uppercaseLetterValidator = null

        beforeEach(() => {
            uppercaseLetterValidator = new UppercaseLetterValidator()
        })

        it('should validate all uppercase letters', () => {
            for (let i = 65, n = 90; i < n; i++) {
                const character = String.fromCharCode(i)
                const valid = uppercaseLetterValidator.isValid(character, 0)
                expect(valid).to.equal(true)
            }
        })

        it('should not validate other characters than all uppercase letters', () => {
            for (let i = 32, n = 64; i < n; i++) {
                const character = String.fromCharCode(i)
                const valid = uppercaseLetterValidator.isValid(character, 0)
                expect(valid).to.equal(false)
            }

            for (let i = 91, n = 126; i < n; i++) {
                const character = String.fromCharCode(i)
                const valid = uppercaseLetterValidator.isValid(character, 0)
                expect(valid).to.equal(false)
            }
        })
    })
})