import filterHiddenNodes from "./filterHiddenNodes.js"
import createFlatNodeArray from "./createFlatNodeArray.js"

export default function processNodes(nodes, componentMap) {
    const componentNodes = {}
    const detachedComponents = {}
    const allComponentNodes = new Set()
    const parentChildMap = nodes.reduce((map, node) => {
        if (node.children) {
            node.children.forEach((childId) => {
                map[childId] = node.id
            })
        }
        return map
    }, {})

    for (const node of nodes) {
        if (node.type === "INSTANCE" && node.componentId && componentMap[node.componentId]) {
            componentNodes[node.id] = componentMap[node.componentId]
            allComponentNodes.add(node.id)
            filterHiddenNodes(createFlatNodeArray(node)).forEach((n) => allComponentNodes.add(n.id))
        }

        if (node.type === "FRAME" && node.name.startsWith("TRACKING PIXEL")) {
            const componentName = node.name.split(" / ")[1].trim() || "undefined"
            const libraryName = node.name.split(" / ")[2].trim() || "undefined"

            const parentId = parentChildMap[node.id]
            if (parentId) {
                const parentNode = nodes.find((n) => n.id === parentId)
                if (parentNode && parentNode.type === "INSTANCE") {
                    if (!componentMap[parentNode?.componentId]) {
                        detachedComponents[libraryName][componentName] =
                            (detachedComponents[libraryName][componentName] || 0) + 1
                    } else {
                        detachedComponents[libraryName][componentName] =
                            (detachedComponents[libraryName][componentName] || 0) + 1
                    }
                }
            }
        }
    }

    return { componentNodes, totalComponentNodeCount: allComponentNodes.size, detachedComponents }
}
