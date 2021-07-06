'use strict'

const Node = require('node-html-light').Node
const fs = require('fs')
const globby = require('globby')
const resolve = require('path').resolve

/** */
class FileReader {

    constructor(basePath) {
        this._basePath = basePath
        this._fileCache = {}
    }

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
    readNodes(root, path) {
        if (!path) {
            path = root
            root = this._basePath
        }

        const resolvedPath = resolve(root, path)
        this._readFileFromDisk(resolvedPath).then((text) => {
            const node = Node.fromString(text)
            return this._isArrayElseToArray(node)
        })
    }

    _isArrayElseToArray(node) {
        if (Array.isArray(node)) {
            return node
        } else {
            return [node]
        }
    }

    _readFileFromDisk(fullPath) {
        return new Promise((resolve, reject) => {
            fs.readFile(fullPath, 'utf-8', (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(data)
                }
            })
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