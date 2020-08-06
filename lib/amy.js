'use strict'

const Compiler = require('./compiling/compiler2')
const RuntimeCompiler = require('./compiling/runtime-compiler')

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
    static compileTemplates(pattern, inputPath, outputPath, context) {
        return new Compiler().compile(pattern, inputPath, outputPath, context)
    }
}

Amy.Compiler = Compiler
Amy.RuntimeCompiler = RuntimeCompiler

module.exports = Amy