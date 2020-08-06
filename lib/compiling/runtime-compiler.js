'use strict'

const TemplateCompiler = require('./compiler2')

const Reader = require('../reading/reader')
const Writer = require('../writing/html-string-writer')

/** */
class RuntimeCompiler extends TemplateCompiler {

    constructor() {
        super()
        this._reader = new Reader()
        this._writer = new Writer()

        this._nodes = []
    }

    /**
     * 
     * @param {String} glob the glob pattern
     * @param {String} inputPath the input path to start checking for files
     * @returns {Promise} a promise that will be resolved once all templates are loaded
     */
    initialize(glob, inputPath) {
        return this._findNodes(glob, inputPath)
    }

    compile(file, context) {
        console.log('Looking for ' + file + ' in ' + Object.keys(this._nodes))
        const compileThisNode = this._nodes[file]
        console.log('Compiling .. ' + typeof compileThisNode)
        return this._compile(compileThisNode, context)
            .then((nodes) => {
                return this._writer.toHtmlString(nodes)
            })
    }

    /** @private */
    _findNodes(glob, inputPath) {
        return this._reader.matchFiles(glob, inputPath).then((inputFiles) => {
            return this._readNodes(inputPath, inputFiles)
        }).then((nodes) => {
            this._nodes = nodes.reduce((current, { file, nodes }) => {
                current[file] = nodes
                return current
            }, {})
            console.log('Initializing nodes from ', Object.keys(this._nodes))
        })
    }

    _readNodes(inputPath, inputFiles) {
        return Promise.all(inputFiles.map((inputFile) => {
            return this._reader.readNodes(inputPath, inputFile).then((nodes) => {
                console.log('InputFile is ' + inputFile)
                return {
                    file: inputFile,
                    nodes
                }
            })
        }))
    }
}

module.exports = RuntimeCompiler