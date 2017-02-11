'use strict'

const resolve = require('path').resolve
const Validator = require.main.require(resolve('lib/validating/validator'))
const expect = require('chai').expect

describe('Validator', () => {
    describe('.Builder', () => {
        describe('.allowAt .build', () => {

            let validator = null

            beforeEach(() => {
                validator = new Validator.Builder().allowAt().build()
            })

            it('should create a validator that validates a @', () => {
                const valid = validator.isValid('@', 0)
                expect(valid).to.equal(true)
            })

            it('should create a validator that does not validate other characters than @', () => {

                for (let i = 32, n = 126; i < n; i++) {
                    const character = String.fromCharCode(i)

                    if (character === '@') {
                        continue
                    }
                    const valid = validator.isValid(character, 0)
                    expect(valid).to.equal(false)
                }
            })
        })

        describe('.allowBlank .build', () => {

            let validator = null

            beforeEach(() => {
                validator = new Validator.Builder().allowBlank().build()
            })

            it('should create a validator that validates a blank space', () => {
                const valid = validator.isValid(' ', 0)
                expect(valid).to.equal(true)
            })

            it('should create a validator that does not validate other characters than a blank space', () => {
                for (let i = 32, n = 126; i < n; i++) {
                    const character = String.fromCharCode(i)

                    if (character === ' ') {
                        continue
                    }
                    const valid = validator.isValid(character, 0)
                    expect(valid).to.equal(false)
                }
            })
        })

        describe('.allowDot .build', () => {

            let validator = null

            beforeEach(() => {
                validator = new Validator.Builder().allowDot().build()
            })

            it('should create a validator that validates a .', () => {
                const valid = validator.isValid('.', 0)
                expect(valid).to.equal(true)
            })

            it('should create a validator that does not validate other characters than a .', () => {
                for (let i = 32, n = 126; i < n; i++) {
                    const character = String.fromCharCode(i)

                    if (character === '.') {
                        continue
                    }
                    const valid = validator.isValid(character, 0)
                    expect(valid).to.equal(false)
                }
            })
        })

        describe('.allowForwardSlash .build', () => {

            let validator = null

            beforeEach(() => {
                validator = new Validator.Builder().allowForwardSlash().build()
            })

            it('should create a validator that validates a /', () => {
                const valid = validator.isValid('/', 0)
                expect(valid).to.equal(true)
            })

            it('should create a validator that does not validate other characters than a /', () => {
                for (let i = 32, n = 126; i < n; i++) {
                    const character = String.fromCharCode(i)

                    if (character === '/') {
                        continue
                    }
                    const valid = validator.isValid(character, 0)
                    expect(valid).to.equal(false)
                }
            })
        })

        describe('.allowLowerCaseLetters .build', () => {

            let validator = null

            beforeEach(() => {
                validator = new Validator.Builder().allowLowerCaseLetters().build()
            })

            it('should create a validator that validates all lowercase letters', () => {
                for (let i = 97, n = 122; i < n; i++) {
                    const character = String.fromCharCode(i)
                    const valid = validator.isValid(character, 0)
                    expect(valid).to.equal(true)
                }
            })

            it('should create a validator that does not validate other characters than all lowercase letters', () => {
                for (let i = 32, n = 96; i < n; i++) {
                    const character = String.fromCharCode(i)
                    const valid = validator.isValid(character, 0)
                    expect(valid).to.equal(false)
                }

                for (let i = 123, n = 126; i < n; i++) {
                    const character = String.fromCharCode(i)
                    const valid = validator.isValid(character, 0)
                    expect(valid).to.equal(false)
                }
            })
        })

        describe('.allowUpperCaseLetters .build', () => {

            let validator = null

            beforeEach(() => {
                validator = new Validator.Builder().allowUpperCaseLetters().build()
            })

            it('should create a validator that validates all uppercase letters', () => {
                for (let i = 65, n = 90; i < n; i++) {
                    const character = String.fromCharCode(i)
                    const valid = validator.isValid(character, 0)
                    expect(valid).to.equal(true)
                }
            })

            it('should create a validator that does not validate other characters than all uppercase letters', () => {
                for (let i = 32, n = 64; i < n; i++) {
                    const character = String.fromCharCode(i)
                    const valid = validator.isValid(character, 0)
                    expect(valid).to.equal(false)
                }

                for (let i = 91, n = 126; i < n; i++) {
                    const character = String.fromCharCode(i)
                    const valid = validator.isValid(character, 0)
                    expect(valid).to.equal(false)
                }
            })
        })

        describe('.allowRoundBrackets .build', () => {

            let validator = null

            beforeEach(() => {
                validator = new Validator.Builder().allowRoundBrackets().build()
            })

            it('should create a validator that validates an (', () => {
                const valid = validator.isValid('(', 0)
                expect(valid).to.equal(true)
            })

            it('should create a validator that validates an )', () => {
                const valid = validator.isValid(')', 0)
                expect(valid).to.equal(true)
            })

            it('should create a validator that does not validate other characters than a ( and )', () => {
                for (let i = 32, n = 39; i < n; i++) {
                    const character = String.fromCharCode(i)
                    const valid = validator.isValid(character, 0)
                    expect(valid).to.equal(false)
                }

                for (let i = 42, n = 126; i < n; i++) {
                    const character = String.fromCharCode(i)
                    const valid = validator.isValid(character, 0)
                    expect(valid).to.equal(false)
                }
            })
        })

        describe('.allowAt .allowBlank .build', () => {

            let validator = null

            beforeEach(() => {
                validator = new Validator.Builder().allowAt().allowBlank().build()
            })

            it('should create a validator that validates a @', () => {
                const valid = validator.isValid('@', 0)
                expect(valid).to.equal(true)
            })

            it('should create a validator that validates a blank space', () => {
                const valid = validator.isValid(' ', 0)
                expect(valid).to.equal(true)
            })

            it('should create a validator that does not validate other characters than a blank space and a @', () => {
                for (let i = 32, n = 126; i < n; i++) {
                    const character = String.fromCharCode(i)

                    if (character === ' ' || character === '@') {
                        continue
                    }
                    const valid = validator.isValid(character, 0)
                    expect(valid).to.equal(false)
                }
            })
        })

        describe('.allowAt .allowBlank .build', () => {

            let validator = null

            beforeEach(() => {
                validator = new Validator.Builder().allowDot().allowForwardSlash().build()
            })

            it('should create a validator that validates a .', () => {
                const valid = validator.isValid('.', 0)
                expect(valid).to.equal(true)
            })

            it('should create a validator that validates a /', () => {
                const valid = validator.isValid('/', 0)
                expect(valid).to.equal(true)
            })

            it('should create a validator that does not validate other characters than a / and a .', () => {
                for (let i = 32, n = 126; i < n; i++) {
                    const character = String.fromCharCode(i)

                    if (character === '/' || character === '.') {
                        continue
                    }
                    const valid = validator.isValid(character, 0)
                    expect(valid).to.equal(false)
                }
            })
        })

        describe('.allowLowerCaseLetters .allowRoundBrackets .build', () => {

            let validator = null

            beforeEach(() => {
                validator = new Validator.Builder().allowLowerCaseLetters().allowRoundBrackets().build()
            })

            it('should create a validator that validates all lowercase letters', () => {
                for (let i = 97, n = 122; i < n; i++) {
                    const character = String.fromCharCode(i)
                    const valid = validator.isValid(character, 0)
                    expect(valid).to.equal(true)
                }
            })

            it('should create a validator that validates an (', () => {
                const valid = validator.isValid('(', 0)
                expect(valid).to.equal(true)
            })

            it('should create a validator that validates an )', () => {
                const valid = validator.isValid(')', 0)
                expect(valid).to.equal(true)
            })

            it('should create a validator that does not validate other characters than a ( and ) and lowercase letters', () => {
                for (let i = 32, n = 39; i < n; i++) {
                    const character = String.fromCharCode(i)
                    const valid = validator.isValid(character, 0)
                    expect(valid).to.equal(false)
                }

                for (let i = 42, n = 96; i < n; i++) {
                    const character = String.fromCharCode(i)
                    const valid = validator.isValid(character, 0)
                    expect(valid).to.equal(false)
                }

                for (let i = 123, n = 126; i < n; i++) {
                    const character = String.fromCharCode(i)
                    const valid = validator.isValid(character, 0)
                    expect(valid).to.equal(false)
                }
            })
        })

        describe('.allowLowerCaseLetters .allowRoundBrackets .allowUpperCaseLetters .build', () => {

            let validator = null

            beforeEach(() => {
                validator = new Validator.Builder().allowLowerCaseLetters().allowUpperCaseLetters().allowRoundBrackets().build()
            })

            it('should create a validator that validates all lowercase letters', () => {
                for (let i = 97, n = 122; i < n; i++) {
                    const character = String.fromCharCode(i)
                    const valid = validator.isValid(character, 0)
                    expect(valid).to.equal(true)
                }
            })

            it('should create a validator that validates all uppercase letters', () => {
                for (let i = 65, n = 90; i < n; i++) {
                    const character = String.fromCharCode(i)
                    const valid = validator.isValid(character, 0)
                    expect(valid).to.equal(true)
                }
            })

            it('should create a validator that validates a (', () => {
                const valid = validator.isValid('(', 0)
                expect(valid).to.equal(true)
            })

            it('should create a validator that validates a )', () => {
                const valid = validator.isValid(')', 0)
                expect(valid).to.equal(true)
            })

            it('should create a validator that does not validate other characters than a ( and ) and lowercase letters', () => {
                for (let i = 32, n = 39; i < n; i++) {
                    const character = String.fromCharCode(i)
                    const valid = validator.isValid(character, 0)
                    expect(valid).to.equal(false)
                }

                for (let i = 42, n = 65; i < n; i++) {
                    const character = String.fromCharCode(i)
                    const valid = validator.isValid(character, 0)
                    expect(valid).to.equal(false)
                }

                for (let i = 91, n = 96; i < n; i++) {
                    const character = String.fromCharCode(i)
                    const valid = validator.isValid(character, 0)
                    expect(valid).to.equal(false)
                }

                for (let i = 123, n = 126; i < n; i++) {
                    const character = String.fromCharCode(i)
                    const valid = validator.isValid(character, 0)
                    expect(valid).to.equal(false)
                }
            })
        })
    })
})