'use strict'

const resolve = require('path').resolve
const Reader = require(resolve('lib/reading/component-registry-reader'))
const Node = require('node-html-light').Node
const expect = require('chai').expect

describe('ComponentRegistryReader', () => {
    let reader

    beforeEach(() => {
        reader = new Reader('test/fixtures/components')
    })

    describe('.initializeRegistry', () => {
        it('reads component from base path', () => {
            return reader.initializeRegistry().then(() => {
                const keys = Object.keys(reader._registry)
                expect(keys).to.have.length(2)
            })
        })

        it('creates a component instance for plain html files', () => {
            return reader.initializeRegistry().then(() => {
                const htmlComponent = reader._registry['html-component']
                expect(htmlComponent.template()).to.include('Document')
                expect(Array.isArray(htmlComponent.props)).to.be.true
                expect(htmlComponent.props).to.have.length(0)
            })
        })
    })

    describe('.hasComponent', () => {
        it('returns true if html component is known', () => {
            return reader.initializeRegistry().then(() => {
                const hasHtmlComponent = reader.hasComponent('html-component')
                expect(hasHtmlComponent).to.be.true
            })
        })
        it('returns true if js component is known', () => {
            return reader.initializeRegistry().then(() => {
                const hasTestComponent = reader.hasComponent('test-component')
                expect(hasTestComponent).to.be.true
            })
        })
        it('returns false if component is unknown', () => {
            return reader.initializeRegistry().then(() => {
                const hasHtmlComponent = reader.hasComponent('js-component')
                expect(hasHtmlComponent).to.be.false
            })
        })
    })

    describe('.getComponent', () => {
        it('returns component if html component is known', () => {
            return reader.initializeRegistry().then(() => {
                const component = reader.getComponent('html-component')
                expect(component).to.not.be.undefined
                expect(component).to.not.be.null
            })
        })
        it('returns true if js component is known', () => {
            return reader.initializeRegistry().then(() => {
                const component = reader.getComponent('test-component')
                expect(component).to.not.be.undefined
                expect(component).to.not.be.null
            })
        })
        it('returns undefined if component is unknown', () => {
            return reader.initializeRegistry().then(() => {
                const component = reader.getComponent('js-component')
                expect(component).to.be.undefined
            })
        })
    })
})