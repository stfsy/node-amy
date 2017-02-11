'use strict'

const resolve = require('path').resolve
const Parser = require(resolve('lib/parsing/parser2.js'))

const expect = require('chai').expect

describe('Parser2', () => {

    let parser = null

    beforeEach(() => {
        parser = new Parser()
    })

    describe('.parseLine', () => {

        it('should return extend as context operation', () => {
            const operations = parser.parseLine('@amy extend a/b/c.html')
            expect(operations.length).to.equal(1)
            expect(operations[0].name()).to.equal('extend')
            expect(operations[0].arguments()).to.equal('a/b/c.html')
        })
        it('should return extend as context operation', () => {
            const operations = parser.parseLine('@amy extend(a/b/c.html)')
            expect(operations.length).to.equal(1)
            expect(operations[0].name()).to.equal('extend')
            expect(operations[0].arguments()).to.equal('a/b/c.html')
        })
        it('should return true because arguments are given', () => {
            const operations = parser.parseLine('@amy extend(a/b/c.html)')
            expect(operations.length).to.equal(1)
            expect(operations[0].name()).to.equal('extend')
            expect(operations[0].withArguments()).to.equal(true)
        })
        it('should return false because no arguments are given', () => {
            const operations = parser.parseLine('@amy extend')
            expect(operations.length).to.equal(1)
            expect(operations[0].name()).to.equal('extend')
            expect(operations[0].withArguments()).to.equal(false)
        })
        it('should return forEach as context operation', () => {
            const operations = parser.parseLine('@amy forEach abc.d.e.f.g')
            expect(operations.length).to.equal(1)
            expect(operations[0].name()).to.equal('forEach')
            expect(operations[0].arguments()).to.equal('abc.d.e.f.g')
        })
        it('should return forEach as context operation', () => {
            const operations = parser.parseLine('@amy forEach(abc.d.e.f.g)')
            expect(operations.length).to.equal(1)
            expect(operations[0].name()).to.equal('forEach')
            expect(operations[0].arguments()).to.equal('abc.d.e.f.g')
        })
        it('should return forEach and as as context operations', () => {
            const operations = parser.parseLine('@amy forEach abc.d.e.f.g as amy')
            expect(operations.length).to.equal(2)
            expect(operations[0].name()).to.equal('forEach')
            expect(operations[0].arguments()).to.equal('abc.d.e.f.g')
            expect(operations[1].name()).to.equal('as')
            expect(operations[1].arguments()).to.equal('amy')
        })
        it('should return forEach and as as context operations', () => {
            const operations = parser.parseLine('@amy forEach(abc.d.e.f.g).as(amy)')
            expect(operations.length).to.equal(2)
            expect(operations[0].name()).to.equal('forEach')
            expect(operations[0].arguments()).to.equal('abc.d.e.f.g')
            expect(operations[1].name()).to.equal('as')
            expect(operations[1].arguments()).to.equal('amy')
        })
        it('should return import, with and as as context operations', () => {
            const operations = parser.parseLine('@amy import abc/def.html with abc.d.e.f.g as amy')
            expect(operations.length).to.equal(3)
            expect(operations[0].name()).to.equal('import')
            expect(operations[0].arguments()).to.equal('abc/def.html')
            expect(operations[1].name()).to.equal('with')
            expect(operations[1].arguments()).to.equal('abc.d.e.f.g')
            expect(operations[2].name()).to.equal('as')
            expect(operations[2].arguments()).to.equal('amy')
        })
        it('should return import as the first context operation', () => {
            const operations = parser.parseLine('@amy import(abc/def.html).with(abc.d.e.f.g).as(amy)')
            expect(operations.length).to.be.above(0)
            expect(operations[0].name()).to.equal('import')
            expect(operations[0].arguments()).to.equal('abc/def.html')
            expect(operations[1].name()).to.equal('with')
            expect(operations[1].arguments()).to.equal('abc.d.e.f.g')
            expect(operations[2].name()).to.equal('as')
            expect(operations[2].arguments()).to.equal('amy')
        })
        it('should not leak the next command if the previous command has no arguments', () => {
            const operations = parser.parseLine('@amy import with as amy')
            expect(operations.length).to.equal(3)
            expect(operations[0].name()).to.equal('import')
            expect(operations[0].withArguments()).to.equal(false)
            expect(operations[0].arguments()).to.equal(null)
            expect(operations[1].name()).to.equal('with')
            expect(operations[1].withArguments()).to.equal(false)
            expect(operations[1].arguments()).to.equal(null)
            expect(operations[2].name()).to.equal('as')
            expect(operations[2].withArguments()).to.equal(true)
            expect(operations[2].arguments()).to.equal('amy')
        })
    })
})