'use strict'

const Parser = require('../parsing/parser2')
const Writer = require('../writing/html-string-writer')
const Reader = require('./reader')
const ComponentRegistry = require('./component-registry-reader')
const Interpolator = require('../compiling/interpolator')
const PathBuilder = require('../traversing/path-builder')
const createError = require('../utilities/error')

const resolve = require('path').resolve
const crypto = require('crypto')
const Nodes = require('node-html-light').Nodes
const Node = require('node-html-light').Node

/**
 * @typedef {import('node-html-light/lib/node')} Node
 */

class PrecompilingReader extends Reader {

    constructor(basePath, options = {}) {
        super(basePath)

        if (options.registry && options.registry.enabled) {
            this._componentRegistry = new ComponentRegistry(basePath, options.registry)
        }
        this._parser = new Parser()
        this._writer = new Writer()
        this._interpolator = new Interpolator()
        this._pathBuilder = new PathBuilder()
        this._precompileResults = {}
        this._htmlFileCache = {}

        this._attributes_to_remove_if_value_false = ['autofocus', 'checked', 'disabled', 'required']
    }

    initialize() {
        if (this._componentRegistry) {
            if (!this._basePath) {
                throw createError('To enable component registry, please set a basePath in your Compiler. Current value is: ' + this._basePath + ' with length ' + this._basePath.length)
            }
            return this._componentRegistry.initializeRegistry()
        } else {
            return Promise.resolve()
        }
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
    _resolveComponents(nodes) {
        if (this._componentRegistry) {
            for (let index = nodes.length - 1; index >= 0; index--) {
                const root = nodes[index]
                root.filterByType((node) => {
                    const name = node.name
                    if (this._componentRegistry.hasComponent(name)) {

                        const component = this._componentRegistry.getComponent(name)
                        if (!component.template || typeof component.template !== 'function') {
                            throw createError(`Component with name "${name}" has no template function. Value of ${name}.template is ${component.template}`)
                        }

                        if (!component.render || typeof component.render !== 'function') {
                            throw createError(`Component with name "${name}" has no render function. Value of ${name}.render is ${component.render}`)
                        }

                        const componentNodes = this._isArrayElseToArray(Node.fromString(component.template()))
                        const renderedNodes = component.render(componentNodes, node.attribs)

                        if (!renderedNodes) {
                            throw createError(`No nodes for precompilation available. 

Does the render function of "${name}" return nodes?"
                            
${component.render.toString()}
                            `)
                        }

                        if (!node.parent || node.parent.type === 'root') {
                            nodes[index] = renderedNodes[0]

                            renderedNodes.slice(1).reverse().forEach((componentNode) => {
                                nodes.splice(index + 1, 0, componentNode)
                            })
                        } else {
                            root.replaceChild(renderedNodes[0], Node.of(node))

                            renderedNodes.slice(1).reverse().forEach((componentNode) => {
                                root.appendChildAfter(componentNode, renderedNodes[0])
                            })
                        }

                        this._resolveComponentsTemplatesAndSlots(renderedNodes, Node.of(node))
                    }
                }, [Node.TYPE_TAG])
            }
        }

        return this._writer.toHtmlString(nodes)
    }

    _resolveComponentsTemplatesAndSlots(componentTemplate, htmlPlaceholderNode) {
        const templates = htmlPlaceholderNode.find('template')
        const slots = componentTemplate.reduce((current, next) => {
            return current.concat(next.find('slot'))
        }, [])

        if (slots.length !== templates.length) {
            throw createError(`Uneven number of templates and slots. "${htmlPlaceholderNode.toHtml()}" has ${templates.length} templates and component "${this._writer.toHtmlString(componentTemplate)}" has ${slots.length} slots.`)
        }

        /**
         * @typedef {Object} SlotAndTemplate
         * @property {Node} slot
         * @property {Array.<Node>} template
         */

        /**
         * @type {Array.<SlotAndTemplate>}
         */
        const slotsAndTemplatesByName = slots.reduce((current, next) => {
            let name = next.attributes.name
            const templatesForName = templates.filter(template => template.attributes.slot === name)

            if (!templatesForName[0]) {
                throw createError(`Could not find a template for slot with name "${name}" element in "${htmlPlaceholderNode.toHtml()}"`)
            }
            if (name && Object.prototype.hasOwnProperty.call(current, name)) {
                throw createError(`There is more than one slot with name "${name}" in "${componentTemplate.toHtml}"`)
            }
            if (!name) {
                name = ''
            }
            if (!current[name]) {
                current[name] = []
            }

            current[name].push({
                slot: next,
                template: templatesForName[0].children
            })
            return current
        }, {})

        Object.entries(slotsAndTemplatesByName).forEach(([, [{ slot, template }]]) => {
            template.reverse().forEach((template) => {
                slot.root.appendChildAfter(template, slot)
            })

            slot.root.removeChild(slot)
        })

        return componentTemplate
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

            node.filterByType((node) => {
                const type = node.type
                const attributes = node.attribs

                if (type === Node.TYPE_TAG || type === Node.TYPE_STYLE || type === Node.TYPE_SCRIPT) {
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
            }, [Node.TYPE_TAG, Node.TYPE_STYLE, Node.TYPE_SCRIPT, Node.TYPE_COMMENT, Node.TYPE_TEXT])
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