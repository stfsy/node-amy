'use strict'

const Parser = require('../parsing/parser2')
const Reader = require('./reader')
const Interpolator = require('../compiling/interpolator')
const PathBuilder = require('../traversing/path-builder')
const resolve = require('path').resolve
const crypto = require('crypto')
const Nodes = require('node-html-light').Nodes
const Node = require('node-html-light').Node

class PrecompilingReader extends Reader {

    constructor(basePath) {
        super(basePath)

        this._parser = new Parser()
        this._interpolator = new Interpolator()
        this._pathBuilder = new PathBuilder()
        this._precompileResults = {}
        this._htmlFileCache = {}

        this._attributes_to_remove_if_value_false = ['autofocus', 'checked', 'disabled', 'required']
    }

    /** 
     * @param {Array<String>} arguments an array of path elements that will, 
     * once joined and resolved relative to the root directory, point to a html file that will be read and parsed
     * 
     * This specialized method will also precompile each fragment / HTML file to speed up compilation process
     * 
     * @returns {Array<Node>} an array of HTML Nodes
    */
    readNodes(root, path) {
        if (!path) {
            path = root
            root = this._basePath
        }

        const cachePath = path

        if (Object.prototype.hasOwnProperty.call(this._htmlFileCache, cachePath)) {
            const text = this._htmlFileCache[cachePath]
            const node = Node.fromString(text)
            return Promise.resolve(this._isArrayElseToArray(node))
        }

        const resolvedPath = resolve(root, path)
        return this._readFileFromDisk(resolvedPath).then((html) => {

            let node = Node.fromString(html)
            let nodes = this._isArrayElseToArray(node)

            const htmlWithComponents = this._resolveComponents(nodes)
            this._htmlFileCache[cachePath] = htmlWithComponents

            node = Node.fromString(htmlWithComponents)
            nodes = this._isArrayElseToArray(node)

            if (!this._precompileResults[cachePath]) {
                const result = this._precompile(nodes)
                this._precompileResults[cachePath] = result
            }

            return nodes
        })
    }

    /** @private */
    _precompile(nodes) {
        const result = []

        new Nodes(nodes).forEach((node, index) => {
            if (!result[index]) {
                result[index] = {
                    attributes: {},
                    commands: {},
                    forEach: {},
                    add: {},
                    if: {},
                    include: {},
                    import: {},
                    text: {}
                }
            }

            node.filter((node) => {
                const type = node.type
                const attributes = node.attribs

                if (type === Node.TYPE_TAG || node.name === 'style' || node.name === 'script') {
                    for (let key in attributes) {
                        const value = attributes[key]
                        if (this._interpolator.canInterpolate(value)) {
                            this._handleInterpolatableAttribute(node, result, index, value, key)
                        }
                    }
                }

                if (type === Node.TYPE_COMMENT) {
                    const text = node.data
                    if (this._parser.isParseable(text)) {
                        this._handleParseableCommand(node, text, result, index)
                    }
                }

                if (type === Node.TYPE_TEXT) {
                    const text = node.data
                    if (this._interpolator.canInterpolate(text)) {
                        this._handleInterpolatableText(node, text, result, index)
                    }
                }
            })
        })

        return result
    }

    _handleInterpolatableAttribute(node, result, index, value, key) {
        const id = this._createId()
        const path = this._pathBuilder.buildPathFromParentToNode(node)

        result[index].attributes[id] = (node, context) => {
            const target = path.reduce((parent, index) => {
                return parent.children[index]
            }, node.get())

            const newValue = this._interpolator.interpolate(value, context)
            if (newValue === 'false' && this._attributes_to_remove_if_value_false.includes(key)) {
                delete target.attribs[key]
            } else {
                target.attribs[key] = newValue
            }
        }
    }

    _createId() {
        return crypto.randomBytes(32).toString('base64')
    }

    _handleParseableCommand(node, text, result, index) {
        const id = this._createId()
        const path = this._pathBuilder.buildPathFromParentToNode(node)
        const commands = this._parser.parseLine(text)
        
        let command

        if (this._hasCommandWithName(commands, 'if')) {
            command = 'if'
        } else if (this._hasCommandWithName(commands, 'forEach')) {
            command = 'forEach'
        } else if (this._hasCommandWithName(commands, 'import')) {
            command = 'import'
        } else if (this._hasCommandWithName(commands, 'add')) {
            command = 'add'
        } else if (this._hasCommandWithName(commands, 'include')) {
            command = 'include'
        }

        result[index][command][id] = (node, context, callback) => {
            const target = path.reduce((parent, index) => {
                return parent.children[index]
            }, node.get())
            callback(new Node(target))
        }
        result[index].commands[id] = (node, context, callback) => {
            const target = path.reduce((parent, index) => {
                return parent.children[index]
            }, node.get())
            callback(new Node(target))
        }
    }

    _handleInterpolatableText(node, text, result, index) {
        const id = this._createId()
        const path = this._pathBuilder.buildPathFromParentToNode(node)
        const tokens = this._interpolator.interpolatables(text)

        result[index].text[id] = (node, context) => {
            const target = path.reduce((parent, index) => {
                return parent.children[index]
            }, node.get())

            target.data = this._interpolator.interpolateWithTokens(tokens, context)
        }
    }

    _hasCommandWithName(commands, name) {
        return commands.find(command => command.name() === name)
    }
}

module.exports = PrecompilingReader