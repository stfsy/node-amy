'use strict'

const resolve = require('path').resolve
const Benchmark = require('benchmark')
const suite = new Benchmark.Suite()

const RuntimeCompiler = require(resolve('lib/compiling/runtime-compiler'))

const runtimeCompilerNoPrecompilation = new RuntimeCompiler('test/fixtures-runtime-feature/templates')
runtimeCompilerNoPrecompilation._usePrecompilation = false

const runtimeCompiler = new RuntimeCompiler('test/fixtures-runtime-feature/templates')

runtimeCompilerNoPrecompilation.initialize('**/*.html')
runtimeCompiler.initialize('**/*.html')
console.log('all initialized')

const context = {
    nonce: 'noncy',
    user: {
        nonce: '4816',
        name: {
            first: 'Tony',
            second: 'Lambada'
        }
    },
    phones: [
        {
            manufacturer: 'aManufacturer'
        },
        {
            manufacturer: 'anotherManufacturer'
        }
    ],
    id: 4815162342
}

setTimeout(() => {
    //     it('tests performance of precompilation', (done) => {
    // add tests
    suite.add('WithPrecompilation', async function (deferred) {
        await runtimeCompiler.compile('home.html', context, true).then(deferred.resolve.bind(deferred))
    }, {
        async: true,
        defer: true,
        initCount: 50,
        minSamples: 100
    }).add('NoPrecompilation', async function (deferred) {
        await runtimeCompilerNoPrecompilation.compile('home.html', context, true).then(deferred.resolve.bind(deferred))
    }, {
        async: true,
        defer: true,
        initCount: 50,
        minSamples: 100
    }).on('cycle', function (event) {
        console.log(String(event.target));
    }).on('complete', function () {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
        // done()
    }).run({ 'async': true });
    //     })
    // })

}, 5000)