import createFlatNodeArray from "./createFlatNodeArray.js"

export default function filterHiddenNodes(nodes) {
    const hiddenNodes = new Set()

    for (const node of nodes) {
        if (node.visible === false && !node.name.startsWith("TRACKING PIXEL") && !hiddenNodes.has(node.id)) {
            hiddenNodes.add(node.id)
            createFlatNodeArray(node).forEach((subNode) => hiddenNodes.add(subNode.id))
        }
    }

    return nodes.filter((n) => !hiddenNodes.has(n.id))
}
