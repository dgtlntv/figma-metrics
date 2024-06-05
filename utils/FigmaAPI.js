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
                console.log("Error fetching data:", response.status, response.statusText)
                return
            }
        } catch (error) {
            console.log("Error fetching data:", error)
            return
        }
    }

    async getComponentMapFromFiles(fileKeys) {
        let componentMap = {}

        for (const fileId of fileKeys) {
            const data = await this.fetchFromFigma(`${fileId}`, "files")

            const processEntities = (entities) => {
                for (const entity of entities) {
                    const getReadableName = () => {
                        if (entity.name.includes("=")) {
                            return entity.containing_frame.name
                        }
                        return entity.name
                    }

                    componentMap[entity.key] = {
                        componentName: getReadableName(),
                        libraryName: data.name,
                        libraryId: fileId,
                    }
                }
            }

            if (data.components) {
                processEntities(data.components)
            }

            if (data.componentSets) {
                processEntities(data.componentSets)
            }
        }

        return componentMap
    }

    async getTeamProjects() {
        let projects = []
        const data = await this.fetchFromFigma(`projects`, "teams")

        if (data.projects) {
            projects = projects.concat(data.projects)
        }

        return projects
    }

    async getProjectFiles(projectId) {
        let files = []
        const data = await this.fetchFromFigma(`${projectId}/files`, "projects")

        if (data.files) {
            files = files.concat(data.files)
        }

        return files
    }

    async getFile(fileId) {
        return await this.fetchFromFigma(`${fileId}`, "files")
    }
}
