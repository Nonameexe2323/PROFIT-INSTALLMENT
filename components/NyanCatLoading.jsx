'use client'
import { Sparkles } from 'lucide-react'

export default function NyanCatLoading({ text = "กำลังจัดเตรียมข้อมูล... 🌈", isLight = false }) {
    return (
        <div className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden font-sans transition-colors duration-150 ${
            isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#08080c] text-white'
        }`}>
            {/* Ambient Blurred Aura Blobs */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-pink-600/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] bg-indigo-600/20 rounded-full blur-[90px] animate-pulse"></div>
            </div>

            {/* Compact Glassmorphic Card */}
            <div className={`relative z-10 flex flex-col items-center gap-3.5 p-5 sm:p-6 rounded-2xl backdrop-blur-xl border shadow-xl text-center max-w-[260px] mx-4 transition-all ${
                isLight 
                    ? 'bg-white/90 border-slate-200 shadow-slate-300/40' 
                    : 'bg-[#10121e]/90 border-white/10 shadow-black/70'
            }`}>
                {/* Compact Nyan Cat Image */}
                <div className="relative w-28 h-20 flex items-center justify-center">
                    <img 
                        src="/cat.png" 
                        alt="Nyan Cat Loading" 
                        className="w-full h-full object-contain animate-bounce drop-shadow-[0_6px_15px_rgba(236,72,153,0.4)]"
                    />
                </div>

                <div>
                    <h2 className="text-sm font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
                        PROFIT & INSTALLMENT
                    </h2>
                    <p className={`text-[11px] mt-0.5 font-semibold flex items-center justify-center gap-1 ${
                        isLight ? 'text-slate-600' : 'text-gray-400'
                    }`}>
                        <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
                        <span>{text}</span>
                    </p>
                </div>

                {/* Rainbow Progress Bar */}
                <div className={`w-36 h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-white/10'}`}>
                    <div className="h-full bg-gradient-to-r from-red-500 via-yellow-400 via-emerald-400 via-indigo-500 to-purple-500 rounded-full w-3/4 animate-pulse"></div>
                </div>
            </div>
        </div>
    )
}
