'use strict'

const Hasher = require('./text-node-hasher')

/** */
class ScriptStyleTagHasher {

    /**
     * 
     * @param {Compiler} compiler an instance of a amy compiler, i.e. RuntimeCompiler
     * @param {Object} options options containing the hash function to be used, i.e., sha256. Default is sha256
     */
    constructor(compiler, options = { fn: 'sha256' }) {
        this._compiler = compiler
        this._hasher = new Hasher(options)
    }

    /** 
     * Finds all script and style nodes in the given parent node and computes hash value using the text values.
     * 
     * Please note: The given node will be compiled fully. This requires a context object, so that placeholders and, i.e., foreach commands can be executed
     * 
     * @param {String} the file to compile and compute hash values from. Must be in configured base folder of compiler.
     * @return {Object} an object containg hash values for all script and style tags, i.e., {scripts: [sha256-OOvkOPunan07ERTT+O32q2TI4K2jvUvmUe3b4RvT8cI=], styles: [sha256-OOvkOPunan07ERTT+O32q2TI4K2jvUvmUe3b4RvT8cI=]}
   */
    computeHashValues(file, context) {
        return this._compiler._reader.readNodes(this._compiler._basePath, file).then((node) => {
            return this._compiler._compile(node, context)
        }).then((nodes) => {
            const hashes = {
                scripts: [],
                styles: []
            }

            nodes.forEach((node) => {
                node.find('script').forEach((script) => {
                    hashes.scripts.push(this._hasher.hash(script, this._fn))
                })
            })

            nodes.forEach((node) => {
                node.find({ name: 'style' }).forEach((style) => {
                    hashes.styles.push(this._hasher.hash(style, this._fn))
                })
            })

            return hashes
        })
    }
}

module.exports = ScriptStyleTagHasher