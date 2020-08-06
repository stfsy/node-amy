'use strict'

const resolve = require('path').resolve
const Compiler = require(resolve('lib/compiling/runtime-compiler'))
const Document = require('node-html-light').Document
const Node = require('node-html-light').Node
const Nodes = require('node-html-light').Nodes

const fs = require('fs-promise')
const chai = require('chai')
const expect = require('chai').expect
const spies = require('chai-spies')

chai.use(spies)

describe('RuntimeCompiler', () => {

    let compiler = null
    let context = null

    beforeEach(() => {
        compiler = new Compiler('test/fixtures-runtime-feature/templates')
        context = {
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
    })

    describe('.compile', () => {
        it('should compile home.html and return a html string', () => {
            return compiler.initialize('**/*.html').then(() => {
                return compiler.compile('home.html', context)
            }).then((contents) => {
                console.log('Compiled this ' + contents)
                expect(contents).to.contain('<header id="header"><h1>Hello Tony!</h1>')
                expect(contents).to.contain('<div id="phones">')
                expect(contents).to.contain('<div id="phones">')
                expect(contents).to.contain('<span id="snexu-summary">')
            })
        })

        it('should compile comment.html and return a html string', () => {
            return compiler.initialize('**/*.html').then(() => {
                return compiler.compile('comment.html', context)
            }).then((contents) => {
                expect(contents).to.contain('<footer id="footer"></footer>')
            })
        })

        it('should compile checkout.html and return a html string', () => {
            return compiler.initialize('**/*.html').then(() => {
                return compiler.compile('checkout.html', context)
            }).then((contents) => {
                console.log('Billings', contents)
                expect(contents).to.contain('<header id="header"><h1>Hello Tony!</h1></header>')
                expect(contents).to.contain('<div id="billing"></div>')
                expect(contents).to.contain('<footer id="footer"></footer>')
            })
        })
    })
})