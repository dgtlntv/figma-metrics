export default function findAll(node, matchFunction) {
    const matches = []

    function recursivelyTraverse(node) {
        if (!node || !node.children) return

        for (const child of node.children) {
            const match = matchFunction(child)
            if (match) matches.push(child)
            recursivelyTraverse(child)
        }
    }

    recursivelyTraverse(node)
    return matches
}
