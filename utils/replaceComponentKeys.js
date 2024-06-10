export default function replaceComponentKeys(file, nodes) {
    for (const node of nodes) {
        if (node.componentId) {
            const component = file.components[node.componentId] || file.componentsSets[node.componentId]
            if (component && component.key) {
                node.componentId = component.key
            }
        }
    }
}
