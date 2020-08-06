'use strict'

const TemplateCompiler = require('./compiler2')

const Reader = require('../reading/reader')
const Writer = require('../writing/html-string-writer')

// const clone = require('clone-deep')
const clone = require('clone-deep')

/** */
class RuntimeCompiler extends TemplateCompiler {

    /**
     * @params {String} basePath the root directory of template folders
     */
    constructor(basePath) {
        super()
        this._reader = new Reader(basePath)
        this._writer = new Writer()

        this._nodes = []
        this._basePath = basePath
    }

    /**
     * 
     * @param {String} glob the glob pattern
     * @returns {Promise} a promise that will be resolved once all templates are loaded
     */
    initialize(glob) {
        return this._findNodes(glob, this._basePath)
    }

    compile(file, context) {
        console.log('Starting compilation of ' + file)
        return this._reader.readNodes(this._basePath, file).then((node) => {
            return this._compile(node, context)
        }).then((nodes) => {
            return this._writer.toHtmlString(nodes)
        })
    }

    /** @private */
    _findNodes(glob, inputPath) {
        return this._reader.matchFiles(glob, inputPath).then((inputFiles) => {
            console.log('Initializing nodes from ', inputFiles)
            return this._readNodes(inputPath, inputFiles)
        })
    }

    /** @private */
    _readNodes(inputPath, inputFiles) {
        return Promise.all(inputFiles.map((inputFile) => {
            return this._reader.readNodes(inputPath, inputFile)
        }))
    }
}

module.exports = RuntimeCompiler