import findAll from "./findAll"

export default function processNodes(nodes, componentNodes, detachedComponents) {
    nodes.forEach((node) => {
        if (node.type === "INSTANCE") {
            // TODO
            // Check if the instances maincomponent is from the libraries defined above otherwise disregard
            // Take note of which component it is (id, name, add to counter)
            // Take note of which library the component comes from (add to library counter)
            componentNodes[node.id] = { layers: [], name: node.name }
            const subNodes = findAll(node, () => true)
            subNodes.forEach((n) => componentNodes[node.id].layers.push(n.id))
        }
        if (node.type === "FRAME" && node.name.startsWith("TRACKING PIXEL")) {
            const componentName = node.name.split("- ")[1]
            detachedComponents[componentName] = (detachedComponents[componentName] || 0) + 1
        }
    })
}
