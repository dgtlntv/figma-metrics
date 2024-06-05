export default async function createComponentMap(figmaApi, fileKeys) {
    const components = await figmaApi.getComponentsFromFile(fileKeys)
    const componentSets = await figmaApi.getComponentSetsFromFile(fileKeys)
    components.concat(componentSets)

    const componentMap = {}
    for (const comp of components) {
        const getComponentReadableName = () => {
            if (comp.name.includes("=")) {
                return comp.containing_frame.name
            }
            return comp.name
        }
        componentMap[comp.key] = { name: getComponentReadableName() }
    }
    return componentMap
}
