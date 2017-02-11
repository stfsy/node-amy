'use strict'

const Node = require('node-html-light').Node
const globby = require('globby')
const resolve = require('path').resolve

/** */
class FileReader {

    /** 
     * @param {Array<String>} arguments an array of path elements that will, 
     * once joined and resolved relative to the root directory, point to a html file that will be read and parsed
     * @returns {Node|Array<Node>} a single node or an array of nodes depending on the input file
    */
    readNode() {
        const path = resolve.apply(null, arguments)
        return Node.fromPath(path)
    }

    /** 
     * @param {Array<String>} arguments an array of path elements that will, 
     * once joined and resolved relative to the root directory, point to a html file that will be read and parsed
     * @returns {Array<Node>} an array of HTML Nodes
    */
    readNodes() {
        const path = resolve.apply(null, arguments)
        return Node.fromPath(path).then((node) => {
            return Array.isArray(node) ? node : [node]
        })
    }

    /** 
     * @param {String|Array<String>} pattern a single glob pattern or an array of patterns
     * @param {String} root the root directory to start looking for files matching the pattern
     * @returns {Promise<Array.String>} a promise that will be resolved with an array of files matching the pattern starting from the root directory
    */
    matchFiles(pattern, root) {

        if (!Array.isArray(pattern)) {
            pattern = [pattern]
        }

        return globby(pattern, {
            cwd: root,
            nodir: true
        })
    }
}

module.exports = FileReader