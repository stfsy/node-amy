'use strict'

const resolve = require('path').resolve
const Tokenizer = require(resolve('lib/tokenizing/tokenizer'))
const Validator = require(resolve('lib/validating/validator'))

const expect = require('chai').expect

describe('Lexer', () => {

    let tokenizer = null

    beforeEach(() => {
        tokenizer = new Tokenizer()
    })

    describe('.tokenizeLine', () => {
        it('should parse the correct template, operation and context', () => {
            const tokenized = tokenizer.tokenize('@amy import abc/def with abc.d.e.f.g')
            expect(tokenized.length).to.equal(5)
            expect(tokenized[0]).to.equal('@amy')
            expect(tokenized[1]).to.equal('import')
            expect(tokenized[2]).to.equal('abc/def')
            expect(tokenized[3]).to.equal('with')
            expect(tokenized[4]).to.equal('abc.d.e.f.g')
        })
        it('should parse the correct template, operation and context', () => {
            const tokenized = tokenizer.tokenize(' @amy import abc/def forEach abc.d.e.f.g ')
            expect(tokenized[0]).to.equal('@amy')
            expect(tokenized[1]).to.equal('import')
            expect(tokenized[2]).to.equal('abc/def')
            expect(tokenized[3]).to.equal('forEach')
            expect(tokenized[4]).to.equal('abc.d.e.f.g')
            expect(tokenized.length).to.equal(5)
        })
        it('should parse the correct template, operation and context', () => {
            const tokenized = tokenizer.tokenize('@amy import(abc/def.html).with(abc.d.e.f.g)')
            expect(tokenized.length).to.equal(2)
            expect(tokenized[0]).to.equal('@amy')
            expect(tokenized[1]).to.equal('import(abc/def.html).with(abc.d.e.f.g)')
        })
        it('should parse interpolated text', () => {
            const tokenized = tokenizer.tokenize('Hey yo, my name is {{ user.name }}')
        })
    })
})