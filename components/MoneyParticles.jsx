'use client'
import { useMemo } from 'react'

const SYMBOLS = ['💸', '💵', '💰', '🪙', '💎', '✨']

export default function MoneyParticles({ active = true, count = 16 }) {
    const particles = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => {
            const left = Math.floor(Math.random() * 94) + 3
            const duration = (Math.random() * 4 + 5).toFixed(2) // 5s to 9s
            const delay = (Math.random() * 4).toFixed(2)
            const size = (Math.random() * 0.6 + 1.2).toFixed(2)
            const symbol = SYMBOLS[i % SYMBOLS.length]
            return { id: i, left, duration, delay, size, symbol }
        })
    }, [count])

    if (!active) return null

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-20 gpu-accelerate">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute animate-money-fall select-none gpu-accelerate"
                    style={{
                        left: `${p.left}%`,
                        fontSize: `${p.size}rem`,
                        animationDuration: `${p.duration}s`,
                        animationDelay: `${p.delay}s`,
                    }}
                >
                    {p.symbol}
                </div>
            ))}
        </div>
    )
}
