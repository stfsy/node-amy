'use strict'

const HtmlStringWriter = require('./html-string-writer')

const Node = require('node-html-light').Node
const fs = require('fs')
const path = require('path')

/** */
class FileWriter extends HtmlStringWriter {

    /** 
     * @param {String} outputPath the output directory
     * @param {String} file the name of the file to be written
     * @param {Node} node the html node to be written 
     * @returns {Promise} a promise that will be resolved after the write operation was finished
    */
    writeNode(outputPath, file, node) {
        return this._write(outputPath, file, node.toHtml())
    }

    /** 
     * @param {String} outputPath the output directory
     * @param {String} file the name of the file to be written
     * @param {Array<Node>} nodes the html node to be written 
     * @returns {Promise} a promise that will be resolved after the write operation was finished
    */
    writeNodes(outputPath, file, nodes) {
        return this._write(outputPath, file, this.toHtmlString(nodes))
    }

    /** @private */
    _write(outputPath, file, content) {
        return this._createDirIfNotExists(outputPath, file).then(() => {
            return new Promise((resolve, reject) => {
                fs.writeFile(path.resolve(outputPath, file), content, { encoding: 'utf8' }, (err) => {
                    if (err) {
                        return reject(err)
                    } else {
                        resolve()
                    }
                })
            })
        })
    }

    _createDirIfNotExists(outputPath, file) {
        const dirname = path.dirname(path.resolve(outputPath, file))
        return new Promise((resolve, reject) => {
            fs.access(path.resolve(dirname), fs.constants.O_DIRECTORY, (err) => {
                if (err) {
                    fs.mkdir(path.resolve(dirname), { recursive: true }, (err) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve()
                        }
                    })
                } else {
                    resolve()
                }
            })
        })
    }
}

module.exports = FileWriter