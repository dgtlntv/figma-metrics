import processComponents from "./processComponents.js"

export default class FigmaAPI {
    constructor(apiToken, teamId) {
        this.teamId = teamId
        this.apiToken = apiToken
        this.baseURL = "https://api.figma.com/v1"
        this.requestQueue = []
        this.processing = false
        this.throttleDelay = 500
    }

    async fetchFromFigma(urlSubDirectory, type) {
        return new Promise((resolve) => {
            this.requestQueue.push({ urlSubDirectory, type, resolve })
            this.processQueue()
        })
    }

    async processQueue() {
        if (this.processing || this.requestQueue.length === 0) {
            return
        }

        this.processing = true
        const { urlSubDirectory, type, resolve } = this.requestQueue.shift()

        if (!urlSubDirectory || !type) {
            console.log("No urlSubDirectory or type provided.")
            resolve()
            return
        }

        let fullUrl = ""
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
                resolve()
                return
        }

        try {
            const response = await fetch(fullUrl, {
                headers: {
                    "X-FIGMA-TOKEN": this.apiToken,
                },
            })

            if (response.ok) {
                const data = await response.json()
                resolve(data)
            } else {
                const errorMessage = await response.text()
                console.log("Error fetching data:", response.status, response.statusText)
                console.log("Error message from API:", errorMessage)
                resolve()
            }
        } catch (error) {
            console.log("Error fetching data:", error)
            reject()
        }

        setTimeout(() => {
            this.processing = false
            this.processQueue()
        }, this.throttleDelay)
    }

    async getComponentMapFromFiles(fileKeys) {
        console.log("Fetching the component map for:", fileKeys)
        let componentMap = {}
        for (const fileId of fileKeys) {
            const file = await this.fetchFromFigma(`${fileId}`, "files")
            const components = await this.fetchFromFigma(`${fileId}/components`, "files")
            const componentSets = await this.fetchFromFigma(`${fileId}/component_sets`, "files")
            console.log("Processing library file:", file.name)
            if (components.meta.components) {
                processComponents(
                    components.meta.components,
                    componentSets?.meta?.component_sets,
                    componentMap,
                    file,
                    fileId
                )
            }
        }
        console.log("Created component map.")
        return componentMap
    }

    async getTeamProjects() {
        console.log("Fetching team projects")
        let projects = []
        const data = await this.fetchFromFigma("projects", "teams")
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
        return await this.fetchFromFigma(`${fileId}`, "files")
    }
}
