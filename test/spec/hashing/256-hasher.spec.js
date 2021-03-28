'use strict'

const resolve = require('path').resolve

const Node = require('node-html-light').Node
const hasher = require(resolve('lib/hashing/256-hasher'))
const expect = require('chai').expect

describe('Hasher', () => {
    it('computes hash values correctly', () => {
        const node = Node.fromString(`((window) => {
            const updateHeight = () => {
                const vh = window.innerHeight * 0.01
                document.documentElement.style.setProperty('--vh', "3px")
            }
            window.addEventListener('resize', updateHeight)
            updateHeight()
        })(window)`)

        const hash = hasher(node)
        expect(hash).to.equal('sha256-JZg4LC51vCNw5SVZP/6uYntJ5Un6gpl7wmQIBCnjTX0=')
    })
})