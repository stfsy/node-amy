'use strict'

const resolve = require('path').resolve
const Reader = require(resolve('lib/reading/pre-compiling-reader'))
const Node = require('node-html-light').Node
const expect = require('chai').expect

describe('PreCompilingReader', () => {

    let reader = null
    const htmlFiles = ['templates/billing/billing.html',
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

    describe('_precompile', () => {
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