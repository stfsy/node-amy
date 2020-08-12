'use strict'

const resolve = require('path').resolve
const DigitsValidator = require(resolve('lib/validating/charCodeValidator/digitsValidator'))
const expect = require('chai').expect

describe('AtValidator', () => {
    describe('.isValid', () => {

        let digitsValidator = null

        beforeEach(() => {
            digitsValidator = new DigitsValidator()
        })

        it('should validate the @ sign', () => {
            const valid = digitsValidator.isValid('1', 0)
            expect(valid).to.equal(true)
        })

        it('should not validate other characters than @', () => {

            for (let i = 32, n = 126; i < n; i++) {
                const character = String.fromCharCode(i)

                if (i >= 48 && i <= 57) {
                    continue
                }
                const valid = digitsValidator.isValid(character, 0)
                expect(valid).to.equal(false)
            }
        })
    })
})