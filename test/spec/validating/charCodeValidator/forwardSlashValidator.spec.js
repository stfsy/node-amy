'use strict'

const resolve = require('path').resolve
const ForwardSlashValidator = require(resolve('lib/validating/charCodeValidator/forwardSlashValidator'))

const expect = require('chai').expect

describe('ForwardSlashValidator', () => {
    describe('.isValid', () => {

        let forwardSlashValidator = null

        beforeEach(() => {
            forwardSlashValidator = new ForwardSlashValidator()
        })

        it('should validate a /', () => {
            const valid = forwardSlashValidator.isValid('/', 0);
            expect(valid).to.equal(true)
        })

        it('should not validate other characters than a /', () => {

            for (let i = 32, n = 126; i < n; i++) {
                const character = String.fromCharCode(i)

                if (character === '/') {
                    continue
                }
                const valid = forwardSlashValidator.isValid(character, 0)
                expect(valid).to.equal(false)
            }
        })
    })
})