'use strict'

/** 
 * @memberof Parser
 * @private 
 * */
class CommandParsers {

    constructor() {
    }

    static get REGISTERED_PARSERS() {
        return [
            'as', 'extend', 'forEach', 'import', 'with'
        ]
    }

    /** */
    parserFor(token) {
        switch (token) {
            case 'as':
                return new GenericCommandParser()
            case 'extend':
                return new GenericCommandParser()
            case 'forEach':
                return new GenericCommandParser()
            case 'import':
                return new GenericCommandParser()
            case 'with':
                return new GenericCommandParser()
        }
    }
}

/** 
 * @memberof Parser 
 * @private
 * */
class GenericCommandParser {

    parse(tokens, index) {
        const token = tokens[index]
        const args = tokens[index + 1]

        const argsIsCommand = args && CommandParsers.REGISTERED_PARSERS.some((parser) => {
            return args === parser
        })

        return new Command(token, argsIsCommand ? null : args)
    }
}

/** 
 * @memberof Parser
 * @private
*/
class Command {

    constructor(name, args) {
        this._name = name
        this._args = args
    }

    /**
     * @returns {String} the name of the command
     */
    name() {
        return this._name
    }

    /**
     * @returns {boolean} true if the command has arguments, false if not
     */
    withArguments() {
        return this._args !== undefined && this._args !== null
    }

    /**
     * @returns {String} the arguments of the command, undefined if none are set
     */
    arguments() {
        return this._args
    }
}

module.exports = CommandParsers