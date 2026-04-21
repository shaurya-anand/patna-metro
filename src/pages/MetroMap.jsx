import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { STATIONS, LINES } from '../data/stations'
import { useLang } from '../context/LanguageContext'

// Layout:
//  Red Line  ───────────────────────────────────── (horizontal, y=95)
//                          │Patna Jn          │Khemnichak (diagonal connector)
//                        Akashvani            │
//                        Gandhi Maidan        │
//                           ...               │
//                        Malahi Pakri         │
//                        Khemnichak ──────────┘
//                        (bend)
//                        Bhootnath — Zero Mile — New ISBT  (horizontal, going left)

const SVG_W = 900
const SVG_H = 430
const PAD_X = 35
const L1Y = 95          // Red Line y
const L2_BEND_Y = 330   // Blue Line bend y (at Khemnichak)
const POST_KH_STEP = 74 // px between stations after the bend

function getPositions() {
  const line1 = STATIONS.filter(s => s.line === 'LINE1').sort((a, b) => a.sequence - b.sequence)
  const line2 = STATIONS.filter(s => s.line === 'LINE2').sort((a, b) => a.sequence - b.sequence)
  const positions = {}

  // Red Line: evenly spaced horizontal
  line1.forEach((s, i) => {
    positions[s.id] = {
      x: PAD_X + (i / (line1.length - 1)) * (SVG_W - 2 * PAD_X),
      y: L1Y,
    }
  })

  const pjRed  = line1.find(s => s.name === 'Patna Junction')
  const pjX    = positions[pjRed.id].x
  const pjBlue = line2.find(s => s.name === 'Patna Junction')
  const khBlue = line2.find(s => s.name === 'Khemnichak')

  // Blue Line: vertical from PJ down to Khemnichak, then horizontal going left
  line2.forEach(s => {
    if (s.sequence <= khBlue.sequence) {
      const t = (s.sequence - pjBlue.sequence) / (khBlue.sequence - pjBlue.sequence)
      positions[s.id] = { x: pjX, y: L1Y + t * (L2_BEND_Y - L1Y) }
    } else {
      const steps = s.sequence - khBlue.sequence
      positions[s.id] = { x: pjX - steps * POST_KH_STEP, y: L2_BEND_Y }
    }
  })

  return positions
}

const POSITIONS = getPositions()

function trunc(name, n) {
  return name.length > n ? name.slice(0, n - 1) + '…' : name
}

export default function MetroMap() {
  const { lang } = useLang()
  const [selected, setSelected] = useState(null)

  const line1 = STATIONS.filter(s => s.line === 'LINE1').sort((a, b) => a.sequence - b.sequence)
  const line2 = STATIONS.filter(s => s.line === 'LINE2').sort((a, b) => a.sequence - b.sequence)
  const sel   = selected ? STATIONS.find(s => s.id === selected) : null

  const T = {
    en: { title: 'Metro Map', tap: 'Tap any station for details', interchange: 'Interchange', operational: 'Open', construction: 'Under Construction' },
    hi: { title: 'मेट्रो नक्शा', tap: 'जानकारी के लिए स्टेशन दबाएं', interchange: 'इंटरचेंज', operational: 'चालू', construction: 'निर्माणाधीन' },
  }
  const t = T[lang]
  const sName = s => lang === 'hi' ? s.nameHi : s.name

  // Khemnichak positions for diagonal interchange connector
  const khRed  = line1.find(s => s.name === 'Khemnichak')
  const khBlue = line2.find(s => s.name === 'Khemnichak')

  // Deduplicate: don't render Blue Patna Junction (same pixel as Red PJ)
  const renderStations = STATIONS.filter(s => {
    if (s.name === 'Patna Junction' && s.line === 'LINE2') return false
    return true
  })

  return (
    <>
    <Helmet>
      <title>Patna Metro Map — Red Line & Blue Line Stations</title>
      <meta name="description" content="Interactive Patna Metro map showing all stations on Red Line (Corridor 1) and Blue Line (Corridor 2). See interchanges, operational stations and the full network." />
      <link rel="canonical" href="https://patna-metro.com/map" />
    </Helmet>
    <div className="px-4 py-5">
      <h1 className="text-lg font-bold text-slate-800 mb-1">{t.title}</h1>
      <p className="text-slate-500 text-xs mb-3">{t.tap}</p>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4">
        {Object.values(LINES).map(line => (
          <div key={line.id} className="flex items-center gap-1.5 text-xs">
            <div className="w-5 h-1.5 rounded-full" style={{ background: line.color }} />
            <span className="text-slate-600">{lang === 'hi' ? line.nameHi : line.name}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-slate-600">{t.operational}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-3 h-3 rounded-full border-2 border-amber-400" />
          <span className="text-slate-600">{t.interchange}</span>
        </div>
      </div>

      {/* SVG Map */}
      <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-x-auto">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full min-w-[560px]" style={{ height: 'auto' }}>

          {/* Khemnichak interchange connector — diagonal */}
          {khRed && khBlue && (
            <line
              x1={POSITIONS[khRed.id].x}  y1={POSITIONS[khRed.id].y}
              x2={POSITIONS[khBlue.id].x} y2={POSITIONS[khBlue.id].y}
              stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5,3"
            />
          )}

          {/* Red Line track */}
          {line1.slice(0, -1).map((s, i) => {
            const a = POSITIONS[s.id], b = POSITIONS[line1[i + 1].id]
            return (
              <line key={s.id}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={LINES.LINE1.color} strokeWidth="4" strokeLinecap="round"
              />
            )
          })}

          {/* Blue Line track — vertical then horizontal */}
          {line2.slice(0, -1).map((s, i) => {
            const a = POSITIONS[s.id], b = POSITIONS[line2[i + 1].id]
            const isOp = s.operational && line2[i + 1].operational
            return (
              <line key={s.id}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={LINES.LINE2.color} strokeWidth="4" strokeLinecap="round"
                strokeOpacity={isOp ? 1 : 0.3}
                strokeDasharray={isOp ? undefined : '6,4'}
              />
            )
          })}

          {/* Stations */}
          {renderStations.map(s => {
            const pos = POSITIONS[s.id]
            if (!pos) return null
            const isSelected = selected === s.id
            const isLine2    = s.line === 'LINE2'
            const stIdx      = (isLine2 ? line2 : line1).findIndex(x => x.id === s.id)
            const dotColor   = s.operational ? '#10b981' : LINES[s.line]?.color

            // Label placement
            let lx, ly, anchor
            if (!isLine2) {
              // Red Line: alternate two rows above
              lx = pos.x
              ly = stIdx % 2 === 0 ? L1Y - 31 : L1Y - 15
              anchor = 'middle'
            } else if (pos.y < L2_BEND_Y - 2) {
              // Blue vertical: label to the right
              lx = pos.x + 11
              ly = pos.y + 3.5
              anchor = 'start'
            } else {
              // Blue horizontal: label below
              lx = pos.x
              ly = pos.y + 16
              anchor = 'middle'
            }

            return (
              <g key={s.id} onClick={() => setSelected(selected === s.id ? null : s.id)} style={{ cursor: 'pointer' }}>
                {/* Tick for Red Line alternating labels */}
                {!isLine2 && (
                  <line
                    x1={pos.x} y1={pos.y - 7}
                    x2={pos.x} y2={stIdx % 2 === 0 ? L1Y - 27 : L1Y - 11}
                    stroke="#cbd5e1" strokeWidth="0.8"
                  />
                )}

                {/* Station dot */}
                <circle
                  cx={pos.x} cy={pos.y}
                  r={s.interchange ? 7 : 5}
                  fill={isSelected ? '#1e293b' : (s.operational ? '#10b981' : 'white')}
                  stroke={s.interchange ? '#f59e0b' : dotColor}
                  strokeWidth={s.interchange ? 2.5 : 1.8}
                  opacity={s.operational || s.interchange ? 1 : 0.6}
                />
                {s.interchange && (
                  <circle cx={pos.x} cy={pos.y} r={11}
                    fill="none" stroke="#f59e0b" strokeWidth="1.1" strokeDasharray="3,2" />
                )}

                {/* Label */}
                <text
                  x={lx} y={ly}
                  textAnchor={anchor}
                  fontSize="7.5"
                  fill={isSelected ? LINES[s.line]?.color : (s.operational ? '#065f46' : '#64748b')}
                  fontWeight={isSelected || s.operational ? '700' : '400'}
                >
                  {trunc(sName(s), 14)}
                </text>
              </g>
            )
          })}

          {/* Line name labels */}
          <text x={PAD_X} y={L1Y - 48} fontSize="9" fill={LINES.LINE1.color} fontWeight="bold">{lang === 'hi' ? LINES.LINE1.nameHi : LINES.LINE1.name}</text>
          <text x={POSITIONS[line1.find(s => s.name === 'Patna Junction').id].x + 12} y={L1Y + 50} fontSize="9" fill={LINES.LINE2.color} fontWeight="bold">{lang === 'hi' ? LINES.LINE2.nameHi : LINES.LINE2.name}</text>
        </svg>
      </div>

      {/* Station detail card */}
      {sel && (
        <div className="mt-4 bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-bold text-slate-800 text-base">{sName(sel)}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
                  style={{ background: LINES[sel.line]?.color }}>
                  {lang === 'hi' ? LINES[sel.line]?.nameHi : LINES[sel.line]?.name}
                </span>
                {sel.interchange && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{t.interchange}</span>}
                <span className={`text-xs px-2 py-0.5 rounded-full ${sel.operational ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {sel.operational ? t.operational : t.construction}
                </span>
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="text-slate-400 text-xl leading-none ml-2">×</button>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
