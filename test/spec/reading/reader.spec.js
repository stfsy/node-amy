'use strict'

const resolve = require('path').resolve
const Reader = require(resolve('lib/reading/reader'))
const expect = require('chai').expect

describe('Reader', () => {

    let reader = null
    const htmlFiles = [
        'components/html-component.html',
        'templates/billing/billing.html',
        'templates/billing/ios.html',
        'templates/checkout.html',
        'templates/copyright.html',
        'templates/comment.html',
        'templates/home.html',
        'templates/main/footer.html',
        'templates/main/footerIncludeWrapper.html',
        'templates/main/header.html',
        'templates/shopping/android/snexu.html',
        'templates/shopping/droid.html',
        'templates/shopping/listing.html',
        'templates/shopping/phones.html']

    beforeEach(() => {
        reader = new Reader()
    })

    describe('.matchFiles', () => {
        it('should return an array with two elements', (done) => {
            reader.matchFiles(['templates/*.html'], 'test/fixtures').then((contents) => {
                const valids = ['templates/checkout.html', 'templates/copyright.html', 'templates/comment.html', 'templates/home.html']
                expect(contents.length).to.equal(valids.length)
                expect(contents).to.have.members(valids)
            }).then(done, done)
        })
        it('should return an array with one element', (done) => {
            reader.matchFiles('templates/home.html', 'test/fixtures').then((contents) => {
                const valids = ['templates/home.html']
                expect(contents.length).to.equal(valids.length)
                expect(contents).to.have.members(valids)
            }).then(done, done)
        })
        it('should return an array with one element', (done) => {
            reader.matchFiles('templates/checkout.html', 'test/fixtures').then((contents) => {
                const valids = ['templates/checkout.html']
                expect(contents.length).to.equal(valids.length)
                expect(contents).to.have.members(valids)
            }).then(done, done)
        })
        it('should return an array with 6 elements', (done) => {
            reader.matchFiles(['**/*.html', '!output/**'], 'test/fixtures').then((contents) => {
                expect(contents.length).to.equal(htmlFiles.length)
                expect(contents).to.have.members(htmlFiles)
            }).then(done, done)
        })
        it('should return an array with 6 elements', (done) => {
            reader.matchFiles(['**/*.html'], 'test/fixtures').then((contents) => {
                expect(contents.length).to.equal(htmlFiles.length)
                expect(contents).to.have.members(htmlFiles)
            }).then(done, done)
        })
        it('should return an array with 6 elements', (done) => {
            reader.matchFiles(['**/*.html'], 'test/fixtures').then((contents) => {
                expect(contents.length).to.equal(htmlFiles.length)
                expect(contents).to.have.members(htmlFiles)
            }).then(done, done)
        })
    })
})