'use strict'

const Compiler = require('./compiling/compiler3')
const ScriptStyleTagHasher = require('./hashing/script-style-tag-hasher')
const Reader = require('./reading/reader')
const Writer = require('./writing/writer')

/** */
class Amy {

    /** 
     * Compiles templates that are in a subfolder of the inputPath und match the glob pattern. Compiled templates are written
     * to the output directory. Commands are executed using the given context.
     * 
     * @param {String} glob the glob pattern
     * @param {String} inputPath the input path to start checking for files
     * @param {String} outputPath the output path of the compiled files
     * @param {Object} context the context that will be used to execute commands and interpolate placeholders
     * @returns {Promise} a promise that will be resolved once all templates are compiled and written to the output directory
    */
    static async compileTemplates(glob, inputPath, outputPath, context) {
        const reader = new Reader()
        const writer = new Writer()
        const compiler = new Compiler(inputPath)
        const inputFiles = await reader.matchFiles(glob, inputPath)

        return await Promise.all(inputFiles.map((inputFile) => {
            return compiler.compile(inputFile, context)
                .then((nodes) => {
                    return writer.writeNodes(outputPath, inputFile, nodes)
                })
        }))
    }
}

Amy.Compiler = Compiler
Amy.StaticCompiler = Compiler
Amy.ScriptStyleTagHasher = ScriptStyleTagHasher

module.exports = Amy