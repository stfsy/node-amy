'use strict'

module.exports = (message, command, context) => {
    const error = new Error(message)
    error.amy = {
        context: context,
        command: command,
    }
    return error
}