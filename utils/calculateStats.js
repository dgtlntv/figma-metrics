export default function calculateStats(allNodes, componentNodes, nonComponentNodes, detachedComponents) {
    return {
        numTotalNodes: allNodes.length,
        numComponentNodes: componentNodes.length,
        numNonComponentNodes: nonComponentNodes.length,
        sourceMixComponentNodes: Math.round((componentNodes.length / allNodes.length) * 100),
        sourceMixNonComponentNodes: Math.round((nonComponentNodes.length / allNodes.length) * 100),
        detachedComponents: detachedComponents,
    }
}
