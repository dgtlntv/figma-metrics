// utils/processProject.js
import processFile from "./processFile.js"

export default async function processProject(figmaApi, project, componentMap, startTime, endTime) {
    const projectFiles = await figmaApi.getProjectFiles(project.id, startTime, endTime)
    if (!projectFiles || projectFiles?.length === 0) return null

    const fileData = await Promise.all(
        projectFiles.map((file, index) => {
            console.log(`Processing file ${index + 1} of ${projectFiles.length}`)
            return processFile(figmaApi, file, componentMap)()
        })
    )

    return { projectName: project.name, projectId: project.id, files: fileData.filter(Boolean) }
}
