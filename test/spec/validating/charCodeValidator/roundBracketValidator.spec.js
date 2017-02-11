'use strict'

const resolve = require('path').resolve
const RoundBracketValidator = require(resolve('lib/validating/charCodeValidator/roundBracketValidator'))

const expect = require('chai').expect

describe('RoundBracketValidator', () => {
    describe('.isValid', () => {

        let roundBracketValidator = null

        beforeEach(() => {
            roundBracketValidator = new RoundBracketValidator()
        })

        it('should validate an (', () => {
            const valid = roundBracketValidator.isValid('(', 0)
            expect(valid).to.equal(true)
        })
        
        it('should validate an )', () => {
            const valid = roundBracketValidator.isValid(')', 0)
            expect(valid).to.equal(true)
        })

        it('should not validate other characters than a ( and )', () => {
            for (let i = 32, n = 39; i < n; i++) {
                const character = String.fromCharCode(i)
                const valid = roundBracketValidator.isValid(character, 0)
                expect(valid).to.equal(false)
            }

            for (let i = 42, n = 126; i < n; i++) {
                const character = String.fromCharCode(i)
                const valid = roundBracketValidator.isValid(character, 0)
                expect(valid).to.equal(false)
            }
        })
    })
})