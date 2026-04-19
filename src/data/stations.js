// Patna Metro — Corridor 1 (Red Line) and Corridor 2 (Blue Line)
// Source: PMRC Phase 1 approved alignment
// Operational as of Oct 2025: Bhootnath, Zero Mile, New ISBT (Blue Line partial section only)

export const LINES = {
  LINE1: { id: 'LINE1', name: 'Red Line',  nameHi: 'रेड लाइन',  color: '#e02424', shortName: 'RL' },
  LINE2: { id: 'LINE2', name: 'Blue Line', nameHi: 'ब्लू लाइन', color: '#1a56db', shortName: 'BL' },
}

export const STATIONS = [
  // Corridor 1 — Red Line (14 stations, fully under construction)
  { id: 'S01', name: 'Danapur Cantonment',   nameHi: 'दानापुर छावनी',          line: 'LINE1', sequence: 1,  interchange: false, operational: false, lat: 25.6215, lng: 85.0393 },
  { id: 'S02', name: 'Saguna More',          nameHi: 'सगुना मोड़',              line: 'LINE1', sequence: 2,  interchange: false, operational: false, lat: 25.6103, lng: 85.0547 },
  { id: 'S03', name: 'RPS More',             nameHi: 'आरपीएस मोड़',             line: 'LINE1', sequence: 3,  interchange: false, operational: false, lat: 25.6086, lng: 85.0635 },
  { id: 'S04', name: 'Patliputra',           nameHi: 'पाटलिपुत्र',             line: 'LINE1', sequence: 4,  interchange: false, operational: false, lat: 25.6072, lng: 85.0780 },
  { id: 'S05', name: 'Rukanpura',            nameHi: 'रुकनपुरा',               line: 'LINE1', sequence: 5,  interchange: false, operational: false, lat: 25.6095, lng: 85.0905 },
  { id: 'S06', name: 'Raja Bazar',           nameHi: 'राजा बाजार',             line: 'LINE1', sequence: 6,  interchange: false, operational: false, lat: 25.6107, lng: 85.1005 },
  { id: 'S07', name: 'Patna Zoo',            nameHi: 'पटना चिड़ियाघर',         line: 'LINE1', sequence: 7,  interchange: false, operational: false, lat: 25.6052, lng: 85.1055 },
  { id: 'S08', name: 'Vikas Bhawan',         nameHi: 'विकास भवन',              line: 'LINE1', sequence: 8,  interchange: false, operational: false, lat: 25.6077, lng: 85.1155 },
  { id: 'S09', name: 'Vidyut Bhawan',        nameHi: 'विद्युत भवन',            line: 'LINE1', sequence: 9,  interchange: false, operational: false, lat: 25.6098, lng: 85.1248 },
  { id: 'S10', name: 'Patna Junction',       nameHi: 'पटना जंक्शन',            line: 'LINE1', sequence: 10, interchange: true,  operational: false, lat: 25.6141, lng: 85.1336, interchangeWith: 'LINE2' },
  { id: 'S11', name: 'Mithapur',             nameHi: 'मिठापुर',                line: 'LINE1', sequence: 11, interchange: false, operational: false, lat: 25.5905, lng: 85.1398 },
  { id: 'S12', name: 'Ramkrishna Nagar',     nameHi: 'रामकृष्ण नगर',           line: 'LINE1', sequence: 12, interchange: false, operational: false, lat: 25.5755, lng: 85.1452 },
  { id: 'S13', name: 'Jaganpur',             nameHi: 'जगनपुर',                 line: 'LINE1', sequence: 13, interchange: false, operational: false, lat: 25.5598, lng: 85.1502 },
  { id: 'S14', name: 'Khemnichak',           nameHi: 'खेमनी चक',              line: 'LINE1', sequence: 14, interchange: true,  operational: false, lat: 25.5450, lng: 85.1555, interchangeWith: 'LINE2' },

  // Corridor 2 — Blue Line (12 stations; Bhootnath → New ISBT operational)
  { id: 'S15', name: 'Patna Junction',       nameHi: 'पटना जंक्शन',            line: 'LINE2', sequence: 1,  interchange: true,  operational: false, lat: 25.6141, lng: 85.1336, interchangeWith: 'LINE1' },
  { id: 'S16', name: 'Akashvani',            nameHi: 'आकाशवाणी',               line: 'LINE2', sequence: 2,  interchange: false, operational: false, lat: 25.6103, lng: 85.1375 },
  { id: 'S17', name: 'Gandhi Maidan',        nameHi: 'गांधी मैदान',            line: 'LINE2', sequence: 3,  interchange: false, operational: false, lat: 25.6063, lng: 85.1428 },
  { id: 'S18', name: 'PMCH',                nameHi: 'पीएमसीएच',               line: 'LINE2', sequence: 4,  interchange: false, operational: false, lat: 25.6018, lng: 85.1465 },
  { id: 'S19', name: 'Patna University',     nameHi: 'पटना विश्वविद्यालय',     line: 'LINE2', sequence: 5,  interchange: false, operational: false, lat: 25.5975, lng: 85.1492 },
  { id: 'S20', name: 'Moin Ul Haq Stadium', nameHi: 'मोईन-उल-हक स्टेडियम',   line: 'LINE2', sequence: 6,  interchange: false, operational: false, lat: 25.5903, lng: 85.1118 },
  { id: 'S21', name: 'Rajendra Nagar',       nameHi: 'राजेंद्र नगर',           line: 'LINE2', sequence: 7,  interchange: false, operational: false, lat: 25.5802, lng: 85.0995 },
  { id: 'S22', name: 'Malahi Pakri',         nameHi: 'मलाही पकड़ी',            line: 'LINE2', sequence: 8,  interchange: false, operational: false, lat: 25.5698, lng: 85.0852 },
  { id: 'S23', name: 'Khemnichak',           nameHi: 'खेमनी चक',              line: 'LINE2', sequence: 9,  interchange: true,  operational: false, lat: 25.5450, lng: 85.1555, interchangeWith: 'LINE1' },
  { id: 'S24', name: 'Bhootnath',            nameHi: 'भूतनाथ',                 line: 'LINE2', sequence: 10, interchange: false, operational: true,  lat: 25.5398, lng: 85.0715 },
  { id: 'S25', name: 'Zero Mile',            nameHi: 'जीरो माइल',              line: 'LINE2', sequence: 11, interchange: false, operational: true,  lat: 25.5352, lng: 85.0608 },
  { id: 'S26', name: 'New ISBT',             nameHi: 'नया आईएसबीटी',           line: 'LINE2', sequence: 12, interchange: false, operational: true,  lat: 25.5305, lng: 85.0503 },
]

export const STATION_FACILITIES = {
  S10: ['Lift', 'Escalator', 'ATM', 'Restroom', 'Feeder Bus'],
  S15: ['Lift', 'Escalator', 'ATM', 'Restroom', 'Feeder Bus'],
  S24: ['Lift', 'Escalator', 'ATM', 'Feeder Bus'],
  S25: ['Lift', 'Escalator'],
  S26: ['Parking', 'Lift', 'Escalator', 'ATM', 'Feeder Bus', 'Restroom'],
  DEFAULT: ['Lift', 'Escalator'],
}

// Fares based on PMRC fare chart: ₹15 up to ~3 km, ₹30 up to ~6 km
// Smart card = 10% discount (rounded down)
export const FARE_SLABS = [
  { maxStations: 3,  tokenFare: 15, cardFare: 14 },
  { maxStations: 6,  tokenFare: 20, cardFare: 18 },
  { maxStations: 12, tokenFare: 30, cardFare: 27 },
  { maxStations: 99, tokenFare: 50, cardFare: 45 },
]

export const SCHEDULE = {
  weekdays: { firstTrain: '06:00', lastTrain: '22:00', peakFrequency: 'Every 3–5 min', offPeakFrequency: 'Every 7–10 min' },
  weekends: { firstTrain: '06:30', lastTrain: '21:30', peakFrequency: 'Every 5–7 min', offPeakFrequency: 'Every 10–12 min' },
  peakHours: ['07:00–10:00', '17:00–20:00'],
}
