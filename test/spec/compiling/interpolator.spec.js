'use strict'

const resolve = require('path').resolve
const Interpolator = require(resolve('lib/compiling/interpolator'))
const Document = require('node-html-light').Document

const expect = require('chai').expect

describe('Interpolator', () => {

    let interpolator = null
    let context = null

    beforeEach(() => {
        interpolator = new Interpolator()
        context = {
            user: {
                name: {
                    first: 'Tony',
                    second: 'Lambada'
                }
            },
            id: 4815162342
        }
    })

    describe('.canInterpolate', () => {
        it('should return true if a string containts placeholders', () => {
            const canInterpolate = interpolator.canInterpolate('Hello {{ abc }}!')
            expect(canInterpolate).to.be.true
        })
        it('should return false if a string contains zero placeholders', () => {
            const canInterpolate = interpolator.canInterpolate('Hello World!')
            expect(canInterpolate).to.be.false
        })
    })

    describe('.interpolatables', () => {
        it('should return the static parts of the string in correct order', () => {
            const tokenized = interpolator._tokenize('Hey yo, my name is {{ user.name }}')
            expect(tokenized.statics.length).to.equal(1)
            expect(tokenized.statics[0]).to.equal('Hey yo, my name is ')
            expect(tokenized.interpolatables[0]).to.equal('user.name')
        })
        it('should return the interpolatable parts of the string trimme  in correct order', () => {
            const tokenized = interpolator._tokenize('Hey {{ greeting}}, my name is {{user.name}}')
            expect(tokenized.statics.length).to.equal(2)
            expect(tokenized.statics[0]).to.equal('Hey ')
            expect(tokenized.statics[1]).to.equal(', my name is ')
            expect(tokenized.interpolatables.length).to.equal(2)
            expect(tokenized.interpolatables[0]).to.equal('greeting')
            expect(tokenized.interpolatables[1]).to.equal('user.name')
        })
    })

    describe('.tokenize', () => {
        it('should return the static parts of the string in correct order', () => {
            const tokenized = interpolator._tokenize('Hey {{ user.name }}!')
            expect(tokenized.statics.length).to.equal(2)
            expect(tokenized.statics[0]).to.equal('Hey ')
            expect(tokenized.statics[1]).to.equal('!')
            expect(tokenized.interpolatables[0]).to.equal('user.name')
        })
        it('should return the static parts of the string in correct order', () => {
            const tokenized = interpolator._tokenize('Hey yo, my name is {{ user.name }}')
            expect(tokenized.statics.length).to.equal(1)
            expect(tokenized.statics[0]).to.equal('Hey yo, my name is ')
            expect(tokenized.interpolatables[0]).to.equal('user.name')
        })
        it('should return the interpolatable parts of the string trimme  in correct order', () => {
            const tokenized = interpolator._tokenize('Hey {{ greeting}}, my name is {{user.name}}')
            expect(tokenized.statics.length).to.equal(2)
            expect(tokenized.statics[0]).to.equal('Hey ')
            expect(tokenized.statics[1]).to.equal(', my name is ')
            expect(tokenized.interpolatables.length).to.equal(2)
            expect(tokenized.interpolatables[0]).to.equal('greeting')
            expect(tokenized.interpolatables[1]).to.equal('user.name')
        })
        it('should return the interpolatable parts of the string trimmed and in in correct order', () => {
            const tokenized = interpolator._tokenize('Hey {{ greet.german.friendly      }}, my name is {{  user.name      }}')
            expect(tokenized.statics.length).to.equal(2)
            expect(tokenized.statics[0]).to.equal('Hey ')
            expect(tokenized.statics[1]).to.equal(', my name is ')
            expect(tokenized.interpolatables.length).to.equal(2)
            expect(tokenized.interpolatables[0]).to.equal('greet.german.friendly')
            expect(tokenized.interpolatables[1]).to.equal('user.name')
        })
    })

    describe('.valueFor', () => {

        it('should return the correct value of the context objects property', () => {
            const value = interpolator.valueFor('user.name.first', context)
            expect(value).to.equal('Tony')
        })
        it('should return the correct value of the context objects property', () => {
            const value = interpolator.valueFor('user.name.second', context)
            expect(value).to.equal('Lambada')
        })
        it('should return the correct value of the context objects property', () => {
            const value = interpolator.valueFor('id', context)
            expect(value).to.equal(4815162342)
        })
        it('should return the context object', () => {
            const value = interpolator.valueFor('', context)
            expect(value).to.equal(context)
        })
        it('should return the user object', () => {
            const value = interpolator.valueFor('user', context)
            expect(value).to.equal(context.user)
        })
    })

    describe('.interpolate', () => {

        it('should interpolate a given string with correct values', () => {
            const interpolated = interpolator.interpolate('Hello {{user.name.first}}', context)
            expect(interpolated).to.equal('Hello Tony')
        })
        it('should interpolate a given string with correct values', () => {
            const interpolated = interpolator.interpolate('Hello {{  user.name.first}}', context)
            expect(interpolated).to.equal('Hello Tony')
        })
        it('should interpolate a given string with correct values', () => {
            const interpolated = interpolator.interpolate('Hello {{  user.name.first                   }}', context)
            expect(interpolated).to.equal('Hello Tony')
        })
        it('should interpolate a given string with correct values', () => {
            const interpolated = interpolator.interpolate('Hello {{user.name.first}}!', context)
            expect(interpolated).to.equal('Hello Tony!')
        })
        it('should interpolate a given string with correct values', () => {
            const interpolated = interpolator.interpolate('Hello{{user.name.first}}!', context)
            expect(interpolated).to.equal('HelloTony!')
        })
        it('should interpolate a given string with correct values', () => {
            const interpolated = interpolator.interpolate('Hey {{user.name.first}}, you are Nr. {{id}}', context)
            expect(interpolated).to.equal('Hey Tony, you are Nr. 4815162342')
        })
    })
})