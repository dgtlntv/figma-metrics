export default class FigmaAPI {
    constructor(apiToken, teamId) {
        this.teamId = teamId
        this.apiToken = apiToken
        this.baseURL = "https://api.figma.com/v1"
    }

    async fetchFromFigma(urlSubDirectory, type) {
        if (!urlSubDirectory || !type) {
            console.log("No urlSubDirectory or type provided.")
            return
        }

        var fullUrl = ""
        switch (type) {
            case "teams":
                fullUrl = `${this.baseURL}/teams/${this.teamId}/${urlSubDirectory}`
                break
            case "files":
                fullUrl = `${this.baseURL}/files/${urlSubDirectory}`
                break
            case "projects":
                fullUrl = `${this.baseURL}/projects/${urlSubDirectory}`
                break
            default:
                console.log("Invalid type provided.")
                return
        }

        try {
            const response = await fetch(fullUrl, {
                headers: {
                    "X-FIGMA-TOKEN": this.apiToken,
                },
            })

            if (response.ok) {
                return await response.json()
            } else {
                const errorMessage = await response.text()
                console.log("Error fetching data:", response.status, response.statusText)
                console.log("Error message from API:", errorMessage)
                return
            }
        } catch (error) {
            console.log("Error fetching data:", error)
            return
        }
    }

    async getComponentMapFromFiles(fileKeys) {
        console.log("Fetching the component map for:", fileKeys)
        let componentMap = {}

        for (const fileId of fileKeys) {
            const file = await this.fetchFromFigma(`${fileId}`, "files")
            const components = await this.fetchFromFigma(`${fileId}/components`, "files")
            const componentSets = await this.fetchFromFigma(`${fileId}/component_sets`, "files")
            console.log("Processing library file:", file.name)

            const processEntities = (entities, componentSetMap) => {
                for (const entity of entities) {
                    const getReadableName = () => {
                        if (entity.name.includes("=")) {
                            return entity.containing_frame.name
                        }
                        return entity.name
                    }

                    const componentSetKey = componentSetMap[entity.containing_frame.nodeId]

                    componentMap[entity.key] = {
                        componentName: getReadableName(),
                        componentId: entity.key,
                        libraryName: file.name,
                        libraryId: fileId,
                        ...(componentSetKey && { componentSetKey }),
                    }
                }
            }

            const componentSetMap = {}
            if (componentSets.meta.component_sets) {
                for (const componentSet of componentSets.meta.component_sets) {
                    componentSetMap[componentSet.node_id] = componentSet.key
                }
            }

            if (components.meta.components) {
                processEntities(components.meta.components, componentSetMap)
            }
        }

        console.log("Created component map.")
        return componentMap
    }

    async getTeamProjects() {
        console.log("Fetching team projects")
        let projects = []
        const data = await this.fetchFromFigma(`projects`, "teams")

        if (data.projects) {
            projects = projects.concat(data.projects)
        }
        console.log("Finished fetching team projects")
        return projects
    }

    async getProjectFiles(projectId, startTime = null, endTime = null) {
        console.log("Fetching files for project:", projectId)
        let files = []
        const data = await this.fetchFromFigma(`${projectId}/files`, "projects")

        if (data.files) {
            files = data.files.filter((file) => {
                const lastModified = new Date(file.last_modified)

                if (startTime && lastModified < startTime) {
                    return false
                }

                if (endTime && lastModified > endTime) {
                    return false
                }

                return true
            })
        }
        return files
    }

    async getFile(fileId) {
        console.log("Fetching file:", fileId)
        return await this.fetchFromFigma(`${fileId}`, "files")
    }
}
