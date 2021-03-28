'use strict'

const Node = require('node-html-light').Node

const crypto = require('crypto')

/** */
class TextNodeHasher {

    constructor({fn}) {
        this._digest = fn
    }

    hash(node) {
        const hash = crypto.createHash(this._digest)

        node.find({
            type: Node.TYPE_TEXT
        }).forEach((textNode) => {
            hash.update(textNode.get().data);
        })

        return this._digest + '-' + hash.digest('base64')
    }
}

module.exports = TextNodeHasher