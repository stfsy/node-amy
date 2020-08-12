'use strict'

const DashValidator = require('./charCodeValidator/dashValidator')
const AtValidator = require('./charCodeValidator/atValidator')
const BlankSpaceValidator = require('./charCodeValidator/blankSpaceValidator')
const DotValidator = require('./charCodeValidator/dotValidator')
const ForwardSlashValidator = require('./charCodeValidator/forwardSlashValidator')
const LowerCaseValidator = require('./charCodeValidator/lowercaseLetterValidator')
const RoundBracketValidator = require('./charCodeValidator/roundBracketValidator')
const CurlyBracketValidator = require('./charCodeValidator/curlyBracketValidator')
const UpperCaseValidator = require('./charCodeValidator/uppercaseLetterValidator')
const DigitsValidator = require('./charCodeValidator/digitsValidator')

/** */
class CharacterValidator {

    constructor(validators) {
        this._validators = validators
    }

    static get Builder() {

        return Builder
    }

    /** 
     * Checks if a string contains a valid or invalid character at a given index. This check is very strict
     * and may be simplified in the future
     * @param {String} string the string that contains the character to be validated
     * @param {Number} index the index of the character
     * @returns {boolean} true if the character is a valid character, false if not
    */
    isValid(string, index) {
        return this._validators.some(validator => validator.isValid(string, index))
    }
}

/** 
 * @memberof Validator
 * @private 
 * */
class Builder {

    constructor() {
        this._validators = []
    }

    allowDash() {
        this._validators.push(new DashValidator())
        return this
    }

    /** */
    allowAt() {
        this._validators.push(new AtValidator())
        return this
    }

    /** */
    allowBlank() {
        this._validators.push(new BlankSpaceValidator())
        return this
    }

    /** */
    allowDot() {
        this._validators.push(new DotValidator())
        return this
    }

    /** */
    allowForwardSlash() {
        this._validators.push(new ForwardSlashValidator())
        return this
    }

    /** */
    allowRoundBrackets() {
        this._validators.push(new RoundBracketValidator())
        return this
    }

    /** */
    allowCurlyBrackets() {
        this._validators.push(new CurlyBracketValidator())
        return this
    }

    /** */
    allowUpperCaseLetters() {
        this._validators.push(new UpperCaseValidator())
        return this
    }

    /** */
    allowLowerCaseLetters() {
        this._validators.push(new LowerCaseValidator())
        return this
    }

    allowDigits() {
        this._validators.push(new DigitsValidator())
        return this
    }

    /** */
    build() {
        return new CharacterValidator(this._validators)
    }
}

module.exports = CharacterValidator