'use strict'

/** 
 * @memberof Validator 
 * @private 
 * */
class CharCodeValidator {

    constructor(lowerBoundary, upperBoundary) {
        this._lowerBoundary = lowerBoundary
        this._upperBoundary = upperBoundary
    }

    /** */
    static forRange(from, to) {
        return CharCodeValidator.bind(null, from.charCodeAt(0), to.charCodeAt(0))
    }

    /** */
    static forSingleCharacter(string) {
        return CharCodeValidator.bind(null, string.charCodeAt(0), string.charCodeAt(0))
    }

    /** */
    isValid(string, index) {
        const charCode = string.charCodeAt(index)
        return charCode >= this._lowerBoundary && charCode <= this._upperBoundary
    }
}

module.exports = CharCodeValidator