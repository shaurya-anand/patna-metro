import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { STATIONS, LINES, FARE_SLABS } from '../data/stations'
import { findRoute } from '../data/graph'
import { getJourneyTimes } from '../data/timeUtils'
import StationSelectBase from '../components/StationSelect'
import { useLang } from '../context/LanguageContext'

const T = {
  en: { title: 'Route Planner', from: 'From', to: 'To', findRoute: 'Find Route',
        stops: 'Stops', estTime: 'Est. Time', token: 'Token', card: 'Smart Card',
        min: 'min', hr: 'h', hrMin: 'm',
        trainTimings: 'Train Timings (Weekdays)', firstTrain: 'First Train', lastTrain: 'Last Train',
        arrives: 'arrives', route: 'Route', changeHere: 'Change here',
        errBoth: 'Please select both stations.', errSame: 'Origin and destination are the same.', errNone: 'No route found.' },
  hi: { title: 'रूट प्लानर', from: 'कहाँ से', to: 'कहाँ तक', findRoute: 'रास्ता खोजें',
        stops: 'स्टॉप', estTime: 'अनुमानित समय', token: 'टोकन', card: 'स्मार्ट कार्ड',
        min: 'मिनट', hr: 'घंटा', hrMin: 'मिनट',
        trainTimings: 'ट्रेन समय (सोम–शुक्र)', firstTrain: 'पहली ट्रेन', lastTrain: 'आखिरी ट्रेन',
        arrives: 'पहुंचती है', route: 'रूट', changeHere: 'यहाँ बदलें',
        errBoth: 'कृपया दोनों स्टेशन चुनें।', errSame: 'प्रारंभ और गंतव्य एक ही हैं।', errNone: 'कोई रास्ता नहीं मिला।' },
}

function getFare(stationCount) {
  const slab = FARE_SLABS.find(s => stationCount <= s.maxStations)
  return slab || FARE_SLABS[FARE_SLABS.length - 1]
}

function estimateTime(stops, interchanges, t) {
  const mins = Math.round(stops * 2.5 + interchanges * 3)
  if (mins < 60) return `${mins} ${t.min}`
  return `${Math.floor(mins / 60)}${t.hr} ${mins % 60}${t.hrMin}`
}

function StationSelect({ label, value, onChange, exclude }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      <StationSelectBase
        value={value}
        onChange={onChange}
        exclude={exclude}
        className="border border-slate-200 rounded-xl px-3 py-3 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-metro-blue"
      />
    </div>
  )
}

export default function Planner() {
  const { lang } = useLang()
  const t = T[lang]
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const stationMap = Object.fromEntries(STATIONS.map(s => [s.id, s]))
  const sName = s => lang === 'hi' ? s?.nameHi : s?.name

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
    const time = estimateTime(stationsInRoute - 1, interchanges, t)
    const trains = getJourneyTimes(stationMap[from], stationsInRoute - 1)
    setResult({ route, stationsInRoute, interchanges, fare, time, trains })
  }

  function swap() { setFrom(to); setTo(from); setResult(null) }

  return (
    <>
    <Helmet>
      <title>Patna Metro Route Planner — Fare & Train Timings</title>
      <meta name="description" content="Plan your Patna Metro journey. Get fare, estimated travel time and first/last train timings for any route on the Red Line or Blue Line." />
      <link rel="canonical" href="https://patna-metro.com/planner" />
      <link rel="alternate" hreflang="en-IN" href="https://patna-metro.com/planner" />
      <link rel="alternate" hreflang="hi" href="https://patna-metro.com/planner" />
      <link rel="alternate" hreflang="x-default" href="https://patna-metro.com/planner" />
    </Helmet>
    <div className="px-4 py-5 space-y-4">
      <h1 className="text-lg font-bold text-slate-800">{t.title}</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
        <StationSelect label={t.from} value={from} onChange={setFrom} exclude={to} />
        <div className="flex justify-center">
          <button onClick={swap} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 active:bg-slate-200">⇅</button>
        </div>
        <StationSelect label={t.to} value={to} onChange={setTo} exclude={from} />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button onClick={handleSearch} className="w-full bg-metro-blue text-white py-3 rounded-xl font-semibold text-sm active:bg-blue-700 transition-colors">
          {t.findRoute}
        </button>
      </div>

      {result && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-50 rounded-2xl p-3 text-center">
              <div className="text-xl font-bold text-metro-blue">{result.stationsInRoute - 1}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{t.stops}</div>
            </div>
            <div className="bg-orange-50 rounded-2xl p-3 text-center">
              <div className="text-xl font-bold text-orange-500">{result.time}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{t.estTime}</div>
            </div>
            <div className="bg-green-50 rounded-2xl p-3 text-center">
              <div className="text-xl font-bold text-green-600">₹{result.fare.tokenFare}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{t.token}</div>
            </div>
            <div className="bg-purple-50 rounded-2xl p-3 text-center">
              <div className="text-xl font-bold text-purple-600">₹{result.fare.cardFare}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{t.card}</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <h2 className="text-sm font-semibold text-slate-600 mb-3">{t.trainTimings}</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t.firstTrain}</div>
                <div className="font-bold text-slate-800">{result.trains.firstDepart}</div>
                <div className="text-[10px] text-slate-400">{t.arrives} {result.trains.firstArrive}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t.lastTrain}</div>
                <div className="font-bold text-slate-800">{result.trains.lastDepart}</div>
                <div className="text-[10px] text-slate-400">{t.arrives} {result.trains.lastArrive}</div>
              </div>
            </div>
          </div>

          {result.interchanges > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700">
              ⚠ {result.interchanges} {lang === 'hi' ? 'इंटरचेंज आवश्यक' : `interchange${result.interchanges > 1 ? 's' : ''} required`}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <h2 className="text-sm font-semibold text-slate-600 mb-3">{t.route}</h2>
            <ol className="space-y-1">
              {result.route.path.map((stId, idx) => {
                const station = stationMap[stId]
                const seg = result.route.segments[idx]
                const isInterchange = seg?.interchange
                const lineColor = station ? LINES[station.line]?.color : '#888'
                const isFirst = idx === 0
                const isLast = idx === result.route.path.length - 1
                return (
                  <li key={stId} className="flex items-start gap-3">
                    <div className="flex flex-col items-center pt-1 flex-shrink-0">
                      <div className="w-3 h-3 rounded-full border-2 border-white ring-1" style={{ background: lineColor, boxShadow: `0 0 0 1.5px ${lineColor}` }} />
                      {!isLast && <div className="w-0.5 h-5 mt-0.5" style={{ background: isInterchange ? '#f59e0b' : lineColor }} />}
                    </div>
                    <div className="pb-1">
                      <span className={`text-sm ${isFirst || isLast ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                        {sName(station)}
                      </span>
                      {isInterchange && (
                        <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">{t.changeHere}</span>
                      )}
                      <div className="text-[10px] text-slate-400">
                        {lang === 'hi' ? LINES[station?.line]?.nameHi : LINES[station?.line]?.name}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
