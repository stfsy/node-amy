'use strict'

class StringWriter {

    toHtmlString(nodes) {
        const strings = nodes.reduce((previous, next) => {
            previous.push(next.toHtml())
            return previous
        }, [''])

        return strings.join('')
    }
}

module.exports = StringWriter