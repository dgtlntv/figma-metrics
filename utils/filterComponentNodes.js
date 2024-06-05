export default function filterComponentNodes(nodes, componentNodes) {
    return nodes.filter((n) => {
        for (const key in componentNodes) {
            if (key === n.id || componentNodes[key].layers.includes(n.id)) {
                return false
            }
        }
        return true
    })
}
