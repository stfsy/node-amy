'use strict'

const Node = require('node-html-light').Node

const crypto = require('crypto')

module.exports = (node) => {
    const hash = crypto.createHash('sha256');

    node.find({
        type: Node.TYPE_TEXT
    }).forEach((textNode) => {
        hash.update(textNode.get().data);
    })

    const digest = 'sha256-' + hash.digest('base64')
    return digest
}