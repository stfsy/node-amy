'use strict'

const Node = require('node-html-light').Node
const Nodes = require('node-html-light').Nodes
const Reader = require('../reading/pre-compiling-reader')
const Writer = require('../writing/writer')
const Parser = require('../parsing/parser2')
const Interpolator = require('./interpolator')

const createError = require('../utilities/error')

/** */
class TemplateCompiler {

    constructor(inputPath, removeComments) {
        this._reader = new Reader(inputPath)
        this._writer = new Writer()
        this._parser = new Parser()
        this._interpolator = new Interpolator()

        if (removeComments !== undefined) {
            this._removeComments = removeComments === true
        } else {
            this._removeComments = process.env.NODE_ENV === 'production'
        }

        this._usePrecompilation = true

        // attributes like checked have no values
        this._attributes_which_values_are_ignored = ['autofocus', 'checked', 'disabled', 'required']
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
                return this._reader.readNodes(inputPath, inputFile)
                    .then((nodes) => {
                        return this._interpolatePrecompiled(inputFile, nodes, context)
                    }).then((nodes) => {
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
                    promises.push(this._execute(commentNode, context).then((elements) => {
                        if (elements) { // could be falsy case for marker commands like 'include' 
                            elements.reverse().forEach((element) => {
                                // it is important to check the parent of the comment node because
                                // if we are compiling a template which contains a command at the 
                                // highest level of the dom, we cannot just append the element node. 
                                // hell we can but the node won't make it into the serialized output 
                                // so if we have no parent we gotta insert the new element manually into the nodes array
                                const parent = commentNode.parent
                                if (!parent || parent.type === 'root') {
                                    nodes.splice(index + 1, 0, element)
                                } else {
                                    parent.appendChildAfter(element, commentNode)
                                }
                            })
                        }

                        // don't remove include comments here because we have not yet
                        // executed them
                        if (this._removeComments && !commentNode.get().data.includes('include')) {
                            commentNode.removeChild(commentNode)
                        }
                    }))
                }
            }
        })

        return Promise.all(promises).then(_ => nodes)
    }

    /** @private */
    _execute(commentNode, context) {
        const commands = this._parser.parseLine(commentNode.get().data)

        const ifCommand = commands.find((command) => {
            return command.name() === 'if'
        })
        const forEachCommand = commands.find((command) => {
            return command.name() === 'forEach'
        })
        const importCommand = commands.find((command) => {
            return command.name() === 'import'
        })
        const addCommand = commands.find((command) => {
            return command.name() === 'add'
        })
        const includeCommand = commands.find((command) => {
            return command.name() === 'include'
        })


        // if needs to go first. if it returns true we can execute other commands
        if (ifCommand) {
            const truthy = this._if(importCommand, commands, context)
            if (!truthy) {
                return Promise.resolve()
            }
        }

        if (forEachCommand) {
            return this._reader.readNodes(importCommand.arguments()).then((nodes) => {
                return this._forEach(nodes, commentNode, forEachCommand, commands, context)
            })
        } else if (addCommand) {
            return this._add(importCommand, commands, context)
        } else if (importCommand) {
            return this._import(importCommand, commands, context)
        } else if (includeCommand) {
            return Promise.resolve()
        } else {
            throw createError('Cannot handle unknown command in comment', commands, context)
        }
    }

    /** @private */
    _if(_, commands, context) {
        const indexOfIfCommand = commands.findIndex((command) => {
            return command.name() === 'if'
        })

        const ifCommands = commands[indexOfIfCommand]
        const conditionalCommand = commands.filter((command) => {
            return command.name() == 'is'
        })

        const value = this._interpolator.valueFor(ifCommands.arguments(), (context))

        if (conditionalCommand.length > 0 && conditionalCommand[0].name() === 'is') {
            return this._is(conditionalCommand[0], value)
        } else if (value) {
            return value
        }
    }

    _is(isCommand, value) {
        switch (isCommand.arguments()) {
            case 'truthy': {
                return value
            }
            case 'falsy': {
                return !value
            }
            case 'true': {
                return value === true
            }
            case 'false': {
                return value === false
            }
            default:
                throw createError('Cannot handle unknown conditional in command', isCommand, value)
        }
    }

    /** @private */
    _forEach(nodes, commentNode, command, commands, globalContext) {
        const newNodes = []
        const elements = this._interpolator.valueFor(command.arguments(), (globalContext))

        if (!nodes) {
            throw createError('Cannot invoke forEach operation on falsy nodes. Did you invoke forEach before import?', command, globalContext)
        }

        if (!Array.isArray(elements)) {
            throw createError('Cannot invoke forEach operation with a context that is not of type Array', command, globalContext)
        }

        const htmlStrings = nodes.map((node) => node.toHtml())

        const promises = elements.map((element) => {
            const nodes = htmlStrings.map((string) => Node.fromString(string))
            const context = this._alias(commands, element)

            return this._compile(nodes, context).then((compiled) => {
                return this._interpolate(compiled, context)
            })
        })

        return Promise.all(promises).then(nodes => {
            return nodes.flat(1)
        })
    }

    _add(importCommand, commands, context) {
        const indexOfInclude = commands.findIndex((command) => {
            return command.name() === 'add'
        })

        const includeCommands = commands.slice(indexOfInclude)
        const parentCommands = commands.slice(0, indexOfInclude)

        return this._import(includeCommands[0], includeCommands, context).then((newChildNodes) => {
            return this._import(parentCommands[0], parentCommands, context).then((parentNodes) => {
                return this._include(parentNodes, newChildNodes)
            })
        })
    }

    _include(siblingNodes, newChildNodes) {
        const topLevelIncludeCommentNodeIndex = siblingNodes.findIndex((node) => {
            if (node.type === Node.TYPE_COMMENT) {
                const commands = this._parser.parseLine(node.get().data)
                if (commands.find((command) => {
                    return command.name() === 'include'
                })) {
                    return true
                }
            }
        })

        if (topLevelIncludeCommentNodeIndex !== -1) {
            const topLevelIncludeCommentNode = siblingNodes[topLevelIncludeCommentNodeIndex]
            // newChildNodes.reduce((current, next) => {
            //     current.appendChildAfter(next, current)
            //     return current
            // }, topLevelIncludeCommentNode)

            newChildNodes.forEach((node, index) => {
                siblingNodes.splice(topLevelIncludeCommentNodeIndex + topLevelIncludeCommentNodeIndex, 0, node)
            })

            if (this._removeComments) {
                topLevelIncludeCommentNode.removeChild(topLevelIncludeCommentNode)
                siblingNodes.splice(topLevelIncludeCommentNodeIndex, 1)
            }

            return siblingNodes
        }

        // if theres no include comment at root level of the fragment
        // we need to traves all node
        siblingNodes.some((parentNode) => {
            const commentNodes = parentNode.find({
                type: Node.TYPE_COMMENT
            })

            return commentNodes.some((commentNode) => {
                const commands = this._parser.parseLine(commentNode.get().data)
                const includeCommand = commands.find((command) => {
                    return command.name() === 'include'
                })
                if (includeCommand && commands.length == 1) {
                    for (let i = newChildNodes.length - 1; i >= 0; i--) {
                        parentNode.appendChildAfter(newChildNodes[i], commentNode)
                    }

                    if (this._removeComments) {
                        commentNode.removeChild(commentNode)
                    }

                    return true;
                }
            })
        })

        return siblingNodes
    }

    /** @private */
    _import(command, commands, globalContext) {
        return this._reader.readNodes(command.arguments()).then((nodes) => {

            const context = this._alias(commands, globalContext)

            return this._compile(nodes, context).then((nodes) => {
                if (this._usePrecompilation) {
                    return this._interpolatePrecompiled(command.arguments(), nodes, context)
                } else {
                    return this._interpolate(nodes, context)
                }
            })
        })
    }

    _interpolatePrecompiled(inputFile, nodes, context) {
        const precompileResults = this._reader._precompileResults[inputFile]

        new Nodes(nodes).forEach((node, index) => {
            if (!precompileResults[index]) {
                return
            }

            Object.entries(precompileResults[index].attributes).forEach(entry => {
                entry[1](node, context)
            })
            Object.entries(precompileResults[index].text).forEach(entry => {
                entry[1](node, context)
            })
        })

        return nodes
    }

    /** @private */
    _interpolate(nodes, context) {

        const wrappedNodes = new Nodes(nodes)
        wrappedNodes.forEach((node) => {
            const type = node.type
            const attributes = node.attributes

            if (type === Node.TYPE_TAG || node.name === 'style' || node.name === 'script') {
                for (let key in attributes) {
                    const value = attributes[key]
                    const interpolatedValue = this._interpolator.interpolate(value, context)
                    if (interpolatedValue === 'false' && this._attributes_which_values_are_ignored.includes(key)) {
                        delete attributes[key]
                    } else {
                        attributes[key] = interpolatedValue
                    }
                }
            }

            if (type === Node.TYPE_TEXT) {
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
    _alias(commands, context) {
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