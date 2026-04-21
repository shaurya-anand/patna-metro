import { useState, useRef, useEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { STATIONS, LINES, STATION_FACILITIES } from '../data/stations'
import { getStationTimes, getTerminals } from '../data/timeUtils'
import { useLang } from '../context/LanguageContext'

const SVG_W = 900
const SVG_H = 430
const PAD_X = 35
const L1Y = 95
const L2_BEND_Y = 330
const POST_KH_STEP = 74

function getPositions() {
  const line1 = STATIONS.filter(s => s.line === 'LINE1').sort((a, b) => a.sequence - b.sequence)
  const line2 = STATIONS.filter(s => s.line === 'LINE2').sort((a, b) => a.sequence - b.sequence)
  const positions = {}

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

const MIN_SCALE = 1
const MAX_SCALE = 5

function clamp(val, min, max) { return Math.min(Math.max(val, min), max) }

// Zoom by adjusting viewBox — SVG re-renders as crisp vectors at every level
const INITIAL_VIEW = { x: 0, y: 0, w: SVG_W, h: SVG_H }

export default function MetroMap() {
  const { lang } = useLang()
  const [selected, setSelected] = useState(null)
  const [view, setView] = useState(INITIAL_VIEW)

  const containerRef = useRef(null)
  const viewRef = useRef(INITIAL_VIEW)   // always-fresh copy for event handlers
  const touch   = useRef({ lastDist: null, lastPos: null, lastMid: null })
  const drag    = useRef({ active: false, lastPos: null })

  const dist = (t1, t2) => Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
  const mid  = (t1, t2) => ({ x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 })

  const update = useCallback((updater) => {
    setView(prev => {
      const next = updater(prev)
      viewRef.current = next
      return next
    })
  }, [])

  const reset = useCallback(() => {
    setView(INITIAL_VIEW)
    viewRef.current = INITIAL_VIEW
  }, [])

  // Convert element-space point (px from top-left of el) → SVG coordinate
  const elToSvg = (ex, ey, v, rect) => ({
    sx: v.x + ex * (v.w / rect.width),
    sy: v.y + ey * (v.h / rect.height),
  })

  // Zoom toward a specific SVG point
  const zoomToward = useCallback((svgX, svgY, elX, elY, rect, factor) => {
    update(v => {
      const curScale = SVG_W / v.w
      const newScale = clamp(curScale * factor, MIN_SCALE, MAX_SCALE)
      const newW = SVG_W / newScale
      const newH = SVG_H / newScale
      // Keep the SVG point (svgX, svgY) under screen point (elX, elY)
      let nx = svgX - elX * (newW / rect.width)
      let ny = svgY - elY * (newH / rect.height)
      nx = clamp(nx, 0, SVG_W - newW)
      ny = clamp(ny, 0, SVG_H - newH)
      return { x: nx, y: ny, w: newW, h: newH }
    })
  }, [update])

  // Native touch/wheel listeners (passive:false needed for preventDefault)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    function onTouchStart(e) {
      if (e.touches.length === 2) {
        touch.current.lastDist = dist(e.touches[0], e.touches[1])
        touch.current.lastMid  = mid(e.touches[0], e.touches[1])
        touch.current.lastPos  = null
      } else if (e.touches.length === 1) {
        touch.current.lastPos  = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        touch.current.lastDist = null
        touch.current.lastMid  = null
      }
    }

    function onTouchMove(e) {
      e.preventDefault()
      const rect = el.getBoundingClientRect()

      if (e.touches.length === 2) {
        const d = dist(e.touches[0], e.touches[1])
        const m = mid(e.touches[0], e.touches[1])

        if (touch.current.lastDist && touch.current.lastMid) {
          const factor = d / touch.current.lastDist
          const v = viewRef.current
          const elX = touch.current.lastMid.x - rect.left
          const elY = touch.current.lastMid.y - rect.top
          const { sx, sy } = elToSvg(elX, elY, v, rect)
          zoomToward(sx, sy, elX, elY, rect, factor)
        }
        touch.current.lastDist = d
        touch.current.lastMid  = m

      } else if (e.touches.length === 1 && touch.current.lastPos) {
        const dx = e.touches[0].clientX - touch.current.lastPos.x
        const dy = e.touches[0].clientY - touch.current.lastPos.y
        update(v => ({
          ...v,
          x: clamp(v.x - dx * (v.w / rect.width),  0, SVG_W - v.w),
          y: clamp(v.y - dy * (v.h / rect.height), 0, SVG_H - v.h),
        }))
        touch.current.lastPos = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      }
    }

    function onTouchEnd(e) {
      if (e.touches.length < 2) touch.current.lastDist = null
      if (e.touches.length === 0) {
        touch.current.lastPos = null
        if (viewRef.current.w > SVG_W * 0.97) reset()
      }
    }

    function onWheel(e) {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const factor = e.deltaY < 0 ? 1.15 : 0.87
      const elX = e.clientX - rect.left
      const elY = e.clientY - rect.top
      const { sx, sy } = elToSvg(elX, elY, viewRef.current, rect)
      zoomToward(sx, sy, elX, elY, rect, factor)
    }

    const opts = { passive: false }
    el.addEventListener('touchstart',  onTouchStart, opts)
    el.addEventListener('touchmove',   onTouchMove,  opts)
    el.addEventListener('touchend',    onTouchEnd,   opts)
    el.addEventListener('wheel',       onWheel,      opts)
    return () => {
      el.removeEventListener('touchstart',  onTouchStart, opts)
      el.removeEventListener('touchmove',   onTouchMove,  opts)
      el.removeEventListener('touchend',    onTouchEnd,   opts)
      el.removeEventListener('wheel',       onWheel,      opts)
    }
  }, [update, reset, zoomToward])

  // Mouse drag (desktop)
  function onMouseDown(e) { drag.current = { active: true, lastPos: { x: e.clientX, y: e.clientY } } }
  function onMouseMove(e) {
    if (!drag.current.active) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const dx = e.clientX - drag.current.lastPos.x
    const dy = e.clientY - drag.current.lastPos.y
    update(v => ({
      ...v,
      x: clamp(v.x - dx * (v.w / rect.width),  0, SVG_W - v.w),
      y: clamp(v.y - dy * (v.h / rect.height), 0, SVG_H - v.h),
    }))
    drag.current.lastPos = { x: e.clientX, y: e.clientY }
  }
  function onMouseUp() { drag.current.active = false }

  const line1 = STATIONS.filter(s => s.line === 'LINE1').sort((a, b) => a.sequence - b.sequence)
  const line2 = STATIONS.filter(s => s.line === 'LINE2').sort((a, b) => a.sequence - b.sequence)
  const sel   = selected ? STATIONS.find(s => s.id === selected) : null

  const T = {
    en: { title: 'Metro Map', tap: 'Pinch to zoom · tap station for details', interchange: 'Interchange', operational: 'Open', construction: 'Under Construction', reset: 'Reset',
          timings: 'Train Timings (Weekdays)', first: 'First', last: 'Last', facilities: 'Facilities' },
    hi: { title: 'मेट्रो नक्शा', tap: 'ज़ूम करें · स्टेशन दबाएं', interchange: 'इंटरचेंज', operational: 'चालू', construction: 'निर्माणाधीन', reset: 'रीसेट',
          timings: 'ट्रेन समय (सोम–शुक्र)', first: 'पहली', last: 'आखिरी', facilities: 'सुविधाएं' },
  }
  const t = T[lang]
  const sName = s => lang === 'hi' ? s.nameHi : s.name

  const khRed  = line1.find(s => s.name === 'Khemnichak')
  const khBlue = line2.find(s => s.name === 'Khemnichak')

  const renderStations = STATIONS.filter(s => !(s.name === 'Patna Junction' && s.line === 'LINE2'))

  const isZoomed = view.w < SVG_W - 1

  return (
    <>
    <Helmet>
      <title>Patna Metro Map — Red Line & Blue Line Stations</title>
      <meta name="description" content="Interactive Patna Metro map showing all stations on Red Line (Corridor 1) and Blue Line (Corridor 2). See interchanges, operational stations and the full network." />
      <link rel="canonical" href="https://patna-metro.com/map" />
      <link rel="alternate" hreflang="en-IN" href="https://patna-metro.com/map" />
      <link rel="alternate" hreflang="hi" href="https://patna-metro.com/map" />
      <link rel="alternate" hreflang="x-default" href="https://patna-metro.com/map" />
    </Helmet>

    <div className="min-h-full bg-slate-50 px-4 pt-5 pb-6 space-y-4">

      {/* Page header */}
      <div>
        <h1 className="text-lg font-bold text-slate-800 mb-0.5">{t.title}</h1>
        <p className="text-slate-400 text-xs">{t.tap}</p>
      </div>

      {/* Map card — legend header + padded map area */}
      <div className="bg-white rounded-3xl shadow-md overflow-hidden">

        {/* Legend strip */}
        <div className="px-4 py-3 flex flex-wrap gap-x-5 gap-y-2 border-b border-slate-100">
          {Object.values(LINES).map(line => (
            <div key={line.id} className="flex items-center gap-1.5 text-xs">
              <div className="w-6 h-1.5 rounded-full" style={{ background: line.color }} />
              <span className="text-slate-600 font-medium">{lang === 'hi' ? line.nameHi : line.name}</span>
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

        {/* Map with inner padding for breathing room */}
        <div className="p-3">
          <div
            ref={containerRef}
            className="bg-slate-50 rounded-2xl overflow-hidden relative w-full"
            style={{ touchAction: 'none', cursor: isZoomed ? 'grab' : 'default' }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
              <svg
                viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              >
                {/* Khemnichak diagonal connector */}
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
                  return <line key={s.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke={LINES.LINE1.color} strokeWidth="4" strokeLinecap="round" />
                })}

                {/* Blue Line track */}
                {line2.slice(0, -1).map((s, i) => {
                  const a = POSITIONS[s.id], b = POSITIONS[line2[i + 1].id]
                  const isOp = s.operational && line2[i + 1].operational
                  return <line key={s.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke={LINES.LINE2.color} strokeWidth="4" strokeLinecap="round"
                    strokeOpacity={isOp ? 1 : 0.3}
                    strokeDasharray={isOp ? undefined : '6,4'} />
                })}

                {/* Stations */}
                {renderStations.map(s => {
                  const pos = POSITIONS[s.id]
                  if (!pos) return null
                  const isSelected = selected === s.id
                  const isLine2    = s.line === 'LINE2'
                  const stIdx      = (isLine2 ? line2 : line1).findIndex(x => x.id === s.id)
                  const dotColor   = s.operational ? '#10b981' : LINES[s.line]?.color

                  let lx, ly, anchor
                  if (!isLine2) {
                    lx = pos.x
                    ly = stIdx % 2 === 0 ? L1Y - 31 : L1Y - 15
                    anchor = 'middle'
                  } else if (pos.y < L2_BEND_Y - 2) {
                    lx = pos.x + 11; ly = pos.y + 3.5; anchor = 'start'
                  } else {
                    lx = pos.x; ly = pos.y + 16; anchor = 'middle'
                  }

                  return (
                    <g key={s.id} onClick={() => setSelected(selected === s.id ? null : s.id)} style={{ cursor: 'pointer' }}>
                      {!isLine2 && (
                        <line x1={pos.x} y1={pos.y - 7}
                          x2={pos.x} y2={stIdx % 2 === 0 ? L1Y - 27 : L1Y - 11}
                          stroke="#cbd5e1" strokeWidth="0.8" />
                      )}
                      <circle cx={pos.x} cy={pos.y} r={s.interchange ? 7 : 5}
                        fill={isSelected ? '#1e293b' : (s.operational ? '#10b981' : 'white')}
                        stroke={s.interchange ? '#f59e0b' : dotColor}
                        strokeWidth={s.interchange ? 2.5 : 1.8}
                        opacity={s.operational || s.interchange ? 1 : 0.6} />
                      {s.interchange && (
                        <circle cx={pos.x} cy={pos.y} r={11}
                          fill="none" stroke="#f59e0b" strokeWidth="1.1" strokeDasharray="3,2" />
                      )}
                      <text x={lx} y={ly} textAnchor={anchor} fontSize="7.5"
                        fill={isSelected ? LINES[s.line]?.color : (s.operational ? '#065f46' : '#64748b')}
                        fontWeight={isSelected || s.operational ? '700' : '400'}>
                        {trunc(sName(s), 14)}
                      </text>
                    </g>
                  )
                })}

                {/* Line name labels */}
                <text x={PAD_X} y={L1Y - 48} fontSize="9" fill={LINES.LINE1.color} fontWeight="bold">
                  {lang === 'hi' ? LINES.LINE1.nameHi : LINES.LINE1.name}
                </text>
                <text x={POSITIONS[line1.find(s => s.name === 'Patna Junction').id].x + 12} y={L1Y + 50}
                  fontSize="9" fill={LINES.LINE2.color} fontWeight="bold">
                  {lang === 'hi' ? LINES.LINE2.nameHi : LINES.LINE2.name}
                </text>
              </svg>

            {/* Reset zoom button */}
            {isZoomed && (
              <button
                onClick={reset}
                className="absolute top-2 right-2 bg-white text-slate-500 text-xs font-semibold px-3 py-1.5 rounded-full shadow border border-slate-200 active:bg-slate-50"
              >
                {t.reset}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Station detail card */}
      {sel && (() => {
        const times     = getStationTimes(sel)
        const terminals = getTerminals(sel.line)
        return (
          <div className="bg-white rounded-3xl shadow-md p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="font-bold text-slate-800 text-base leading-tight">{sName(sel)}</h2>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full text-white"
                    style={{ background: LINES[sel.line]?.color }}>
                    {lang === 'hi' ? LINES[sel.line]?.nameHi : LINES[sel.line]?.name}
                  </span>
                  {sel.interchange && <span className="text-xs bg-amber-100 text-amber-700 font-medium px-2.5 py-0.5 rounded-full">{t.interchange}</span>}
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${sel.operational ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                    {sel.operational ? t.operational : t.construction}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-base leading-none ml-2 flex-shrink-0 active:bg-slate-200">×</button>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100 mb-3" />

            {/* Timings */}
            <div className="mb-3">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t.timings}</div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2.5">
                  <span className="text-xs text-slate-500 truncate font-medium">→ {sName(terminals?.terminalB)}</span>
                  <div className="text-right ml-2 flex-shrink-0">
                    <span className="text-xs font-semibold text-slate-700">{t.first} {times?.towardB.first}</span>
                    <span className="text-xs text-slate-400 ml-2">{t.last} {times?.towardB.last}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2.5">
                  <span className="text-xs text-slate-500 truncate font-medium">→ {sName(terminals?.terminalA)}</span>
                  <div className="text-right ml-2 flex-shrink-0">
                    <span className="text-xs font-semibold text-slate-700">{t.first} {times?.towardA.first}</span>
                    <span className="text-xs text-slate-400 ml-2">{t.last} {times?.towardA.last}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Facilities */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t.facilities}</div>
              <div className="flex flex-wrap gap-1.5">
                {(STATION_FACILITIES[sel.id] || STATION_FACILITIES.DEFAULT).map(f => (
                  <span key={f} className="text-xs bg-blue-50 text-blue-700 font-medium px-2.5 py-0.5 rounded-full">{f}</span>
                ))}
              </div>
            </div>
          </div>
        )
      })()}

    </div>
    </>
  )
}
