export default function calculateStats(allNodes, componentNodes, totalComponentNodeCount, detachedComponents) {
    const componentUsage = {}

    Object.values(componentNodes).forEach((node) => {
        const componentName = node.componentName
        const libraryName = node.libraryName
        const componentKey = node.componentSetKey || node.componentId

        if (!componentUsage[componentKey]) {
            componentUsage[componentKey] = {
                componentName: componentName,
                libraryName: libraryName,
                count: 0,
            }
        }
        componentUsage[componentKey].count++
    })

    return {
        numTotalNodes: allNodes.length,
        numComponentNodes: totalComponentNodeCount,
        numNonComponentNodes: allNodes.length - totalComponentNodeCount,
        sourceMixComponentNodes: Math.round((totalComponentNodeCount / allNodes.length) * 100),
        sourceMixNonComponentNodes: Math.round((allNodes.length - totalComponentNodeCount / allNodes.length) * 100),
        detachedComponents: detachedComponents,
        componentUsage: componentUsage,
    }
}
