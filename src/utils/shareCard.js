const STATUS_COLORS = {
  "Ghosting Incoming": "#ff4444",
  "Breadcrumbing": "#ff8800",
  "Lowkey Interested": "#ffcc00",
  "Catching Feelings": "#44bbff",
  "Rizz Detected": "#44ff88",
}

const STATUS_EMOJI = {
  "Ghosting Incoming": "👻",
  "Breadcrumbing": "🍞",
  "Lowkey Interested": "👀",
  "Catching Feelings": "💕",
  "Rizz Detected": "🔥",
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function wrapText(ctx, text, x, y, maxW, lineH, maxLines = 5) {
  const words = text.split(' ')
  let line = ''
  let row = 0
  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + ' '
    if (ctx.measureText(test).width > maxW && i > 0) {
      ctx.fillText(line.trim(), x, y + row * lineH)
      line = words[i] + ' '
      row++
      if (row >= maxLines) break
    } else {
      line = test
    }
  }
  if (row < maxLines) ctx.fillText(line.trim(), x, y + row * lineH)
  return row + 1
}

export function generateShareCard(result) {
  return new Promise((resolve) => {
    const W = 1080, H = 1080
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const c = canvas.getContext('2d')

    const color = STATUS_COLORS[result.status] || '#888'
    const emoji = STATUS_EMOJI[result.status] || '🤔'

    // Background
    const bg = c.createLinearGradient(0, 0, W, H)
    bg.addColorStop(0, '#06060f')
    bg.addColorStop(0.55, '#130a24')
    bg.addColorStop(1, '#060614')
    c.fillStyle = bg
    c.fillRect(0, 0, W, H)

    // Glow orb
    const glow = c.createRadialGradient(W / 2, H * 0.28, 0, W / 2, H * 0.28, 480)
    glow.addColorStop(0, color + '1a')
    glow.addColorStop(1, 'transparent')
    c.fillStyle = glow
    c.fillRect(0, 0, W, H)

    // Card border
    c.strokeStyle = 'rgba(255,255,255,0.07)'
    c.lineWidth = 2
    roundRect(c, 60, 60, W - 120, H - 120, 52)
    c.stroke()

    // App name
    c.font = '700 32px system-ui, -apple-system, sans-serif'
    c.textAlign = 'center'
    c.fillStyle = 'rgba(255,255,255,0.2)'
    c.fillText('💀 SITUATIONSHIP DECODER', W / 2, 148)

    // Thin divider
    c.strokeStyle = 'rgba(255,255,255,0.05)'
    c.lineWidth = 1
    c.beginPath()
    c.moveTo(160, 172)
    c.lineTo(W - 160, 172)
    c.stroke()

    // Status badge
    const badgeText = `${emoji} ${result.status.toUpperCase()}`
    c.font = '800 44px system-ui, -apple-system, sans-serif'
    const bw = c.measureText(badgeText).width + 80
    const bx = W / 2 - bw / 2
    const by = 208
    const bh = 84

    c.fillStyle = color + '1c'
    roundRect(c, bx, by, bw, bh, bh / 2)
    c.fill()
    c.strokeStyle = color + '55'
    c.lineWidth = 2
    roundRect(c, bx, by, bw, bh, bh / 2)
    c.stroke()

    c.fillStyle = color
    c.fillText(badgeText, W / 2, by + 57)

    // Divider
    c.strokeStyle = 'rgba(255,255,255,0.05)'
    c.lineWidth = 1
    c.beginPath()
    c.moveTo(140, 336)
    c.lineTo(W - 140, 336)
    c.stroke()

    // Verdict
    c.font = '700 54px system-ui, -apple-system, sans-serif'
    c.fillStyle = 'rgba(255,255,255,0.92)'
    c.textAlign = 'center'
    wrapText(c, `"${result.verdict}"`, W / 2, 408, W - 200, 70, 4)

    // Confidence section
    const barY = 640
    c.font = '600 30px system-ui, -apple-system, sans-serif'
    c.textAlign = 'left'
    c.fillStyle = 'rgba(255,255,255,0.38)'
    c.fillText('INTEREST LEVEL', 160, barY)

    c.textAlign = 'right'
    c.fillStyle = color
    c.font = '800 44px system-ui, -apple-system, sans-serif'
    c.fillText(`${result.confidence}%`, W - 160, barY)

    // Bar track
    c.fillStyle = 'rgba(255,255,255,0.07)'
    roundRect(c, 160, barY + 18, W - 320, 22, 11)
    c.fill()

    // Bar fill
    const fw = ((W - 320) * result.confidence) / 100
    const fillG = c.createLinearGradient(160, 0, 160 + fw, 0)
    fillG.addColorStop(0, color + '66')
    fillG.addColorStop(1, color)
    c.fillStyle = fillG
    roundRect(c, 160, barY + 18, fw, 22, 11)
    c.fill()

    // Explanation
    c.font = '400 28px system-ui, -apple-system, sans-serif'
    c.textAlign = 'center'
    c.fillStyle = 'rgba(255,255,255,0.42)'
    wrapText(c, result.explanation, W / 2, 730, W - 200, 44, 3)

    // Bottom divider
    c.strokeStyle = 'rgba(255,255,255,0.05)'
    c.lineWidth = 1
    c.beginPath()
    c.moveTo(160, 878)
    c.lineTo(W - 160, 878)
    c.stroke()

    // Branding
    c.font = '600 26px system-ui, -apple-system, sans-serif'
    c.fillStyle = 'rgba(255,255,255,0.14)'
    c.textAlign = 'center'
    c.fillText('situationship-decoder.app', W / 2, 940)

    resolve(canvas.toDataURL('image/png'))
  })
}
