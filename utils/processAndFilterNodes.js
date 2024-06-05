import processNodes from "./processNodes"
import filterComponentNodes from "./filterComponentNodes"

export default function processAndFilterNodes(nodes, componentNodes, detachedComponents, componentMap) {
    processNodes(nodes, componentNodes, detachedComponents, componentMap)
    const nonComponentNodes = filterComponentNodes(nodes, componentNodes)
    const filteredComponentNodes = Object.keys(componentNodes)

    return { nonComponentNodes, filteredComponentNodes }
}
