import filterHiddenNodes from "./filterHiddenNodes.js"
import findAll from "./findAll.js"

export default function processNodes(nodes, componentMap) {
    const componentNodes = {}
    const detachedComponents = {}
    const allComponentNodes = new Set()

    nodes.forEach((node) => {
        if (node.type === "INSTANCE") {
            if (node.componentId && componentMap[node.componentId]) {
                componentNodes[node.id] = {
                    ...componentMap[node.componentId],
                }
                allComponentNodes.add(node.id)

                const subNodes = findAll(node, () => true)
                const nonHiddenSubNodes = filterHiddenNodes(subNodes)

                nonHiddenSubNodes.forEach((n) => {
                    allComponentNodes.add(n.id)
                })
            }
        }

        // I need to check if the parent layer is a component
        // if it is a component we need to check if it is a blessed component
        // if it is not a blessed component then we count it as detached
        // if it isn't a component we count it as detached

        if (node.type === "FRAME" && node.name.startsWith("TRACKING PIXEL")) {
            const componentName = node.name.split("- ")[1]
            detachedComponents[componentName] = (detachedComponents[componentName] || 0) + 1
        }
    })

    return { componentNodes, totalComponentNodeCount: allComponentNodes.size, detachedComponents }
}
