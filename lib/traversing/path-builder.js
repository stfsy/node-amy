'use strict'

/** */
class Builder {

    /** 
     * @param {Node} node a parsed node that will be the target of the returned path
     * @returns {Array<Number>} an array of indices, i.e. [2,1,3]
    */
    buildPathFromParentToNode(node) {
        const path = []

        while (node.parent.type !== 'root') {
            path.push(this._countPreviousSiblings(node))
            node = node.parent
        }

        return path.reverse()
    }

    _countPreviousSiblings(node) {
        let count = 0
        for (; node.prev != null; node = node.prev, count++) { }
        return count
    }
}

module.exports = Builder