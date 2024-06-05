export default function calculateStats(allNodes, componentNodes, nonComponentNodes, detachedComponents) {
    const componentUsage = {}

    Object.values(componentNodes).forEach((node) => {
        const componentName = node.name
        const libraryName = node.library

        if (!componentUsage[componentName]) {
            componentUsage[componentName] = {
                count: 0,
                library: libraryName,
            }
        }

        componentUsage[componentName].count++
    })

    return {
        numTotalNodes: allNodes.length,
        numComponentNodes: Object.keys(componentNodes).length,
        numNonComponentNodes: nonComponentNodes.length,
        sourceMixComponentNodes: Math.round((Object.keys(componentNodes).length / allNodes.length) * 100),
        sourceMixNonComponentNodes: Math.round((nonComponentNodes.length / allNodes.length) * 100),
        detachedComponents: detachedComponents,
        componentUsage: componentUsage,
    }
}
