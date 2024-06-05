import processNodes from "./processNodes.js"
import filterComponentNodes from "./filterComponentNodes.js"

export default function processAndFilterNodes(nodes, componentNodes, detachedComponents, componentMap) {
    processNodes(nodes, componentNodes, detachedComponents, componentMap)
    const nonComponentNodes = filterComponentNodes(nodes, componentNodes)
    const filteredComponentNodes = Object.keys(componentNodes)

    return { nonComponentNodes, filteredComponentNodes }
}
