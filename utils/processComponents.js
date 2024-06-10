export default function processComponents(components, componentSets, componentMap, file, fileId) {
    const componentSetMap = (componentSets || []).reduce((map, set) => {
        map[set.node_id] = set.key
        return map
    }, {})

    for (const component of components) {
        const {
            key,
            name,
            containing_frame: { nodeId, name: frameName },
        } = component
        const componentSetKey = componentSetMap[nodeId]
        componentMap[key] = {
            componentName: name.includes("=") ? frameName : name,
            componentId: key,
            libraryName: file.name,
            libraryId: fileId,
            ...(componentSetKey && { componentSetKey }),
        }
    }
}
