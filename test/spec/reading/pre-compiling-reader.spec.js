'use strict'

const resolve = require('path').resolve
const Reader = require(resolve('lib/reading/pre-compiling-reader'))
const Node = require('node-html-light').Node
const expect = require('chai').expect

const fs = require('fs')
const copyrightContent = fs.readFileSync('test/fixtures/templates/copyright.html')

describe.only('PreCompilingReader', () => {

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
        reader = new Reader('test/fixtures', { registry: { enabled: true, componentFilePattern: '**/*{component.js,html}' } })
        return reader.initialize()
    })

    after(() => {
        fs.writeFileSync('test/fixtures/templates/copyright.html', copyrightContent, 'utf-8')
    })

    describe('readNodes', () => {
        it('reads nodes from disk if not cached', () => {
            return reader.readNodes('templates/copyright.html').then(html => {
                expect(html[0].toHtml()).to.include('id="copyright"')
                expect(html[2].toHtml()).to.include('id="who"')
            })
        })
        it('reads nodes from cache', () => {
            return reader.readNodes('templates/copyright.html').then(html => {
                expect(html[0].toHtml()).to.include('id="copyright"')
                expect(html[2].toHtml()).to.include('id="who"')

                fs.writeFileSync('test/fixtures/templates/copyright.html', 'hello', 'utf-8')
            }).then(() => {
                return reader.readNodes('templates/copyright.html').then(html => {
                    expect(html[0].toHtml()).to.include('id="copyright"')
                    expect(html[2].toHtml()).to.include('id="who"')
                })
            })
        })
        it('replaces component tags with component templates', () => {
            return reader.readNodes('templates/main/footer.html').then(html => {
                expect(html[0].toHtml()).to.include('id="snexu-summary"')
            })
        })
        it('replaces component slots with template elements children', () => {
            return reader.readNodes('templates/billing/billing.html').then(html => {
                expect(html[0].toHtml()).to.include('id="apple"')
                expect(html[0].toHtml()).not.to.include('<template>')
            })
        })
        it('replaces component slots with template elements children in place', () => {
            return reader.readNodes('templates/billing/billing.html').then(html => {
                const htmlString = html[0].toHtml()
                let appleId = htmlString.indexOf('id="apple"')
                let afterTemplateId = htmlString.indexOf('id="after-template')

                expect(appleId).to.not.equal(-1)
                expect(afterTemplateId).to.not.equal(-1)
                expect(appleId).to.be.lessThan(afterTemplateId)
            })
        })
        it('replaces component slots of templates with multiple root nodes in place', () => {
            return reader.readNodes('templates/main/footer.html').then(html => {
                const htmlString = html[0].toHtml()
                let summaryId = htmlString.indexOf('id="snexu-summary"')
                let yearId = htmlString.indexOf('id="year')

                expect(summaryId).to.not.equal(-1)
                expect(yearId).to.not.equal(-1)
                expect(summaryId).to.be.lessThan(yearId)
            })
        })
        it('removes the slot element', () => {
            return reader.readNodes('templates/billing/billing.html').then(html => {
                const htmlString = html[0].toHtml()
                expect(htmlString.indexOf('slot')).to.equal(-1)
            })
        })
    })

    describe('_resolveComponents', () => {
        it('injects components into html', () => {
            const html = '<div><app-snexu/></div>'
            const node = [Node.fromString(html)]
            const htmlWithComponents = reader._resolveComponents(node)
            expect(htmlWithComponents).to.include('snexu-summary')
        })
        it('replaces root element with component template', () => {
            const html = '<div></div><app-snexu/>'
            const node = Node.fromString(html)
            const htmlWithComponents = reader._resolveComponents(node)
            expect(htmlWithComponents).to.include('snexu-summary')
        })
        it('adds new root element with component template consists of more than one', () => {
            const html = '<div></div><app-phones/><span></span>'
            const node = Node.fromString(html)
            const htmlWithComponents = reader._resolveComponents(node)
            expect(htmlWithComponents).to.include('id="phones')
            expect(htmlWithComponents).to.include('id="footer"')
            expect(htmlWithComponents.indexOf('phones')).to.be.lessThan(htmlWithComponents.indexOf('footer'))
            expect(htmlWithComponents.indexOf('footer')).to.be.lessThan(htmlWithComponents.indexOf('span'))
        })
        it('adds new root elements for each component template that consists of more than one', () => {
            const html = '<div></div><app-phones/><app-snexu/><span></span>'
            const node = Node.fromString(html)
            const htmlWithComponents = reader._resolveComponents(node)
            expect(htmlWithComponents).to.include('id="phones')
            expect(htmlWithComponents).to.include('id="footer"')
            expect(htmlWithComponents).to.include('snexu-summary')
            expect(htmlWithComponents.indexOf('phones')).to.be.lessThan(htmlWithComponents.indexOf('footer'))
            expect(htmlWithComponents.indexOf('footer')).to.be.lessThan(htmlWithComponents.indexOf('snexu-summary'))
            expect(htmlWithComponents.indexOf('snexu-summmary')).to.be.lessThan(htmlWithComponents.indexOf('span'))
        })
        it('adds new elements if component template has more than one root', () => {
            const html = '<div><app-phones/><app-snexu/></div>'
            const node = [Node.fromString(html)]
            const htmlWithComponents = reader._resolveComponents(node)
            expect(htmlWithComponents).to.include('snexu-summary')
            expect(htmlWithComponents).to.include('id="phones"')
            expect(htmlWithComponents).to.include('id="footer"')
        })
        it('throws if nested component has no template property', () => {
            const html = '<div><app-test-component-template-is-a-property.component/></div>'
            const node = [Node.fromString(html)]
            expect(() => {
                reader._resolveComponents(node)
            }).to.throw(/.* has no template .*/)
        })
        it('throws if nested component has no render property', () => {
            const html = '<div><app-test-component-no-render-function.component/></div>'
            const node = [Node.fromString(html)]
            expect(() => {
                reader._resolveComponents(node)
            }).to.throw(/.* has no render .*/)
        })
        it('throws if render function does not return nodes', () => {
            const html = '<div><app-test-component-render-returns-no-nodes.component/></div>'
            const node = [Node.fromString(html)]
            expect(() => {
                reader._resolveComponents(node)
            }).to.throw(/No nodes for precompilation .*/)
        })
    })

    describe('_resolveComponentsTemplatesAndSlots', () => {
        let componentWithSlot
        let componentWithNamedSlot
        let componentWithNamedSlotAndUnnamedSlot
        let componentWithMultipleRootsAndSlots
        let invalidComponentSlotsWithSameName
        let template
        let templateWithMultipleElementsOneNamedslot
        let templateWithMultipleElements

        beforeEach(() => {
            componentWithSlot = [Node.fromString('<div><slot/></div>')]
            componentWithNamedSlot = [Node.fromString('<div><slot name="hello"/></div>')]
            componentWithNamedSlotAndUnnamedSlot = [Node.fromString('<div><div id="named"><slot name="hello"/></div><div id="unnamed"><slot/></div></div>')]
            componentWithMultipleRootsAndSlots = Node.fromString('<div id="first"><slot name="hello"></slot></div><div id="second"><slot/></div>')
            invalidComponentSlotsWithSameName = [Node.fromString('<div><slot name="hello"/><slot name="hello"></div>')]
            template = Node.fromString('<div><template><span>Hello World!</span></template></div>')
            templateWithMultipleElementsOneNamedslot = Node.fromString('<div><template><p><span>Hello World!</span></p></template><template slot="hello"><p><span>It\'s a good day!</span></p></template></div>')
            templateWithMultipleElements = Node.fromString('<div><template><p><span>Hello World!</span></p><p><span>It\'s a good day!</span></p></template></div>')
        })

        it('replaces default slot with template content', () => {
            const component = reader._resolveComponentsTemplatesAndSlots(componentWithSlot, template)
            const span = component[0].find('span')[0]
            const text = span.get().children[0].data
            expect(text).to.equal('Hello World!')
        })
        it('adds all templates children', () => {
            const component = reader._resolveComponentsTemplatesAndSlots(componentWithSlot, templateWithMultipleElements)
            const firstSpan = component[0].find('span')[0]
            const firstText = firstSpan.get().children[0].data
            const secondSpan = component[0].find('span')[1]
            const secondText = secondSpan.get().children[0].data
            expect(firstText).to.equal('Hello World!')
            expect(secondText).to.equal('It\'s a good day!')
        })
        it('removes template tag and add only its child elements', () => {
            const component = reader._resolveComponentsTemplatesAndSlots(componentWithSlot, template)
            const templateNode = component[0].find('template')
            expect(templateNode).to.have.length(0)
        })
        it('add templates with slot name to respective slot', () => {
            const component = reader._resolveComponentsTemplatesAndSlots(componentWithNamedSlotAndUnnamedSlot, templateWithMultipleElementsOneNamedslot)
            const namedDiv = component[0].find('div', [{ key: 'id', value: 'named' }])[0]
            const unnamedDiv = component[0].find('div', [{ key: 'id', value: 'unnamed' }])[0]
            const goodDay = namedDiv.find('span')[0].children[0].get().data
            const hello = unnamedDiv.find('span')[0].children[0].get().data
            expect(goodDay).to.equal('It\'s a good day!')
            expect(hello).to.equal('Hello World!')
        })
        it('add templates with slot name to respective slot in correct root elements', () => {
            const component = reader._resolveComponentsTemplatesAndSlots(componentWithMultipleRootsAndSlots, templateWithMultipleElementsOneNamedslot)
            const firstDiv = component[0].find('div', [{ key: 'id', value: 'first' }])[0]
            const secondDiv = component[1].find('div', [{ key: 'id', value: 'second' }])[0]
            const goodDay = firstDiv.find('span')[0].children[0].get().data
            const hello = secondDiv.find('span')[0].children[0].get().data
            expect(goodDay).to.equal('It\'s a good day!')
            expect(hello).to.equal('Hello World!')
        })
        it('throws an error if there\'s unequel number of slots and templates', () => {
            expect(() => {
                reader._resolveComponentsTemplatesAndSlots(componentWithNamedSlot, template)
            }).to.throw(/Could not find .*/)
        })
        it('throws an error if component has named slots and template doesnt', () => {
            expect(() => {
                reader._resolveComponentsTemplatesAndSlots(componentWithNamedSlotAndUnnamedSlot, template)
            }).to.throw(/Uneven number of templates .*/)
        })
        it('throws and error if multiple slots have same name', () => {
            expect(() => {
                reader._resolveComponentsTemplatesAndSlots(invalidComponentSlotsWithSameName, templateWithMultipleElementsOneNamedslot)
            }).to.throw(/There is more than one .*/)
        })
    })

    describe('_precompile', () => {
        new Reader()._attributes_to_remove_if_value_false.forEach((attribute) => {
            it('removes ' + attribute + ' if value is "false"', () => {
                const node = Node.fromString(`<body ${attribute}="{{value}}"></body>`)
                const result = reader._precompile([node])
                Object.entries(result[0].attributes).forEach(entry => entry[1](node, { value: 'false' }))
                expect(node.attributes[attribute]).to.be.undefined
            })
            it('interpolates ' + attribute + ' if value is not "false"', () => {
                const node = Node.fromString(`<body ${attribute}="{{value}}"></body>`)
                const result = reader._precompile([node])
                Object.entries(result[0].attributes).forEach(entry => entry[1](node, { value: 'true' }))
                expect(node.attributes[attribute]).to.equal('true')
            })
        })
        it('creates a function that interpolates text content', () => {
            const node = Node.fromString('<body class="Hello {{name}}!">{{ subscription }}</body>')
            const result = reader._precompile([node])
            Object.entries(result[0].attributes).forEach(entry => entry[1](node, { name: 'Tom' }))
            expect(node.attributes.class).to.equal('Hello Tom!')
        })
        it('creates a function that interpolates an attribute', () => {
            const node = Node.fromString('<body class="Hello {{name}}!"></body>')
            const result = reader._precompile([node])
            expect(result).to.have.length(1)
            Object.entries(result[0].attributes).forEach(entry => entry[1](node, { name: 'Tom' }))
            expect(node.attributes.class).to.equal('Hello Tom!')
        })
        it('creates a function that interpolates multiple placeholders in an attribute', () => {
            const node = Node.fromString('<body class="Hello {{name}}! The clock says its {{ time }}"></body>')
            const result = reader._precompile([node])
            expect(result).to.have.length(1)
            Object.entries(result[0].attributes).forEach(entry => entry[1](node, { name: 'Tom', time: '09:00' }))
            expect(node.attributes.class).to.equal('Hello Tom! The clock says its 09:00')
        })
        it('creates a function that interpolates multiple placeholders in multiple attributes', () => {
            const node = Node.fromString('<body class="Hello {{name}}!" id="{{id}}"></body>')
            const result = reader._precompile([node])
            expect(result).to.have.length(1)
            Object.entries(result[0].attributes).forEach(entry => entry[1](node, { name: 'Tom', id: 'main-button' }))
            Object.entries(result[0].attributes).forEach(entry => entry.attributes, { name: 'Tom', id: 'main-button' })
            expect(node.attributes.class).to.equal('Hello Tom!')
            expect(node.attributes.id).to.equal('main-button')
        })
        it('creates a function that interpolates placeholders in text elements', () => {
            const node = Node.fromString('<body>Hello {{name}}</body>')
            const result = reader._precompile([node])
            expect(result).to.have.length(1)
            Object.entries(result[0].text).forEach(entry => entry[1](node, { name: 'Mercedes' }))
            expect(node.get().children[0].data).to.equal('Hello Mercedes')
        })
        it('creates a function that interpolates placeholders in nested text elements', () => {
            const node = Node.fromString('<body><div><p><span>Hello {{name}}</span></p></div></body>')
            const result = reader._precompile([node])
            expect(result).to.have.length(1)
            Object.entries(result[0].text).forEach(entry => entry[1](node, { name: 'Mercedes' }))
            expect(node.get().children[0].children[0].children[0].children[0].data).to.equal('Hello Mercedes')
        })
        it('creates a function that interpolates multiple placeholders in nested text elements', () => {
            const node = Node.fromString('<body><div><p><span>Hello {{name}} from {{country}}</span></p></div></body>')
            const result = reader._precompile([node])
            expect(result).to.have.length(1)
            Object.entries(result[0].text).forEach(entry => entry[1](node, { name: 'Mercedes', country: 'Germany' }))
            expect(node.get().children[0].children[0].children[0].children[0].data).to.equal('Hello Mercedes from Germany')
        })
        it('creates a function for import command', () => {
            const node = Node.fromString('<body><div><p><span></span><!-- @amy import abc.html --></p></div></body>')
            const result = reader._precompile([node])
            expect(result).to.have.length(1)
            Object.entries(result[0].import).forEach((entry) => {
                expect(typeof entry[1]).to.equal('function')
            })
        })
        it('creates a function for forEach command', () => {
            const node = Node.fromString('<body><div><p><span></span><!-- @amy import abc.html forEach 123--></p></div></body>')
            const result = reader._precompile([node])
            expect(result).to.have.length(1)
            Object.entries(result[0].forEach).forEach((entry) => {
                expect(typeof entry[1]).to.equal('function')
            })
        })
        it('creates a function for include command', () => {
            const node = Node.fromString('<body><div><p><span></span><!-- @amy include --></p></div></body>')
            const result = reader._precompile([node])
            expect(result).to.have.length(1)
            Object.entries(result[0].include).forEach((entry) => {
                expect(typeof entry[1]).to.equal('function')
            })
        })
        it('creates a function for add command', () => {
            const node = Node.fromString('<body><div><p><span></span><!-- @amy import abc and add def.html--></p></div></body>')
            const result = reader._precompile([node])
            expect(result).to.have.length(1)
            Object.entries(result[0].include).forEach((entry) => {
                expect(typeof entry[1]).to.equal('function')
            })
        })
        it('creates a function for if command', () => {
            const node = Node.fromString('<body><div><p><span></span><!-- @amy if iol import abc and add def.html--></p></div></body>')
            const result = reader._precompile([node])
            expect(result).to.have.length(1)
            Object.entries(result[0].if).forEach((entry) => {
                expect(typeof entry[1]).to.equal('function')
            })
        })
        it('creates a function that receives a callback that is called with the comment node', (done) => {
            const node = Node.fromString('<body><div><p><span></span><!-- @amy if iol import abc and add def.html--></p></div></body>')
            const result = reader._precompile([node])
            expect(result).to.have.length(1)
            Object.entries(result[0].if).forEach((entry) => {
                entry[1](node, {}, (node) => {
                    expect(node.type).to.equal('comment')
                    done()
                })
            })
        })
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