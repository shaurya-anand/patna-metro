import { Helmet } from 'react-helmet-async'
import { SCHEDULE, STATIONS, LINES } from '../data/stations'
import { fmt } from '../data/timeUtils'
import { useLang } from '../context/LanguageContext'

const T = {
  en: {
    title: 'Schedule', weekdays: 'Weekdays', weekdaysSub: 'Mon – Fri',
    weekends: 'Weekends', weekendsSub: 'Sat, Sun & Holidays',
    first: 'First Train', last: 'Last Train',
    freqTitle: 'Train Frequency',
    rushHours: 'Rush Hours', otherTimes: 'Other Times',
    terminals: 'Terminals',
    disclaimer: 'Schedule is indicative. Check official PMRC notices for actual timings.',
    statusNote: 'Currently only Bhootnath → New ISBT (Blue Line) is operational. All other stations are under construction.',
  },
  hi: {
    title: 'समय सारणी', weekdays: 'सप्ताह के दिन', weekdaysSub: 'सोम – शुक्र',
    weekends: 'सप्ताहांत', weekendsSub: 'शनि, रवि और छुट्टियाँ',
    first: 'पहली ट्रेन', last: 'आखिरी ट्रेन',
    freqTitle: 'ट्रेन आवृत्ति',
    rushHours: 'भीड़ के समय', otherTimes: 'अन्य समय',
    terminals: 'टर्मिनल',
    disclaimer: 'समय सांकेतिक है। सटीक समय के लिए PMRC की आधिकारिक सूचना देखें।',
    statusNote: 'अभी केवल भूतनाथ → नया आईएसबीटी (ब्लू लाइन) चालू है। अन्य सभी स्टेशन निर्माणाधीन हैं।',
  },
}

export default function Schedule() {
  const { lang } = useLang()
  const t = T[lang]
  const { weekdays, weekends, peakHours } = SCHEDULE

  const termini = {
    LINE1: [
      STATIONS.filter(s => s.line === 'LINE1').sort((a, b) => a.sequence - b.sequence)[0],
      STATIONS.filter(s => s.line === 'LINE1').sort((a, b) => b.sequence - a.sequence)[0],
    ],
    LINE2: [
      STATIONS.filter(s => s.line === 'LINE2').sort((a, b) => a.sequence - b.sequence)[0],
      STATIONS.filter(s => s.line === 'LINE2').sort((a, b) => b.sequence - a.sequence)[0],
    ],
  }

  const sName = s => lang === 'hi' ? s?.nameHi : s?.name

  const peakSub = peakHours
    .map(ph => { const [s, e] = ph.split('–'); return `${fmt(s)} – ${fmt(e)}` })
    .join('   ·   ')

  return (
    <>
    <Helmet>
      <title>Patna Metro Schedule — Train Timings & Frequency</title>
      <meta name="description" content="Patna Metro train timings: first train 6:00 AM, last train 10:00 PM on weekdays. Check peak and off-peak frequency, weekend schedule and terminal stations." />
      <link rel="canonical" href="https://patna-metro.com/schedule" />
      <link rel="alternate" hreflang="en-IN" href="https://patna-metro.com/schedule" />
      <link rel="alternate" hreflang="hi" href="https://patna-metro.com/schedule" />
      <link rel="alternate" hreflang="x-default" href="https://patna-metro.com/schedule" />
    </Helmet>
    <div className="space-y-0">

      {/* Blue hero header */}
      <div className="bg-metro-blue px-4 pt-5 pb-12">
        <h1 className="text-2xl font-extrabold text-white">{t.title}</h1>
        <p className="text-white/55 text-xs mt-1">{t.statusNote}</p>
      </div>

      <div className="px-4 -mt-7 pb-6 space-y-4">

        {/* Weekdays card */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="bg-metro-blue/8 px-4 pt-4 pb-2 flex items-baseline gap-2">
            <span className="text-sm font-bold text-metro-blue">{t.weekdays}</span>
            <span className="text-xs text-slate-400">{t.weekdaysSub}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 px-4 pb-4 pt-2">
            <div className="bg-emerald-50 rounded-2xl p-3 text-center">
              <div className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide mb-1">{t.first}</div>
              <div className="text-xl font-extrabold text-emerald-700">{fmt(weekdays.firstTrain)}</div>
            </div>
            <div className="bg-rose-50 rounded-2xl p-3 text-center">
              <div className="text-[10px] font-semibold text-rose-400 uppercase tracking-wide mb-1">{t.last}</div>
              <div className="text-xl font-extrabold text-rose-600">{fmt(weekdays.lastTrain)}</div>
            </div>
          </div>
        </div>

        {/* Weekends card */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="bg-orange-50 px-4 pt-4 pb-2 flex items-baseline gap-2">
            <span className="text-sm font-bold text-orange-500">{t.weekends}</span>
            <span className="text-xs text-slate-400">{t.weekendsSub}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 px-4 pb-4 pt-2">
            <div className="bg-emerald-50 rounded-2xl p-3 text-center">
              <div className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide mb-1">{t.first}</div>
              <div className="text-xl font-extrabold text-emerald-700">{fmt(weekends.firstTrain)}</div>
            </div>
            <div className="bg-rose-50 rounded-2xl p-3 text-center">
              <div className="text-[10px] font-semibold text-rose-400 uppercase tracking-wide mb-1">{t.last}</div>
              <div className="text-xl font-extrabold text-rose-600">{fmt(weekends.lastTrain)}</div>
            </div>
          </div>
        </div>

        {/* Frequency */}
        <div className="bg-white rounded-3xl shadow-lg p-4">
          <p className="text-sm font-bold text-slate-700 mb-3">{t.freqTitle}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-amber-50 rounded-2xl px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-amber-800">{t.rushHours}</div>
                <div className="text-xs text-amber-600/70 mt-0.5">{peakSub}</div>
              </div>
              <span className="text-base font-extrabold text-amber-600 ml-3">{weekdays.peakFrequency}</span>
            </div>
            <div className="flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-3">
              <div className="text-sm font-semibold text-slate-700">{t.otherTimes}</div>
              <span className="text-base font-extrabold text-metro-blue">{weekdays.offPeakFrequency}</span>
            </div>
          </div>
        </div>

        {/* Terminals */}
        <div className="bg-white rounded-3xl shadow-lg p-4">
          <p className="text-sm font-bold text-slate-700 mb-3">{t.terminals}</p>
          <div className="space-y-2">
            {Object.entries(termini).map(([lineId, [start, end]]) => (
              <div key={lineId} className="rounded-2xl overflow-hidden border border-slate-100">
                <div className="px-4 py-2" style={{ background: LINES[lineId]?.color + '15' }}>
                  <span className="text-xs font-bold" style={{ color: LINES[lineId]?.color }}>
                    {lang === 'hi' ? LINES[lineId]?.nameHi : LINES[lineId]?.name}
                  </span>
                </div>
                <div className="px-4 py-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: LINES[lineId]?.color }} />
                  <span className="text-sm font-semibold text-slate-700">{sName(start)}</span>
                  <span className="text-slate-300 mx-1">↔</span>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: LINES[lineId]?.color }} />
                  <span className="text-sm font-semibold text-slate-700">{sName(end)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-700">
          ⚠ {t.disclaimer}
        </div>

      </div>
    </div>
    </>
  )
}
