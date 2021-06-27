'use strict'

const Reader = require('./reader')
const Interpolator = require('../compiling/interpolator')
const PathBuilder = require('../traversing/path-builder')
const crypto = require('crypto')

const Nodes = require('node-html-light').Nodes
const Node = require('node-html-light').Node


class PrecompilingReader extends Reader {

    constructor(basePath) {
        super(basePath)

        this._interpolator = new Interpolator()
        this._pathBuilder = new PathBuilder()
        this._precompileResults = {}
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
        return super.readNodes(root, path).then((nodes) => {
            if (!path) {
                path = root
                root = this._basePath
            }
            const cachePath = path
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
                    text: {}
                }
            }

            const type = node.type
            const attributes = node.attributes

            if (type === Node.TYPE_TAG || node.name === 'style' || node.name === 'script') {
                for (let key in attributes) {
                    const value = attributes[key]
                    if (this._interpolator.canInterpolate(value)) {
                        const interpolatables = this._interpolator.interpolatables(value)

                        result[index].attributes[key] = (attrs, context) => {
                            const tokens = interpolatables
                            attrs[key] = this._interpolator.interpolateWithTokens(tokens, context)
                        }
                    }
                }
            }

            if (type === Node.TYPE_TEXT) {
                // generate id from text value
                const text = node.get().data
                const id = crypto.createHash('md5').update(text, 'utf-8').digest('base64')

                const path = this._pathBuilder.buildPathFromParentToNode(node)

                if (this._interpolator.canInterpolate(text)) {
                    const tokens = this._interpolator.interpolatables(text)
                    result[index].text[id] = (node, context) => {
                        const target = path.reduce((parent, index) => {
                            return parent.children[index]
                        }, node.get())
                        target.data = this._interpolator.interpolateWithTokens(tokens, context)
                    }
                }
            }
        }, true)

        return result
    }
}

module.exports = PrecompilingReader