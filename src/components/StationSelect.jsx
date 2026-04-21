import { STATIONS, LINES } from '../data/stations'
import { useLang } from '../context/LanguageContext'

export default function StationSelect({ value, onChange, exclude, className = '', placeholder }) {
  const { lang } = useLang()
  const ph = placeholder ?? (lang === 'hi' ? 'स्टेशन चुनें…' : 'Select station…')

  const available = STATIONS.filter(s => s.id !== exclude)
  const openNow = available.filter(s => s.operational)

  // Per-line lists; interchange stations appear in both lines (intentional)
  const byLine = {}
  available.forEach(s => {
    if (!byLine[s.line]) byLine[s.line] = []
    byLine[s.line].push(s)
  })

  const sLabel = s => `${lang === 'hi' ? s.nameHi : s.name}${s.interchange ? ' ⇄' : ''}`

  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)} className={`appearance-none pr-10 ${className}`}>
        <option value="">{ph}</option>

        {openNow.length > 0 && (
          <optgroup label={lang === 'hi' ? `ब्लू लाइन · ${openNow.length} अभी चालू` : `Blue Line · ${openNow.length} Open Now`}>
            {openNow.map(s => (
              <option key={s.id} value={s.id}>{sLabel(s)}</option>
            ))}
          </optgroup>
        )}

        {Object.values(LINES).map(line => {
          const lineName = lang === 'hi' ? line.nameHi : line.name
          const status = lang === 'hi' ? '· निर्माणाधीन' : '· Under Construction'
          return (
            <optgroup key={line.id} label={`${lineName} ${status}`}>
              {(byLine[line.id] || []).map(s => (
                <option key={s.id} value={s.id}>{sLabel(s)}</option>
              ))}
            </optgroup>
          )
        })}
      </select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
    </div>
  )
}
