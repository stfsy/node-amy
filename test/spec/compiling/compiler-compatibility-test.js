'use strict'

const resolve = require('path').resolve
const Node = require('node-html-light').Node
const Nodes = require('node-html-light').Nodes

const fs = require('fs-promise')
const expect = require('chai').expect

module.exports = (compilerProvider) => {

    let compiler = null
    let context = null

    const checkoutHtmlPath = resolve('test', 'fixtures', 'templates', 'checkout.html')
    const homeHtmlPath = resolve('test', 'fixtures', 'templates', 'home.html')
    const commentPath = resolve('test', 'fixtures', 'templates', 'comment.html')

    beforeEach(() => {
        compiler = compilerProvider('')
        context = {
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
    })

    describe('.compile', () => {
        it('compiles each time from scratch', () => {
            return compiler.compile(homeHtmlPath, context).then((html) => {
                expect(html).to.contain('Hello Tony!')
            }).then(() => {
                context.user.name.first = 'Ben'
                return compiler.compile(homeHtmlPath, context)
            }).then((html) => {
                expect(html).to.not.contain('Hello Tony!')
                expect(html).to.contain('Hello Ben!')
            })
        })
        it('caches files if cache flag is set', () => {
            return compiler.compile(homeHtmlPath, context,true).then((html) => {
                expect(html).to.contain('Hello Tony!')
            }).then(() => {
                context.user.name.first = 'Ben'
                return compiler.compile(homeHtmlPath, context, true)
            }).then((html) => {
                expect(html).to.contain('Hello Tony!')
                expect(html).to.not.contain('Hello Ben!')
            })
        })
    })

    describe('._compileFile', () => {
        it('resolves multiple attributes on the first imported node', () => {
            return compiler._compileFile('test/fixtures/templates', 'checkout.html', context, true)
                .then((contents) => {
                    const header = new Nodes(contents).find({ name: 'header' })[0]
                    expect(header.attributes.id).to.equal('header')
                })
        })
        it('should import footer.html1 because importEnabled is true', () => {
            context.importEnabled = true
            return compiler._compileFile('test/fixtures/templates', commentPath, context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const footer = nodes.find({ name: 'footer' }, [{ key: 'id', value: 'footer' }])
                expect(footer.length).to.equal(1)
                expect(footer[0].name).to.equal('footer')
            })
        })
        it('should not import footer.html1 because importEnabled is false', () => {
            context.importEnabled = false
            return compiler._compileFile('test/fixtures/templates', commentPath, context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const footer = nodes.find('footer', [{ key: 'id', value: 'footer' }])
                expect(footer.length).to.equal(0)
            })
        })
        it('resolves multiple attributes on the first imported node', () => {
            return compiler._compileFile('test/fixtures/templates', homeHtmlPath, context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const body = nodes.find('body')[0]
                expect(body.attributes.id).to.equal('4815162342')
                expect(body.attributes.nonce).to.equal('noncy')
            })
        })
        it('resolves multiple attributes on other nodes', () => {
            return compiler._compileFile('test/fixtures/templates', homeHtmlPath, context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const header = nodes.find('header')[0]
                expect(header.attributes.class).to.equal('hidden')
                expect(header.attributes._id).to.equal('815')
            })
        })
        it('should import listing.html multiple times', () => {
            return compiler._compileFile('test/fixtures/templates', homeHtmlPath, context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)

                const list = nodes.find('div', [{ key: 'class', value: 'list' }])

                expect(list.length).to.equal(2)
                expect(list[0].name).to.equal('div')
                expect(list[1].name).to.equal('div')
                expect(list[0].attributes.class).to.equal('list')
                expect(list[1].attributes.class).to.equal('list')
            })
        })
        it('should interpolate header.html correctly', () => {
            return compiler._compileFile('test/fixtures/templates', homeHtmlPath, context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const textNodes = nodes.find('h1')[0].find({ type: Node.TYPE_TEXT })

                expect(textNodes.length).to.equal(1)
                expect(textNodes[0].get().data).to.equal('Hello Tony!')
            })
        })
        it('should include copyright in header.html', () => {
            return compiler._compileFile('test/fixtures/templates', homeHtmlPath, context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const list = nodes.find({ name: 'span' }, [{ key: 'id', value: 'copyright' }])

                expect(list.length).to.equal(1)
                expect(list[0].get().children[0].data).to.equal("© 2020");
            })
        })
        it('should include stfsy in header.html', () => {
            return compiler._compileFile('test/fixtures/templates', homeHtmlPath, context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const list = nodes.find({ name: 'span' }, [{ key: 'id', value: 'who' }])

                expect(list.length).to.equal(1)
                expect(list[0].get().children[0].data).to.equal("stfsy");
            })
        })
        it('should import listing.html multiple times and interpolate the manufacturer text element correctly', () => {
            return compiler._compileFile('test/fixtures/templates', homeHtmlPath, context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const list = nodes.find({ name: 'div' }, [{ key: 'class', value: 'list' }])

                expect(list.length).to.equal(2)
                list.forEach((element, index) => {

                    const textNode = element.find('span')[0].find({ type: Node.TYPE_TEXT })
                    expect(textNode.length).to.equal(1)
                    expect(textNode[0].get().data).to.equal(context.phones[index].manufacturer)
                })
            })
        })
        it('should include copyright.html', () => {
            return compiler._compileFile('test/fixtures/templates', homeHtmlPath, context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const list = nodes.find({ name: 'span' }, [{ key: 'id', value: 'copyright' }])

                expect(list.length).to.equal(1)
                expect(list[0].get().children[0].data).to.equal("© 2020");
            })
        })
        it('should include copyright.html and span tag stfsy', () => {
            return compiler._compileFile('test/fixtures/templates', homeHtmlPath, context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const list = nodes.find({ name: 'span' }, [{ key: 'id', value: 'who' }])

                expect(list.length).to.equal(1)
                expect(list[0].get().children[0].data).to.equal("stfsy");
            })
        })

        it('should remove checked attribute when value is "false"', () => {
            return compiler._compileFile('test/fixtures/templates', checkoutHtmlPath, context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const header = nodes.find('header')[0]

                expect(header.attributes.checked).to.be.undefined
            })
        })
        it('should remove checked attribute when value is "false"', () => {
            context.user.checked = 'yes'
            return compiler._compileFile('test/fixtures/templates', checkoutHtmlPath, context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const header = nodes.find('header')[0]

                expect(header.attributes.checked).to.equal('yes')
            })
        })
        it('should import header.html', () => {
            return compiler._compileFile('test/fixtures/templates', checkoutHtmlPath, context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const header = nodes.find({ name: 'header' }, [{ key: 'id', value: 'header' }])

                expect(header.length).to.equal(1)
                expect(header[0].name).to.equal('header')
            })
        })
        it('should import billing.html', () => {
            return compiler._compileFile('test/fixtures/templates', checkoutHtmlPath, context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const div = nodes.find({ name: 'div' }, [{ key: 'id', value: 'billing' }])

                expect(div.length).to.equal(1)
                expect(div[0].name).to.equal('div')
            })
        })
        it('should import footer.html', () => {
            return compiler._compileFile('test/fixtures/templates', checkoutHtmlPath, context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const footer = nodes.find({ name: 'footer' }, [{ key: 'id', value: 'footer' }])

                expect(footer.length).to.equal(1)
                expect(footer[0].name).to.equal('footer')
            })
        })
        it('should add copyright', () => {
            return compiler._compileFile('test/fixtures/templates', checkoutHtmlPath, context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const list = nodes.find({ name: 'span' }, [{ key: 'id', value: 'copyright' }])

                expect(list.length).to.equal(1)
                expect(list[0].get().children[0].data).to.equal("© 2020");
            })
        })
        it('should add author', () => {
            return compiler._compileFile('test/fixtures/templates', checkoutHtmlPath, context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const list = nodes.find({ name: 'span' }, [{ key: 'id', value: 'who' }])

                expect(list.length).to.equal(1)
                expect(list[0].get().children[0].data).to.equal("stfsy");
            })
        })
        it('should import header.html', () => {
            return compiler._compileFile('test/fixtures/templates', homeHtmlPath, context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const header = nodes.find({ name: 'header' }, [{ key: 'id', value: 'header' }])

                expect(header.length).to.equal(1)
                expect(header[0].name).to.equal('header')
            })
        })
        it('should import phones.html two times', () => {
            return compiler._compileFile('test/fixtures/templates', homeHtmlPath, context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const div = nodes.find({ name: 'div' }, [{ key: 'id', value: 'phones' }])
                expect(div.length).to.equal(1)
                expect(div[0].name).to.equal('div')
                expect(div[0].attributes.id).to.equal('phones')
            })
        })
        it('should import footer.html three times', () => {
            return compiler._compileFile('test/fixtures/templates', homeHtmlPath, context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const footers = nodes.find({ name: 'body' })[0].find({ name: 'footer' })
                expect(footers.length).to.equal(2)
                expect(footers[0].name).to.equal('footer')
                expect(footers[1].name).to.equal('footer')
            })
        })
        it('should resursively import droid.html', () => {
            return compiler._compileFile('test/fixtures/templates', homeHtmlPath, context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const div = nodes.find({ name: 'div' }, [{ key: 'id', value: 'droid' }])
                expect(div.length).to.equal(1)
                expect(div[0].name).to.equal('div')
                expect(div[0].attributes.id).to.equal('droid')
            })
        })
        it('should resursively import snexu.html', () => {
            return compiler._compileFile('test/fixtures/templates', homeHtmlPath, context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const div = nodes.find({ name: 'span' }, [{ key: 'id', value: 'snexu-summary' }])

                expect(div.length).to.equal(1)
                expect(div[0].name).to.equal('span')
                expect(div[0].attributes.id).to.equal('snexu-summary')
            })
        })
        it('toggles removal of all comment nodes', () => {
            compiler._removeComments = true

            return compiler._compileFile('test/fixtures/templates', homeHtmlPath, context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const commentNodes = nodes.find({
                    type: Node.TYPE_COMMENT
                })
                // didn't catch all this time
                expect(commentNodes.length).to.equal(3)
            })
        })
        it('imports includes correctly', () => {
            compiler._removeComments = true

            return compiler._compileFile('test/fixtures/templates', homeHtmlPath, context).then((compiledNode) => {
                const nodes = Nodes.of(compiledNode)
                const list = nodes.find('span', [{ key: 'id', value: 'copyright' }])

                expect(list.length).to.equal(1)
                expect(list[0].get().children[0].data).to.equal("© 2020");

            })
        })
    })

    describe('.initialize', () => {
        it('finds templates', () => {
            return compiler.initialize('test/fixtures/templates').then(() => {
                expect(Object.keys(compiler._reader._precompileResults)).to.have.length(13)
            })
        })
        it('precompiles templates and stores paths to commands', () => {
            return compiler.initialize('test/fixtures/templates').then(() => {
                const precompileResults = compiler._reader._precompileResults
                expect(Object.keys(precompileResults['test/fixtures/templates/home.html'][2].forEach)).to.have.length(1)
            })
        })
        it('precompiles templates and stores paths interpolatables', () => {
            return compiler.initialize('test/fixtures/templates').then(() => {
                const precompileResults = compiler._reader._precompileResults
                console.log(precompileResults['test/fixtures/templates/home.html'])
                expect(Object.keys(precompileResults['test/fixtures/templates/home.html'][2].attributes)).to.have.length(2)
            })
        })
    })
}