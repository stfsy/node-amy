'use strict'

const resolve = require('path').resolve
const BlankSpaceValidator = require(resolve('lib/validating/charCodeValidator/blankSpaceValidator'))

const expect = require('chai').expect

describe('BlankSpaceValidator', () => {
    describe('.isValid', () => {

        let blankSpaceValidator = null

        beforeEach(() => {
            blankSpaceValidator = new BlankSpaceValidator()
        })

        it('should validate a blank space', () => {
            const valid = blankSpaceValidator.isValid(' ', 0)
            expect(valid).to.equal(true)
        })

        it('should not validate other characters than a blank space', () => {

            for (let i = 32, n = 126; i < n; i++) {
                const character = String.fromCharCode(i)

                if (character === ' ') {
                    continue
                }
                const valid = blankSpaceValidator.isValid(character, 0);
                expect(valid).to.equal(false)
            }
        })
    })
})