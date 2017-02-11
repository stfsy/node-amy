'use strict'

const resolve = require('path').resolve
const DotValidator = require(resolve('lib/validating/charCodeValidator/dotValidator'))

const expect = require('chai').expect

describe('DotValidator', () => {
    describe('.isValid', () => {

        let dotValidator = null

        beforeEach(() => {
            dotValidator = new DotValidator()
        })

        it('should validate a .', () => {
            const valid = dotValidator.isValid('.', 0)
            expect(valid).to.equal(true)
        })

        it('should not validate other characters than a .', () => {

            for (let i = 32, n = 126; i < n; i++) {
                const character = String.fromCharCode(i)

                if (character === '.') {
                    continue
                }
                const valid = dotValidator.isValid(character, 0)
                expect(valid).to.equal(false)
            }
        })
    })
})