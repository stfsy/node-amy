'use strict'

const Tokenizer = require('../tokenizing/tokenizer')
const CommandParsers = require('./commandParsers')

/** */
class CommandParser {

    constructor() {
        this._tokenizer = new Tokenizer()
        this._commandParsers = new CommandParsers()
    }

    /** 
     * @param {String} line 
     * @returns {boolean} true if the line can be parsed, false if not 
    */
    isParseable(line) {
        return line.indexOf('@amy') >= 0
    }

    /** 
     * @param {String} line the line to be parsed
     * @returns {Array<Parser.Command>} an array of commands
    */
    parseLine(line) {
        let operations = []

        let tokens = this._tokenizer.tokenize(line)

        if (tokens.length === 2) {
            tokens = tokens[1].match(/[a-zA-Z]+|\([\.a-zA-Z/]+\)/g)
        }

        tokens = tokens.map((token) => {
            return token.replace('(', '').replace(')', '')
        })

        tokens.forEach((token, index) => {
            const parser = this._commandParsers.parserFor(token)
            if (parser) {
                const operation = parser.parse(tokens, index)
                operations.push(operation)
            }
        })

        return operations
    }
}

module.exports = CommandParser