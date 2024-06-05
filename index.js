import FigmaAPI from "./utils/FigmaAPI"
import findAll from "./utils/findAll"
import filterHiddenNodes from "./utils/filterHiddenNodes"
import calculateStats from "./utils/calculateStats"
import filterReadyForDev from "./utils/filterReadyForDev"
import processAndFilterNodes from "./utils/processAndFilterNodes"

async function main() {
    const API_TOKEN = process.env["FIGMA-API-TOKEN"]
    const FIGMA_TEAM_ID = process.env["FIGMA-TEAM-ID"]
    const FIGMA_LIBRARY_FILES = JSON.parse(process.env["FIGMA_LIBRARY_FILES"])
    const figmaApi = new FigmaAPI(API_TOKEN, FIGMA_TEAM_ID)
    const componentMap = await figmaApi.getComponentMapFromFiles(FIGMA_LIBRARY_FILES)
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
            const allReadyForDevComponentNodes = {}
            const readyForDevDetachedComponents = {}

            try {
                const fileDocument = await figmaApi.getFile(file.key)
            } catch (error) {
                console.log(`Failed to fetch ${file.key}.`, error)
                continue
            }

            console.log(`Processing file of ${i + 1} of ${projectFiles.length}`)

            for (const page of fileDocument.children) {
                const allNodes = findAll(page, () => true)
                const { nonHiddenNodes } = filterHiddenNodes(allNodes)
                allNodesInFile.push(...nonHiddenNodes)
            }

            const { nonComponentNodes, filteredComponentNodes } = processAndFilterNodes(
                allNodesInFile,
                allComponentNodes,
                detachedComponents,
                componentMap
            )

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

            const wholeFileStats = calculateStats(
                allNodesInFile,
                filteredComponentNodes,
                nonComponentNodes,
                detachedComponents
            )
            const readyForDevStats = calculateStats(
                readyForDevNodes,
                filteredReadyForDevComponentNodes,
                readyForDevNonComponentNodes,
                readyForDevDetachedComponents
            )

            fileData.push({ wholeFileStats: wholeFileStats, readyForDevStats: readyForDevStats })
        }
        projectsData.push({ projectName: projects[index].name, projectId: projects[index].id, files: fileData })
    }
}

await main()
