import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { STATIONS, LINES, FARE_SLABS } from '../data/stations'
import { findRoute } from '../data/graph'
import StationSelect from '../components/StationSelect'
import { useLang } from '../context/LanguageContext'

const T = {
  en: { whereTo: 'Where to?', from: 'From…', to: 'To…', findRoute: 'Find Route',
        stops: 'Stops', time: 'Time', token: 'Token', card: 'Card',
        route: 'Route', change: 'Change',
        errBoth: 'Please select both stations.', errSame: 'Origin and destination are the same.', errNone: 'No route found.' },
  hi: { whereTo: 'कहाँ जाना है?', from: 'कहाँ से…', to: 'कहाँ तक…', findRoute: 'रास्ता खोजें',
        stops: 'स्टॉप', time: 'समय', token: 'टोकन', card: 'कार्ड',
        route: 'रूट', change: 'बदलें',
        errBoth: 'कृपया दोनों स्टेशन चुनें।', errSame: 'प्रारंभ और गंतव्य एक ही हैं।', errNone: 'कोई रास्ता नहीं मिला।' },
}

function getFare(stationCount) {
  const slab = FARE_SLABS.find(s => stationCount <= s.maxStations)
  return slab || FARE_SLABS[FARE_SLABS.length - 1]
}

function estimateTime(stops, interchanges) {
  const mins = Math.round(stops * 2.5 + interchanges * 3)
  if (mins < 60) return `${mins} min`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

const selectCls = 'w-full px-4 py-3.5 text-sm text-slate-800 bg-white focus:outline-none'

export default function Home() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const { lang } = useLang()
  const t = T[lang]
  const navigate = useNavigate()
  const stationMap = Object.fromEntries(STATIONS.map(s => [s.id, s]))

  function handleSearch() {
    setError('')
    setResult(null)
    if (!from || !to) { setError(t.errBoth); return }
    if (from === to) { setError(t.errSame); return }
    const route = findRoute(from, to)
    if (!route) { setError(t.errNone); return }
    const stationsInRoute = route.path.length
    const interchanges = route.segments.filter(s => s.interchange).length
    const fare = getFare(stationsInRoute - 1)
    const time = estimateTime(stationsInRoute - 1, interchanges)
    setResult({ route, stationsInRoute, interchanges, fare, time })
  }

  function swap() { setFrom(to); setTo(from); setResult(null) }

  return (
    <>
    <Helmet>
      <title>Patna Metro — Route Planner, Fare & Schedule</title>
      <meta name="description" content="Plan your Patna Metro journey instantly. Check fares, train timings, live station status and metro map. Free Patna Metro app — no login needed." />
      <link rel="canonical" href="https://patna-metro.com/" />
      <link rel="alternate" hreflang="en-IN" href="https://patna-metro.com/" />
      <link rel="alternate" hreflang="hi" href="https://patna-metro.com/" />
      <link rel="alternate" hreflang="x-default" href="https://patna-metro.com/" />
    </Helmet>
    <div className="min-h-full bg-metro-blue flex flex-col px-5 py-6">

      {/* Hero */}
      <div className="flex flex-col items-center text-center mb-7 pt-2">
        <div className="w-16 h-16 rounded-full bg-black/30 flex items-center justify-center text-4xl mb-4">🚇</div>
        <h2 className="text-3xl font-extrabold text-white mb-1.5">
          {lang === 'hi' ? 'अपनी यात्रा प्लान करें' : 'Plan your journey'}
        </h2>
        <p className="text-white/55 text-sm mb-4">
          Patna Metro · {lang === 'hi' ? '1 लाइन · 3 स्टेशन चालू' : '1 line · 3 stations open'}
        </p>
        <div className="flex gap-2">
          {Object.values(LINES).map(line => {
            const total = STATIONS.filter(s => s.line === line.id).length
            const open  = STATIONS.filter(s => s.line === line.id && s.operational).length
            return (
              <button key={line.id} onClick={() => navigate('/stations', { state: { filter: line.id } })} className="flex items-center gap-2 bg-white/15 active:bg-white/25 rounded-full px-4 py-2 text-sm text-white font-medium transition-colors">
                <div className="w-2 h-2 rounded-full" style={{ background: line.color }} />
                <span>{lang === 'hi' ? line.nameHi : line.name}</span>
                {open > 0 ? (
                  <span className="font-normal text-xs">
                    <span className="text-emerald-300 font-semibold">{open}</span>
                    <span className="text-white/40"> / {total}</span>
                  </span>
                ) : (
                  <span className="text-white/35 font-normal text-xs">{lang === 'hi' ? 'जल्द' : 'Soon'}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Planner card */}
      <div className="bg-white rounded-3xl px-5 pt-6 pb-5 shadow-2xl">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{t.whereTo}</p>

        {/* Fused input group */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm mb-4">
          <StationSelect
            value={from}
            onChange={v => { setFrom(v); setResult(null) }}
            exclude={to}
            placeholder={t.from}
            className={`${selectCls} border-b border-slate-100`}
          />
          <StationSelect
            value={to}
            onChange={v => { setTo(v); setResult(null) }}
            exclude={from}
            placeholder={t.to}
            className={selectCls}
          />
          <button
            onClick={swap}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-metro-blue text-white shadow-md flex items-center justify-center text-sm active:scale-90 transition-transform"
          >⇅</button>
        </div>

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        <button
          onClick={handleSearch}
          className="w-full bg-metro-blue text-white font-bold py-3.5 rounded-2xl text-sm active:opacity-80 transition-opacity"
        >
          {t.findRoute}
        </button>

      {/* Results — inside the same card */}
      {result && (
        <div className="bg-white mt-1 space-y-4">
          <div className="h-px bg-slate-100" />

          {/* Summary strip */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-blue-50 rounded-xl p-2.5 text-center">
              <div className="font-bold text-metro-blue">{result.stationsInRoute - 1}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{t.stops}</div>
            </div>
            <div className="bg-orange-50 rounded-xl p-2.5 text-center">
              <div className="font-bold text-orange-500">{result.time}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{t.time}</div>
            </div>
            <div className="bg-green-50 rounded-xl p-2.5 text-center">
              <div className="font-bold text-green-600">₹{result.fare.tokenFare}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{t.token}</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-2.5 text-center">
              <div className="font-bold text-purple-600">₹{result.fare.cardFare}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{t.card}</div>
            </div>
          </div>

          {result.interchanges > 0 && (
            <p className="text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
              ⚠ {result.interchanges} interchange{result.interchanges > 1 ? 's' : ''} required
            </p>
          )}

          {/* Route steps */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{t.route}</p>
            <div className="space-y-1">
              {result.route.path.map((stId, idx) => {
                const station = stationMap[stId]
                const seg = result.route.segments[idx]
                const isLast = idx === result.route.path.length - 1
                const lineColor = LINES[station?.line]?.color
                return (
                  <div key={`${stId}-${idx}`} className="flex items-start gap-3">
                    <div className="flex flex-col items-center pt-1 flex-shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: lineColor, boxShadow: `0 0 0 2px white, 0 0 0 3px ${lineColor}` }} />
                      {!isLast && <div className="w-0.5 h-5 mt-0.5" style={{ background: lineColor, opacity: 0.25 }} />}
                    </div>
                    <div className="pb-0.5">
                      <span className={`text-sm ${idx === 0 || isLast ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
                        {lang === 'hi' ? station?.nameHi : station?.name}
                      </span>
                      {seg?.interchange && (
                        <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">{t.change}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
    </>
  )
}
