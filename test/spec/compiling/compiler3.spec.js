'use strict'

const resolve = require('path').resolve
const Compiler = require(resolve('lib/compiling/compiler3'))

describe('Compiler3', () => {

    require('./compiler-compatibility-test')((basePath) => new Compiler(basePath))
})