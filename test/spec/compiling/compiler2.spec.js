'use strict'

const resolve = require('path').resolve
const Compiler = require(resolve('lib/compiling/compiler2'))
const Document = require('node-html-light').Document
const Node = require('node-html-light').Node
const Nodes = require('node-html-light').Nodes

const fs = require('fs-promise')
const chai = require('chai')
const expect = require('chai').expect
const spies = require('chai-spies')

chai.use(spies)

describe('Compiler2', () => {

    let compiler = null
    let checkoutHtmlNode = null
    let homeHtmlNode = null
    let commentNode = null
    let firstNameTextNode = null
    let idTextNode = null
    let radioButtonInput = null
    let context = null

    const checkoutHtmlPath = resolve('test', 'fixtures', 'templates', 'checkout.html')
    const homeHtmlPath = resolve('test', 'fixtures', 'templates', 'home.html')
    const commentPath = resolve('test', 'fixtures', 'templates', 'comment.html')

    beforeEach(() => {
        compiler = new Compiler('')
        radioButtonInput = [Node.fromString('<input type="radio" checked="{{ user.isFanboy }}"/>')]
        firstNameTextNode = [Node.fromString('<div id="{{ id }}">{{ user.name.first }}</div>')]
        idTextNode = [Node.fromString('<div><p>{{ id }}<p><div><span name="{{ user.name.first }}"></span></div></div>')]
        context = {
            user: {
                name: {
                    first: 'Tony',
                    second: 'Lambada'
                },
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
        return Document.fromPath(checkoutHtmlPath).then((node) => {
            checkoutHtmlNode = node
            return Document.fromPath(homeHtmlPath)
        }).then((node) => {
            homeHtmlNode = node
            return Node.fromPath(commentPath)
        }).then((node) => {
            commentNode = node
        })
    })

    describe('._compile', () => {
        it('should import footer.html1', (done) => {
            compiler._compile([commentNode], context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const footer = nodes.find({ name: 'footer' }, [{ key: 'id', value: 'footer' }])
                expect(footer.length).to.equal(1)
                expect(footer[0].name).to.equal('footer')
            }).then(done, done)
        })
        it('should import listing.html multiple times', (done) => {
            compiler._compile([homeHtmlNode.body()], context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)

                const list = nodes.find({ name: 'div' }, [{ key: 'class', value: 'list' }])

                expect(list.length).to.equal(2)
                expect(list[0].name).to.equal('div')
                expect(list[1].name).to.equal('div')
                expect(list[0].attributes.class).to.equal('list')
                expect(list[1].attributes.class).to.equal('list')
            }).then(done, done)
        })
        it('should interpolate header.html correctly', (done) => {
            compiler._compile([homeHtmlNode.body()], context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const textNodes = nodes.find('h1')[0].find({ type: Node.TYPE_TEXT })

                expect(textNodes.length).to.equal(1)
                expect(textNodes[0].get().data).to.equal('Hello Tony!')
            }).then(done, done)
        })
        it('should include copyright in header.html', (done) => {
            compiler._compile([homeHtmlNode.body()], context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const list = nodes.find({ name: 'span' }, [{ key: 'id', value: 'copyright' }])

                expect(list.length).to.equal(1)
                expect(list[0].get().children[0].data).to.equal("© 2020");
            }).then(done, done)
        })
        it('should include stfsy in header.html', (done) => {
            compiler._compile([homeHtmlNode.body()], context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const list = nodes.find({ name: 'span' }, [{ key: 'id', value: 'who' }])

                expect(list.length).to.equal(1)
                expect(list[0].get().children[0].data).to.equal("stfsy");
            }).then(done, done)
        })
        it('should import listing.html multiple times and interpolate the manufacturer text element correctly', (done) => {
            compiler._compile([homeHtmlNode.body()], context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const list = nodes.find({ name: 'div' }, [{ key: 'class', value: 'list' }])

                expect(list.length).to.equal(2)
                list.forEach((element, index) => {

                    const textNode = element.find('span')[0].find({ type: Node.TYPE_TEXT })
                    expect(textNode.length).to.equal(1)
                    expect(textNode[0].get().data).to.equal(context.phones[index].manufacturer)
                })
            }).then(done, done)
        })
        it('should include copyright.html', (done) => {
            compiler._compile([homeHtmlNode.body()], context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const list = nodes.find({ name: 'span' }, [{ key: 'id', value: 'copyright' }])

                expect(list.length).to.equal(1)
                expect(list[0].get().children[0].data).to.equal("© 2020");
            }).then(done, done)
        })
        it('should include copyright.html and span tag stfsy', (done) => {
            compiler._compile([homeHtmlNode.body()], context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const list = nodes.find({ name: 'span' }, [{ key: 'id', value: 'who' }])

                expect(list.length).to.equal(1)
                expect(list[0].get().children[0].data).to.equal("stfsy");
            }).then(done, done)
        })
    })

    describe('._compile', () => {
        it('should import header.html', (done) => {
            compiler._compile([checkoutHtmlNode.body()], context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const header = nodes.find({ name: 'header' }, [{ key: 'id', value: 'header' }])

                expect(header.length).to.equal(1)
                expect(header[0].name).to.equal('header')
            }).then(done, done)
        })
        it('should import billing.html', (done) => {
            compiler._compile([checkoutHtmlNode.body()], context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const div = nodes.find({ name: 'div' }, [{ key: 'id', value: 'billing' }])

                expect(div.length).to.equal(1)
                expect(div[0].name).to.equal('div')
            }).then(done, done)
        })
        it('should import footer.html', (done) => {
            compiler._compile([checkoutHtmlNode.body()], context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const footer = nodes.find({ name: 'footer' }, [{ key: 'id', value: 'footer' }])

                expect(footer.length).to.equal(1)
                expect(footer[0].name).to.equal('footer')
            }).then(done, done)
        })
        it('should import header.html', (done) => {
            compiler._compile([homeHtmlNode.body()], context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const header = nodes.find({ name: 'header' }, [{ key: 'id', value: 'header' }])

                expect(header.length).to.equal(1)
                expect(header[0].name).to.equal('header')
            }).then(done, done)
        })
        it('should import phones.html two times', (done) => {
            compiler._compile([homeHtmlNode.body()], context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const div = nodes.find({ name: 'div' }, [{ key: 'id', value: 'phones' }])
                expect(div.length).to.equal(1)
                expect(div[0].name).to.equal('div')
                expect(div[0].attributes.id).to.equal('phones')
            }).then(done, done)
        })
        it('should import footer.html three times', (done) => {
            compiler._compile([homeHtmlNode.body()], context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const footers = nodes.find({ name: 'body' })[0].find({ name: 'footer' })
                expect(footers.length).to.equal(2)
                expect(footers[0].name).to.equal('footer')
                expect(footers[1].name).to.equal('footer')
            }).then(done, done)
        })
        it('should resursively import droid.html', (done) => {
            compiler._compile([homeHtmlNode.body()], context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const div = nodes.find({ name: 'div' }, [{ key: 'id', value: 'droid' }])
                expect(div.length).to.equal(1)
                expect(div[0].name).to.equal('div')
                expect(div[0].attributes.id).to.equal('droid')
            }).then(done, done)
        })
        it('should resursively import snexu.html', (done) => {
            compiler._compile([homeHtmlNode.body()], context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const div = nodes.find({ name: 'span' }, [{ key: 'id', value: 'snexu-summary' }])

                expect(div.length).to.equal(1)
                expect(div[0].name).to.equal('span')
                expect(div[0].attributes.id).to.equal('snexu-summary')
            }).then(done, done)
        })
    })

    describe('.compile', () => {
        const outputFolder = 'test/output'

        afterEach(() => {
            return fs.remove(outputFolder)
        })

        it('should compile templates and write to the given output path', (done) => {
            compiler.compile('templates/*.html', 'test/fixtures', 'test/output', context).then(() => {
                return fs.readdir(resolve('test', 'output', 'templates'))
            }).then((contents) => {
                const valids = ['checkout.html', 'comment.html', 'copyright.html', 'home.html']
                expect(contents.length).to.equal(valids.length)
                expect(contents).to.eql(valids)
            }).then(done, done)
        })
        it('should compile templates and write to the given output path', (done) => {
            compiler.compile('*.html', 'test/fixtures/templates', 'test/output', context).then(() => {
                return fs.readdir(resolve('test', 'output'))
            }).then((contents) => {
                const valids = ['checkout.html', 'comment.html', 'copyright.html', 'home.html']
                expect(contents.length).to.equal(valids.length)
                expect(contents).to.eql(valids)
            }).then(done, done)
        })
        it('should compile templates and write to the given output path', (done) => {
            compiler.compile('**/*.html', 'test/fixtures/templates', 'test/output', context).then(() => {
                return fs.readdir(resolve('test', 'output'))
            }).then((contents) => {
                const valids = ['billing', 'checkout.html', 'comment.html', 'copyright.html', 'home.html', 'main', 'shopping']
                expect(contents.length).to.equal(valids.length)
                expect(contents).to.eql(valids)
            }).then(done, done)
        })
        it('should compile templates and write to the given output path', (done) => {
            compiler.compile('**/*.html', 'test/fixtures/templates', 'test/output', context).then(() => {
                return fs.readdir(resolve('test', 'output', 'billing'))
            }).then((contents) => {
                const valids = ['billing.html']
                expect(contents.length).to.equal(valids.length)
                expect(contents).to.eql(valids)
            }).then(done, done)
        })
        it('should compile templates and write to the given output path', (done) => {
            compiler.compile('**/*.html', 'test/fixtures/templates', 'test/output', context).then(() => {
                return fs.readdir(resolve('test', 'output', 'shopping'))
            }).then((contents) => {
                const valids = ['android', 'droid.html', 'listing.html', 'phones.html']
                expect(contents.length).to.equal(valids.length)
                expect(contents).to.eql(valids)
            }).then(done, done)
        })
        it('should compile templates and write to the given output path', (done) => {
            compiler.compile('**/*.html', 'test/fixtures/templates', 'test/output', context).then(() => {
                return fs.readdir(resolve('test', 'output', 'main'))
            }).then((contents) => {
                const valids = ['footer.html', 'header.html']
                expect(contents.length).to.equal(valids.length)
                expect(contents).to.eql(valids)
                expect(contents.length).to.equal(2)
            }).then(done, done)
        })
    })
    describe('.forEach', () => {
        let commentNode = null
        let command =
            beforeEach(() => {
                commentNode = Node.fromString('<!-- text -->')
                command = { arguments: () => 'phones' }
            })
        it('should return an array of nodes with 2 elements', (done) => {
            compiler._forEach(idTextNode, commentNode, command, [], context).then((result) => {
                expect(result).to.be.an('array')
                expect(result.length).to.equal(2)
                done()
            }).catch(done)
        })
        it('should return an array of nodes with 1 element', (done) => {
            compiler._forEach(idTextNode, commentNode, command, [], { phones: context.phones.slice(1) }).then((result) => {
                expect(result).to.be.an('array')
                expect(result.length).to.equal(1)
                done()
            }).catch(done)
        })
        it('should throw if nodes object is falsy', () => {
            expect(() => compiler._forEach(null, null, command, null, context)).to.throw(/falsy/)
        })
        it('should throw if context is not an array', () => {
            expect(() => compiler._forEach(homeHtmlNode, commentNode, command, null, { context })).to.throw(/not of type Array/)
        })
    })
    describe('._import', () => {
        const htmlPath = resolve('test', 'fixtures', 'templates', 'shopping', 'droid.html')

        it('should import read and parse the given files and return the html nodes', (done) => {
            compiler._import({ arguments: () => htmlPath }, [], context).then((nodes) => {
                expect(nodes).to.be.an('array')
                expect(nodes.length).to.equal(1)
                expect(nodes[0].find('div', [{ key: 'id', value: 'droid' }])).to.be.an('array')
                expect(nodes[0].find('div', [{ key: 'id', value: 'droid' }]).length).to.equal(1)
                done()
            }).catch(done)
        })
        it('should throw a helpful error if a file cannot be found', (done) => {
            compiler._import({ arguments: () => 'forcing_errors.html' }, context).catch((e) => {
                expect(e.message).to.contain('no such file')
                expect(e.path).to.contain((resolve('forcing_errors.html')))
                done()
            })
        })
    })
    describe('._interpolate', () => {
        it('should replace the name property path with the correct value', () => {
            compiler._interpolate(firstNameTextNode, context)
            const interpolatedNode = firstNameTextNode[0].find({ type: 'text' })[0]
            expect(interpolatedNode.get().data).to.equal(context.user.name.first)
        })
        it('should replace the id property path in the attribute with the correct value', () => {
            compiler._interpolate(firstNameTextNode, context)
            expect(firstNameTextNode[0].attributes.id).to.equal(context.id + '')
        })
        it('should replace the id property path with the correct value', () => {
            compiler._interpolate(idTextNode, context)

            const interpolatedNode = idTextNode[0].find({ type: 'text' })[0]
            expect(interpolatedNode.get().data).to.equal(context.id + '')
        })
        it('should replace the name property path in the attribute with the correct value', () => {
            compiler._interpolate(idTextNode, context)

            const interpolatedNode = idTextNode[0].find({ type: 'tag', name: 'span' })[0]
            expect(interpolatedNode.attributes.name).to.equal(context.user.name.first)
        })
        it('should remove the checked attribute if value is falsy', () => {
            compiler._interpolate(radioButtonInput, context)
            expect(radioButtonInput[0].attributes.checked).to.be.undefined
        })
    })
})