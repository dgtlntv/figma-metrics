import * as fs from "fs"

function transformData(data) {
    const sheet1Data = [
        [
            "Project",
            "File",
            "Non component nodes (whole file)",
            "Component nodes (whole file)",
            "% Component nodes (whole file)",
            "Non component nodes (ready for dev)",
            "Component nodes (ready for dev)",
            "% Component nodes (ready for dev)",
        ],
    ]

    const sheet2Data = [
        [
            "Project",
            "File",
            "% Design System Library",
            "% 🔶 app-layout components",
            "% 🔴 [EDGE] Vanilla - Core component library",
            "N° Design System Library",
            "N° 🔶 app-layout components",
            "N° 🔴 [EDGE] Vanilla - Core component library",
        ],
    ]

    const sheet3Data = [["Component", "Library", "Count"]]

    data.forEach((project) => {
        const { projectName, files } = project

        files.forEach((file) => {
            const { fileName, wholeFileStats, readyForDevStats } = file
            const {
                numTotalNodes: wholeFileTotal,
                numNonComponentNodes: wholeFileNonComponentNodes,
                numComponentNodes: wholeFileComponentNodes,
                sourceMixComponentNodes: wholeFilePercentage,
                detachedComponents,
            } = wholeFileStats

            let readyForDevNonComponentNodes = "n/a"
            let readyForDevComponentNodes = "n/a"
            let readyForDevTotal = "n/a"
            let readyForDevPercentage = "n/a"

            if (readyForDevStats) {
                readyForDevNonComponentNodes = readyForDevStats.numNonComponentNodes
                readyForDevComponentNodes = readyForDevStats.numComponentNodes
                readyForDevTotal = readyForDevStats.numTotalNodes
                readyForDevPercentage = readyForDevStats.sourceMixComponentNodes
            }

            sheet1Data.push([
                projectName,
                fileName,
                wholeFileNonComponentNodes,
                wholeFileComponentNodes,
                `${wholeFilePercentage}%`,
                readyForDevNonComponentNodes,
                readyForDevComponentNodes,
                readyForDevPercentage,
            ])

            const componentUsage = wholeFileStats.componentUsage
            const totalComponents = Object.values(componentUsage).reduce((sum, component) => sum + component.count, 0)
            const designSystemLibraryComponents = Object.values(componentUsage)
                .filter((component) => component.libraryName === "Design System Library")
                .reduce((sum, component) => sum + component.count, 0)
            const appLayoutComponents = Object.values(componentUsage)
                .filter((component) => component.libraryName === "🔶 app-layout components")
                .reduce((sum, component) => sum + component.count, 0)
            const edgeVanillaComponents = Object.values(componentUsage)
                .filter((component) => component.libraryName === "🔴 [EDGE] Vanilla - Core component library")
                .reduce((sum, component) => sum + component.count, 0)

            sheet2Data.push([
                projectName,
                fileName,
                totalComponents > 0 ? `${Math.round((designSystemLibraryComponents / totalComponents) * 100)}%` : "0%",
                totalComponents > 0 ? `${Math.round((appLayoutComponents / totalComponents) * 100)}%` : "0%",
                totalComponents > 0 ? `${Math.round((edgeVanillaComponents / totalComponents) * 100)}%` : "0%",
                designSystemLibraryComponents,
                appLayoutComponents,
                edgeVanillaComponents,
            ])

            Object.entries(detachedComponents).forEach(([libraryName, components]) => {
                Object.entries(components).forEach(([componentName, count]) => {
                    sheet3Data.push([componentName, libraryName, count])
                })
            })
        })
    })

    return [sheet1Data, sheet2Data, sheet3Data]
}

const latestMetricsFile = process.argv[2]
var jsonData = JSON.parse(fs.readFileSync(latestMetricsFile, "utf8"))

const transformedData = transformData(jsonData)
process.stdout.write(JSON.stringify(transformedData))
