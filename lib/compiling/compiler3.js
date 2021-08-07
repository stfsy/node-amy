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

    constructor(inputPath, removeComments, options = {}) {
        this._basePath = inputPath
        this._reader = new Reader(inputPath, options.reader)
        this._writer = new Writer()
        this._parser = new Parser()
        this._interpolator = new Interpolator()

        this._compileCache = {}

        if (removeComments !== undefined) {
            this._removeComments = removeComments === true
        } else {
            this._removeComments = process.env.NODE_ENV === 'production'
        }

        // attributes like checked have no values
        this._attributes_which_values_are_ignored = ['autofocus', 'checked', 'disabled', 'required']
    }

    /**
     * 
     * @param {String} glob the glob pattern
     * @returns {Promise} a promise that will be resolved once all templates are loaded
     */
    initialize(glob) {
        return this._reader.initialize().then(() => {
            return this._findNodes(glob, this._basePath)
        })
    }

    /**
     * Find all html fragments, that match the given pattern
     * @param {String} glob the glob pattern
     * @param {String} inputPath the root folder to start searching
     * @returns {Promise} a promise that will be resolved once all templates are loaded
     * @private
     */
    _findNodes(glob, inputPath) {
        return this._reader.matchFiles(glob, inputPath).then((inputFiles) => {
            console.log('Runtime Compiler: Initializing nodes from ', inputFiles)
            return this._readNodes(inputPath, inputFiles)
        })
    }
    /**
     * Instructs the fragment reader to read and cache given set of html fragments
     * @param {String} inputPath the root folder to start searching
     * @param {String} inputFiles the html fragments to read and cache
     * @returns {Promise} a promise that will be resolved once all templates are loaded
     * @private
     */
    _readNodes(inputPath, inputFiles) {
        return Promise.all(inputFiles.map((inputFile) => {
            return this._reader.readNodes(inputPath, inputFile)
        }))
    }

    /** 
     * Compiles the given template file and writes
     * to the output directory. Commands are executed using the given context.
     * 
     * @param {String} inputPath the base path of the input file
     * @param {String} inputFile the input file
     * @param {String} outputPath the output path of the compiled files
     * @param {Object} context the context that will be used to execute commands and interpolate placeholders
     * @returns {Promise} a promise that will be resolved once all templates are compiled
     */
    compile(inputFile, context, shouldBeCached) {
        if (shouldBeCached && this._compileCache[inputFile]) {
            return Promise.resolve(this._compileCache[inputFile])
        } else {
            return this._compileFile(this._basePath, inputFile, context).then((nodes) => {
                return this._writer.toHtmlString(nodes)
            }).then((html) => {
                if (shouldBeCached) {
                    this._compileCache[inputFile] = html
                }
                return html
            })
        }
    }

    /** 
     * Compiles the given template file and writes
     * to the output directory. Commands are executed using the given context.
     * 
     * @param {String} inputPath the base path of the input file
     * @param {String} inputFile the input file
     * @param {String} outputPath the output path of the compiled files
     * @param {Object} context the context that will be used to execute commands and interpolate placeholders
     * @returns {Promise} a promise that will be resolved once all templates are compiled
     */
    _compileFile(inputPath, inputFile, context) {
        return this._reader.readNodes(inputPath, inputFile)
            .then((nodes) => {
                return this._interpolatePrecompiled(inputFile, nodes, context)
            }).then((nodes) => {
                return this._compile(inputFile, nodes, context)
            })
    }

    /** @private */
    _compile(inputFile, nodes, context) {
        const promises = []

        const precompileResults = this._reader._precompileResults[inputFile]
        new Nodes(nodes).forEach((node, index) => {
            if (!precompileResults[index]) {
                return
            }

            // iterating backwards because we might insert some elements 
            // while iterating through the array. iterating backwards will 
            // help us do that because we will insert at index i+1
            Object.keys(precompileResults[index].commands).reverse().forEach((key) => {

                const commandCallback = precompileResults[index].commands[key]
                commandCallback(node, {}, (commentNode => {
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
                }))
            })
        })

        return Promise.all(promises).then(_ => nodes).then(() => {

            // need to remove conditionals after compiliation
            // because we depend on correct indices of commands, attributes and conditionalTemplates
            new Nodes(nodes).forEach((node, index) => {
                if (!precompileResults[index]) {
                    return
                }

                Object.keys(precompileResults[index].conditionalTemplate).forEach((key) => {
                    precompileResults[index].conditionalTemplate[key](node, context)
                })
            })
            return nodes
        })
    }

    /** @private */
    _execute(commentNode, context) {
        const rawCommands = this._parser.parseLine(commentNode.get().data)
        const commands = this._createCommandsObject(rawCommands)

        // if needs to go first. if it returns true we can execute other commands
        if (commands.if) {
            const truthy = this._if(commands, context)
            if (!truthy) {
                return Promise.resolve()
            }
        }

        if (commands.forEach) {
            return this._reader.readNodes(commands.import.arguments()).then((nodes) => {
                return this._forEach(nodes, commands, context)
            })
        } else if (commands.add) {
            return this._add(commands, context)
        } else if (commands.import) {
            return this._import(commands, context)
        } else if (commands.include) {
            return Promise.resolve()
        } else {
            throw createError('Cannot handle unknown command in comment', commentNode.get().data, context)
        }
    }

    /** @private */
    _if(commands, context) {
        const value = this._interpolator.valueFor(commands.if.arguments(), (context))

        if (commands.is) {
            return this._is(commands, value)
        } else if (value) {
            return value
        }
    }

    _is(commands, value) {
        switch (commands.is.arguments()) {
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
                throw createError('Cannot handle unknown conditional in command', commands.is, value)
        }
    }

    /** @private */
    _forEach(nodes, commands, globalContext) {
        const elements = this._interpolator.valueFor(commands.forEach.arguments(), (globalContext))

        if (!nodes) {
            throw createError('Cannot invoke forEach operation on falsy nodes. Did you invoke forEach before import?', commands.forEach, globalContext)
        }

        if (!Array.isArray(elements)) {
            throw createError(`Cannot invoke forEach operation with a context that is not of type Array: Context is ${typeof elements} and has value ${elements}`, commands.forEach, globalContext)
        }

        const htmlStrings = nodes.map((node) => node.toHtml())

        const promises = elements.map((element) => {
            const nodes = htmlStrings.map((string) => Node.fromString(string))
            const context = this._alias(commands, element)

            return this._compile(commands.import.arguments(), nodes, context).then((compiled) => {
                return this._interpolatePrecompiled(commands.import.arguments(), compiled, context)
            })
        })

        return Promise.all(promises).then(nodes => {
            return nodes.flat(1)
        })
    }

    _add(commands, context) {
        // need to create new commands object to support, i.e.
        // import axz and add abc.html with context as contextName
        const indexOfInclude = commands._raw.findIndex((command) => {
            return command.name() === 'add'
        })

        const includeCommands = this._createCommandsObject(commands._raw.slice(indexOfInclude))
        includeCommands.import = includeCommands.add

        const parentCommands = this._createCommandsObject(commands._raw.slice(0, indexOfInclude))

        return this._import(includeCommands, context).then((newChildNodes) => {
            return this._import(parentCommands, context).then((parentNodes) => {
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
    _import(commands, globalContext) {
        const inputFile = commands.import.arguments()
        return this._reader.readNodes(inputFile).then((nodes) => {

            const context = this._alias(commands, globalContext)

            return this._compile(inputFile, nodes, context).then((nodes) => {
                return this._interpolatePrecompiled(inputFile, nodes, context)
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
    _alias(commands, context) {
        const aliasCommand = commands.as
        const withCommand = commands.with

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

    _createCommandsObject(rawCommands) {
        return {
            if: this._commandForName(rawCommands, 'if'),
            forEach: this._commandForName(rawCommands, 'forEach'),
            import: this._commandForName(rawCommands, 'import'),
            add: this._commandForName(rawCommands, 'add'),
            include: this._commandForName(rawCommands, 'include'),
            is: this._commandForName(rawCommands, 'is'),
            as: this._commandForName(rawCommands, 'as'),
            with: this._commandForName(rawCommands, 'with'),
            _raw: rawCommands
        }
    }

    _commandForName(commands, name) {
        return commands.find((command) => {
            return command.name() === name
        })
    }
}


module.exports = TemplateCompiler