import filterHiddenNodes from "./filterHiddenNodes.js"
import findAll from "./findAll.js"

export default function processNodes(nodes, componentMap) {
    const componentNodes = {}
    const detachedComponents = {}
    nodes.forEach((node) => {
        if (node.type === "INSTANCE") {
            if (node.componentId && componentMap[node.componentId]) {
                componentNodes[node.id] = {
                    layers: [],
                    ...componentMap[node.componentId],
                }
                const subNodes = findAll(node, () => true)
                const nonHiddenSubNodes = filterHiddenNodes(subNodes)

                nonHiddenSubNodes.forEach((n) => componentNodes[node.id].layers.push(n.id))
            }
        }
        if (node.type === "FRAME" && node.name.startsWith("TRACKING PIXEL")) {
            const componentName = node.name.split("- ")[1]
            detachedComponents[componentName] = (detachedComponents[componentName] || 0) + 1
        }
    })
    return { componentNodes, detachedComponents }
}
