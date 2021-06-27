'use strict'

const TemplateCompiler = require('./compiler2')

const Writer = require('../writing/html-string-writer')

/** */
class RuntimeCompiler extends TemplateCompiler {

    /**
     * @params {String} basePath the root directory of template folders
     * @params {Boolean} removeComments flag indication whether html comments shall be removed. If missing, will use NODE_ENV and enable for value 'production'
     */
    constructor(basePath, removeComments) {
        super(basePath, removeComments)
        this._writer = new Writer()
        this._cache = {}

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

    compile(file, context, shouldBeCached) {
        if (shouldBeCached && this._cache[file]) {
            return Promise.resolve(this._cache[file])
        } else {
            return this._compileNoCache(file, context).then((html) => {
                if (shouldBeCached) {
                    this._cache[file] = html
                }
                return html
            })
        }
    }

    _compileNoCache(file, context) {
        return this._reader.readNodes(this._basePath, file).then((node) => {
            return this._compile(node, context)
        }).then((nodes) => {
            return this._writer.toHtmlString(nodes)
        })
    }

    /** @private */
    _findNodes(glob, inputPath) {
        return this._reader.matchFiles(glob, inputPath).then((inputFiles) => {
            console.log('Runtime Compiler: Initializing nodes from ', inputFiles)
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