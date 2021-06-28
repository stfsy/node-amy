'use strict'

const Node = require('node-html-light').Node
const resolve = require('path').resolve
const PathBuilder = require(resolve('lib/traversing/path-builder'))

const expect = require('chai').expect

describe('PathBuilder', () => {

    const node = Node.fromString('<div><p>{{ id }}</p><div><span name="{{ user.name.first }}"></span><ul></ul></div></div>')

    let pathBuilder

    beforeEach(() => {
        pathBuilder = new PathBuilder()
    })

    it('does return empty array if element is root', () => {

    })

    it('returns an array for nested elements on level1', () => {
        const paragraph = node.find('p')
        const path = pathBuilder.buildPathFromParentToNode(paragraph[0].get())
        expect(path).to.have.length(1)
        expect(path[0]).to.equal(0)
    })

    it('returns an array for nested elements on level 2', () => {
        const span = node.find('span')
        const path = pathBuilder.buildPathFromParentToNode(span[0].get())
        expect(path).to.deep.equal([1, 0])
    })

    it('returns an array with reversed indices', () => {
        const list = node.find('ul')
        const path = pathBuilder.buildPathFromParentToNode(list[0].get())
        expect(path).to.deep.equal([1, 1])
    })

    it('return a path allows traversing back to target node', () => {
        const list = node.find('ul')
        const path = pathBuilder.buildPathFromParentToNode(list[0].get())
        const target = path.reduce((parent, index) => {
            return parent.children[index]
        }, node.get())
        expect(target.name).to.equal('ul')
    })
})