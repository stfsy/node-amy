'use strict'

const Reader = require('./reader')

const path = require('path')
const globby = require('globby')

class ComponentRegistryReader extends Reader {

    constructor(basePath, { componentFilePattern = '**/*{js,html}', componentNamePrefix = 'app' }) {
        super(basePath)
        this._basePath = basePath
        this._pattern = componentFilePattern
        this._prefix = componentNamePrefix

        this._registry = {
            // file : html as string
        }
    }

    hasComponent(name) {
        return Object.prototype.hasOwnProperty.call(this._registry, name)
    }

    getComponent(name) {
        return this._registry[name]
    }

    /**
     * 
     * @returns Promise<>
     */
    async initializeRegistry() {
        const files = await super.matchFiles(this._pattern, this._basePath)
        return Promise.all(files.map(async file => {
            if (file.endsWith('html')) {
                const content = await super._readFileFromDisk(path.join(this._basePath, file))
                this._registry[this._createCacheName(file)] = this._createComponent(content)
            } else {
                this._registry[this._createCacheName(file)] = require(path.resolve(path.join(this._basePath, file)))
            }
        }))
    }

    _createCacheName(file) {
        return this._trailingDashIfNotEmpty(this._prefix) + path.parse(file).name
    }

    _trailingDashIfNotEmpty(prefix) {
        if (prefix) {
            return prefix + '-'
        } else {
            return prefix
        }
    }

    _createComponent(template) {
        return {
            props: [],
            template: () => template
        }
    }
}

module.exports = ComponentRegistryReader