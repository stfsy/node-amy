'use strict'

const Node = require('node-html-light').Node
const fs = require('fs-promise')
const path = require('path')

/** */
class FileWriter {

    /** 
     * @param {String} outputPath the output directory
     * @param {String} file the name of the file to be written
     * @param {Node} node the html node to be written 
     * @returns {Promise} a promise that will be resolved after the write operation was finished
    */
    writeNode(outputPath, file, node) {

        return fs.outputFile(path.resolve(outputPath, file), node.toHtml(), { encoding: 'utf8' })
    }

    /** 
     * @param {String} outputPath the output directory
     * @param {String} file the name of the file to be written
     * @param {Array<Node>} nodes the html node to be written 
     * @returns {Promise} a promise that will be resolved after the write operation was finished
    */    writeNodes(outputPath, file, nodes) {
        
        const strings = nodes.reduce((previous, next) => {
            previous.push(next.toHtml())
            return previous
        }, [''])

        return fs.outputFile(path.resolve(outputPath, file), strings.join(''), { encoding: 'utf8' })
    }
}

module.exports = FileWriter