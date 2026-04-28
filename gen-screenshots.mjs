import { createCanvas, loadImage } from 'canvas'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dir = path.join(__dirname, 'public/screenshots')

const BG = '#1a56db'
const PHONE_DARK = '#1c1c1e'
const W = 1080, H = 1920

// 9:17 ratio — middle ground, not too long, not too squat
const PW = 780
const SW = PW - 56
const SH = Math.round(SW * 17 / 9)  // ~1368px
const PH = SH + 130
const PX = (W - PW) / 2
const PY = 90
const SX = PX + 28, SY = PY + 50

const screens = [
  { file: 'home.jpg',      title: 'Plan your journey'         },
  { file: 'route.jpg',     title: 'Instant fare & route'      },
  { file: 'map.jpg',       title: 'Full metro map'            },
  { file: 'schedule.jpg',  title: 'Train timings at a glance' },
  { file: 'stations.jpg',  title: 'All stations & facilities' },
]

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

for (const s of screens) {
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext('2d')

  // Flat blue background
  ctx.fillStyle = BG
  ctx.fillRect(0, 0, W, H)

  // Drop shadow
  ctx.shadowColor = 'rgba(0,0,0,0.5)'
  ctx.shadowBlur = 50
  ctx.shadowOffsetY = 25
  ctx.fillStyle = '#0d0d0d'
  roundRect(ctx, PX, PY, PW, PH, 60)
  ctx.fill()
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0

  // Metallic rim (gradient stroke)
  const rimGrad = ctx.createLinearGradient(PX, PY, PX + PW, PY + PH)
  rimGrad.addColorStop(0, '#555')
  rimGrad.addColorStop(0.4, '#999')
  rimGrad.addColorStop(1, '#333')
  ctx.strokeStyle = rimGrad
  ctx.lineWidth = 4
  roundRect(ctx, PX + 2, PY + 2, PW - 4, PH - 4, 58)
  ctx.stroke()

  // Phone body gradient
  const bodyGrad = ctx.createLinearGradient(PX, PY, PX + PW, PY + PH)
  bodyGrad.addColorStop(0, '#141414')
  bodyGrad.addColorStop(1, '#0d0d0d')
  ctx.fillStyle = bodyGrad
  roundRect(ctx, PX + 2, PY + 2, PW - 4, PH - 4, 58)
  ctx.fill()

  // Side buttons (volume left, power right)
  ctx.fillStyle = '#333'
  ctx.beginPath(); ctx.roundRect(PX - 4, PY + 220, 6, 60, 3); ctx.fill()
  ctx.beginPath(); ctx.roundRect(PX - 4, PY + 300, 6, 60, 3); ctx.fill()
  ctx.beginPath(); ctx.roundRect(PX + PW - 2, PY + 260, 6, 80, 3); ctx.fill()

  // Clip screen and draw screenshot
  ctx.save()
  roundRect(ctx, SX, SY, SW, SH, 36)
  ctx.clip()
  // Fill screen black first (letterbox bars)
  ctx.fillStyle = '#111'
  ctx.fillRect(SX, SY, SW, SH)
  const img = await loadImage(path.join(dir, s.file))
  // Contain — no cropping, black bars fill the gaps
  const scale = Math.min(SW / img.width, SH / img.height)
  const iw = img.width * scale, ih = img.height * scale
  ctx.drawImage(img, SX + (SW - iw) / 2, SY + (SH - ih) / 2, iw, ih)
  ctx.restore()

  // Subtle screen glare
  ctx.save()
  roundRect(ctx, SX, SY, SW, SH, 36)
  ctx.clip()
  const glare = ctx.createLinearGradient(SX, SY, SX + SW * 0.6, SY + SH * 0.3)
  glare.addColorStop(0, 'rgba(255,255,255,0.07)')
  glare.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = glare
  ctx.fillRect(SX, SY, SW, SH)
  ctx.restore()

  // Dynamic island
  ctx.fillStyle = '#111'
  roundRect(ctx, PX + PW / 2 - 50, SY + 10, 100, 24, 12)
  ctx.fill()

  // Caption below phone
  const capY = PY + PH + 150
  ctx.textAlign = 'center'
  ctx.shadowColor = 'rgba(0,0,0,0.35)'
  ctx.shadowBlur = 18
  ctx.shadowOffsetY = 6
  ctx.fillStyle = 'white'
  ctx.font = '900 86px sans-serif'
  ctx.fillText(s.title, W / 2, capY)
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0

  const outName = s.file.replace('.jpg', '-mockup.png')
  writeFileSync(path.join(dir, outName), canvas.toBuffer('image/png'))
  console.log('Generated', outName)
}
