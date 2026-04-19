import { createContext, useContext, useState } from 'react'

const LanguageContext = createContext()

const STORAGE_KEY = 'pmrc_lang'

export function LanguageProvider({ children }) {
  const stored = localStorage.getItem(STORAGE_KEY)
  const [lang, setLang] = useState(stored || null)  // null = not yet chosen

  function choose(l) {
    localStorage.setItem(STORAGE_KEY, l)
    setLang(l)
  }

  const toggle = () => choose(lang === 'en' ? 'hi' : 'en')

  if (!lang) {
    return (
      <div className="flex items-center justify-center h-screen bg-metro-blue">
        <div className="bg-white rounded-3xl mx-6 p-8 shadow-2xl text-center max-w-sm w-full">
          <div className="text-5xl mb-5">🚇</div>
          <h1 className="text-xl font-extrabold text-slate-800 mb-1">Patna Metro</h1>
          <p className="text-slate-400 text-sm mb-8">Choose your language · भाषा चुनें</p>
          <div className="space-y-3">
            <button
              onClick={() => choose('en')}
              className="w-full bg-metro-blue text-white font-bold py-4 rounded-2xl text-base active:opacity-80 transition-opacity"
            >
              English
            </button>
            <button
              onClick={() => choose('hi')}
              className="w-full border-2 border-metro-blue text-metro-blue font-bold py-4 rounded-2xl text-base active:opacity-80 transition-opacity"
            >
              हिंदी
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <LanguageContext.Provider value={{ lang, toggle }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
