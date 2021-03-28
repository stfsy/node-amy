'use strict'

const Node = require('node-html-light').Node

const crypto = require('crypto')

/** */
class TextNodeHasher {

    /**
     * 
     * @param {Object} options options containing the hash function to be used, i.e., sha256 
     */
    constructor({fn}) {
        this._digest = fn
    }

    /** 
     * Finds all text nodes in the given parent node and computes hash value using the text values
     * 
     * @param {Node} the parent node
     * @return {Object} the hash value prefix with hash function, i.e., sha256-OOvkOPunan07ERTT+O32q2TI4K2jvUvmUe3b4RvT8cI=
   */
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