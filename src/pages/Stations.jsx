import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { STATIONS, LINES, STATION_FACILITIES } from '../data/stations'
import { getStationTimes, getTerminals } from '../data/timeUtils'
import { useLang } from '../context/LanguageContext'

const T = {
  en: { title: 'Stations', search: 'Search stations…', all: 'All', red: 'Red', blue: 'Blue',
        facilities: 'Facilities', timings: 'Train Timings (Weekdays)', first: 'First', last: 'Last',
        interchange: 'Interchange', operational: 'Open', construction: 'Under Construction',
        noResults: 'No stations found.' },
  hi: { title: 'स्टेशन', search: 'स्टेशन खोजें…', all: 'सभी', red: 'रेड', blue: 'ब्लू',
        facilities: 'सुविधाएं', timings: 'ट्रेन समय (सोम–शुक्र)', first: 'पहली', last: 'आखिरी',
        interchange: 'इंटरचेंज', operational: 'चालू', construction: 'निर्माणाधीन',
        noResults: 'कोई स्टेशन नहीं मिला।' },
}

export default function Stations() {
  const { lang } = useLang()
  const t = T[lang]
  const { state } = useLocation()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState(state?.filter ?? 'ALL')
  const [selected, setSelected] = useState(null)

  const sName = s => lang === 'hi' ? s.nameHi : s.name

  const filtered = STATIONS.filter(s => {
    const matchLine = filter === 'ALL' || s.line === filter
    const matchSearch = sName(s).toLowerCase().includes(search.toLowerCase()) ||
                        s.name.toLowerCase().includes(search.toLowerCase())
    return matchLine && matchSearch
  })

  return (
    <div className="px-4 py-5 space-y-3">
      <h1 className="text-lg font-bold text-slate-800">{t.title}</h1>

      <div className="flex gap-2">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t.search}
          className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-metro-blue bg-white"
        />
      </div>

      <div className="flex gap-2">
        {[
          { key: 'ALL',   en: 'All',  hi: 'सभी'  },
          { key: 'LINE1', en: 'Red',  hi: 'रेड'  },
          { key: 'LINE2', en: 'Blue', hi: 'ब्लू' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex-1 ${
              filter === f.key
                ? f.key === 'LINE1' ? 'bg-metro-red text-white'
                  : f.key === 'LINE2' ? 'bg-metro-blue text-white'
                  : 'bg-slate-800 text-white'
                : 'bg-white border border-slate-200 text-slate-500'
            }`}
          >
            {lang === 'hi' ? f.hi : f.en}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(s => {
          const isSelected = selected === s.id
          const times = isSelected ? getStationTimes(s) : null
          const terminals = isSelected ? getTerminals(s.line) : null

          return (
            <button
              key={s.id}
              onClick={() => setSelected(isSelected ? null : s.id)}
              className={`w-full text-left bg-white rounded-2xl border px-4 py-3 transition-all ${
                isSelected ? 'border-metro-blue shadow-md' : 'border-slate-100 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: LINES[s.line]?.color }} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-slate-800 truncate">{sName(s)}</div>
                  <div className="text-xs text-slate-400">
                    {lang === 'hi' ? LINES[s.line]?.nameHi : LINES[s.line]?.name} · #{s.sequence}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {s.interchange && (
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{t.interchange}</span>
                  )}
                  {s.operational
                    ? <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{t.operational}</span>
                    : <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">{t.construction}</span>
                  }
                </div>
              </div>

              {isSelected && (
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">{t.timings}</div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
                        <span className="text-xs text-slate-500 truncate">→ {sName(terminals?.terminalB)}</span>
                        <div className="text-right ml-2 flex-shrink-0">
                          <span className="text-xs font-semibold text-slate-700">{t.first} {times?.towardB.first}</span>
                          <span className="text-xs text-slate-400 ml-2">{t.last} {times?.towardB.last}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
                        <span className="text-xs text-slate-500 truncate">→ {sName(terminals?.terminalA)}</span>
                        <div className="text-right ml-2 flex-shrink-0">
                          <span className="text-xs font-semibold text-slate-700">{t.first} {times?.towardA.first}</span>
                          <span className="text-xs text-slate-400 ml-2">{t.last} {times?.towardA.last}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">{t.facilities}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {(STATION_FACILITIES[s.id] || STATION_FACILITIES.DEFAULT).map(f => (
                        <span key={f} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{f}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </button>
          )
        })}

        {filtered.length === 0 && (
          <p className="text-center text-slate-400 py-10 text-sm">{t.noResults}</p>
        )}
      </div>
    </div>
  )
}
