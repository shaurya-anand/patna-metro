import { createCanvas, loadImage } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.join(__dirname, 'public/screenshots')
const outDir = path.join(__dirname, 'public/screenshots/ipad')
mkdirSync(outDir, { recursive: true })

const BG = '#1a56db'
const W = 2048, H = 2732  // iPad Pro 13-inch App Store slot

// iPad frame
const PW = 1500
const PH = 2100
const PX = (W - PW) / 2
const PY = 150

// Screen inset inside frame
const BEZEL = 45
const SX = PX + BEZEL
const SY = PY + BEZEL
const SW = PW - BEZEL * 2
const SH = PH - BEZEL * 2

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

  // Background
  ctx.fillStyle = BG
  ctx.fillRect(0, 0, W, H)

  // Drop shadow
  ctx.shadowColor = 'rgba(0,0,0,0.5)'
  ctx.shadowBlur = 80
  ctx.shadowOffsetY = 40
  ctx.fillStyle = '#0d0d0d'
  roundRect(ctx, PX, PY, PW, PH, 55)
  ctx.fill()
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0

  // Metallic rim
  const rimGrad = ctx.createLinearGradient(PX, PY, PX + PW, PY + PH)
  rimGrad.addColorStop(0, '#555')
  rimGrad.addColorStop(0.4, '#999')
  rimGrad.addColorStop(1, '#333')
  ctx.strokeStyle = rimGrad
  ctx.lineWidth = 5
  roundRect(ctx, PX + 2, PY + 2, PW - 4, PH - 4, 53)
  ctx.stroke()

  // iPad body gradient
  const bodyGrad = ctx.createLinearGradient(PX, PY, PX + PW, PY + PH)
  bodyGrad.addColorStop(0, '#141414')
  bodyGrad.addColorStop(1, '#0d0d0d')
  ctx.fillStyle = bodyGrad
  roundRect(ctx, PX + 2, PY + 2, PW - 4, PH - 4, 53)
  ctx.fill()

  // iPad buttons: Volume on right side, Power on top
  ctx.fillStyle = '#2a2a2a'
  ctx.beginPath(); ctx.roundRect(PX + PW - 1, PY + 340, 7, 70, 3); ctx.fill()
  ctx.beginPath(); ctx.roundRect(PX + PW - 1, PY + 430, 7, 70, 3); ctx.fill()
  ctx.beginPath(); ctx.roundRect(PX + PW - 160, PY - 6, 80, 7, 3); ctx.fill()

  // Clip screen
  ctx.save()
  roundRect(ctx, SX, SY, SW, SH, 14)
  ctx.clip()
  ctx.fillStyle = '#111'
  ctx.fillRect(SX, SY, SW, SH)
  const img = await loadImage(path.join(srcDir, s.file))
  const scale = Math.min(SW / img.width, SH / img.height)
  const iw = img.width * scale, ih = img.height * scale
  ctx.drawImage(img, SX + (SW - iw) / 2, SY + (SH - ih) / 2, iw, ih)
  ctx.restore()

  // Screen glare
  ctx.save()
  roundRect(ctx, SX, SY, SW, SH, 14)
  ctx.clip()
  const glare = ctx.createLinearGradient(SX, SY, SX + SW * 0.6, SY + SH * 0.3)
  glare.addColorStop(0, 'rgba(255,255,255,0.06)')
  glare.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = glare
  ctx.fillRect(SX, SY, SW, SH)
  ctx.restore()

  // Front camera pill (iPad Pro Face ID style)
  ctx.fillStyle = '#0a0a0a'
  roundRect(ctx, PX + PW / 2 - 45, SY + 16, 90, 26, 13)
  ctx.fill()

  // Home indicator at bottom
  ctx.fillStyle = 'rgba(255,255,255,0.40)'
  roundRect(ctx, PX + PW / 2 - 55, SY + SH - 20, 110, 6, 3)
  ctx.fill()

  // Caption
  const capY = PY + PH + 220
  ctx.textAlign = 'center'
  ctx.shadowColor = 'rgba(0,0,0,0.35)'
  ctx.shadowBlur = 24
  ctx.shadowOffsetY = 8
  ctx.fillStyle = 'white'
  ctx.font = '900 110px sans-serif'
  ctx.fillText(s.title, W / 2, capY)
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0

  const outName = s.file.replace('.jpg', '-mockup.png')
  writeFileSync(path.join(outDir, outName), canvas.toBuffer('image/png'))
  console.log('Generated', outName)
}
