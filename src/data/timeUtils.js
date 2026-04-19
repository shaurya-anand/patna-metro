import { STATIONS, SCHEDULE } from './stations'

function toMins(str) {
  const [h, m] = str.split(':').map(Number)
  return h * 60 + m
}

function toStr(mins) {
  const total = ((Math.round(mins) % 1440) + 1440) % 1440
  const h24 = Math.floor(total / 60)
  const m = total % 60
  const ampm = h24 < 12 ? 'AM' : 'PM'
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

// Convert a HH:MM string (24h) to 12h AM/PM
export function fmt(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  const ampm = h < 12 ? 'AM' : 'PM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

// For a station at sequence seq on a line with totalStations:
//   First train from Terminal A arrives at: firstTrain + (seq-1) * 2.5 min
//   Last  train from Terminal A arrives at: lastTrain  - (total-seq) * 2.5 min
//   (same logic reversed for Terminal B direction)
export function getStationTimes(station, day = 'weekdays') {
  const { firstTrain, lastTrain } = SCHEDULE[day]
  const lineStations = STATIONS.filter(s => s.line === station.line)
  const total = lineStations.length
  const seq = station.sequence        // 1-based, Terminal A = 1

  const firstMins = toMins(firstTrain)
  const lastMins  = toMins(lastTrain)
  const MINS_PER_STOP = 2.5

  return {
    // Towards Terminal B (higher sequence)
    towardB: {
      first: toStr(firstMins + (seq - 1) * MINS_PER_STOP),
      last:  toStr(lastMins  - (total - seq) * MINS_PER_STOP),
    },
    // Towards Terminal A (lower sequence)
    towardA: {
      first: toStr(firstMins + (total - seq) * MINS_PER_STOP),
      last:  toStr(lastMins  - (seq - 1) * MINS_PER_STOP),
    },
  }
}

// Terminal names for a line
export function getTerminals(lineId) {
  const stations = STATIONS.filter(s => s.line === lineId).sort((a, b) => a.sequence - b.sequence)
  return { terminalA: stations[0], terminalB: stations[stations.length - 1] }
}

// Given origin station + stops in route, compute departure/arrival times for first & last train
export function getJourneyTimes(originStation, stops, day = 'weekdays') {
  const stationTimes = getStationTimes(originStation, day)
  const MINS_PER_STOP = 2.5
  const travelMins = stops * MINS_PER_STOP

  // Use towardB as default direction (we don't know direction here, so show both sides' first)
  const earliest = Math.min(toMins(stationTimes.towardB.first), toMins(stationTimes.towardA.first))
  const latest   = Math.max(toMins(stationTimes.towardB.last),  toMins(stationTimes.towardA.last))

  return {
    firstDepart: toStr(earliest),
    firstArrive: toStr(earliest + travelMins),
    lastDepart:  toStr(latest),
    lastArrive:  toStr(latest + travelMins),
  }
}
