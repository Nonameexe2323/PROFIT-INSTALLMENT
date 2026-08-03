'use client'
import { useState, useEffect } from 'react'

const MONEY_SYMBOLS = ['💸', '💵', '💰', '🪙', '💎', '✨', '💳']

export default function MoneyParticles({ active = true, count = 28 }) {
    const [particles, setParticles] = useState([])

    useEffect(() => {
        if (!active) {
            setParticles([])
            return
        }

        const items = Array.from({ length: count }).map((_, i) => ({
            id: i,
            symbol: MONEY_SYMBOLS[Math.floor(Math.random() * MONEY_SYMBOLS.length)],
            left: Math.random() * 98,
            duration: 6 + Math.random() * 9,
            delay: Math.random() * 6,
            size: 16 + Math.floor(Math.random() * 20),
            opacity: 0.35 + Math.random() * 0.45,
            spinDuration: 3 + Math.random() * 5
        }))

        setParticles(items)
    }, [active, count])

    if (!active || particles.length === 0) return null

    return (
        <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute animate-money-fall"
                    style={{
                        left: `${p.left}%`,
                        top: '-50px',
                        fontSize: `${p.size}px`,
                        opacity: p.opacity,
                        animationDuration: `${p.duration}s`,
                        animationDelay: `${p.delay}s`,
                        animationIterationCount: 'infinite',
                        animationTimingFunction: 'linear'
                    }}
                >
                    <span 
                        className="inline-block animate-pulse"
                        style={{ animationDuration: `${p.spinDuration}s` }}
                    >
                        {p.symbol}
                    </span>
                </div>
            ))}
        </div>
    )
}
