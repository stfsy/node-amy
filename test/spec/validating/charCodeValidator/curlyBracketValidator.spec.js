'use strict'

const resolve = require('path').resolve
const RoundBracketValidator = require(resolve('lib/validating/charCodeValidator/curlyBracketValidator'))

const expect = require('chai').expect

describe('CurlyBracketValidator', () => {
    describe('.isValid', () => {

        let roundBracketValidator = null

        beforeEach(() => {
            roundBracketValidator = new RoundBracketValidator()
        })
        it('should validate an (', () => {
            const valid = roundBracketValidator.isValid('{', 0)
            expect(valid).to.equal(true)
        })
        it('should validate an )', () => {
            const valid = roundBracketValidator.isValid('}', 0)
            expect(valid).to.equal(true)
        })
        it('should not validate other characters than a { and }', () => {
            for (let i = 32, n = 123; i < n; i++) {
                const character = String.fromCharCode(i)
                const valid = roundBracketValidator.isValid(character, 0)
                expect(valid).to.equal(false)
            }

            const character = String.fromCharCode(126)
            const valid = roundBracketValidator.isValid(character, 0)
            expect(valid).to.equal(false)
        })
    })
})