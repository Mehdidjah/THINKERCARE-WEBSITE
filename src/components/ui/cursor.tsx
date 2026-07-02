"use client"

import { useEffect, useMemo, useRef } from "react"

const glyphs = ["-", "/", ")", ".", "+", "=", ">", "<", "*", "&", "("]
const colors = ["#ae85ff", "#f73678", "#c05200", "#583af7", "#5fed83", "#bba00a"]

export default function Cursor() {
  const rootRef = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])
  const blocks = useMemo(() => Array.from({ length: 10 }), [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches
    if (reduceMotion || coarsePointer) return

    const trailBlocks = Array.from(root.querySelectorAll<HTMLElement>(".cursor-trail-block"))
    const skipSelector = "a, button, input, textarea, select, label, [role='button'], .no-trail"
    const activeSelector = "main, footer, .cursor-trail-zone"
    let index = 0

    const random = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)]
    const snap = (value: number) => Math.round(value / 20) * 20

    const handleMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse") return
      const target = event.target
      if (!(target instanceof Element)) return
      if (!target.closest(activeSelector) || target.closest(skipSelector)) return

      const blockIndex = index % trailBlocks.length
      const block = trailBlocks[blockIndex]
      const color = block?.querySelector<HTMLElement>(".cursor-trail-color")
      if (!block || !color) return

      index += 1
      const selectedColor = random(colors)
      block.classList.remove("active")
      block.style.transform = `translate3d(${snap(event.clientX)}px, ${snap(event.clientY)}px, 0)`
      color.textContent = random(glyphs)
      color.style.backgroundColor = selectedColor
      color.style.color = selectedColor === "#583af7" ? "#ffffff" : "#000000"

      window.requestAnimationFrame(() => block.classList.add("active"))
      window.clearTimeout(timers.current[blockIndex])
      timers.current[blockIndex] = window.setTimeout(() => {
        block.classList.remove("active")
      }, 100 + Math.random() * 300)
    }

    window.addEventListener("pointermove", handleMove, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handleMove)
      timers.current.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  return (
    <div ref={rootRef} id="cursor-trail" className="cursor-trail" aria-hidden="true">
      {blocks.map((_, index) => (
        <span className="cursor-trail-block" key={index}>
          <span className="cursor-trail-color" />
        </span>
      ))}
    </div>
  )
}
