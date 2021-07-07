'use strict'

const Validator = require('../validating/validator')

/** */
class StringTokenizer {
    /** */
    constructor() {

        this._BLANK_SPACE = ' '
        this._validator = new Validator.Builder()
            .allowDot()
            .allowAt()
            .allowDash()
            .allowForwardSlash()
            .allowUpperCaseLetters()
            .allowLowerCaseLetters()
            .allowRoundBrackets()
            .allowCurlyBrackets()
            .allowDigits()
            .build()
    }

    /** 
     * @param {String} string the string to be splitted into multiple tokens
     * @returns {Array<String>} an array of tokens. the 
     * @example
     * const tokens = tokenizer.tokenize('@amy import(abc/def.html).with(abc.d.e.f.g)')
     * // tokens[0] => @amy
     * // tokens[1] => import(abc/def.html).with(abc.d.e.f.g)
     * 
     * @example
     * const tokens = tokenizer.tokenize('@amy import abc/def.html with abc.d.e.f.g ')
     * // tokens[0] => @amy
     * // tokens[1] => import
     * // tokens[2] => abc/def.html
     * // tokens[3] => with
     * // tokens[4] => abc.d.e.f.g
    */
    tokenize(string) {
        const tokens = []
        let buffer = ['']

        for (let i = 0, n = string.length; i < n; i++) {
            if (string.charAt(i) === this._BLANK_SPACE) {
                /* istanbul ignore else */
                if (buffer.length > 1) {
                    tokens.push(buffer.join(''))
                    buffer = ['']
                }
            }
            if (this._validator.isValid(string, i)) {
                buffer.push(string.charAt(i))
            }
        }

        if (buffer.length > 1) {
            tokens.push(buffer.join(''))
        }

        return tokens
    }
}

module.exports = StringTokenizer