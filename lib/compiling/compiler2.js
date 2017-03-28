'use strict'

const Node = require('node-html-light').Node
const Nodes = require('node-html-light').Nodes
const Reader = require('../reading/reader')
const Writer = require('../writing/writer')
const Parser = require('../parsing/parser2')
const Interpolator = require('./interpolator')

/** */
class TemplateCompiler {

    constructor() {
        this._reader = new Reader()
        this._writer = new Writer()
        this._parser = new Parser()
        this._interpolator = new Interpolator()
    }

    /** 
     * Compiles templates that are in a subfolder of the inputPath und match the glob pattern. Compiled templates are written
     * to the output directory. Commands are executed using the given context.
     * 
     * @param {String} glob the glob pattern
     * @param {String} inputPath the input path to start checking for files
     * @param {String} outputPath the output path of the compiled files
     * @param {Object} context the context that will be used to execute commands and interpolate placeholders
     * @returns {Promise} a promise that will be resolved once all templates are compiled and written to the output directory
    */
    compile(glob, inputPath, outputPath, context) {
        return this._reader.matchFiles(glob, inputPath).then((inputFiles) => {
            const promises = inputFiles.map((inputFile) => {
                return this._reader.readNodes(inputPath, inputFile).then((nodes) => {
                    return this._compile(nodes, context)
                }).then((nodes) => {
                    return this._writer.writeNodes(outputPath, inputFile, nodes)
                })
            })
            return Promise.all(promises)
        })
    }

    /** @private */
    _compile(nodes, context) {
        const promises = []

        nodes.forEach((node, index) => {
            const commentNodes = node.find({
                type: Node.TYPE_COMMENT
            })

            // iterating backwards because we might insert some elements 
            // while iterating through the array. iterating backwards will 
            // help us do that because we will insert at index i+1
            for (let i = commentNodes.length - 1; i >= 0; i--) {
                const commentNode = commentNodes[i]
                if (this._parser.isParseable(commentNode.get().data)) {
                    promises.push(this._execute(node, nodes, commentNode, context).then((elements) => {
                        elements.reverse().forEach((element) => {
                            // it is important to check the parent of the comment node because
                            // if we are compiling a template which contains a command at the 
                            // highest level of the dom, we cannot just append the element node. 
                            // hell we can but the node won't make it into the serialized output 
                            // so if we have no parent we gotta insert the new element manually into the nodes array
                            const parent = commentNode.parent
                            if (!parent) {
                                nodes.splice(index + 1, 0, element)
                            } else {
                                parent.appendChildAfter(element, commentNode)
                            }
                        })
                    }))
                }
            }
        })

        return Promise.all(promises).then(_ => nodes)
    }

    /** @private */
    _execute(node, nodes, commentNode, context) {
        const commands = this._parser.parseLine(commentNode.get().data)

        const forEachCommand = commands.find((command) => {
            return command.name() === 'forEach'
        })
        const importCommand = commands.find((command) => {
            return command.name() === 'import'
        })

        if (forEachCommand) {
            return this._reader.readNodes(importCommand.arguments()).then((nodes) => {
                return this._forEach(nodes, commentNode, forEachCommand, commands, context)
            })
        } else if (importCommand) {
            return this._import(node, commentNode, importCommand, commands, context)
        } else {
            throw new Error('Cannot handle unknown command ' + command.name())
        }
    }

    /** @private */
    _forEach(nodes, commentNode, command, commands, globalContext) {
        const newNodes = []
        const elements = this._interpolator.valueFor(command.arguments(), (globalContext))

        if (!nodes) {
            const error = new Error('Cannot invoke forEach operation on falsy nodes. Did you invoke forEach before import?')
            error.amy = {
                command: command,
                context: globalContext
            }
            throw error
        }

        if (!Array.isArray(elements)) {
            const error = new Error('Cannot invoke forEach operation with a context that is not of type Array')
            error.amy = {
                trigger: commentNode.get().data,
                command: command,
                context: JSON.stringify(globalContext),
            }
            throw error
        }

        const htmlStrings = nodes.map((node) => node.toHtml())

        const promises = elements.map((element) => {
            const nodes = htmlStrings.map((string) => Node.fromString(string))
            const context = this._alias(nodes, commentNode, command, commands, element)

            return this._compile(nodes, context).then((compiled) => {
                return this._interpolate(compiled, context)
            }).then((nodes) => {
                nodes.forEach((node) => {
                    newNodes.push(node)
                })
            })
        })

        return Promise.all(promises).then(_ => newNodes)
    }

    /** @private */
    _import(node, commentNode, command, commands, globalContext, interpolate) {
        return this._reader.readNodes(command.arguments()).then((nodes) => {

            const context = this._alias(nodes, commentNode, command, commands, globalContext)

            return this._compile(nodes, context).then((nodes) => {
                return this._interpolate(nodes, context)
            })
        })
    }

    /** @private */
    _interpolate(nodes, context) {

        const wrappedNodes = new Nodes(nodes)
        wrappedNodes.forEach((node) => {
            const type = node.get().type
            const attributes = node.attributes

            if (type === Node.TYPE_TAG) {
                for (let key in attributes) {
                    const value = attributes[key]
                    attributes[key] = this._interpolator.interpolate(value, context)
                }
            } else if (type === Node.TYPE_TEXT) {
                const rawNode = node.get()
                const text = rawNode.data
                rawNode.data = this._interpolator.interpolate(text, context)
            }
        }, true)

        /*nodes.forEach((node) => {

            const textNodes = node.find({
                type: 'text'
            })

            textNodes.forEach((textNode) => {

            })
        })*/

        return Promise.resolve(nodes)
    }

    /** @private */
    _alias(node, commentNode, command, commands, context) {
        const aliasCommand = commands.find((command) => command.name() === 'as')
        const withCommand = commands.find((command) => command.name() === 'with')

        if (!aliasCommand && !withCommand) {
            // return the initial context
            return context
        } else if (aliasCommand && !withCommand) {
            // return a new object with the alias arguments values as key
            // and the initial context as value
            const aliasArgument = aliasCommand.arguments()
            const newContext = {}
            newContext[aliasArgument] = context
            return newContext
        } else if (!aliasCommand && withCommand) {
            // no need to return a new object, extract the value of the with arguments
            // and get the value from the initial contet
            const withArgument = withCommand.arguments()
            const withValue = this._interpolator.valueFor(withArgument, context)
            return withValue
        } else {
            // having both commands means we will return a new object with the
            // alias arguments values as key and the value which we extracted out of our
            // context with help from the with commands argument
            const aliasArgument = aliasCommand.arguments()
            const withArgument = withCommand.arguments()
            const withValue = this._interpolator.valueFor(withArgument, context)

            const newContext = {}
            newContext[aliasArgument] = withValue
            return newContext
        }
    }
}


module.exports = TemplateCompiler