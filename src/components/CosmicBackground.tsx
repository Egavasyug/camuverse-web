"use client"

import { useEffect, useRef } from 'react'

export default function CosmicBackground() {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)

    const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
    canvas.width = Math.floor(w * DPR)
    canvas.height = Math.floor(h * DPR)
    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'
    ctx.scale(DPR, DPR)

    const stars = Array.from({ length: Math.min(140, Math.floor((w * h) / 25000)) }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.2,
      a: Math.random() * Math.PI * 2,
      s: 0.002 + Math.random() * 0.004,
    }))

    let raf = 0
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (const st of stars) {
        st.a += st.s
        const twinkle = 0.6 + 0.4 * Math.sin(st.a)
        ctx.globalAlpha = 0.25 * twinkle
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }
    draw()

    const onResize = () => {
      w = (canvas.width = window.innerWidth)
      h = (canvas.height = window.innerHeight)
      canvas.width = Math.floor(w * DPR)
      canvas.height = Math.floor(h * DPR)
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(DPR, DPR)
    }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [])

  return (
    <canvas ref={ref} className="pointer-events-none fixed inset-0 z-0" aria-hidden="true" />
  )
}
