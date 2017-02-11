'use strict'

const resolve = require('path').resolve
const AtValidator = require(resolve('lib/validating/charCodeValidator/dashValidator'))
const expect = require('chai').expect

describe('AtValidator', () => {
    describe('.isValid', () => {

        let atValidator = null

        beforeEach(() => {
            atValidator = new AtValidator()
        })

        it('should validate the @ sign', () => {
            const valid = atValidator.isValid('-', 0)
            expect(valid).to.equal(true)
        })

        it('should not validate other characters than @', () => {

            for (let i = 32, n = 126; i < n; i++) {
                const character = String.fromCharCode(i)

                if (character === '-') {
                    continue
                }
                const valid = atValidator.isValid(character, 0)
                expect(valid).to.equal(false)
            }
        })
    })
})