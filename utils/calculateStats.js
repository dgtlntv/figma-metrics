export default function calculateStats(allNodes, componentNodes, detachedComponents) {
    const componentUsage = {}
    let numComponentNodes = 0

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

        // Count the number of layers within each component instance
        numComponentNodes += node.layers.length
    })

    // Add the number of component instances to the total count
    numComponentNodes += Object.keys(componentNodes).length
    const nonComponentNodes = allNodes.length - numComponentNodes

    return {
        numTotalNodes: allNodes.length,
        numComponentNodes: numComponentNodes,
        numNonComponentNodes: nonComponentNodes,
        sourceMixComponentNodes: Math.round((numComponentNodes / allNodes.length) * 100),
        sourceMixNonComponentNodes: Math.round((nonComponentNodes / allNodes.length) * 100),
        detachedComponents: detachedComponents,
        componentUsage: componentUsage,
    }
}
