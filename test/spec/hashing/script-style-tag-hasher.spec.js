'use strict'

const resolve = require('path').resolve

const Node = require('node-html-light').Node
const Compiler = require(resolve('lib/compiling/runtime-compiler'))
const ScriptStyleTagHasher = require(resolve('lib/hashing/script-style-tag-hasher'))
const expect = require('chai').expect

describe('Hasher', () => {
    const compiler = new Compiler('test/fixtures-runtime-feature/templates')
    let scriptStyleTagHasher = new ScriptStyleTagHasher(compiler)

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

    it('computes hash values for multiple style tags', () => {
        return scriptStyleTagHasher.computeHashValues('csp.html', context).then((hash) => {
            expect(hash.styles[0]).to.equal('sha256-Nsv0lSYmXHu8ShkoTca6Ig+0T7CZsE82fvnrJXweuI0=')
            expect(hash.styles[1]).to.equal('sha256-USEY+6MROppSLNbXZ1fLqPoEGbjS9XirppvVF6W+R/w=')
        })
    })
    it('computes hash values for multiple script tags', () => {
        return scriptStyleTagHasher.computeHashValues('csp.html', context).then((hash) => {
            expect(hash.scripts[0]).to.equal('sha256-Zw0fB5Rd5EdZQpmJ7Svj4dNN2q9nLSGPhwQA1EQhOWg=')
            expect(hash.scripts[1]).to.equal('sha256-OOvkOPunan07ERTT+O32q2TI4K2jvUvmUe3b4RvT8cI=')
        })
    })
    it('uses sha-256 by default', () => {
        return scriptStyleTagHasher.computeHashValues('csp.html', context).then((hash) => {
            expect(hash.scripts[0]).to.contain('sha256')
        })
    })
    it('can be configured to use sha-384', () => {
        let scriptStyleTagHasher = new ScriptStyleTagHasher(compiler, { fn: 'sha384' })
        return scriptStyleTagHasher.computeHashValues('csp.html', context).then((hash) => {
            expect(hash.scripts[0]).to.contain('sha384')
        })
    })
    it('can be configured to use sha-512', () => {
        let scriptStyleTagHasher = new ScriptStyleTagHasher(compiler, { fn: 'sha512' })
        return scriptStyleTagHasher.computeHashValues('csp.html', context).then((hash) => {
            expect(hash.scripts[0]).to.contain('sha512')
        })
    })
})