'use strict'

const Module = require('../../lib/index')

const expect = require('chai').expect

describe('Module', () => {

    it('should be defined', () => {

        expect(typeof Module).to.equal('string')
    })
})