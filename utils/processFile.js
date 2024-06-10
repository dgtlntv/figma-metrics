import createFlatNodeArray from "./createFlatNodeArray.js"
import filterHiddenNodes from "./filterHiddenNodes.js"
import calculateStats from "./calculateStats.js"
import filterReadyForDev from "./filterReadyForDev.js"
import processNodes from "./processNodes.js"
import replaceComponentKeys from "./replaceComponentKeys.js"

export default async function processFile(figmaApi, file, componentMap) {
    console.log("Fetching file:", file.name)
    const fileDocument = await figmaApi.getFile(file.key)
    console.log("Processing file:", file.name)
    if (!fileDocument || fileDocument?.length === 0) return null

    const allNodes = createFlatNodeArray(fileDocument.document)
    const nonHiddenNodes = filterHiddenNodes(allNodes)
    replaceComponentKeys(fileDocument, nonHiddenNodes)
    const { componentNodes, totalComponentNodeCount, detachedComponents } = processNodes(nonHiddenNodes, componentMap)
    const wholeFileStats = calculateStats(nonHiddenNodes, componentNodes, totalComponentNodeCount, detachedComponents)

    const fileDataObject = {
        fileId: file.key,
        fileName: fileDocument.name,
        wholeFileStats,
    }

    const readyForDevNodes = filterReadyForDev(nonHiddenNodes)
    if (readyForDevNodes.length > 0) {
        const {
            componentNodes: readyForDevComponentNodes,
            totalComponentNodeCount: readyForDevTotalComponentNodeCount,
            detachedComponents: readyForDevDetachedComponents,
        } = processNodes(readyForDevNodes, componentMap)
        const readyForDevStats = calculateStats(
            readyForDevNodes,
            readyForDevComponentNodes,
            readyForDevTotalComponentNodeCount,
            readyForDevDetachedComponents
        )
        fileDataObject.readyForDevStats = readyForDevStats
    }

    return fileDataObject
}
