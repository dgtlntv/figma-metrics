import findAll from "./findAll"

export default function processNodes(nodes, componentNodes, detachedComponents, componentMap) {
    nodes.forEach((node) => {
        if (node.type === "INSTANCE") {
            if (node.componentId && componentMap[node.componentId]) {
                componentNodes[node.id] = {
                    layers: [],
                    componentId: node.componentId,
                    ...componentMap[node.componentId],
                }
                const subNodes = findAll(node, () => true)
                subNodes.forEach((n) => componentNodes[node.id].layers.push(n.id))
            }
        }
        if (node.type === "FRAME" && node.name.startsWith("TRACKING PIXEL")) {
            const componentName = node.name.split("- ")[1]
            detachedComponents[componentName] = (detachedComponents[componentName] || 0) + 1
        }
    })
}
