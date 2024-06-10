import * as fs from "fs"
import FigmaAPI from "./utils/FigmaAPI.js"
import processProject from "./utils/processProject.js"

async function main() {
    const API_TOKEN = process.env["FIGMA_API_TOKEN"]
    const FIGMA_TEAM_ID = process.env["FIGMA_TEAM_ID"]
    const FIGMA_LIBRARY_FILES = process.env["FIGMA_LIBRARY_FILES"].split(",")
    const currentDate = new Date()
    const endTime = currentDate
    const startTime = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000)
    const outputFolder = `./archive/${currentDate.toISOString().slice(0, 10)}`
    const outputFilePath = `${outputFolder}/figma-metrics.json`

    const figmaApi = new FigmaAPI(API_TOKEN, FIGMA_TEAM_ID)
    fs.mkdirSync(outputFolder, { recursive: true })
    const componentMap = await figmaApi.getComponentMapFromFiles(FIGMA_LIBRARY_FILES)
    const projects = await figmaApi.getTeamProjects()

    const projectsData = await Promise.all(
        projects.map((project) => {
            console.log(`Fetching file ids of project ${project.name}`)
            return processProject(figmaApi, project, componentMap, startTime, endTime)
        })
    )

    fs.writeFileSync(outputFilePath, JSON.stringify(projectsData.filter(Boolean), null, 2))
    console.log(`The Figma metrics have been saved to ${outputFilePath}!`)
}

main()
