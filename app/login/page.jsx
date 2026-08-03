'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
    Lock, User, Eye, EyeOff, ArrowRight, Wallet, UserPlus, LogIn, CheckCircle2, 
    Shield, Sparkles, Sun, Moon, TrendingUp, DollarSign, Clock, MessageCircle,
    Zap, Award, BarChart3, Star, ShieldCheck, Flame, Key, AlertTriangle, X
} from 'lucide-react'
import { loginUserAccount, registerNewUser } from '@/utils/supabaseClient'

export default function LoginPage() {
    const router = useRouter()
    const [mode, setMode] = useState('login') // 'login' or 'register'
    const [showPassword, setShowPassword] = useState(false)
    const [theme, setTheme] = useState('dark') // 'dark' or 'light'
    
    // Login State (Username or Email)
    const [loginIdentifier, setLoginIdentifier] = useState('')
    const [loginPassword, setLoginPassword] = useState('')

    // Register State (รวมรหัสเชิญสมัครจากเจ้าของเว็บ)
    const [regName, setRegName] = useState('')
    const [regEmail, setRegEmail] = useState('')
    const [regPassword, setRegPassword] = useState('')
    const [regConfirmPassword, setRegConfirmPassword] = useState('')
    const [regInviteCode, setRegInviteCode] = useState('')

    // Feedback State
    const [isLoading, setIsLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    useEffect(() => {
        const savedTheme = localStorage.getItem('app_theme')
        if (savedTheme) setTheme(savedTheme)
    }, [])

    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark'
        setTheme(nextTheme)
        localStorage.setItem('app_theme', nextTheme)
    }

    // Login Handler (ดึงข้อมูลผู้ใช้ตรงจาก Supabase 100%)
    const handleLoginSubmit = async (e) => {
        e.preventDefault()
        if (!loginIdentifier.trim() || !loginPassword) {
            setErrorMsg('⚠️ กรุณากรอกชื่อผู้ใช้/อีเมล และรหัสผ่านให้ครบถ้วน')
            return
        }
        setIsLoading(true)
        setErrorMsg('')
        setSuccessMsg('')
        
        const res = await loginUserAccount(loginIdentifier, loginPassword)
        setIsLoading(false)
        if (res.success) {
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('just_logged_in', 'true')
            }
            setSuccessMsg(`🎉 เข้าสู่ระบบสำเร็จ ยินดีต้อนรับคุณ ${res.user.name}`)
            setTimeout(() => router.push('/'), 300)
        } else {
            setErrorMsg('⚠️ ชื่อผู้ใช้/อีเมล หรือรหัสผ่านไม่ถูกต้อง (ลองตรวจสอบตัวพิมพ์เล็ก/ใหญ่)')
        }
    }

    // Register Handler
    const handleRegisterSubmit = async (e) => {
        e.preventDefault()
        if (!regInviteCode.trim()) {
            setErrorMsg('⚠️ กรุณากรอกรหัสอนุมัติสมัครสมาชิกจากเจ้าของเว็บ (sakchawit)')
            return
        }
        if (!regName.trim() || !regEmail.trim() || !regPassword) {
            setErrorMsg('⚠️ กรุณากรอกชื่อผู้ใช้ อีเมล และตั้งรหัสผ่านให้ครบถ้วนทุกช่อง')
            return
        }
        if (regPassword.length < 6) {
            setErrorMsg('⚠️ รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร')
            return
        }
        if (regPassword !== regConfirmPassword) {
            setErrorMsg('⚠️ รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง')
            return
        }

        setIsLoading(true)
        setErrorMsg('')
        setSuccessMsg('')

        const res = await registerNewUser(regName, regEmail, regPassword, regInviteCode)
        setIsLoading(false)
        if (res.success) {
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('just_logged_in', 'true')
            }
            setSuccessMsg(`🎉 สมัครสมาชิกสำเร็จ! สร้างบัญชีใหม่สำหรับคุณ ${res.user.name} เรียบร้อย`)
            setTimeout(() => router.push('/'), 500)
        } else {
            setErrorMsg(`⚠️ ${res.error || 'คุณต้องมีรหัสสมัครจากเจ้าของเว็บ (sakchawit)'}`)
        }
    }

    const isLight = theme === 'light'

    return (
        <main className={`min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden transition-colors duration-150 font-sans ${
            isLight ? 'bg-slate-100 text-slate-900 selection:bg-indigo-600 selection:text-white' : 'bg-[#08080c] text-gray-100 selection:bg-indigo-500 selection:text-white'
        }`}>
            {/* Ambient Background Aura Blobs */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-[-15%] left-[-10%] w-[650px] h-[650px] rounded-full blur-[140px] transition-opacity duration-300 ${
                    isLight ? 'bg-indigo-300/60' : 'bg-indigo-600/25'
                }`}></div>
                <div className={`absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[140px] transition-opacity duration-300 ${
                    isLight ? 'bg-purple-300/60' : 'bg-purple-600/25'
                }`}></div>
                <div className={`absolute top-1/3 right-1/4 w-[350px] h-[350px] rounded-full blur-[120px] transition-opacity duration-300 ${
                    isLight ? 'bg-pink-200/50' : 'bg-pink-600/15'
                }`}></div>
            </div>

            {/* Floating Top Right Theme Toggle */}
            <div className="absolute top-6 right-6 z-30">
                <button
                    type="button"
                    onClick={toggleTheme}
                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
                        isLight 
                            ? 'bg-white/90 border-slate-200 text-slate-800 shadow-slate-200/50 hover:bg-white' 
                            : 'bg-white/10 border-white/10 text-white shadow-black/40 hover:bg-white/15'
                    }`}
                >
                    {isLight ? <Moon className="w-4 h-4 text-indigo-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
                    <span>{isLight ? 'โหมดมืด (Dark)' : 'โหมดสว่าง (Light)'}</span>
                </button>
            </div>

            {/* Main Rich Container */}
            <div className="w-full max-w-5xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6">
                
                {/* LEFT HERO SHOWCASE SECTION */}
                <div className="lg:col-span-6 space-y-5 animate-fade-in-up pr-0 lg:pr-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold shadow-lg">
                        <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
                        <span>ระบบจัดการรายรับ & ยอดผ่อนอันดับ 1</span>
                    </div>

                    <div className="space-y-2">
                        <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight ${
                            isLight ? 'text-slate-900' : 'text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-purple-300'
                        }`}>
                            PROFIT & INSTALLMENT <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                                TRACKER
                            </span>
                        </h1>
                        <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                            ระบบบริหารจัดการสรุปกำไรขายออก สรุปยอดขายประจำเดือน และติดตามยอดค้างผ่อนของลูกค้าแบบเรียลไทม์
                        </p>
                    </div>

                    {/* Feature Highlights Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className={`p-3.5 rounded-2xl border backdrop-blur-xl transition-all hover:-translate-y-0.5 ${
                            isLight ? 'bg-white/80 border-slate-200 shadow-md' : 'bg-white/5 border-white/10'
                        }`}>
                            <div className="p-2 bg-emerald-500/10 rounded-xl w-fit text-emerald-400 mb-1.5 border border-emerald-500/20">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            <h3 className={`text-xs font-bold mb-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>คำนวณกำไรเรียลไทม์</h3>
                            <p className="text-[10px] text-gray-400 leading-snug">สรุปกำไรสุทธิและต้นทุนแยกตามหมวดหมู่</p>
                        </div>

                        <div className={`p-3.5 rounded-2xl border backdrop-blur-xl transition-all hover:-translate-y-0.5 ${
                            isLight ? 'bg-white/80 border-slate-200 shadow-md' : 'bg-white/5 border-white/10'
                        }`}>
                            <div className="p-2 bg-indigo-500/10 rounded-xl w-fit text-indigo-400 mb-1.5 border border-indigo-500/20">
                                <BarChart3 className="w-4 h-4" />
                            </div>
                            <h3 className={`text-xs font-bold mb-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>วิเคราะห์กราฟยอดขาย</h3>
                            <p className="text-[10px] text-gray-400 leading-snug">คำนวณกราฟเส้นและกราฟวงกลมประจำเดือน</p>
                        </div>

                        <div className={`p-3.5 rounded-2xl border backdrop-blur-xl transition-all hover:-translate-y-0.5 ${
                            isLight ? 'bg-white/80 border-slate-200 shadow-md' : 'bg-white/5 border-white/10'
                        }`}>
                            <div className="p-2 bg-purple-500/10 rounded-xl w-fit text-purple-400 mb-1.5 border border-purple-500/20">
                                <MessageCircle className="w-4 h-4" />
                            </div>
                            <h3 className={`text-xs font-bold mb-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>ทักหาลูกค้าใน 1 คลิก</h3>
                            <p className="text-[10px] text-gray-400 leading-snug">ปุ่มทักหาลูกค้าทาง Line / Facebook ได้ทันที</p>
                        </div>

                        <div className={`p-3.5 rounded-2xl border backdrop-blur-xl transition-all hover:-translate-y-0.5 ${
                            isLight ? 'bg-white/80 border-slate-200 shadow-md' : 'bg-white/5 border-white/10'
                        }`}>
                            <div className="p-2 bg-pink-500/10 rounded-xl w-fit text-pink-400 mb-1.5 border border-pink-500/20">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <h3 className={`text-xs font-bold mb-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>แยกข้อมูลรายบัญชี</h3>
                            <p className="text-[10px] text-gray-400 leading-snug">สมัครใหม่รับกระดานเปล่า ไม่ปะปนกับผู้อื่น</p>
                        </div>
                    </div>

                    {/* Floating Mascot Avatar Badge */}
                    <div className={`p-3 rounded-2xl border backdrop-blur-xl flex items-center gap-3 shadow-xl ${
                        isLight ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200' : 'bg-gradient-to-r from-indigo-950/40 to-purple-950/40 border-indigo-500/30'
                    }`}>
                        <img 
                            src="/cat.png" 
                            alt="Nyan Cat" 
                            className="w-10 h-8 object-contain animate-bounce drop-shadow-[0_4px_10px_rgba(236,72,153,0.5)] shrink-0" 
                        />
                        <div className="text-xs">
                            <div className="font-bold text-indigo-400 flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                                <span>พร้อมใช้งานทันที</span>
                            </div>
                            <div className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>เข้าสู่ระบบเพื่อเริ่มจดกำไรและผ่อนสินค้าของคุณ</div>
                        </div>
                    </div>
                </div>

                {/* RIGHT FORM SECTION (Login & Register Form) */}
                <div className="lg:col-span-6 w-full max-w-md mx-auto animate-fade-in-up">
                    <div className="relative">
                        {/* Glowing Outer Gradient Border Effect */}
                        <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-40 blur-xl animate-pulse"></div>

                        <div className={`backdrop-blur-2xl p-7 sm:p-9 rounded-3xl shadow-2xl relative overflow-hidden transition-colors duration-150 border ${
                            isLight 
                                ? 'bg-white/90 border-slate-200/80 shadow-slate-300/60' 
                                : 'bg-[#10121e]/90 border-white/15 shadow-black/80'
                        }`}>
                            {/* Top Shimmer Gradient Bar */}
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                            {/* Header Title & Icon */}
                            <div className="text-center mb-5">
                                <div className="inline-block mb-2 relative">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-xl shadow-indigo-500/30 mx-auto">
                                        <div className={`w-full h-full rounded-[14px] flex items-center justify-center ${isLight ? 'bg-white' : 'bg-[#0d0e17]'}`}>
                                            <Wallet className="w-7 h-7 text-indigo-500" />
                                        </div>
                                    </div>
                                </div>

                                <h2 className={`text-lg sm:text-xl font-black tracking-tight ${
                                    isLight ? 'text-slate-900' : 'text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-purple-300'
                                }`}>
                                    PROFIT & INSTALLMENT TRACKER
                                </h2>
                                <p className={`text-xs mt-1 font-medium ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                                    เข้าสู่ระบบเพื่อจัดการข้อมูลกำไรและยอดผ่อนชำระ
                                </p>
                            </div>

                            {/* Tab Switcher: Login / Register */}
                            <div className={`flex p-1 rounded-2xl mb-5 border text-xs font-bold ${
                                isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/5'
                            }`}>
                                <button
                                    type="button"
                                    onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                                    className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                        mode === 'login' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    <LogIn className="w-3.5 h-3.5" />
                                    <span>เข้าสู่ระบบ</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
                                    className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                        mode === 'register' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    <UserPlus className="w-3.5 h-3.5" />
                                    <span>สมัครสมาชิกใหม่</span>
                                </button>
                            </div>

                            {/* CUSTOM BEAUTIFUL ALERT POPUP BANNERS */}
                            {errorMsg && (
                                <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-rose-500/20 to-red-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-start justify-between gap-3 shadow-lg animate-fade-in-up backdrop-blur-md">
                                    <div className="flex items-start gap-2.5">
                                        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
                                        <span className="leading-relaxed">{errorMsg}</span>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => setErrorMsg('')}
                                        className="text-rose-400 hover:text-white p-0.5 rounded cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            {successMsg && (
                                <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between gap-3 shadow-lg animate-fade-in-up backdrop-blur-md">
                                    <div className="flex items-center gap-2.5">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                        <span>{successMsg}</span>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => setSuccessMsg('')}
                                        className="text-emerald-400 hover:text-white p-0.5 rounded cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {/* MODE 1: LOGIN FORM */}
                            {mode === 'login' ? (
                                <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
                                    <div>
                                        <label className={`block text-xs font-semibold mb-1.5 tracking-wide ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                                            ชื่อผู้ใช้ (Username) หรือ อีเมล (Email) *
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                                            <input
                                                type="text"
                                                value={loginIdentifier}
                                                onChange={(e) => setLoginIdentifier(e.target.value)}
                                                autoCapitalize="none"
                                                autoCorrect="off"
                                                spellCheck={false}
                                                className={`w-full rounded-xl py-3 pl-11 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                                    isLight 
                                                        ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400' 
                                                        : 'bg-white/[0.04] border border-white/10 text-white placeholder-gray-500'
                                                }`}
                                                placeholder="เช่น sakchawit หรือ name@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`block text-xs font-semibold mb-1.5 tracking-wide ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                                            รหัสผ่าน (Password) *
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={loginPassword}
                                                onChange={(e) => setLoginPassword(e.target.value)}
                                                autoCapitalize="none"
                                                autoCorrect="off"
                                                spellCheck={false}
                                                className={`w-full rounded-xl py-3 pl-11 pr-11 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                                    isLight 
                                                        ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400' 
                                                        : 'bg-white/[0.04] border border-white/10 text-white placeholder-gray-500'
                                                }`}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full mt-3 py-3.5 px-4 text-sm font-bold flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                <span>กำลังเข้าสู่ระบบ...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <span>เข้าสู่ระบบ</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                /* MODE 2: REGISTER FORM */
                                <form onSubmit={handleRegisterSubmit} noValidate className="space-y-4">
                                    <div>
                                        <label className={`block text-xs font-semibold mb-1.5 tracking-wide flex items-center justify-between ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                                            <span>รหัสสมัครสมาชิกจากเจ้าของเว็บ *</span>
                                            <span className="text-[10px] text-amber-400 font-bold">ต้องมีรหัสอนุมัติ</span>
                                        </label>
                                        <div className="relative">
                                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                                            <input
                                                type="text"
                                                value={regInviteCode}
                                                onChange={(e) => setRegInviteCode(e.target.value)}
                                                autoCapitalize="none"
                                                autoCorrect="off"
                                                spellCheck={false}
                                                className={`w-full rounded-xl py-3 pl-11 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold ${
                                                    isLight 
                                                        ? 'bg-slate-50 border border-amber-300 text-slate-900 placeholder-slate-400' 
                                                        : 'bg-white/[0.04] border border-amber-500/40 text-amber-300 placeholder-gray-500'
                                                }`}
                                                placeholder="ใส่รหัสสมัคร เช่น sakchawit"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`block text-xs font-semibold mb-1.5 tracking-wide ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                                            ชื่อผู้ใช้งาน / ชื่อร้านค้า *
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                                            <input
                                                type="text"
                                                value={regName}
                                                onChange={(e) => setRegName(e.target.value)}
                                                autoCapitalize="none"
                                                autoCorrect="off"
                                                spellCheck={false}
                                                className={`w-full rounded-xl py-3 pl-11 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                                    isLight 
                                                        ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400' 
                                                        : 'bg-white/[0.04] border border-white/10 text-white placeholder-gray-500'
                                                }`}
                                                placeholder="เช่น sakchawit หรือ ร้านเกมเมอร์ช็อป"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`block text-xs font-semibold mb-1.5 tracking-wide ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                                            อีเมล *
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                                            <input
                                                type="email"
                                                value={regEmail}
                                                onChange={(e) => setRegEmail(e.target.value)}
                                                autoCapitalize="none"
                                                autoCorrect="off"
                                                spellCheck={false}
                                                className={`w-full rounded-xl py-3 pl-11 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                                    isLight 
                                                        ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400' 
                                                        : 'bg-white/[0.04] border border-white/10 text-white placeholder-gray-500'
                                                }`}
                                                placeholder="name@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`block text-xs font-semibold mb-1.5 tracking-wide ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                                            ตั้งรหัสผ่าน *
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={regPassword}
                                                onChange={(e) => setRegPassword(e.target.value)}
                                                autoCapitalize="none"
                                                autoCorrect="off"
                                                spellCheck={false}
                                                className={`w-full rounded-xl py-3 pl-11 pr-11 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                                    isLight 
                                                        ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400' 
                                                        : 'bg-white/[0.04] border border-white/10 text-white placeholder-gray-500'
                                                }`}
                                                placeholder="อย่างน้อย 6 ตัวอักษร"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`block text-xs font-semibold mb-1.5 tracking-wide ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                                            ยืนยันรหัสผ่านอีกครั้ง *
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={regConfirmPassword}
                                                onChange={(e) => setRegConfirmPassword(e.target.value)}
                                                autoCapitalize="none"
                                                autoCorrect="off"
                                                spellCheck={false}
                                                className={`w-full rounded-xl py-3 pl-11 pr-11 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                                    isLight 
                                                        ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400' 
                                                        : 'bg-white/[0.04] border border-white/10 text-white placeholder-gray-500'
                                                }`}
                                                placeholder="พิมพ์รหัสผ่านเดิมอีกครั้ง"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full mt-3 py-3.5 px-4 text-sm font-bold flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                <span>กำลังตรวจสอบและสมัคร...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <span>สมัครสมาชิกและเริ่มใช้งาน</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}

                            {/* Footer Notice */}
                            <div className={`mt-6 pt-4 border-t text-center text-[11px] flex items-center justify-center gap-1.5 ${
                                isLight ? 'border-slate-200 text-slate-500' : 'border-white/10 text-gray-400'
                            }`}>
                                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                                <span>สร้างโดย sakchawit</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}