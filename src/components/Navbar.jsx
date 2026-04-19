import { NavLink } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'

function HomeIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  )
}

function MapIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="10" r="3" />
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    </svg>
  )
}

function ClockIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 15.5" />
    </svg>
  )
}

function TrainIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="13" rx="3" />
      <path d="M4 11h16" />
      <path d="M8 3v8M16 3v8" />
      <circle cx="8.5" cy="15.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="15.5" r="1" fill="currentColor" stroke="none" />
      <path d="M7 19l2-3.5M17 19l-2-3.5" />
    </svg>
  )
}

const tabs = [
  { to: '/',         Icon: HomeIcon,  en: 'Home',      hi: 'होम'       },
  { to: '/map',      Icon: MapIcon,   en: 'Map',        hi: 'नक्शा'     },
  { to: '/schedule', Icon: ClockIcon, en: 'Schedule',   hi: 'समय'       },
  { to: '/stations', Icon: TrainIcon, en: 'Stations',   hi: 'स्टेशन'    },
]

export default function Navbar() {
  const { lang } = useLang()
  return (
    <nav className="bg-white border-t border-slate-200 safe-area-pb flex-shrink-0">
      <div className="flex">
        {tabs.map(({ to, Icon, en, hi }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                isActive ? 'text-metro-blue' : 'text-slate-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon active={isActive} />
                <span className="text-[10px] font-medium">{lang === 'hi' ? hi : en}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
