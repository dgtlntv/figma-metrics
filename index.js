import { FigmaCalculator } from "figma-calculations"
import FigmaDocumentParser from "figma-calculations/dist/parser"
import FigmaAPI from "./utils/figmaApi/FigmaApi"
import createComponentMap from "./utils/figmaApi/createComponentMap"

async function main() {
    const API_TOKEN = process.env["FIGMA-API-TOKEN"]
    const FIGMA_TEAM_ID = process.env["FIGMA-TEAM-ID"]
    const FIGMA_LIBRARY_FILES = JSON.parse(process.env["FIGMA_LIBRARY_FILES"])
    const figmaApi = new FigmaAPI(API_TOKEN, FIGMA_TEAM_ID)
    const componentMap = createComponentMap(figmaApi, FIGMA_LIBRARY_FILES)
    const projects = await figmaApi.getTeamProjects()
    const projectsData = []

    for (let index = 0; index < projects; index++) {
        console.log(`Fetching files of project ${projects[index].name}`)
        const projectFiles = figmaApi.getProjectFiles(projects[index].id)

        if (projectFiles.length === 0) {
            console.log(`No files found for project ${projects[index].name}`)
            continue
        }

        const fileData = []
        for (let index = 0; index < projectFiles; index++) {
            const file = projectFiles[i]

            const allNodesInFile = []
            const allComponentNodes = {}
            const detachedComponents = {}
            const filteredComponentNodes = []

            const readyForDevNodes = []
            const allReadyForDevComponentNodes = {}
            const readyForDevDetachedComponents = {}
            const filteredReadyForDevComponentNodes = []

            try {
                await figmaApi.getFile(file.key)
            } catch (error) {
                console.log(`Failed to fetch ${file.key}.`, error)
                continue
            }

            console.log(`Processing file of ${i + 1} of ${projectFiles.length}`)

            for (const page of figmaCalculator.getAllPages()) {
                const allNodes = FigmaDocumentParser.FindAll(page)
                const { nonHiddenNodes } = FigmaCalculator.filterHiddenNodes(allNodes)
                allNodesInFile.push(...nonHiddenNodes)
            }

            allNodesInFile.forEach((node) => {
                if (node.type === "INSTANCE") {
                    // TODO
                    // Check if the instances maincomponent is from the libraries defined above otherwise disregard
                    // Take note of which component it is (id, name, add to counter)
                    // Take note of which library the component comes from (add to library counter)
                    allComponentNodes[node.id] = { layers: [], name: node.name }
                    const subNodes = FigmaDocumentParser.FindAll(node, () => true)
                    subNodes.forEach((n) => allComponentNodes[node.id].layers.push(n.id))
                }
                if (node.type === "FRAME" && node.name.startsWith("TRACKING PIXEL")) {
                    const componentName = node.name.split("- ")[1]
                    detachedComponents[componentName] += 1
                }
                if ((node.type === "FRAME" || node.type === "SECTION") && node.devStatus.type === "READY_FOR_DEV") {
                    const subNodes = FigmaDocumentParser.FindAll(node, () => true)
                    readyForDevNodes.push(...subNodes)
                }
            })

            const nonComponentNodes = nodes.filter((n) => {
                for (const key in allComponentNodes) {
                    if (key === n.id || allComponentNodes[key].layers.includes(n.id)) {
                        filteredComponentNodes.push(n.id)
                        return false
                    }
                }
                return true
            })

            readyForDevNodes.forEach((node) => {
                if (node.type === "INSTANCE") {
                    // TODO
                    // Check if the instances maincomponent is from the libraries defined above otherwise disregard
                    // Take note of which component it is (id, name, add to counter)
                    // Take note of which library the component comes from (add to library counter)
                    allReadyForDevComponentNodes[node.id] = { layers: [], name: node.name }
                    const subNodes = FigmaDocumentParser.FindAll(node, () => true)
                    subNodes.forEach((n) => allReadyForDevComponentNodes[node.id].layers.push(n.id))
                }
            })

            const readyForDevNonComponentNodes = nodes.filter((n) => {
                for (const key in allReadyForDevComponentNodes) {
                    if (key === n.id || allReadyForDevComponentNodes[key].layers.includes(n.id)) {
                        filteredReadyForDevComponentNodes.push(n.id)
                        return false
                    }
                }
                return true
            })

            const wholeFileStats = {
                numTotalNodes: allNodesInFile.length,
                numComponentNodes: filteredComponentNodes.length,
                numNonComponentNodes: nonComponentNodes.length,
                sourceMixComponentNodes: Math.round((filteredComponentNodes.length / allNodesInFile.length) * 100),
                sourceMixNonComponentNodes: Math.round((nonComponentNodes.length / allNodesInFile.length) * 100),
                detachedComponents: detachedComponents,
            }

            const readyForDevStats = {
                numTotalNodes: readyForDevNodes.length,
                numComponentNodes: filteredReadyForDevComponentNodes.length,
                numNonComponentNodes: readyForDevNonComponentNodes.length,
                sourceMixComponentNodes: Math.round(
                    (filteredReadyForDevComponentNodes.length / allNodesInFile.length) * 100
                ),
                sourceMixNonComponentNodes: Math.round(
                    (readyForDevNonComponentNodes.length / allNodesInFile.length) * 100
                ),
                detachedComponents: readyForDevDetachedComponents,
            }

            fileData.push({ wholeFileStats: wholeFileStats, readyForDevStats: readyForDevStats })
        }
        projectsData.push({ projectName: projects[index].name, projectId: projects[index].id, files: fileData })
    }
}
