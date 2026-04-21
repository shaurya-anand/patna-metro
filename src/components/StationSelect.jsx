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
    <select value={value} onChange={e => onChange(e.target.value)} className={`appearance-none ${className}`}>
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
  )
}
