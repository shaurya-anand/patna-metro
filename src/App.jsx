import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { LanguageProvider, useLang } from './context/LanguageContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Planner from './pages/Planner'
import MetroMap from './pages/MetroMap'
import Schedule from './pages/Schedule'
import Stations from './pages/Stations'

function Header() {
  const { lang, toggle } = useLang()
  return (
    <>
      {/* Dynamically set <html lang> and global hreflang alternates */}
      <Helmet>
        <html lang={lang === 'hi' ? 'hi' : 'en-IN'} />
      </Helmet>
      <header className="bg-metro-blue text-white px-4 py-3 flex items-center gap-2 flex-shrink-0">
        <span className="text-xl">🚇</span>
        <span className="font-bold text-base tracking-tight flex-1">Patna Metro</span>
        <button
          onClick={toggle}
          className="text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors"
        >
          {lang === 'en' ? 'हिंदी' : 'English'}
        </button>
      </header>
    </>
  )
}

// Blue pages have a blue hero at the top; all others are slate-50
const BLUE_PAGES = new Set(['/', '/schedule'])

function PageMain() {
  const { pathname } = useLocation()
  const bg = BLUE_PAGES.has(pathname) ? 'bg-metro-blue' : 'bg-slate-50'
  return (
    <main className={`flex-1 overflow-y-auto flex flex-col min-h-0 ${bg}`}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/map" element={<MetroMap />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/stations" element={<Stations />} />
      </Routes>
    </main>
  )
}

export default function App() {
  return (
    <HelmetProvider>
    <LanguageProvider>
    <BrowserRouter>
      <div className="flex flex-col h-dvh bg-slate-50 max-w-md mx-auto relative overflow-hidden shadow-2xl">
        <Header />

        {/* Scrollable page content — bg matches current page top so iOS overscroll never flashes */}
        <PageMain />

        {/* Bottom tab bar */}
        <Navbar />
      </div>
    </BrowserRouter>
    </LanguageProvider>
    </HelmetProvider>
  )
}
