export default function replaceComponentKeys(file, nodes) {
    nodes.forEach((node) => {
        if (node.componentId) {
            let componentKey

            if (file.components[node.componentId] && file.components[node.componentId].key) {
                componentKey = file.components[node.componentId].key
            } else if (file.componentsSets[node.componentId] && file.componentsSets[node.componentId].key) {
                componentKey = file.componentsSets[node.componentId].key
            }

            if (componentKey) {
                node.componentId = componentKey
            }
        }
    })
}
