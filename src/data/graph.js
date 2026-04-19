import { STATIONS } from './stations'

// Build adjacency list for BFS pathfinding
// Edges connect consecutive stations on same line + interchange stations
function buildGraph() {
  const graph = {}

  STATIONS.forEach(s => { graph[s.id] = [] })

  // Same-line edges
  const byLine = {}
  STATIONS.forEach(s => {
    if (!byLine[s.line]) byLine[s.line] = []
    byLine[s.line].push(s)
  })

  Object.values(byLine).forEach(lineStations => {
    const sorted = [...lineStations].sort((a, b) => a.sequence - b.sequence)
    for (let i = 0; i < sorted.length - 1; i++) {
      const a = sorted[i], b = sorted[i + 1]
      graph[a.id].push({ to: b.id, line: a.line, interchange: false })
      graph[b.id].push({ to: a.id, line: a.line, interchange: false })
    }
  })

  // Interchange edges — stations sharing the same name across lines
  const byName = {}
  STATIONS.forEach(s => {
    if (!byName[s.name]) byName[s.name] = []
    byName[s.name].push(s)
  })

  Object.values(byName).forEach(group => {
    if (group.length > 1) {
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          graph[group[i].id].push({ to: group[j].id, line: 'INTERCHANGE', interchange: true })
          graph[group[j].id].push({ to: group[i].id, line: 'INTERCHANGE', interchange: true })
        }
      }
    }
  })

  return graph
}

export const GRAPH = buildGraph()

// All IDs that share the same station name (covers interchange twins)
const nameToIds = {}
STATIONS.forEach(s => {
  if (!nameToIds[s.name]) nameToIds[s.name] = []
  nameToIds[s.name].push(s.id)
})
export function siblingIds(stationId) {
  const name = STATIONS.find(s => s.id === stationId)?.name
  return name ? nameToIds[name] : [stationId]
}

// BFS — accepts single IDs; treats all same-name nodes as valid targets
// so arriving at any physical platform of an interchange counts as "reached"
export function findRoute(fromId, toId) {
  const targets = new Set(siblingIds(toId))
  const origins = new Set(siblingIds(fromId))

  if (targets.has(fromId) || origins.has(toId)) return { path: [fromId], segments: [] }

  const queue = [{ id: fromId, path: [fromId], segments: [] }]
  const visited = new Set([...origins])

  while (queue.length) {
    const { id, path, segments } = queue.shift()
    for (const edge of GRAPH[id] || []) {
      if (visited.has(edge.to)) continue
      visited.add(edge.to)
      const newPath = [...path, edge.to]
      const newSegments = [...segments, { from: id, to: edge.to, line: edge.line, interchange: edge.interchange }]
      if (targets.has(edge.to)) {
        // Replace last node with the canonical toId so display is consistent
        newPath[newPath.length - 1] = toId
        return { path: newPath, segments: newSegments }
      }
      queue.push({ id: edge.to, path: newPath, segments: newSegments })
    }
  }

  return null
}
