import "dotenv/config"
import FigmaAPI from "./utils/FigmaAPI.js"
import findAll from "./utils/findAll.js"
import filterHiddenNodes from "./utils/filterHiddenNodes.js"
import calculateStats from "./utils/calculateStats.js"
import filterReadyForDev from "./utils/filterReadyForDev.js"
import processAndFilterNodes from "./utils/processAndFilterNodes.js"
import replaceComponentKeys from "./utils/replaceComponentKeys.js"

async function main() {
    const API_TOKEN = process.env["FIGMA-API-TOKEN"]
    const FIGMA_TEAM_ID = process.env["FIGMA-TEAM-ID"]
    const FIGMA_LIBRARY_FILES = process.env["FIGMA_LIBRARY_FILES"].split(",")
    const figmaApi = new FigmaAPI(API_TOKEN, FIGMA_TEAM_ID)
    const startTime = new Date("2024-06-03")
    const endTime = new Date("2024-06-05")

    // A map of all components we consider to be part of the Design System and want to track + some metadata of the component
    const componentMap = await figmaApi.getComponentMapFromFiles(FIGMA_LIBRARY_FILES)
    const projects = await figmaApi.getTeamProjects()
    const projectsData = []

    for (let index = 0; index < projects.length; index++) {
        console.log(`Fetching file id's of project ${projects[index].name}`)
        const projectFiles = await figmaApi.getProjectFiles(projects[index].id, startTime, endTime)

        if (projectFiles.length === 0) {
            console.log(`No files found for project ${projects[index].name}`)
            continue
        }

        const fileData = []
        for (let index = 0; index < projectFiles.length; index++) {
            const file = projectFiles[index]
            const allNodesInFile = []
            const allComponentNodes = {}
            const detachedComponents = {}
            const allReadyForDevComponentNodes = {}
            const readyForDevDetachedComponents = {}

            const fileDocument = await figmaApi.getFile(file.key)

            if (fileDocument.length === 0) {
                console.log(`Failed to fetch file document for ${file.name}`)
                continue
            }

            console.log(`Processing file of ${index + 1} of ${projectFiles.length}`)

            // Creating a flat array of all nodes in a file and removing any hidden nodes
            for (const page of fileDocument.document.children) {
                const allNodes = findAll(page, () => true)
                const { nonHiddenNodes } = filterHiddenNodes(allNodes)
                replaceComponentKeys(fileDocument, nonHiddenNodes)
                allNodesInFile.push(...nonHiddenNodes)
            }

            // Process the nodes of the file: check for components from our componentMap, check for detachedComponents
            const { nonComponentNodes, filteredComponentNodes } = processAndFilterNodes(
                allNodesInFile,
                allComponentNodes,
                detachedComponents,
                componentMap
            )

            const wholeFileStats = calculateStats(
                allNodesInFile,
                filteredComponentNodes,
                nonComponentNodes,
                detachedComponents
            )

            // The previous filtering was for the whole Figma file.
            // While these stats are also interesting we can not really judge someone for explorig with non design system components.
            // What is important however is the usage of design system components in the final handover.
            // Thats why we want to also create separate stats for files marked as ready for development.
            const readyForDevNodes = filterReadyForDev(allNodesInFile)
            const {
                nonComponentNodes: readyForDevNonComponentNodes,
                filteredComponentNodes: filteredReadyForDevComponentNodes,
            } = processAndFilterNodes(
                readyForDevNodes,
                allReadyForDevComponentNodes,
                readyForDevDetachedComponents,
                componentMap
            )

            const readyForDevStats = calculateStats(
                readyForDevNodes,
                filteredReadyForDevComponentNodes,
                readyForDevNonComponentNodes,
                readyForDevDetachedComponents
            )

            fileData.push({
                fileId: file.key,
                fileName: fileDocument.name,
                wholeFileStats: wholeFileStats,
                readyForDevStats: readyForDevStats,
            })
        }
        projectsData.push({ projectName: projects[index].name, projectId: projects[index].id, files: fileData })
    }
    console.log("Stats:", JSON.stringify(projectsData, null, 2))
}

await main()
