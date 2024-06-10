export default function createFlatNodeArray(node) {
    const flatNodeArray = []

    function recursivelyTraverseNodes(node) {
        if (!node || !node.children) return

        for (const child of node.children) {
            flatNodeArray.push(child)
            recursivelyTraverseNodes(child)
        }
    }

    recursivelyTraverseNodes(node)
    return flatNodeArray
}
