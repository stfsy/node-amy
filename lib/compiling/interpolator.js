'use strict'

const PLACEHOLDER_START_SYMBOL = '{{'
const PLACEHOLDER_END_SYMBOL = '}}'

/** */
class StringInterpolator {

    /** 
     * Returns true if the string contains a placeholder that can be interpolated
     * @param {String} string the string to be interpolated
     * @returns {boolean} 
     * @example
     *  const string = 'I got a new phone! It's a {{ phone.manufacture.name }}!'
     * 
     * const canInterpolate = interpolator.canInterpolate(string)
     * // canInterpolate => true
    */
    canInterpolate(string) {
        return string.includes(PLACEHOLDER_START_SYMBOL) && string.includes(PLACEHOLDER_END_SYMBOL)
    }

    /** 
     * Returns an object containing placeholders and static strings
     * @param {String} string the string to be interpolated
     * @returns {Object} 
     * @example
     *  const string = 'I got a new phone! It's a {{ phone.manufacture.name }}!'
     * 
     * const canInterpolate = interpolator.interpolatables(string)
     * // canInterpolate => true
    */
    interpolatables(string) {
        return this._tokenize(string)
    }

    /** 
     * Interpolates the given string by searching for placeholders/handlebars and resolving the values using
     * the given context
     * @param {String} string the string to be interpolated
     * @param {Object} context the context the interpolated values are resolved against
     * @returns {String} the interpolated String 
     * @example
     *  const string = 'I got a new phone! It's a {{ phone.manufacture.name }}!'
     * 
     *  const context = {
     *     phone: {
     *        manufacturer: {
     *             name: 'Pixus'
     *         }
     *      }
     *  }
     *
     * const propertyPath = 'phone.manufacturer.name'
     * const value = interpolator.interpolate(propertyPath, context)
     * // value => 'I got a new phone! It's a Pixus!'
    */
    interpolate(string, context) {
        const tokens = this._tokenize(string)
        return this.interpolateWithTokens(tokens, context)
    }

    interpolateWithTokens(tokens, context) {
        const staticTokens = tokens.statics
        const interpolatableTokens = tokens.interpolatables

        const result = []

        const loopCount = Math.max(staticTokens.length, interpolatableTokens.length)

        for(let i = 0, n = loopCount; i < n; i++) {
            
            if (i < staticTokens.length) {
                result.push(staticTokens[i])
            }

            if (i < interpolatableTokens.length) {
                const value = this.valueFor(interpolatableTokens[i], context)
                result.push(value)
            }
        }

        return result.join('')
    }

    /** 
     * Extracts a property out of a given context. Properties can be looked up deeply by specifying the correct
     * names of the objects all along the path to the value we want to get. Names have to be separated by dots.
     * @param {String} propertyPath the path to lookup the value we want
     * @param {Object} context the context the value is resolved against
     * @returns {Any} 
     * @example
     *  const context = {
     *     phone: {
     *        manufacturer: {
     *             name: 'Sammy'
     *         }
     *      }
     *  }
     *
     * const propertyPath = 'phone.manufacturer.name'
     * const value = interpolator.valueFor(propertyPath, context)
     * // value => 'Sammy'
    */
    valueFor(propertyPath, context) {
        
        if (!propertyPath) {
            return context
        }

        const splittedPath = propertyPath.split('.')

        return splittedPath.reduce((previous, current) => {
            return previous ? previous[current] : ''
        }, context)
    }

    /** @private */
    _tokenize(string) {

        const statics = []
        const interpolatables = []

        let buffer = []

        for (let i = 0, n = string.length; i<n; i++) {
            const char = string.charAt(i)
            const nextChar = string.charAt(i+1)

            if (char === '{' && nextChar === '{') {
                statics.push(buffer.join(''))
                buffer = []
                i++
            } else if (char === '}' && nextChar === '}') {
                interpolatables.push(buffer.join('').trim())
                buffer = []
                i++
            } else {
                buffer.push(char)
            }
        }

        if (buffer.length) {
            statics.push(buffer.join(''))
        }

        return { statics: statics, interpolatables: interpolatables }
    }
}

module.exports = StringInterpolator