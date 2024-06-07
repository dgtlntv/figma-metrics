import findAll from "./findAll.js"

export default function filterHiddenNodes(nodes) {
    // TODO do not filter out Tracking pixel

    let allHiddenNodes = []
    nodes.forEach((node) => {
        if (node.visible === false && !allHiddenNodes.includes(node.id)) {
            const subNodes = findAll(node, () => true)
            allHiddenNodes.push(node.id)
            subNodes.forEach((n) => allHiddenNodes.push(n.id))
        }
    })

    const nonHiddenNodes = nodes.filter((n) => {
        if (allHiddenNodes.includes(n.id)) {
            return false
        }
        return true
    })
    return nonHiddenNodes
}
