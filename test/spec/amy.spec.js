'use strict'

const resolve = require('path').resolve

const Amy = require(resolve('lib/amy'))
const fs = require('fs-promise')

const expect = require('chai').expect

describe('Amy', () => {
    describe('.compileTemplates', () => {
        const outputFolder = 'test/output'
        const context = {
            class: 'hidden',
            checked: 'false',
            id: '4815162342',
            nonce: 'noncy',
            user: {
                id: '815',
                class: 'hidden',
                name: {
                    first: 'Tony',
                    second: 'Lambada'
                },
                checked: 'false',
                isFanboy: false
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

        afterEach(() => {
            return fs.remove(outputFolder)
        })

        it('should compile templates and write to the given output path', () => {
            return Amy.compileTemplates('test/fixtures/templates/**/*.html', '', 'test/output', context).then(() => {
                return fs.readdir(resolve('test', 'output', 'test', 'fixtures', 'templates'))
            }).then((contents) => {
                expect(contents.length).to.equal(7)
            })
        })
    })
})