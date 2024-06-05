export default function findAll(node, matchFunction) {
    const matches = []
    function recursivelyTraverse(node) {
        if (!node.children) return matches
        if (node.children.length == 0) return matches
        for (const child of node.children) {
            const match = matchFunction(child)
            if (match) matches.push(child)
            recursivelyTraverse(child)
        }
    }
    recursivelyTraverse(node)
    return matches
}
