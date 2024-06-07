import "dotenv/config"
import * as fs from "fs"
import FigmaAPI from "./utils/FigmaAPI.js"
import findAll from "./utils/findAll.js"
import filterHiddenNodes from "./utils/filterHiddenNodes.js"
import calculateStats from "./utils/calculateStats.js"
import filterReadyForDev from "./utils/filterReadyForDev.js"
import processNodes from "./utils/processNodes.js"
import replaceComponentKeys from "./utils/replaceComponentKeys.js"

async function main() {
    const API_TOKEN = process.env["FIGMA-API-TOKEN"]
    const FIGMA_TEAM_ID = process.env["FIGMA-TEAM-ID"]
    const FIGMA_LIBRARY_FILES = process.env["FIGMA_LIBRARY_FILES"].split(",")
    const figmaApi = new FigmaAPI(API_TOKEN, FIGMA_TEAM_ID)
    const startTime = new Date("2024-05-07")
    const endTime = new Date("2024-06-07")
    const currentDate = new Date().toISOString().slice(0, 10)
    const outputFolder = `./archive/${currentDate}`
    const outputFilePath = `${outputFolder}/figma-metrics.json`

    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder, { recursive: true })
    }

    // A map of all components we consider to be part of the Design System and want to track + some metadata of the component
    const componentMap = await figmaApi.getComponentMapFromFiles(FIGMA_LIBRARY_FILES)
    const projects = await figmaApi.getTeamProjects()
    const projectsData = []

    for (let index = 0; index < projects.length; index++) {
        console.log(`Fetching file id's of project ${projects[index].name}`)
        const projectFiles = await figmaApi.getProjectFiles(projects[index].id, startTime, endTime)

        if (!projectFiles || projectFiles?.length === 0) {
            console.log(`No files found for project ${projects[index].name}`)
            continue
        }

        const fileData = []
        for (let index = 0; index < projectFiles.length; index++) {
            const file = projectFiles[index]

            const fileDocument = await figmaApi.getFile(file.key)

            if (!fileDocument || fileDocument?.length === 0) {
                console.log(`Failed to fetch file document for ${file.name}`)
                continue
            }

            console.log(`Processing file of ${index + 1} of ${projectFiles.length}`)

            const allNodes = findAll(fileDocument.document, () => true)
            const nonHiddenNodes = filterHiddenNodes(allNodes)
            replaceComponentKeys(fileDocument, nonHiddenNodes)

            // Process the nodes of the file: check for components from our componentMap, check for detachedComponents
            const { componentNodes, totalComponentNodeCount, detachedComponents } = processNodes(
                nonHiddenNodes,
                componentMap
            )

            const wholeFileStats = calculateStats(
                nonHiddenNodes,
                componentNodes,
                totalComponentNodeCount,
                detachedComponents
            )

            // The previous filtering was for the whole Figma file.
            // While these stats are also interesting we can not really judge someone for explorig with non design system components.
            // What is important however is the usage of design system components in the final handover.
            // Thats why we want to also create separate stats for files marked as ready for development.
            const readyForDevNodes = filterReadyForDev(nonHiddenNodes)

            const fileDataObject = {
                fileId: file.key,
                fileName: fileDocument.name,
                wholeFileStats: wholeFileStats,
            }

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
                fileDataObject["readyForDevStats"] = readyForDevStats
            }

            fileData.push(fileDataObject)
        }
        projectsData.push({ projectName: projects[index].name, projectId: projects[index].id, files: fileData })
    }

    fs.writeFile(outputFilePath, JSON.stringify(projectsData, null, 2), (err) => {
        if (err) throw err
        console.log(`The Figma metrics have been saved to ${outputFilePath}!`)
    })
}

await main()
