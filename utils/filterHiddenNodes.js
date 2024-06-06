import findAll from "./findAll.js"

export default function filterHiddenNodes(nodes) {
    let allHiddenNodes = []
    nodes.forEach((node) => {
        if (node.visible === false && !allHiddenNodes.includes(node.id)) {
            const subNodes = findAll(node, () => true)
            allHiddenNodes.push(node.id)
            subNodes.forEach((n) => allHiddenNodes.push(n.id))
        }
    })
    // we do our filtering on the second run because the order of nodes is unknown, and a child may appear before the parent
    const nonHiddenNodes = nodes.filter((n) => {
        // if the node is hidden, then toss it out
        if (allHiddenNodes.includes(n.id)) {
            return false
        }
        return true
    })
    return nonHiddenNodes
}
