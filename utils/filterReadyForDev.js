export default function filterReadyForDev(nodes) {
    return nodes.filter(
        (node) => (node.type === "FRAME" || node.type === "SECTION") && node.devStatus.type === "READY_FOR_DEV"
    )
}
