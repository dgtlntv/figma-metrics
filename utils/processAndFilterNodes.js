import processNodes from "./processNodes"
import filterComponentNodes from "./filterComponentNodes"

export default function processAndFilterNodes(nodes, componentNodes, detachedComponents) {
    processNodes(nodes, componentNodes, detachedComponents)
    const nonComponentNodes = filterComponentNodes(nodes, componentNodes)
    const filteredComponentNodes = Object.keys(componentNodes)

    return { nonComponentNodes, filteredComponentNodes }
}
