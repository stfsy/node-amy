'use strict'

const resolve = require('path').resolve
const RuntimeCompiler = require(resolve('lib/compiling/compiler3'))
const expect = require('chai').expect

describe('RuntimeCompiler', () => {
    const context = {
        user: {
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
    describe('should deep clone all components before rendering', () => {
        it('should compile checkout.html and return a html string', () => {
            const compiler = new RuntimeCompiler('test/fixtures-runtime-feature/templates')
            return compiler.initialize('**/*.html').then(() => {
                return compiler.compile('checkout.html', context)
            }).then(() => {
                return compiler.compile('checkout.html', context)
            }).then((contents) => {
                expect(contents.split('Tony')).has.length(2)
            })
        })
    })
})