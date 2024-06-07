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

    const nonComponentNodes = allNodes.length - totalComponentNodeCount

    return {
        numTotalNodes: allNodes.length,
        numComponentNodes: totalComponentNodeCount,
        numNonComponentNodes: nonComponentNodes,
        sourceMixComponentNodes: Math.round((totalComponentNodeCount / allNodes.length) * 100),
        sourceMixNonComponentNodes: Math.round((nonComponentNodes / allNodes.length) * 100),
        detachedComponents: detachedComponents,
        componentUsage: componentUsage,
    }
}
