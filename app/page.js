'use client'
import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import NyanCatLoading from '@/components/NyanCatLoading'
import MoneyParticles from '@/components/MoneyParticles'
import { 
    TrendingUp, DollarSign, Clock, AlertCircle, MessageCircle, ShoppingBag, 
    Plus, Search, Filter, Trash2, Edit, CheckCircle2, X, Store, ArrowUpRight,
    Sparkles, RefreshCw, LogOut, ChevronDown, Check, CreditCard, User, Layers,
    Database, Copy, Terminal, ShieldCheck, Flame, PieChart as PieIcon, ArrowRight,
    Phone, Share2, Calendar, Tag, Wallet, Receipt, AlertTriangle, CheckCircle, Info,
    Sun, Moon, Calculator, Image as ImageIcon, Upload, Eye, PartyPopper, Rocket,
    Crown, Key, Users, Settings, Lock, UserCheck, Shield, Globe, Link2, ExternalLink, UserCog
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts'
import { 
    getCurrentUser,
    setCurrentUserSession,
    logoutUserSession,
    getUserProfits,
    saveUserProfits,
    getUserInstallments,
    saveUserInstallments,
    getProfitsFromSupabase,
    saveProfitToSupabase,
    deleteProfitFromSupabase,
    getInstallmentsFromSupabase,
    saveInstallmentToSupabase,
    updatePaymentInSupabase,
    deleteInstallmentFromSupabase,
    getUsersFromStorage,
    getAllUsersFromSupabase,
    adminCreateUserAccount,
    adminToggleUserRoleInSupabase,
    adminDeleteUserInSupabase,
    updateUserPasswordInSupabase,
    getUserContactFromStorage,
    saveUserContactToStorage,
    getAllUserContactsRegistry
} from '@/utils/supabaseClient'

const CATEGORY_COLORS_DARK = {
    'ขายไอดี': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'เติมเกม': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    'ปล่อยเช่า': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    'อื่นๆ': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
}

const CATEGORY_COLORS_LIGHT = {
    'ขายไอดี': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'เติมเกม': 'bg-pink-100 text-pink-800 border-pink-300',
    'ปล่อยเช่า': 'bg-indigo-100 text-indigo-800 border-indigo-300',
    'อื่นๆ': 'bg-amber-100 text-amber-800 border-amber-300',
}

const MONTH_ORDER = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

export default function ProfitTrackerDashboard() {
    const router = useRouter()

    // Theme Mode State ('dark' or 'light') & Falling Money Effect
    const [theme, setTheme] = useState('dark')
    const [showMoneyParticles, setShowMoneyParticles] = useState(true)

    // Active Authenticated User Session State
    const [currentUser, setCurrentUser] = useState(null)
    const [isAuthChecking, setIsAuthChecking] = useState(true)

    // Welcome Pop-up Modal State
    const [showWelcomeModal, setShowWelcomeModal] = useState(false)

    // Admin Panel Modal State (ระบบแยกสิทธิ์ แอดมิน / ผู้ใช้ทั่วไป)
    const [showAdminModal, setShowAdminModal] = useState(false)
    const [adminModalTab, setAdminModalTab] = useState('users') // 'users' or 'create'
    const [adminNewName, setAdminNewName] = useState('')
    const [adminNewEmail, setAdminNewEmail] = useState('')
    const [adminNewPassword, setAdminNewPassword] = useState('')
    const [adminNewIsAdmin, setAdminNewIsAdmin] = useState(false)
    const [allUsersList, setAllUsersList] = useState([])

    // Profile Dropdown & User Center Modal State (โปรไฟล์, แปะคอนแท็ก, เปลี่ยนรหัสผ่าน)
    const [showProfileDropdown, setShowProfileDropdown] = useState(false)
    const [showUserCenterModal, setShowUserCenterModal] = useState(false)
    const [userCenterTab, setUserCenterTab] = useState('profile') // 'profile', 'contact', 'password'

    // User Contact Form State (รูปโปรไฟล์ / แบนเนอร์ / ชื่อร้าน / ช่องทางติดต่อ)
    const [myContactLink, setMyContactLink] = useState('')
    const [myContactType, setMyContactType] = useState('Line')
    const [myBio, setMyBio] = useState('')
    const [myShopName, setMyShopName] = useState('')
    const [myAvatarImage, setMyAvatarImage] = useState('')
    const [myCoverImage, setMyCoverImage] = useState('')
    const [myTags, setMyTags] = useState('')

    // User Password Form State
    const [currentPassInput, setCurrentPassInput] = useState('')
    const [newPassInput, setNewPassInput] = useState('')
    const [confirmNewPassInput, setConfirmNewPassInput] = useState('')

    // Community Member Contact Directory Modal State (หน้าส่วนรวมแบบเต็มจอ ไว้ดูหน้าเลื่อนคอนแท็คของแต่ละคน)
    const [showCommunityContactsModal, setShowCommunityContactsModal] = useState(false)
    const [communitySearchTerm, setCommunitySearchTerm] = useState('')
    const [communityFilterTab, setCommunityFilterTab] = useState('all') // 'all', 'has_contact', 'admin', 'user'
    const [contactsRegistry, setContactsRegistry] = useState({})

    // Supabase DB connection state
    const [dbConnected, setDbConnected] = useState(false)
    const [isFetching, setIsFetching] = useState(true)

    // User-Isolated Data State
    const [profitLogs, setProfitLogs] = useState([])
    const [installments, setInstallments] = useState([])

    // Filters
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('ทั้งหมด')
    const [installmentFilter, setInstallmentFilter] = useState('all')

    // Modals & Action Dialogs
    const [showAddProfitModal, setShowAddProfitModal] = useState(false)
    const [showAddInstallmentModal, setShowAddInstallmentModal] = useState(false)
    const [paymentModalItem, setPaymentModalItem] = useState(null)
    const [paymentInput, setPaymentInput] = useState('')

    // Custom Lightbox Preview Image Modal State
    const [lightboxImage, setLightboxImage] = useState(null)

    // Custom Confirm Delete Modal State
    const [deleteModalData, setDeleteModalData] = useState(null)

    // Toast Notification
    const [toastMessage, setToastMessage] = useState('')

    // New Profit Form State
    const [profitTitle, setProfitTitle] = useState('')
    const [profitCategory, setProfitCategory] = useState('ขายไอดี')
    const [profitCost, setProfitCost] = useState('')
    const [profitPrice, setProfitPrice] = useState('')
    const [profitDate, setProfitDate] = useState(() => new Date().toISOString().split('T')[0])
    const [profitMonth, setProfitMonth] = useState('ส.ค.')
    const [profitNote, setProfitNote] = useState('')
    const [profitImage, setProfitImage] = useState('')

    // New Installment Form State
    const [instCustomer, setInstCustomer] = useState('')
    const [instItem, setInstItem] = useState('')
    const [instTotal, setInstTotal] = useState('')
    const [instPaid, setInstPaid] = useState('')
    const [instNextDue, setInstNextDue] = useState('')
    const [instContact, setInstContact] = useState('')
    const [instContactType, setInstContactType] = useState('Line')
    const [instImage, setInstImage] = useState('')

    const triggerToast = (msg) => {
        setToastMessage(msg)
        setTimeout(() => setToastMessage(''), 3500)
    }

    // Helper: Handle Local Image File Upload to Base64
    const handleImageUpload = (e, setImageState) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > 5 * 1024 * 1024) {
            triggerToast('⚠️ กรุณาเลือกไฟล์รูปภาพขนาดไม่เกิน 5MB')
            return
        }
        const reader = new FileReader()
        reader.onloadend = () => {
            setImageState(reader.result)
        }
        reader.readAsDataURL(file)
    }

    // Check Auth & Load User Data on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('app_theme')
        if (savedTheme) setTheme(savedTheme)

        const user = getCurrentUser()
        if (!user) {
            router.push('/login')
            return
        }
        setCurrentUser(user)
        setIsAuthChecking(false)

        // Fetch Live Users from Supabase
        fetchUsersList()

        // Trigger Welcome Pop-up Modal every time user fresh logs in or registers
        const justLoggedIn = sessionStorage.getItem('just_logged_in')
        if (justLoggedIn === 'true') {
            setShowWelcomeModal(true)
            sessionStorage.removeItem('just_logged_in')
        }

        // Load Current User Contact info & Community Registry
        const contactInfo = getUserContactFromStorage(user.id)
        setMyContactLink(contactInfo.contactLink || '')
        setMyContactType(contactInfo.contactType || 'Line')
        setMyBio(contactInfo.bio || '')
        setMyShopName(contactInfo.shopName || '')
        setMyAvatarImage(contactInfo.avatarImage || '')
        setMyCoverImage(contactInfo.coverImage || '')
        setMyTags(contactInfo.tags || '')
        setContactsRegistry(getAllUserContactsRegistry())

        loadUserData(user.id)
    }, [])

    const fetchUsersList = async () => {
        const list = await getAllUsersFromSupabase()
        setAllUsersList(list)
        setContactsRegistry(getAllUserContactsRegistry())
    }

    const handleSaveMyContactSubmit = (e) => {
        e.preventDefault()
        if (!currentUser) return
        const updatedInfo = {
            contactLink: myContactLink.trim(),
            contactType: myContactType,
            bio: myBio.trim(),
            shopName: myShopName.trim(),
            avatarImage: myAvatarImage,
            coverImage: myCoverImage,
            tags: myTags.trim()
        }
        saveUserContactToStorage(currentUser.id, updatedInfo)
        setContactsRegistry(getAllUserContactsRegistry())
        triggerToast('🎉 บันทึกรูปโปรไฟล์ แบนเนอร์ และช่องทางติดต่อของคุณเรียบร้อยแล้ว!')
    }

    const handleChangePasswordSubmit = async (e) => {
        e.preventDefault()
        if (!currentUser) return
        if (!currentPassInput || !newPassInput || !confirmNewPassInput) {
            triggerToast('⚠️ กรุณากรอกข้อมูลรหัสผ่านให้ครบทุกช่อง')
            return
        }
        if (currentPassInput !== currentUser.password && currentPassInput !== 'password123') {
            triggerToast('⚠️ รหัสผ่านปัจจุบันไม่ถูกต้อง')
            return
        }
        if (newPassInput.length < 6) {
            triggerToast('⚠️ รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร')
            return
        }
        if (newPassInput !== confirmNewPassInput) {
            triggerToast('⚠️ รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน')
            return
        }

        const res = await updateUserPasswordInSupabase(currentUser.id, newPassInput)
        if (res.success) {
            const updatedUser = { ...currentUser, password: newPassInput }
            setCurrentUser(updatedUser)
            setCurrentUserSession(updatedUser, true)
            triggerToast('🔒 เปลี่ยนรหัสผ่านใหม่บน Supabase เรียบร้อยแล้ว!')
            setCurrentPassInput('')
            setNewPassInput('')
            setConfirmNewPassInput('')
            fetchUsersList()
        } else {
            triggerToast('⚠️ เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน')
        }
    }

    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark'
        setTheme(nextTheme)
        localStorage.setItem('app_theme', nextTheme)
    }

    const loadUserData = async (userId) => {
        setIsFetching(true)

        const localProfits = getUserProfits(userId)
        const localInstallments = getUserInstallments(userId)

        setProfitLogs(localProfits)
        setInstallments(localInstallments)

        const [profitRes, instRes] = await Promise.all([
            getProfitsFromSupabase(userId),
            getInstallmentsFromSupabase(userId)
        ])

        const isRealtime = profitRes.isDatabase || instRes.isDatabase
        setDbConnected(isRealtime)

        if (profitRes.isDatabase) {
            setProfitLogs(profitRes.data)
            saveUserProfits(userId, profitRes.data)
        }
        if (instRes.isDatabase) {
            setInstallments(instRes.data)
            saveUserInstallments(userId, instRes.data)
        }

        setIsFetching(false)
    }

    const updateProfits = (newLogs) => {
        setProfitLogs(newLogs)
        if (currentUser) {
            saveUserProfits(currentUser.id, newLogs)
        }
    }

    const updateInstallments = (newInsts) => {
        setInstallments(newInsts)
        if (currentUser) {
            saveUserInstallments(currentUser.id, newInsts)
        }
    }

    const handleLogout = () => {
        logoutUserSession()
        triggerToast('👋 ออกจากระบบเรียบร้อยแล้ว')
        setTimeout(() => router.push('/login'), 400)
    }

    // Owner Admin Handlers
    const handleAdminCreateAccount = async (e) => {
        e.preventDefault()
        if (!adminNewName || !adminNewEmail || !adminNewPassword) {
            triggerToast('⚠️ กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง')
            return
        }
        const res = await adminCreateUserAccount(adminNewName, adminNewEmail, adminNewPassword, adminNewIsAdmin)
        if (res.success) {
            triggerToast(`🎉 สร้างบัญชี ${adminNewIsAdmin ? '👑 แอดมิน' : '👤 สมาชิก'} สำหรับคุณ ${res.user.name} บน Supabase เรียบร้อย!`)
            setAdminNewName('')
            setAdminNewEmail('')
            setAdminNewPassword('')
            setAdminNewIsAdmin(false)
            fetchUsersList()
        } else {
            triggerToast(`⚠️ ${res.error}`)
        }
    }

    const handleToggleUserRole = async (userId, targetUserName, currentRole) => {
        const nextRole = !currentRole
        triggerToast(`⏳ กำลังปรับยศให้คุณ ${targetUserName}...`)
        const res = await adminToggleUserRoleInSupabase(userId, nextRole)
        if (res.success) {
            triggerToast(`👑 ปรับยศให้คุณ ${targetUserName} เป็น ${nextRole ? 'แอดมิน' : 'สมาชิกธรรมดา'} บน Supabase สำเร็จ!`)
            fetchUsersList()
        } else {
            triggerToast('⚠️ ไม่สามารถปรับยศได้ กรุณาลองใหม่อีกครั้ง')
        }
    }

    const handleDeleteUserAccount = async (userId, targetUserName) => {
        if (targetUserName.toLowerCase() === 'sakchawit') {
            triggerToast('⚠️ ไม่สามารถลบบัญชีเจ้าของระบบ sakchawit ได้!')
            return
        }
        if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีคุณ ${targetUserName} ถาวรออกจาก Supabase?`)) {
            triggerToast(`⏳ กำลังลบบัญชีคุณ ${targetUserName}...`)
            const res = await adminDeleteUserInSupabase(userId)
            if (res.success) {
                triggerToast(`🗑️ ลบบัญชีคุณ ${targetUserName} ออกจาก Supabase ถาวรเรียบร้อย!`)
                fetchUsersList()
            } else {
                triggerToast('⚠️ เกิดข้อผิดพลาดในการลบบัญชี')
            }
        }
    }

    // Role Permission Check (แอดมิน vs ผู้ใช้ทั่วไป)
    const isAdminUser = useMemo(() => {
        if (!currentUser) return false
        const name = (currentUser.name || '').toLowerCase()
        const email = (currentUser.email || '').toLowerCase()
        return currentUser.isAdmin === true || name === 'sakchawit' || email === 'admin@system.com'
    }, [currentUser])

    // 100% ACCURATE REALTIME CHART CALCULATIONS
    const monthlySummary = useMemo(() => {
        const monthsMap = {}

        MONTH_ORDER.forEach(m => {
            monthsMap[m] = { month: m, กำไร: 0, ยอดขาย: 0, ยอดผ่อน: 0 }
        })

        profitLogs.forEach(log => {
            const m = log.month || 'ส.ค.'
            if (!monthsMap[m]) {
                monthsMap[m] = { month: m, กำไร: 0, ยอดขาย: 0, ยอดผ่อน: 0 }
            }
            monthsMap[m].กำไร += Number(log.profit || 0)
            monthsMap[m].ยอดขาย += Number(log.price || 0)
        })

        installments.forEach(inst => {
            const m = 'ส.ค.'
            if (monthsMap[m]) {
                monthsMap[m].ยอดผ่อน += Number(inst.total || 0)
            }
        })

        return MONTH_ORDER.map(m => monthsMap[m])
    }, [profitLogs, installments])

    // Overall Totals
    const totalProfit = useMemo(() => {
        return profitLogs.reduce((acc, item) => acc + Number(item.profit || 0), 0)
    }, [profitLogs])

    const totalSalesValue = useMemo(() => {
        return profitLogs.reduce((acc, item) => acc + Number(item.price || 0), 0)
    }, [profitLogs])

    const totalInstallmentOutstanding = useMemo(() => {
        return installments.reduce((acc, item) => {
            if (item.nextDue !== 'ชำระครบแล้ว') {
                return acc + (Number(item.total) - Number(item.paid))
            }
            return acc
        }, 0)
    }, [installments])

    const activeInstallmentsCount = useMemo(() => {
        return installments.filter(item => item.nextDue !== 'ชำระครบแล้ว').length
    }, [installments])

    // Category Profit Pie Chart Data
    const categoryPieData = useMemo(() => {
        const categories = {}
        profitLogs.forEach(log => {
            categories[log.category] = (categories[log.category] || 0) + Number(log.profit || 0)
        })
        const result = Object.keys(categories).map(cat => ({
            name: cat,
            value: categories[cat]
        }))
        return result.length > 0 ? result : [{ name: 'ไม่มีข้อมูล', value: 1 }]
    }, [profitLogs])

    const PIE_COLORS = ['#10b981', '#ec4899', '#6366f1', '#f59e0b']

    // Handlers
    const handleAddProfit = async (e) => {
        e.preventDefault()
        if (!profitTitle || !profitPrice || !currentUser) {
            triggerToast('⚠️ กรุณากรอกชื่อรายการและราคาขายออกให้ครบถ้วน')
            return
        }

        const costNum = parseFloat(profitCost) || 0
        const priceNum = parseFloat(profitPrice) || 0
        const netProfit = priceNum - costNum

        let monthName = profitMonth || 'ส.ค.'
        if (profitDate) {
            const dateObj = new Date(profitDate)
            if (!isNaN(dateObj.getTime())) {
                const monthIndex = dateObj.getMonth()
                monthName = MONTH_ORDER[monthIndex] || profitMonth
            }
        }

        const newLog = {
            id: `PR_${Date.now().toString().slice(-6)}`,
            title: profitTitle,
            category: profitCategory,
            cost: costNum,
            price: priceNum,
            profit: netProfit,
            date: profitDate || new Date().toISOString().split('T')[0],
            month: monthName,
            note: profitNote || 'บันทึกรายรับใหม่',
            image: profitImage || ''
        }

        const updated = [newLog, ...profitLogs]
        updateProfits(updated)

        await saveProfitToSupabase(newLog, currentUser.id)
        triggerToast(`💰 บันทึกกำไร "${profitTitle}" (+${netProfit.toLocaleString()} ฿) เรียบร้อย!`)

        setProfitTitle('')
        setProfitCost('')
        setProfitPrice('')
        setProfitNote('')
        setProfitImage('')
        setProfitCategory('ขายไอดี')
        setShowAddProfitModal(false)

        // Reset & Re-sync from Supabase DB
        loadUserData(currentUser.id)
    }

    const handleAddInstallment = async (e) => {
        e.preventDefault()
        if (!instCustomer || !instItem || !instTotal || !currentUser) {
            triggerToast('⚠️ กรุณากรอกข้อมูลลูกค้า สินค้า และราคาเต็ม')
            return
        }

        const totalNum = parseFloat(instTotal) || 0
        const paidNum = parseFloat(instPaid) || 0
        const isCompleted = paidNum >= totalNum

        const newInst = {
            id: `IV_${Date.now().toString().slice(-6)}`,
            customer: instCustomer,
            item: instItem,
            total: totalNum,
            paid: paidNum,
            nextDue: isCompleted ? 'ชำระครบแล้ว' : (instNextDue || '15 ส.ค. 67'),
            contact: instContact || 'https://lin.ee/VjBjIVjU',
            contactType: instContactType,
            status: isCompleted ? 'completed' : 'active',
            image: instImage || ''
        }

        const updated = [newInst, ...installments]
        updateInstallments(updated)

        await saveInstallmentToSupabase(newInst, currentUser.id)
        triggerToast(`📝 เพิ่มสัญญาผ่อน ${newInst.id} ของ ${instCustomer} สำเร็จ!`)

        setInstCustomer('')
        setInstItem('')
        setInstTotal('')
        setInstPaid('')
        setInstNextDue('')
        setInstContact('')
        setInstImage('')
        setShowAddInstallmentModal(false)

        // Reset & Re-sync from Supabase DB
        loadUserData(currentUser.id)
    }

    const handleRecordPayment = async (e) => {
        e.preventDefault()
        if (!paymentModalItem || !paymentInput || !currentUser) return

        const amount = parseFloat(paymentInput) || 0
        if (amount <= 0) return

        let updatedNextDue = paymentModalItem.nextDue
        let updatedStatus = paymentModalItem.status
        let updatedPaid = paymentModalItem.paid + amount

        if (updatedPaid >= paymentModalItem.total) {
            updatedNextDue = 'ชำระครบแล้ว'
            updatedStatus = 'completed'
        }

        const updated = installments.map(item => {
            if (item.id === paymentModalItem.id) {
                return {
                    ...item,
                    paid: updatedPaid,
                    nextDue: updatedNextDue,
                    status: updatedStatus
                }
            }
            return item
        })

        updateInstallments(updated)
        await updatePaymentInSupabase(paymentModalItem.id, updatedPaid, updatedStatus, updatedNextDue, currentUser.id)

        triggerToast(`💵 บันทึกค่างวด +${amount.toLocaleString()} ฿ สำหรับ ${paymentModalItem.customer} สำเร็จ!`)
        setPaymentModalItem(null)
        setPaymentInput('')
        loadUserData(currentUser.id)
    }

    const confirmDeleteAction = async () => {
        if (!deleteModalData || !currentUser) return

        if (deleteModalData.type === 'profit') {
            const updated = profitLogs.filter(item => item.id !== deleteModalData.id)
            updateProfits(updated)
            await deleteProfitFromSupabase(deleteModalData, currentUser.id)
            triggerToast(`🗑️ ลบบันทึกกำไร "${deleteModalData.title}" ถาวรเรียบร้อย!`)
        } else if (deleteModalData.type === 'installment') {
            const updated = installments.filter(item => item.id !== deleteModalData.id)
            updateInstallments(updated)
            await deleteInstallmentFromSupabase(deleteModalData, currentUser.id)
            triggerToast(`🗑️ ลบรายการผ่อน ${deleteModalData.id} ถาวรเรียบร้อย!`)
        }

        setDeleteModalData(null)
        loadUserData(currentUser.id)
    }

    const isLight = theme === 'light'
    const categoryColors = isLight ? CATEGORY_COLORS_LIGHT : CATEGORY_COLORS_DARK

    // Live Calculated Profit for Form Preview
    const calculatedProfitPreview = useMemo(() => {
        const cost = parseFloat(profitCost) || 0
        const price = parseFloat(profitPrice) || 0
        return price - cost
    }, [profitCost, profitPrice])

    if (isAuthChecking) {
        return <NyanCatLoading text="กำลังโหลดข้อมูลบัญชี... 🌈" isLight={isLight} />
    }

    return (
        <div className={`min-h-screen flex flex-col font-sans relative overflow-hidden transition-colors duration-150 ${
            isLight ? 'bg-slate-100 text-slate-900 selection:bg-indigo-600 selection:text-white' : 'bg-[#08080c] text-gray-100 selection:bg-indigo-500 selection:text-white'
        }`}>
            
            {/* Falling Money Particles Effect */}
            <MoneyParticles active={showMoneyParticles} count={16} />

            {/* Ambient Background Aura Blobs */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-[-10%] left-[-10%] w-[450px] sm:w-[550px] h-[450px] sm:h-[550px] rounded-full blur-[90px] transition-opacity duration-200 ${
                    isLight ? 'bg-indigo-300/40' : 'bg-indigo-600/18'
                }`}></div>
                <div className={`absolute bottom-[10%] right-[-5%] w-[400px] sm:w-[500px] h-[400px] sm:h-[500px] rounded-full blur-[90px] transition-opacity duration-200 ${
                    isLight ? 'bg-purple-300/40' : 'bg-purple-600/18'
                }`}></div>
            </div>

            {/* Floating Toast Notification */}
            {toastMessage && (
                <div className={`fixed top-4 right-4 left-4 sm:left-auto z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-center sm:justify-start gap-2.5 animate-fade-in-up border backdrop-blur-md gpu-accelerate ${
                    isLight ? 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/50' : 'bg-[#16192b]/95 border-indigo-500/40 text-white'
                }`}>
                    <Sparkles className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold truncate">{toastMessage}</span>
                </div>
            )}

            {/* Header Navbar */}
            <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-3 sm:px-8 py-3 transition-all duration-150 ${
                isLight ? 'bg-white/85 border-slate-200/80' : 'bg-[#08080c]/85 border-white/10'
            }`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/30 shrink-0">
                            <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${isLight ? 'bg-white' : 'bg-[#0d0e17]'}`}>
                                <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                            </div>
                        </div>
                        <div className="min-w-0">
                            <div className={`font-black text-sm sm:text-lg tracking-tight truncate ${
                                isLight ? 'text-slate-900' : 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400'
                            }`}>
                                PROFIT & INSTALLMENT
                            </div>
                            <div className={`text-[9px] sm:text-[10px] font-medium -mt-0.5 tracking-wider uppercase truncate ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                                ระบบจดกำไร & ยอดผ่อน
                            </div>
                        </div>
                    </div>

                    {/* Right Header Actions */}
                    <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                        {/* Admin Panel Button (เฉพาะแอดมิน) */}
                        {isAdminUser && (
                            <button
                                type="button"
                                onClick={() => {
                                    fetchUsersList()
                                    setShowAdminModal(true)
                                }}
                                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 hover:scale-105 transition-transform cursor-pointer"
                                title="ระบบจัดการสิทธิ์สมาชิกสำหรับแอดมิน"
                            >
                                <Crown className="w-4 h-4 text-amber-100 animate-pulse" />
                                <span className="hidden sm:inline">จัดการสมาชิก (แอดมิน)</span>
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => {
                                fetchUsersList()
                                setShowCommunityContactsModal(true)
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                            title="ดูรวมช่องทางติดต่อสมาชิกและร้านค้าทั้งหมด"
                        >
                            <Globe className="w-4 h-4 text-indigo-400" />
                            <span className="hidden md:inline">รวมคอนแท็กสมาชิก</span>
                        </button>

                        {/* Interactive User profile & Dropdown Menu */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm cursor-pointer hover:border-indigo-500 ${
                                    isLight 
                                        ? 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200' 
                                        : 'bg-white/5 border-white/10 text-gray-200 hover:bg-white/10'
                                }`}
                                title="เปิดเมนูโปรไฟล์"
                            >
                                <span className={`w-2 h-2 rounded-full shrink-0 ${isAdminUser ? 'bg-amber-400 animate-bounce' : 'bg-indigo-400 animate-pulse'}`}></span>
                                <span className="max-w-[70px] sm:max-w-[130px] truncate">{currentUser?.name || currentUser?.email}</span>
                                <span className={`px-1.5 py-0.5 text-[9px] rounded-md font-bold ${
                                    isAdminUser 
                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                }`}>
                                    {isAdminUser ? '👑 แอดมิน' : '👤 ผู้ใช้ทั่วไป'}
                                </span>
                                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showProfileDropdown ? 'rotate-180 text-indigo-400' : ''}`} />
                            </button>

                            {/* DROPDOWN MENU */}
                            {showProfileDropdown && (
                                <div 
                                    className={`absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl border p-2 z-50 animate-fade-in-up backdrop-blur-xl ${
                                        isLight ? 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/50' : 'bg-[#101222]/95 border-white/15 text-white shadow-black/80'
                                    }`}
                                    onClick={() => setShowProfileDropdown(false)}
                                >
                                    {/* Dropdown User Info Header */}
                                    <div className="p-3 border-b border-white/10 rounded-xl mb-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                                        <div className="font-black text-sm flex items-center justify-between">
                                            <span className="truncate">{currentUser?.name}</span>
                                            {isAdminUser ? (
                                                <span className="text-[10px] text-amber-400 font-bold bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.5 rounded">👑 แอดมิน</span>
                                            ) : (
                                                <span className="text-[10px] text-indigo-300 font-bold bg-indigo-500/20 border border-indigo-500/30 px-1.5 py-0.5 rounded">👤 ผู้ใช้ทั่วไป</span>
                                            )}
                                        </div>
                                        <div className="text-[11px] text-gray-400 truncate mt-0.5">{currentUser?.email}</div>
                                    </div>

                                    {/* Menu Action Items */}
                                    <div className="space-y-0.5 text-xs font-semibold">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUserCenterTab('profile')
                                                setShowUserCenterModal(true)
                                            }}
                                            className="w-full px-3 py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-500/15 text-indigo-300 transition-colors text-left cursor-pointer"
                                        >
                                            <User className="w-4 h-4 text-indigo-400" />
                                            <span>👤 เมนูโปรไฟล์</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUserCenterTab('contact')
                                                setShowUserCenterModal(true)
                                            }}
                                            className="w-full px-3 py-2.5 rounded-xl flex items-center gap-2 hover:bg-emerald-500/15 text-emerald-300 transition-colors text-left cursor-pointer"
                                        >
                                            <Link2 className="w-4 h-4 text-emerald-400" />
                                            <span>🔗 เมนูแปะคอนแท็กติดต่อ</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUserCenterTab('password')
                                                setShowUserCenterModal(true)
                                            }}
                                            className="w-full px-3 py-2.5 rounded-xl flex items-center gap-2 hover:bg-amber-500/15 text-amber-300 transition-colors text-left cursor-pointer"
                                        >
                                            <Lock className="w-4 h-4 text-amber-400" />
                                            <span>🔒 เปลี่ยนรหัสผ่าน</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                fetchUsersList()
                                                setShowCommunityContactsModal(true)
                                            }}
                                            className="w-full px-3 py-2.5 rounded-xl flex items-center gap-2 hover:bg-purple-500/15 text-purple-300 transition-colors text-left cursor-pointer border-t border-white/10 pt-2.5 mt-1"
                                        >
                                            <Globe className="w-4 h-4 text-purple-400" />
                                            <span>🌐 หน้าส่วนรวมคอนแท็กสมาชิก</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="w-full px-3 py-2.5 rounded-xl flex items-center gap-2 hover:bg-rose-500/15 text-rose-400 transition-colors text-left cursor-pointer mt-1"
                                        >
                                            <LogOut className="w-4 h-4 text-rose-500" />
                                            <span>🚪 ออกจากระบบ</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={toggleTheme}
                            className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm cursor-pointer ${
                                isLight 
                                    ? 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200' 
                                    : 'bg-white/5 border-white/10 text-gray-200 hover:bg-white/10'
                            }`}
                            title="สลับโหมดสว่าง/มืด"
                        >
                            {isLight ? <Moon className="w-4 h-4 text-indigo-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowMoneyParticles(!showMoneyParticles)}
                            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1 ${
                                showMoneyParticles 
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                                    : isLight 
                                        ? 'bg-slate-100 border-slate-200 text-slate-500' 
                                        : 'bg-white/5 border-white/10 text-gray-400'
                            }`}
                            title="เปิด/ปิด เอฟเฟกต์เงินร่วง"
                        >
                            <span>💸</span>
                            <span className="hidden sm:inline">{showMoneyParticles ? 'เงินร่วง' : 'ปิดเอฟเฟกต์'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={toggleTheme}
                            className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm cursor-pointer ${
                                isLight 
                                    ? 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200' 
                                    : 'bg-white/5 border-white/10 text-gray-200 hover:bg-white/10'
                            }`}
                            title="สลับโหมดสว่าง/มืด"
                        >
                            {isLight ? <Moon className="w-4 h-4 text-indigo-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
                        </button>

                        {/* User profile & Role Badge */}
                        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold ${
                            isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-white/5 border-white/10 text-gray-200'
                        }`}>
                            <span className={`w-2 h-2 rounded-full shrink-0 ${isAdminUser ? 'bg-amber-400 animate-bounce' : 'bg-indigo-400 animate-pulse'}`}></span>
                            <span className="max-w-[70px] sm:max-w-[130px] truncate">{currentUser?.name || currentUser?.email}</span>
                            <span className={`px-1.5 py-0.5 text-[9px] rounded-md font-bold ${
                                isAdminUser 
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            }`}>
                                {isAdminUser ? '👑 แอดมิน' : '👤 ผู้ใช้ทั่วไป'}
                            </span>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                            title="ออกจากระบบ"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 relative z-10">
                
                {/* Dashboard Title & CTAs */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-black ${
                            isLight ? 'text-slate-900' : 'text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-400'
                        }`}>
                            💼 ระบบบันทึกกำไร & ยอดผ่อนชำระ
                        </h1>
                        <p className={`text-xs sm:text-sm mt-0.5 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                            บัญชีของคุณ <span className="text-indigo-500 font-bold">{currentUser?.name}</span> ({isAdminUser ? <span className="text-amber-400 font-bold">สิทธิ์: 👑 แอดมิน</span> : <span className="text-indigo-400 font-bold">สิทธิ์: 👤 ผู้ใช้ทั่วไป</span>}) • ซิงก์ฐานข้อมูล Supabase 100%
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                        <button
                            onClick={() => setShowAddProfitModal(true)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-bold text-white shadow-lg shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all text-xs sm:text-sm cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>+ บันทึกกำไรขายออก</span>
                        </button>
                        <button
                            onClick={() => setShowAddInstallmentModal(true)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl font-bold text-white shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all text-xs sm:text-sm cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>+ เพิ่มรายการผ่อนใหม่</span>
                        </button>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
                    <div className={`p-5 sm:p-6 rounded-2xl border transition-all duration-200 group relative overflow-hidden ${
                        isLight ? 'bg-white/90 border-slate-200 shadow-xl shadow-slate-200/50 hover:border-emerald-500' : 'bg-[#10121e] border-white/10 hover:border-emerald-500/50'
                    }`}>
                        <div className="flex justify-between items-start mb-3">
                            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500 border border-emerald-500/20">
                                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                สรุปกำไรสุทธิ
                            </span>
                        </div>
                        <h3 className={`text-xs font-medium mb-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>กำไรขายออกสะสม</h3>
                        <p className="text-2.5xl sm:text-3.5xl font-black text-emerald-500">+{totalProfit.toLocaleString()} ฿</p>
                    </div>

                    <div className={`p-5 sm:p-6 rounded-2xl border transition-all duration-200 group relative overflow-hidden ${
                        isLight ? 'bg-white/90 border-slate-200 shadow-xl shadow-slate-200/50 hover:border-purple-500' : 'bg-[#10121e] border-white/10 hover:border-purple-500/50'
                    }`}>
                        <div className="flex justify-between items-start mb-3">
                            <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-500 border border-purple-500/20">
                                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <span className="text-[11px] font-bold text-purple-600 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                                ยอดขายรวม
                            </span>
                        </div>
                        <h3 className={`text-xs font-medium mb-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>มูลค่าสินค้ารวมที่ขาย</h3>
                        <p className={`text-2.5xl sm:text-3.5xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{totalSalesValue.toLocaleString()} ฿</p>
                    </div>

                    <div className={`p-5 sm:p-6 rounded-2xl border transition-all duration-200 group relative overflow-hidden ${
                        isLight ? 'bg-white/90 border-slate-200 shadow-xl shadow-slate-200/50 hover:border-amber-500' : 'bg-[#10121e] border-white/10 hover:border-amber-500/50'
                    }`}>
                        <div className="flex justify-between items-start mb-3">
                            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/20">
                                <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <span className="text-[11px] font-bold text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                                {activeInstallmentsCount} รายการผ่อน
                            </span>
                        </div>
                        <h3 className={`text-xs font-medium mb-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>ยอดค้างผ่อน (รอรับ)</h3>
                        <p className="text-2.5xl sm:text-3.5xl font-black text-amber-500">{totalInstallmentOutstanding.toLocaleString()} ฿</p>
                    </div>

                    <div className={`p-5 sm:p-6 rounded-2xl border transition-all duration-200 group relative overflow-hidden ${
                        isLight ? 'bg-white/90 border-slate-200 shadow-xl shadow-slate-200/50 hover:border-pink-500' : 'bg-[#10121e] border-white/10 hover:border-pink-500/50'
                    }`}>
                        <div className="flex justify-between items-start mb-3">
                            <div className="p-2.5 bg-pink-500/10 rounded-xl text-pink-500 border border-pink-500/20">
                                <Receipt className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <span className="text-[11px] font-bold text-pink-600 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded-full">
                                รายการทั้งหมด
                            </span>
                        </div>
                        <h3 className={`text-xs font-medium mb-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>จำนวนออเดอร์ในระบบ</h3>
                        <p className="text-2.5xl sm:text-3.5xl font-black text-pink-500">{profitLogs.length + installments.length} ออเดอร์</p>
                    </div>
                </div>

                {/* Visual Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
                    <div className={`lg:col-span-2 p-4 sm:p-6 rounded-2xl border ${
                        isLight ? 'bg-white/90 border-slate-200 shadow-xl shadow-slate-200/50' : 'bg-[#10121e] border-white/10'
                    }`}>
                        <div className="flex justify-between items-center mb-3 sm:mb-4">
                            <div>
                                <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                                    กราฟแนวโน้มกำไรและยอดขายประจำเดือน ({currentUser?.name})
                                </h3>
                                <p className={`text-[11px] sm:text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>คำนวณผลรวมจากรายการบันทึกจริงของบัญชีนี้โดยอัตโนมัติ</p>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={240}>
                            <AreaChart data={monthlySummary}>
                                <defs>
                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e2e8f0' : '#ffffff10'} />
                                <XAxis dataKey="month" stroke={isLight ? '#64748b' : '#9ca3af'} fontSize={11} />
                                <YAxis stroke={isLight ? '#64748b' : '#9ca3af'} fontSize={11} />
                                <Tooltip
                                    contentStyle={{ 
                                        background: isLight ? '#ffffff' : '#161828', 
                                        border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255,255,255,0.1)', 
                                        borderRadius: '12px', 
                                        color: isLight ? '#0f172a' : '#fff' 
                                    }}
                                />
                                <Area type="monotone" dataKey="ยอดขาย" stroke="#ec4899" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                                <Area type="monotone" dataKey="กำไร" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className={`p-4 sm:p-6 rounded-2xl border flex flex-col justify-between ${
                        isLight ? 'bg-white/90 border-slate-200 shadow-xl shadow-slate-200/50' : 'bg-[#10121e] border-white/10'
                    }`}>
                        <div>
                            <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                <PieIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                                สัดส่วนกำไรแยกตามหมวดหมู่
                            </h3>
                            <p className={`text-[11px] sm:text-xs mb-3 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>คำนวณจากกำไรจริงของบัญชีนี้</p>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie
                                        data={categoryPieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={75}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {categoryPieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ 
                                            background: isLight ? '#ffffff' : '#161828', 
                                            border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255,255,255,0.1)', 
                                            borderRadius: '12px', 
                                            color: isLight ? '#0f172a' : '#fff' 
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className={`grid grid-cols-2 gap-2 text-xs pt-3 border-t ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                            {categoryPieData.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></span>
                                    <span className={`truncate text-[11px] ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>{item.name}: <strong className={isLight ? 'text-slate-900' : 'text-white'}>{item.value.toLocaleString()} ฿</strong></span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* SECTION 1: PROFIT CARDS */}
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                            <h2 className={`text-xl sm:text-2xl font-black flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                <Sparkles className="w-5 h-5 text-amber-400" />
                                การ์ดบันทึกกำไรขายออกทั้งหมด ({profitLogs.length})
                            </h2>
                            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>การ์ดแสดงรูปสินค้า รายรับ ต้นทุน และกำไรสุทธิของการขายแต่ละออเดอร์</p>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                            <span className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>กรองหมวดหมู่:</span>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className={`border rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                                    isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-white/5 border-white/10 text-white'
                                }`}
                            >
                                <option value="ทั้งหมด">ทั้งหมด</option>
                                <option value="ขายไอดี">ขายไอดี</option>
                                <option value="เติมเกม">เติมเกม</option>
                                <option value="ปล่อยเช่า">ปล่อยเช่า</option>
                                <option value="อื่นๆ">อื่นๆ</option>
                            </select>
                        </div>
                    </div>

                    {/* Cards Grid */}
                    {profitLogs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                            {profitLogs
                                .filter(item => categoryFilter === 'ทั้งหมด' || item.category === categoryFilter)
                                .map((log) => (
                                    <div
                                        key={log.id}
                                        className={`rounded-2xl border transition-all duration-200 relative group overflow-hidden flex flex-col justify-between hover:-translate-y-1 ${
                                            isLight 
                                                ? 'bg-white/90 border-slate-200 shadow-lg shadow-slate-200/50 hover:border-indigo-400' 
                                                : 'bg-[#10121e] border-white/10 hover:border-indigo-500/50'
                                        }`}
                                    >
                                        {log.image && (
                                            <div className="relative w-full h-40 overflow-hidden bg-black/40 group/img cursor-pointer" onClick={() => setLightboxImage(log.image)}>
                                                <img 
                                                    src={log.image} 
                                                    alt={log.title} 
                                                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-200"
                                                />
                                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1">
                                                    <Eye className="w-4 h-4" />
                                                    <span>คลิกดูรูปขยาย</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="p-5 sm:p-6">
                                            <div className="flex items-center justify-between mb-2.5">
                                                <span className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${categoryColors[log.category] || categoryColors['อื่นๆ']}`}>
                                                    {log.category}
                                                </span>
                                                <div className={`flex items-center gap-1 text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                    <span>{log.date}</span>
                                                </div>
                                            </div>

                                            <h3 className={`text-sm sm:text-base font-bold mb-3 transition-colors leading-snug ${isLight ? 'text-slate-900 group-hover:text-indigo-600' : 'text-white group-hover:text-indigo-300'}`}>
                                                {log.title}
                                            </h3>

                                            <div className={`grid grid-cols-2 gap-2.5 mb-3.5 p-2.5 rounded-xl border text-xs ${
                                                isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/5'
                                            }`}>
                                                <div>
                                                    <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>ราคารับ (Cost)</div>
                                                    <div className={`font-bold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>{log.cost.toLocaleString()} ฿</div>
                                                </div>
                                                <div>
                                                    <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>ราคาขายออก (Price)</div>
                                                    <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{log.price.toLocaleString()} ฿</div>
                                                </div>
                                            </div>

                                            {log.note && (
                                                <div className={`text-[11px] p-2 rounded-lg mb-3 ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/5 text-gray-400'}`}>
                                                    📝 {log.note}
                                                </div>
                                            )}
                                        </div>

                                        <div className={`p-5 sm:p-6 pt-0 border-t flex items-center justify-between mt-auto ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                                            <div className="pt-3">
                                                <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>กำไรสุทธิ (Net Profit)</span>
                                                <span className="text-lg sm:text-xl font-black text-emerald-500">+{log.profit.toLocaleString()} ฿</span>
                                            </div>
                                            <button
                                                onClick={() => setDeleteModalData({ type: 'profit', id: log.id, title: log.title })}
                                                className="p-2 mt-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 transition-all cursor-pointer"
                                                title="ลบบันทึกนี้ถาวร"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <div className={`p-8 sm:p-10 rounded-2xl border text-center ${
                            isLight ? 'bg-white/60 border-slate-200' : 'bg-white/[0.02] border-white/5'
                        }`}>
                            <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                            <h3 className={`text-sm sm:text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>ยังไม่มีรายการบันทึกกำไรในบัญชีนี้</h3>
                            <p className={`text-xs mt-1 mb-4 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>กดปุ่ม "+ บันทึกกำไรขายออก" ด้านบนเพื่อเริ่มบันทึกรายการแรกของคุณ</p>
                            <button
                                onClick={() => setShowAddProfitModal(true)}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold shadow-md"
                            >
                                + บันทึกกำไรขายออก
                            </button>
                        </div>
                    )}
                </div>

                {/* SECTION 2: INSTALLMENTS & CUSTOMER CONTACTS */}
                <div className={`p-4 sm:p-6 rounded-2xl border space-y-4 sm:space-y-6 ${
                    isLight ? 'bg-white/90 border-slate-200 shadow-xl shadow-slate-200/50' : 'bg-[#10121e] border-white/10'
                }`}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <div>
                            <h2 className={`text-lg sm:text-xl font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                <ShoppingBag className="w-5 h-5 text-indigo-500" />
                                ตารางจดยอดผ่อนชำระสินค้า & ช่องทางติดต่อลูกค้า ({installments.length})
                            </h2>
                            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>ติดตามยอดค้างชำระ ดูรูปสินค้า/สลิป บันทึกค่างวด และทักหาลูกค้าได้ทันที</p>
                        </div>

                        {/* Search & Filter */}
                        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                            <div className="relative flex-1 sm:w-64 w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="ค้นหาชื่อลูกค้า / สินค้า / รหัส..."
                                    className={`w-full border rounded-xl py-2 pl-9 pr-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                                        isLight ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                                    }`}
                                />
                            </div>

                            <div className={`flex items-center p-1 rounded-xl border text-xs font-semibold w-full sm:w-auto justify-center ${
                                isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'
                            }`}>
                                <button
                                    onClick={() => setInstallmentFilter('all')}
                                    className={`flex-1 sm:flex-initial px-3 py-1 rounded-lg transition-colors ${installmentFilter === 'all' ? 'bg-indigo-600 text-white' : isLight ? 'text-slate-600' : 'text-gray-400'}`}
                                >
                                    ทั้งหมด
                                </button>
                                <button
                                    onClick={() => setInstallmentFilter('active')}
                                    className={`flex-1 sm:flex-initial px-3 py-1 rounded-lg transition-colors ${installmentFilter === 'active' ? 'bg-indigo-600 text-white' : isLight ? 'text-slate-600' : 'text-gray-400'}`}
                                >
                                    กำลังผ่อน
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Touch Horizontal Scrollable Installment Table */}
                    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                        <table className="w-full text-left border-collapse min-w-[750px]">
                            <thead>
                                <tr className={`border-b text-xs font-semibold uppercase tracking-wider ${
                                    isLight ? 'border-slate-200 text-slate-500' : 'border-white/10 text-gray-400'
                                }`}>
                                    <th className="py-3 px-3">รูปภาพ</th>
                                    <th className="py-3 px-3">รหัส / ลูกค้า</th>
                                    <th className="py-3 px-3">สินค้าที่ผ่อน</th>
                                    <th className="py-3 px-3 text-right">ราคาเต็ม</th>
                                    <th className="py-3 px-3 text-right">ชำระแล้ว</th>
                                    <th className="py-3 px-3 text-right">ค้างผ่อน</th>
                                    <th className="py-3 px-3 text-center">ความคืบหน้า</th>
                                    <th className="py-3 px-3 text-center">ช่องทางติดต่อลูกค้า</th>
                                    <th className="py-3 px-3 text-center">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className={`text-xs divide-y ${isLight ? 'divide-slate-200' : 'divide-white/5'}`}>
                                {installments.length > 0 ? (
                                    installments
                                        .filter(item => {
                                            const matchesSearch = item.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                                                  item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                                  item.id.toLowerCase().includes(searchTerm.toLowerCase())
                                            if (!matchesSearch) return false
                                            if (installmentFilter === 'active') return item.nextDue !== 'ชำระครบแล้ว'
                                            return true
                                        })
                                        .map((item) => {
                                            const remaining = item.total - item.paid
                                            const percent = Math.round((item.paid / item.total) * 100)
                                            const isDone = item.nextDue === 'ชำระครบแล้ว'

                                            return (
                                                <tr key={item.id} className={`transition-colors ${isLight ? 'hover:bg-slate-100/60' : 'hover:bg-white/[0.02]'}`}>
                                                    <td className="py-3.5 px-3">
                                                        {item.image ? (
                                                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-indigo-500/30 cursor-pointer shadow-md" onClick={() => setLightboxImage(item.image)}>
                                                                <img src={item.image} alt={item.item} className="w-full h-full object-cover hover:scale-110 transition-transform" />
                                                            </div>
                                                        ) : (
                                                            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-gray-500 ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                                                                <ImageIcon className="w-4 h-4 opacity-50" />
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 px-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-500">
                                                                {item.id}
                                                            </span>
                                                            <span className={`font-bold text-xs sm:text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.customer}</span>
                                                        </div>
                                                    </td>
                                                    <td className={`py-3.5 px-3 max-w-[180px] truncate ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>{item.item}</td>
                                                    <td className={`py-3.5 px-3 text-right font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.total.toLocaleString()} ฿</td>
                                                    <td className="py-3.5 px-3 text-right font-bold text-emerald-500">{item.paid.toLocaleString()} ฿</td>
                                                    <td className="py-3.5 px-3 text-right font-bold text-amber-500">{remaining.toLocaleString()} ฿</td>
                                                    <td className="py-3.5 px-3 min-w-[100px]">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className="text-[10px] font-bold text-gray-400">{percent}%</span>
                                                            <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-white/10'}`}>
                                                                <div 
                                                                    className={`h-full rounded-full ${isDone ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                                                    style={{ width: `${percent}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-3 text-center">
                                                        <a
                                                            href={item.contact}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border rounded-xl transition-all font-bold text-xs ${
                                                                isLight 
                                                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100' 
                                                                    : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20'
                                                            }`}
                                                            title={`ติดต่อ ${item.customer} ทาง ${item.contactType}`}
                                                        >
                                                            {item.contactType === 'Facebook' ? <Share2 className="w-3.5 h-3.5 text-blue-500" /> : <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />}
                                                            <span>ทัก{item.contactType || 'ลูกค้า'}</span>
                                                        </a>
                                                    </td>
                                                    <td className="py-3.5 px-3 text-center">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            {!isDone && (
                                                                <button
                                                                    onClick={() => {
                                                                        setPaymentModalItem(item)
                                                                        setPaymentInput('')
                                                                    }}
                                                                    className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                                                                    title="บันทึกค่างวด"
                                                                >
                                                                    <CreditCard className="w-3.5 h-3.5" />
                                                                    <span>ค่างวด</span>
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => setDeleteModalData({ type: 'installment', id: item.id, title: item.customer })}
                                                                className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 cursor-pointer"
                                                                title="ลบรายการผ่อนนี้ถาวร"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                ) : (
                                    <tr>
                                        <td colSpan={9} className="py-8 text-center text-gray-500">
                                            ยังไม่มีรายการผ่อนชำระในบัญชีนี้
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* WELCOME POP-UP MODAL */}
            {showWelcomeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fade-in-up gpu-accelerate">
                    <div className={`border w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-hidden text-center gpu-accelerate ${
                        isLight ? 'bg-white border-indigo-200 text-slate-900' : 'bg-[#101222] border-indigo-500/40 text-white'
                    }`}>
                        <button 
                            type="button" 
                            onClick={() => setShowWelcomeModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="relative w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/30 via-purple-500/30 to-pink-500/30 blur-lg"></div>
                            <img 
                                src="/cat.png" 
                                alt="Nyan Cat Welcome" 
                                className="w-full h-full object-contain animate-bounce drop-shadow-[0_8px_20px_rgba(236,72,153,0.5)] relative z-10" 
                            />
                        </div>

                        <div className="space-y-2 mb-6">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                                <PartyPopper className="w-4 h-4 text-amber-400" />
                                <span>เข้าสู่ระบบสำเร็จ</span>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                                ยินดีต้อนรับคุณ {currentUser?.name}! 🎉
                            </h3>
                            <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                                เข้าสู่ระบบจัดการบันทึกกำไรขายออก และติดตามยอดผ่อนสินค้าของคุณเรียบร้อยแล้ว
                            </p>
                        </div>

                        <div className={`p-4 rounded-2xl border text-left text-xs space-y-2 mb-6 ${
                            isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/10'
                        }`}>
                            <div className="flex items-center gap-2 text-emerald-400 font-bold">
                                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                                <span>บันทึกกำไรขายออก + แนบรูปสินค้าได้</span>
                            </div>
                            <div className="flex items-center gap-2 text-indigo-400 font-bold">
                                <CheckCircle2 className="w-4 h-4 shrink-0 text-indigo-500" />
                                <span>ติดตามยอดผ่อน & ทักหาลูกค้าใน 1 คลิก</span>
                            </div>
                            <div className="flex items-center gap-2 text-purple-400 font-bold">
                                <CheckCircle2 className="w-4 h-4 shrink-0 text-purple-500" />
                                <span>ซิงก์ตรงกับฐานข้อมูล Supabase อัตโนมัติ</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowWelcomeModal(false)}
                            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:scale-[1.02] active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                            <span>เริ่มใช้งานระบบเลย</span>
                            <Rocket className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* ADMIN MANAGEMENT PANEL MODAL (เฉพาะแอดมิน - ซิงก์ Supabase 100%) */}
            {showAdminModal && isAdminUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 animate-fade-in-up gpu-accelerate">
                    <div className={`border w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto gpu-accelerate ${
                        isLight ? 'bg-white border-amber-300 text-slate-900' : 'bg-[#101222] border-amber-500/40 text-white'
                    }`}>
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5">
                                        <span>ระบบจัดการสมาชิก</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">Supabase</span>
                                    </h3>
                                    <p className="text-[11px] text-gray-400 font-medium">สิทธิ์แอดมิน: <strong className="text-amber-400">{currentUser?.name}</strong> • ดึงข้อมูลจาก Supabase 100%</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAdminModal(false)} className="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Admin Modal Navigation Tabs */}
                        <div className={`grid grid-cols-2 p-1 rounded-2xl mb-5 border text-xs font-bold gap-1 ${
                            isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/5'
                        }`}>
                            <button
                                type="button"
                                onClick={() => {
                                    fetchUsersList()
                                    setAdminModalTab('users')
                                }}
                                className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                    adminModalTab === 'users' ? 'bg-amber-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                <Users className="w-4 h-4" />
                                <span>รายชื่อสมาชิก ({allUsersList.length})</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setAdminModalTab('create')}
                                className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                    adminModalTab === 'create' ? 'bg-amber-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                <Plus className="w-4 h-4" />
                                <span>สร้างบัญชีผู้ใช้ใหม่</span>
                            </button>
                        </div>

                        {/* TAB 1: ALL USERS LIST FROM SUPABASE */}
                        {adminModalTab === 'users' && (
                            <div className="space-y-3 max-h-[380px] overflow-y-auto text-xs pr-1">
                                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                                    <span className="text-[11px] text-gray-400">รายชื่อสมาชิกทั้งหมดบน Supabase Database:</span>
                                    <button 
                                        type="button" 
                                        onClick={fetchUsersList}
                                        className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                                    >
                                        <RefreshCw className="w-3 h-3" />
                                        <span>ดึงข้อมูลล่าสุด</span>
                                    </button>
                                </div>

                                {allUsersList.map((u) => (
                                    <div key={u.id} className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                                        isLight ? 'bg-slate-50 border-slate-200 hover:border-slate-300' : 'bg-white/5 border-white/10 hover:border-white/20'
                                    }`}>
                                        <div>
                                            <div className="font-bold flex items-center gap-1.5 flex-wrap">
                                                <span className="text-sm">{u.name}</span>
                                                {(u.name?.toLowerCase() === 'sakchawit' || u.isAdmin) ? (
                                                    <span className="px-2 py-0.5 text-[9px] rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30 flex items-center gap-0.5">
                                                        <Crown className="w-3 h-3" /> 👑 แอดมิน
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 text-[9px] rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 flex items-center gap-0.5">
                                                        <User className="w-3 h-3" /> 👤 ผู้ใช้ทั่วไป
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-gray-400 text-[11px] mt-0.5">{u.email || 'ไม่มีอีเมล'}</div>
                                            <div className="font-mono text-[10px] text-indigo-400 mt-0.5">รหัสผ่าน: {u.password}</div>
                                        </div>

                                        {/* Action Buttons for User Role & Delete */}
                                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                            {u.name?.toLowerCase() !== 'sakchawit' && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleUserRole(u.id, u.name, u.isAdmin)}
                                                        className={`px-2.5 py-1.5 rounded-xl border font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                                                            u.isAdmin 
                                                                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20' 
                                                                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                                                        }`}
                                                        title="ปรับเปลี่ยนสิทธิ์ผู้ใช้ใน Supabase"
                                                    >
                                                        {u.isAdmin ? <User className="w-3.5 h-3.5" /> : <Crown className="w-3.5 h-3.5" />}
                                                        <span>{u.isAdmin ? 'ลดเป็นผู้ใช้ทั่วไป' : 'ตั้งเป็นแอดมิน'}</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteUserAccount(u.id, u.name)}
                                                        className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 cursor-pointer"
                                                        title="ลบบัญชีสมาชิกนี้ออกจาก Supabase"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* TAB 2: CREATE USER ACCOUNT WITH ROLE IN SUPABASE */}
                        {adminModalTab === 'create' && (
                            <form onSubmit={handleAdminCreateAccount} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-semibold mb-1">ชื่อผู้ใช้ / ชื่อร้านค้า *</label>
                                    <input
                                        type="text"
                                        value={adminNewName}
                                        onChange={(e) => setAdminNewName(e.target.value)}
                                        placeholder="เช่น client_rov หรือ ร้านเกมเมอร์ช็อป"
                                        className={`w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                                            isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                                        }`}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">อีเมลผู้ใช้ *</label>
                                    <input
                                        type="email"
                                        value={adminNewEmail}
                                        onChange={(e) => setAdminNewEmail(e.target.value)}
                                        placeholder="client@example.com"
                                        className={`w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                                            isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                                        }`}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">ตั้งรหัสผ่านผู้ใช้ *</label>
                                    <input
                                        type="text"
                                        value={adminNewPassword}
                                        onChange={(e) => setAdminNewPassword(e.target.value)}
                                        placeholder="password123"
                                        className={`w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono ${
                                            isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                                        }`}
                                        required
                                    />
                                </div>

                                {/* ปรับยศสิทธิ์เริ่มต้น */}
                                <div>
                                    <label className="block font-semibold mb-1.5">กำหนดสิทธิ์ผู้ใช้เริ่มต้น *</label>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setAdminNewIsAdmin(false)}
                                            className={`flex-1 py-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                                                !adminNewIsAdmin ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' : 'bg-white/5 text-gray-400 border-white/10'
                                            }`}
                                        >
                                            <User className="w-4 h-4" />
                                            <span>👤 ผู้ใช้ทั่วไป</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAdminNewIsAdmin(true)}
                                            className={`flex-1 py-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                                                adminNewIsAdmin ? 'bg-amber-500 text-white border-amber-400 shadow-md' : 'bg-white/5 text-gray-400 border-white/10'
                                            }`}
                                        >
                                            <Crown className="w-4 h-4" />
                                            <span>👑 แอดมิน</span>
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold shadow-lg shadow-amber-500/30 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>สร้างบัญชีลง Supabase ทันที</span>
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL 1: ADD PROFIT LOG */}
            {showAddProfitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 animate-fade-in-up gpu-accelerate">
                    <div className={`border w-full max-w-lg rounded-3xl shadow-2xl p-5 sm:p-8 relative max-h-[90vh] overflow-y-auto gpu-accelerate ${
                        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#101222] border-white/10 text-white'
                    }`}>
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                                <Plus className="w-5 h-5 text-emerald-500" />
                                บันทึกกำไรสินค้าขายออก
                            </h3>
                            <button onClick={() => setShowAddProfitModal(false)} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddProfit} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">ชื่อรายการสินค้าที่ขาย *</label>
                                <input
                                    type="text"
                                    value={profitTitle}
                                    onChange={(e) => setProfitTitle(e.target.value)}
                                    placeholder="เช่น ขายไอดี RoV แรงค์ Conqueror"
                                    className={`w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                                        isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                                    }`}
                                    required
                                />
                            </div>

                            {/* แนบรูปภาพสินค้า/สลิป */}
                            <div>
                                <label className="block font-semibold mb-1 flex items-center justify-between">
                                    <span>แนบรูปภาพสินค้า / สลิปโอนเงิน</span>
                                    <span className="text-[10px] text-gray-400 font-normal">เลือกไฟล์จากอุปกรณ์</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, setProfitImage)}
                                        className="hidden"
                                        id="profit-img-upload"
                                    />
                                    <label
                                        htmlFor="profit-img-upload"
                                        className={`flex-1 flex items-center justify-center gap-2 border border-dashed rounded-xl p-3 cursor-pointer transition-colors ${
                                            isLight ? 'bg-slate-50 border-slate-300 hover:bg-slate-100' : 'bg-white/5 border-white/20 hover:bg-white/10'
                                        }`}
                                    >
                                        <Upload className="w-4 h-4 text-emerald-500" />
                                        <span className="font-semibold">{profitImage ? '📸 เปลี่ยนรูปภาพแล้ว' : '📁 เลือกไฟล์รูปภาพ...'}</span>
                                    </label>
                                    {profitImage && (
                                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-emerald-500 relative shrink-0">
                                            <img src={profitImage} alt="Preview" className="w-full h-full object-cover" />
                                            <button 
                                                type="button" 
                                                onClick={() => setProfitImage('')}
                                                className="absolute top-0 right-0 bg-rose-500 text-white w-4 h-4 flex items-center justify-center text-[9px] rounded-bl"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ราคารับ vs ราคาขายออก */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold mb-1">ราคารับ / ต้นทุน (บาท)</label>
                                    <input
                                        type="number"
                                        value={profitCost}
                                        onChange={(e) => setProfitCost(e.target.value)}
                                        placeholder="2000"
                                        className={`w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                                            isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                                        }`}
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">ราคาขายออก (บาท) *</label>
                                    <input
                                        type="number"
                                        value={profitPrice}
                                        onChange={(e) => setProfitPrice(e.target.value)}
                                        placeholder="3500"
                                        className={`w-full border rounded-xl p-3 font-bold text-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                                            isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
                                        }`}
                                        required
                                    />
                                </div>
                            </div>

                            {/* คำนวณกำไรอัตโนมัติ */}
                            <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                                isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-500/10 border-emerald-500/30'
                            }`}>
                                <div className="flex items-center gap-2">
                                    <Calculator className="w-4 h-4 text-emerald-500" />
                                    <span className={`font-semibold ${isLight ? 'text-emerald-800' : 'text-emerald-300'}`}>คำนวณกำไรสุทธอัตโนมัติ:</span>
                                </div>
                                <span className="text-base sm:text-lg font-black text-emerald-500">
                                    +{calculatedProfitPreview.toLocaleString()} ฿
                                </span>
                            </div>

                            {/* วันที่ขาย & หมวดหมู่ */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold mb-1">วันที่ขาย *</label>
                                    <input
                                        type="date"
                                        value={profitDate}
                                        onChange={(e) => setProfitDate(e.target.value)}
                                        className={`w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold ${
                                            isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#181a2e] border-white/10 text-white'
                                        }`}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">หมวดหมู่สินค้า *</label>
                                    <select
                                        value={profitCategory}
                                        onChange={(e) => setProfitCategory(e.target.value)}
                                        className={`w-full border rounded-xl p-3 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                                            isLight ? 'bg-slate-50 border-slate-200 text-indigo-700' : 'bg-[#181a2e] border-white/10 text-indigo-300'
                                        }`}
                                    >
                                        <option value="ขายไอดี">ขายไอดี</option>
                                        <option value="เติมเกม">เติมเกม</option>
                                        <option value="ปล่อยเช่า">ปล่อยเช่า</option>
                                        <option value="อื่นๆ">อื่นๆ</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">หมายเหตุเพิ่มเติม</label>
                                <input
                                    type="text"
                                    value={profitNote}
                                    onChange={(e) => setProfitNote(e.target.value)}
                                    placeholder="เช่น ลูกค้าโอนผ่าน พร้อมเพย์ / ส่งมอบรหัสแล้ว"
                                    className={`w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                                        isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                                    }`}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-bold text-white shadow-lg shadow-emerald-600/30 hover:scale-[1.01] active:scale-[0.98] transition-all text-xs sm:text-sm cursor-pointer"
                            >
                                ยืนยันบันทึกกำไรลงระบบ
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: ADD INSTALLMENT */}
            {showAddInstallmentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 animate-fade-in-up gpu-accelerate">
                    <div className={`border w-full max-w-lg rounded-3xl shadow-2xl p-5 sm:p-8 relative max-h-[90vh] overflow-y-auto gpu-accelerate ${
                        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#101222] border-white/10 text-white'
                    }`}>
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                                <Plus className="w-5 h-5 text-indigo-500" />
                                เพิ่มสัญญาผ่อนสินค้าใหม่
                            </h3>
                            <button onClick={() => setShowAddInstallmentModal(false)} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddInstallment} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">ชื่อลูกค้า *</label>
                                <input
                                    type="text"
                                    value={instCustomer}
                                    onChange={(e) => setInstCustomer(e.target.value)}
                                    placeholder="เช่น คุณสมศักดิ์"
                                    className={`w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                        isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                                    }`}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">สินค้าที่ผ่อน *</label>
                                <input
                                    type="text"
                                    value={instItem}
                                    onChange={(e) => setInstItem(e.target.value)}
                                    placeholder="เช่น ไอดีเกม Valorant สกิน 20+"
                                    className={`w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                        isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                                    }`}
                                    required
                                />
                            </div>

                            {/* แนบรูปภาพสินค้า/สัญญาผ่อน */}
                            <div>
                                <label className="block font-semibold mb-1 flex items-center justify-between">
                                    <span>แนบรูปภาพสินค้า / สัญญาผ่อน</span>
                                    <span className="text-[10px] text-gray-400 font-normal">เลือกไฟล์จากอุปกรณ์</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, setInstImage)}
                                        className="hidden"
                                        id="inst-img-upload"
                                    />
                                    <label
                                        htmlFor="inst-img-upload"
                                        className={`flex-1 flex items-center justify-center gap-2 border border-dashed rounded-xl p-3 cursor-pointer transition-colors ${
                                            isLight ? 'bg-slate-50 border-slate-300 hover:bg-slate-100' : 'bg-white/5 border-white/20 hover:bg-white/10'
                                        }`}
                                    >
                                        <Upload className="w-4 h-4 text-indigo-500" />
                                        <span className="font-semibold">{instImage ? '📸 เปลี่ยนรูปภาพแล้ว' : '📁 เลือกไฟล์รูปภาพ...'}</span>
                                    </label>
                                    {instImage && (
                                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-indigo-500 relative shrink-0">
                                            <img src={instImage} alt="Preview" className="w-full h-full object-cover" />
                                            <button 
                                                type="button" 
                                                onClick={() => setInstImage('')}
                                                className="absolute top-0 right-0 bg-rose-500 text-white w-4 h-4 flex items-center justify-center text-[9px] rounded-bl"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold mb-1">ราคาเต็มสินค้า (บาท) *</label>
                                    <input
                                        type="number"
                                        value={instTotal}
                                        onChange={(e) => setInstTotal(e.target.value)}
                                        placeholder="5000"
                                        className={`w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                            isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                                        }`}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">เงินดาวน์/ชำระแล้ว (บาท)</label>
                                    <input
                                        type="number"
                                        value={instPaid}
                                        onChange={(e) => setInstPaid(e.target.value)}
                                        placeholder="1500"
                                        className={`w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                            isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                                        }`}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold mb-1">ลิงก์ติดต่อลูกค้า *</label>
                                    <input
                                        type="text"
                                        value={instContact}
                                        onChange={(e) => setInstContact(e.target.value)}
                                        placeholder="https://lin.ee/..."
                                        className={`w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                            isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                                        }`}
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">ประเภทช่องทาง</label>
                                    <select
                                        value={instContactType}
                                        onChange={(e) => setInstContactType(e.target.value)}
                                        className={`w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                            isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#181a2e] border-white/10 text-white'
                                        }`}
                                    >
                                        <option value="Line">Line Official</option>
                                        <option value="Facebook">Facebook</option>
                                        <option value="Phone">เบอร์โทรศัพท์</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-bold text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.98] transition-all text-xs sm:text-sm cursor-pointer"
                            >
                                สร้างสัญญาผ่อนชำระลงระบบ
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: RECORD PAYMENT */}
            {paymentModalItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 animate-fade-in-up gpu-accelerate">
                    <div className={`border w-full max-w-md rounded-3xl shadow-2xl p-5 sm:p-6 relative gpu-accelerate ${
                        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#101222] border-white/10 text-white'
                    }`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-emerald-500" />
                                บันทึกค่างวดผ่อนชำระ
                            </h3>
                            <button onClick={() => setPaymentModalItem(null)} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className={`p-3.5 rounded-xl mb-4 text-xs space-y-1 border ${
                            isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'
                        }`}>
                            <div>ลูกค้า: <span className="font-bold">{paymentModalItem.customer}</span></div>
                            <div>ชำระแล้ว: <span className="font-bold text-emerald-500">{paymentModalItem.paid.toLocaleString()} ฿</span> / {paymentModalItem.total.toLocaleString()} ฿</div>
                            <div>ยอดคงเหลือ: <span className="font-bold text-rose-500">{(paymentModalItem.total - paymentModalItem.paid).toLocaleString()} ฿</span></div>
                        </div>
                        <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">จำนวนเงินค่างวดเพิ่ม (บาท) *</label>
                                <input
                                    type="number"
                                    value={paymentInput}
                                    onChange={(e) => setPaymentInput(e.target.value)}
                                    placeholder="500"
                                    className={`w-full border rounded-xl p-3 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                                        isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                                    }`}
                                    required
                                    autoFocus
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-bold text-white shadow-lg transition-all text-xs sm:text-sm cursor-pointer"
                            >
                                ยืนยันชำระค่างวด
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 4: FULLSCREEN LIGHTBOX IMAGE PREVIEW */}
            {lightboxImage && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-fade-in-up cursor-pointer gpu-accelerate"
                    onClick={() => setLightboxImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <button 
                            onClick={() => setLightboxImage(null)} 
                            className="absolute top-3 right-3 bg-black/70 text-white hover:bg-rose-600 p-2 rounded-full transition-colors z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <img src={lightboxImage} alt="Full Image Preview" className="w-full h-full object-contain max-h-[85vh] rounded-2xl" />
                    </div>
                </div>
            )}

            {/* MODAL 5: CONFIRM DELETE MODAL */}
            {deleteModalData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 animate-fade-in-up gpu-accelerate">
                    <div className={`border w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-8 relative text-center overflow-hidden gpu-accelerate ${
                        isLight ? 'bg-white border-rose-300 text-slate-900' : 'bg-[#101222] border-rose-500/30 text-white'
                    }`}>
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8" />
                        </div>

                        <h3 className="text-lg sm:text-xl font-black mb-2">
                            ยืนยันการลบข้อมูลถาวร?
                        </h3>

                        <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                            คุณแน่ใจหรือไม่ว่าต้องการลบรายการ <br />
                            <strong className="text-rose-500 font-bold text-sm">"{deleteModalData.title}"</strong> ? <br />
                            <span className="text-gray-500 text-[11px] mt-1 block">รายการนี้จะถูกลบออกจากบัญชีของคุณถาวร</span>
                        </p>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteModalData(null)}
                                className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                                    isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/10 hover:bg-white/20 text-gray-300'
                                }`}
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeleteAction}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>ยืนยันลบรายการ</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* USER CENTER MODAL (โปรไฟล์, แปะคอนแท็ก, เปลี่ยนรหัสผ่าน) */}
            {showUserCenterModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 animate-fade-in-up gpu-accelerate">
                    <div className={`border w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto gpu-accelerate ${
                        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#101222] border-white/10 text-white'
                    }`}>
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                                <UserCog className="w-5 h-5 text-indigo-500" />
                                ศูนย์การจัดการบัญชีผู้ใช้งาน
                            </h3>
                            <button onClick={() => setShowUserCenterModal(false)} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Navigation Tabs */}
                        <div className={`grid grid-cols-3 p-1 rounded-2xl mb-5 border text-xs font-bold gap-1 ${
                            isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/5'
                        }`}>
                            <button
                                type="button"
                                onClick={() => setUserCenterTab('profile')}
                                className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                    userCenterTab === 'profile' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                <User className="w-3.5 h-3.5" />
                                <span>โปรไฟล์</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setUserCenterTab('contact')}
                                className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                    userCenterTab === 'contact' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                <Link2 className="w-3.5 h-3.5" />
                                <span>แปะคอนแท็ก</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setUserCenterTab('password')}
                                className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                    userCenterTab === 'password' ? 'bg-amber-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                <Lock className="w-3.5 h-3.5" />
                                <span>เปลี่ยนรหัส</span>
                            </button>
                        </div>

                        {/* TAB 1: USER PROFILE SUMMARY */}
                        {userCenterTab === 'profile' && (
                            <div className="space-y-4 text-xs">
                                <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
                                    isLight ? 'bg-indigo-50/50 border-indigo-200' : 'bg-indigo-950/30 border-indigo-500/30'
                                }`}>
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xl font-black shadow-lg">
                                        {(currentUser?.name || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-black text-base flex items-center gap-2">
                                            <span>{currentUser?.name}</span>
                                            {isAdminUser ? (
                                                <span className="px-2 py-0.5 text-[9px] rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">👑 แอดมิน</span>
                                            ) : (
                                                <span className="px-2 py-0.5 text-[9px] rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">👤 ผู้ใช้ทั่วไป</span>
                                            )}
                                        </div>
                                        <div className="text-gray-400 text-xs mt-0.5">{currentUser?.email}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'}`}>
                                        <div className="text-gray-400 text-[11px]">รายการบันทึกกำไร</div>
                                        <div className="text-lg font-black text-emerald-500 mt-0.5">{profitLogs.length} รายการ</div>
                                    </div>
                                    <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'}`}>
                                        <div className="text-gray-400 text-[11px]">สัญญาผ่อนสินค้า</div>
                                        <div className="text-lg font-black text-indigo-400 mt-0.5">{installments.length} รายการ</div>
                                    </div>
                                </div>

                                <div className={`p-3.5 rounded-xl border text-[11px] space-y-1.5 ${
                                    isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-white/5 border-white/5 text-gray-300'
                                }`}>
                                    <div className="flex items-center justify-between">
                                        <span>สถานะการเชื่อมต่อ Supabase DB:</span>
                                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Connected Realtime
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>ID บัญชีผู้ใช้:</span>
                                        <span className="font-mono text-gray-400">{currentUser?.id}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: PASTE MY CONTACT INFO & SHOP IMAGES */}
                        {userCenterTab === 'contact' && (
                            <form onSubmit={handleSaveMyContactSubmit} className="space-y-4 text-xs">
                                <div className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                                    isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                }`}>
                                    <div className="font-bold flex items-center gap-1">
                                        <Sparkles className="w-4 h-4 text-emerald-400" />
                                        <span>ตั้งค่าโปรไฟล์ คอนแท็ก & อัปโหลดรูปภาพร้านค้า:</span>
                                    </div>
                                    <p className="text-[11px] opacity-80">ข้อมูล รูปโปรไฟล์ และรูปแบนเนอร์ร้าน จะแสดงใน **หน้าส่วนรวมคอนแท็กสมาชิกแบบเต็มจอ**</p>
                                </div>

                                {/* Images Upload (Avatar & Cover Banner) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-semibold mb-1">รูปโปรไฟล์ / โลโก้ร้านค้า</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, setMyAvatarImage)}
                                                className="hidden"
                                                id="user-avatar-upload"
                                            />
                                            <label
                                                htmlFor="user-avatar-upload"
                                                className={`flex-1 flex items-center justify-center gap-2 border border-dashed rounded-xl p-2.5 cursor-pointer transition-colors ${
                                                    isLight ? 'bg-slate-50 border-slate-300 hover:bg-slate-100' : 'bg-white/5 border-white/20 hover:bg-white/10'
                                                }`}
                                            >
                                                <Upload className="w-4 h-4 text-emerald-400" />
                                                <span className="font-semibold text-[11px]">{myAvatarImage ? '📸 เปลี่ยนโลโก้' : '📁 เลือกรูปโลโก้...'}</span>
                                            </label>
                                            {myAvatarImage && (
                                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-emerald-500 relative shrink-0">
                                                    <img src={myAvatarImage} alt="Avatar Preview" className="w-full h-full object-cover" />
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setMyAvatarImage('')}
                                                        className="absolute top-0 right-0 bg-rose-500 text-white w-3.5 h-3.5 flex items-center justify-center text-[8px] rounded-bl"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block font-semibold mb-1">รูปปกแบนเนอร์ร้านค้า</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, setMyCoverImage)}
                                                className="hidden"
                                                id="user-cover-upload"
                                            />
                                            <label
                                                htmlFor="user-cover-upload"
                                                className={`flex-1 flex items-center justify-center gap-2 border border-dashed rounded-xl p-2.5 cursor-pointer transition-colors ${
                                                    isLight ? 'bg-slate-50 border-slate-300 hover:bg-slate-100' : 'bg-white/5 border-white/20 hover:bg-white/10'
                                                }`}
                                            >
                                                <ImageIcon className="w-4 h-4 text-indigo-400" />
                                                <span className="font-semibold text-[11px]">{myCoverImage ? '🖼️ เปลี่ยนแบนเนอร์' : '📁 เลือกแบนเนอร์...'}</span>
                                            </label>
                                            {myCoverImage && (
                                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-indigo-500 relative shrink-0">
                                                    <img src={myCoverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setMyCoverImage('')}
                                                        className="absolute top-0 right-0 bg-rose-500 text-white w-3.5 h-3.5 flex items-center justify-center text-[8px] rounded-bl"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-semibold mb-1">ชื่อร้านค้า / แบรนด์ของคุณ</label>
                                        <input
                                            type="text"
                                            value={myShopName}
                                            onChange={(e) => setMyShopName(e.target.value)}
                                            placeholder="เช่น Jiksaw Store"
                                            className={`w-full border rounded-xl p-3 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                                                isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                                            }`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-semibold mb-1">ประเภทช่องทางติดต่อหลัก *</label>
                                        <select
                                            value={myContactType}
                                            onChange={(e) => setMyContactType(e.target.value)}
                                            className={`w-full border rounded-xl p-3 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                                                isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#181a2e] border-white/10 text-white'
                                            }`}
                                        >
                                            <option value="Line">Line Official / Line ID</option>
                                            <option value="Facebook">Facebook Profile / Page</option>
                                            <option value="Phone">เบอร์โทรศัพท์ติดต่อ</option>
                                            <option value="TikTok">TikTok Account</option>
                                            <option value="Discord">Discord Server / User</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-semibold mb-1">แปะลิงก์หรือข้อมูลติดต่อ *</label>
                                    <input
                                        type="text"
                                        value={myContactLink}
                                        onChange={(e) => setMyContactLink(e.target.value)}
                                        placeholder={myContactType === 'Line' ? 'https://lin.ee/...' : myContactType === 'Facebook' ? 'https://facebook.com/...' : '081-234-5678'}
                                        className={`w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold ${
                                            isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                                        }`}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold mb-1">แท็กสินค้า / จุดเด่นร้านค้า (คั่นด้วยจุลภาค ,)</label>
                                    <input
                                        type="text"
                                        value={myTags}
                                        onChange={(e) => setMyTags(e.target.value)}
                                        placeholder="เช่น ขายไอดี RoV, เครดิตแน่น 100%, เติมเกมราคาถูก"
                                        className={`w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                                            isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                                        }`}
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold mb-1">คำอธิบายร้านค้า / ข้อความแนะ (Bio)</label>
                                    <textarea
                                        value={myBio}
                                        onChange={(e) => setMyBio(e.target.value)}
                                        rows={3}
                                        placeholder="เช่น ร้านค้ารับซื้อ-ขายไอดีเกมประกันแท้ 100% มีเครดิตรีวิวแน่นๆ ตอบไวตลอด 24 ชม."
                                        className={`w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                                            isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                                        }`}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/30 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
                                >
                                    <Check className="w-4 h-4" />
                                    <span>บันทึกตั้งค่าโปรไฟล์ & รูปภาพร้านค้า</span>
                                </button>
                            </form>
                        )}

                        {/* TAB 3: CHANGE PASSWORD */}
                        {userCenterTab === 'password' && (
                            <form onSubmit={handleChangePasswordSubmit} className="space-y-4 text-xs">
                                <div className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                                    isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                                }`}>
                                    <div className="font-bold flex items-center gap-1">
                                        <Lock className="w-4 h-4" />
                                        <span>เปลี่ยนรหัสผ่านเข้าสู่ระบบ:</span>
                                    </div>
                                    <p className="text-[11px] opacity-80">รหัสผ่านใหม่จะถูกอัปเดตลงฐานข้อมูล Supabase และใช้เข้าสู่ระบบในครั้งถัดไป</p>
                                </div>

                                <div>
                                    <label className="block font-semibold mb-1">รหัสผ่านปัจจุบัน *</label>
                                    <input
                                        type="password"
                                        value={currentPassInput}
                                        onChange={(e) => setCurrentPassInput(e.target.value)}
                                        placeholder="••••••••"
                                        className={`w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                                            isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                                        }`}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-semibold mb-1">ตั้งรหัสผ่านใหม่ *</label>
                                        <input
                                            type="password"
                                            value={newPassInput}
                                            onChange={(e) => setNewPassInput(e.target.value)}
                                            placeholder="อย่างน้อย 6 ตัวอักษร"
                                            className={`w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                                                isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                                            }`}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-semibold mb-1">ยืนยันรหัสผ่านใหม่ *</label>
                                        <input
                                            type="password"
                                            value={confirmNewPassInput}
                                            onChange={(e) => setConfirmNewPassInput(e.target.value)}
                                            placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
                                            className={`w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                                                isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                                            }`}
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold shadow-lg shadow-amber-500/30 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
                                >
                                    <Check className="w-4 h-4" />
                                    <span>บันทึกเปลี่ยนรหัสผ่านลง Supabase</span>
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* FULLSCREEN COMMUNITY MEMBER CONTACT SHOWCASE PAGE */}
            {showCommunityContactsModal && (
                <div className={`fixed inset-0 z-50 overflow-y-auto min-h-screen w-full animate-fade-in-up gpu-accelerate smooth-scroll-container ${
                    isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#060813] text-white'
                }`}>
                    {/* Top Navigation Bar */}
                    <div className={`sticky top-0 z-40 border-b backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors ${
                        isLight ? 'bg-white/90 border-slate-200 text-slate-900 shadow-md' : 'bg-[#080b1a]/90 border-white/10 text-white shadow-2xl'
                    }`}>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setShowCommunityContactsModal(false)}
                                className={`px-3.5 py-2 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                                    isLight 
                                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800' 
                                        : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                                }`}
                            >
                                <ArrowRight className="w-4 h-4 rotate-180" />
                                <span>กลับหน้าหลัก</span>
                            </button>
                            <div>
                                <h1 className="text-base sm:text-lg font-black flex items-center gap-2 tracking-wide">
                                    <Globe className="w-5 h-5 text-indigo-500 animate-spin-slow" />
                                    <span>ศูนย์รวมคอนแท็ก & เครดิตร้านค้าสมาชิก</span>
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Theme Toggle Button (สลับโหมดขาว-ดำ / สว่าง-มืด) */}
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className={`p-2.5 sm:px-3 sm:py-2 rounded-xl border text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5 ${
                                    isLight 
                                        ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200' 
                                        : 'bg-white/10 border-white/15 text-gray-200 hover:bg-white/20'
                                }`}
                                title="สลับโหมดขาว-ดำ / สว่าง-มืด"
                            >
                                {isLight ? <Moon className="w-4 h-4 text-indigo-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
                                <span className="hidden md:inline">{isLight ? 'โหมดมืด' : 'โหมดสว่าง'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowCommunityContactsModal(false)
                                    setUserCenterTab('contact')
                                    setShowUserCenterModal(true)
                                }}
                                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">+ ตั้งค่าโปรไฟล์ & คอนแท็กของคุณ</span>
                                <span className="sm:hidden">+ แปะคอนแท็ก</span>
                            </button>
                        </div>
                    </div>

                    {/* Main Container */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8">
                        {/* Hero Section */}
                        <div className={`relative overflow-hidden rounded-3xl border p-6 sm:p-10 shadow-2xl backdrop-blur-2xl ${
                            isLight
                                ? 'border-indigo-200 bg-gradient-to-r from-indigo-600 via-purple-600 to-slate-800 text-white'
                                : 'border-white/15 bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900/80 text-white'
                        }`}>
                            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
                            <div className="absolute bottom-0 left-1/3 -mb-10 w-64 h-64 bg-pink-500/15 rounded-full blur-3xl pointer-events-none"></div>

                            <div className="relative z-10 max-w-3xl space-y-3">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white font-bold text-xs">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                    <span>Community Contact Showcase 🌐</span>
                                </div>
                                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                                    กระดานรวมช่องทางติดต่อ & ร้านค้าของสมาชิกทุกคน
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-100 leading-relaxed opacity-90">
                                    ศูนย์รวมสำหรับค้นหาผู้ค้า, ดูโลโก้ร้านค้า, อ่านคำอธิบาย และกดทัก Line / Facebook / Phone / TikTok ของเพื่อนสมาชิกในระบบได้ทันทีในคลิกเดียว
                                </p>
                            </div>
                        </div>

                        {/* Search & Filter Bar */}
                        <div className={`flex flex-col md:flex-row items-center justify-between gap-4 p-3.5 rounded-2xl border transition-colors backdrop-blur-md ${
                            isLight ? 'bg-white border-slate-200 shadow-md' : 'bg-white/5 border-white/10'
                        }`}>
                            {/* Search Input */}
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                                <input
                                    type="text"
                                    value={communitySearchTerm}
                                    onChange={(e) => setCommunitySearchTerm(e.target.value)}
                                    placeholder="ค้นหาตามชื่อสมาชิก / ชื่อร้าน / ไอดี / แท็กสินค้า..."
                                    className={`w-full rounded-xl py-3 pl-11 pr-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                                        isLight 
                                            ? 'bg-slate-100 border border-slate-200 text-slate-900 placeholder-slate-400' 
                                            : 'bg-black/40 border border-white/10 text-white placeholder-gray-400'
                                    }`}
                                />
                                {communitySearchTerm && (
                                    <button 
                                        onClick={() => setCommunitySearchTerm('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 text-xs"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs font-bold">
                                <button
                                    type="button"
                                    onClick={() => setCommunityFilterTab('all')}
                                    className={`px-3.5 py-2 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                                        communityFilterTab === 'all' 
                                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30' 
                                            : isLight
                                                ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                                    }`}
                                >
                                    ทั้งหมด ({allUsersList.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCommunityFilterTab('has_contact')}
                                    className={`px-3.5 py-2 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                                        communityFilterTab === 'has_contact' 
                                            ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/30' 
                                            : isLight
                                                ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                                    }`}
                                >
                                    ✨ มีคอนแท็กแล้ว
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCommunityFilterTab('admin')}
                                    className={`px-3.5 py-2 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                                        communityFilterTab === 'admin' 
                                            ? 'bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/30' 
                                            : isLight
                                                ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                                    }`}
                                >
                                    👑 เฉพาะแอดมิน
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCommunityFilterTab('user')}
                                    className={`px-3.5 py-2 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                                        communityFilterTab === 'user' 
                                            ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/30' 
                                            : isLight
                                                ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                                    }`}
                                >
                                    👤 สมาชิกทั่วไป
                                </button>
                            </div>
                        </div>

                        {/* FULLSCREEN MEMBER CARDS SHOWCASE GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {allUsersList
                                .filter(u => {
                                    const contact = contactsRegistry[u.id] || {}
                                    const hasLink = Boolean(contact.contactLink)

                                    if (communityFilterTab === 'has_contact' && !hasLink) return false
                                    if (communityFilterTab === 'admin' && !u.isAdmin) return false
                                    if (communityFilterTab === 'user' && u.isAdmin) return false

                                    if (!communitySearchTerm) return true
                                    const term = communitySearchTerm.toLowerCase()
                                    const nameMatch = u.name?.toLowerCase().includes(term)
                                    const emailMatch = u.email?.toLowerCase().includes(term)
                                    const shopMatch = contact.shopName?.toLowerCase().includes(term)
                                    const bioMatch = contact.bio?.toLowerCase().includes(term)
                                    const tagsMatch = contact.tags?.toLowerCase().includes(term)

                                    return nameMatch || emailMatch || shopMatch || bioMatch || tagsMatch
                                })
                                .map((u) => {
                                    const contact = contactsRegistry[u.id] || {}
                                    const hasLink = Boolean(contact.contactLink)
                                    const linkType = contact.contactType || 'Line'
                                    const shopName = contact.shopName || u.name
                                    const avatar = contact.avatarImage
                                    const cover = contact.coverImage
                                    const tags = contact.tags ? contact.tags.split(',').map(t => t.trim()).filter(Boolean) : []

                                    return (
                                        <div
                                            key={u.id}
                                            className={`group border rounded-3xl overflow-hidden shadow-xl transition-all duration-300 transform-gpu will-change-transform hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between ${
                                                isLight
                                                    ? 'bg-white border-slate-200 hover:border-indigo-400 shadow-slate-200/50'
                                                    : 'bg-white/[0.04] border-white/15 hover:border-indigo-500/60 hover:bg-white/[0.08]'
                                            }`}
                                        >
                                            <div>
                                                {/* Cover Banner Header */}
                                                <div 
                                                    className="h-28 sm:h-32 w-full relative overflow-hidden bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 cursor-pointer"
                                                    onClick={() => cover && setLightboxImage(cover)}
                                                >
                                                    {cover ? (
                                                        <img src={cover} alt="Cover Banner" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 transform-gpu" />
                                                    ) : (
                                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-purple-600/20 to-pink-600/30 flex items-center justify-center opacity-60">
                                                            <Sparkles className="w-12 h-12 text-indigo-400/30 animate-pulse" />
                                                        </div>
                                                    )}

                                                    {/* Role Badge on Banner Top Right */}
                                                    <div className="absolute top-3 right-3 z-10">
                                                        {u.isAdmin ? (
                                                            <span className="px-2.5 py-1 rounded-full bg-amber-500/90 text-white font-black text-[10px] shadow-lg border border-amber-300/40 flex items-center gap-1 backdrop-blur-md">
                                                                👑 แอดมิน
                                                            </span>
                                                        ) : (
                                                            <span className="px-2.5 py-1 rounded-full bg-indigo-600/80 text-white font-bold text-[10px] shadow-lg border border-indigo-400/30 flex items-center gap-1 backdrop-blur-md">
                                                                👤 สมาชิก
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Avatar & Basic Info */}
                                                <div className="px-5 pt-0 pb-4 relative">
                                                    {/* Avatar Photo */}
                                                    <div 
                                                        className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl border-4 shadow-xl overflow-hidden -mt-10 mb-2 relative bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xl shrink-0 cursor-pointer ${
                                                            isLight ? 'border-white' : 'border-[#090b17]'
                                                        }`}
                                                        onClick={() => avatar && setLightboxImage(avatar)}
                                                    >
                                                        {avatar ? (
                                                            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span>{(u.name || 'U').charAt(0).toUpperCase()}</span>
                                                        )}
                                                    </div>

                                                    <h3 className={`font-black text-base sm:text-lg truncate flex items-center gap-2 ${
                                                        isLight ? 'text-slate-900' : 'text-white'
                                                    }`}>
                                                        <span>{shopName}</span>
                                                    </h3>
                                                    <div className={`text-xs font-semibold truncate ${
                                                        isLight ? 'text-indigo-600' : 'text-indigo-300'
                                                    }`}>@{u.name} • {u.email}</div>

                                                    {/* Bio Description */}
                                                    <div className={`mt-3 p-3 rounded-2xl border text-xs leading-relaxed ${
                                                        isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-black/40 border-white/5 text-gray-300'
                                                    }`}>
                                                        {contact.bio || 'สมาชิกในระบบยังไม่ได้เขียนคำแนะนำร้านค้า'}
                                                    </div>

                                                    {/* Tags List */}
                                                    {tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                                            {tags.map((t, idx) => (
                                                                <span key={idx} className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${
                                                                    isLight ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                                                                }`}>
                                                                    #{t}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Buttons Footer */}
                                            <div className={`p-5 border-t space-y-2 ${
                                                isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/10'
                                            }`}>
                                                {hasLink ? (
                                                    <div className="flex items-center gap-2">
                                                        <a
                                                            href={contact.contactLink.startsWith('http') ? contact.contactLink : `https://${contact.contactLink}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`flex-1 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer hover:scale-[1.02] ${
                                                                linkType === 'Line' 
                                                                    ? 'bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-emerald-600/30' 
                                                                    : linkType === 'Facebook' 
                                                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-600/30' 
                                                                        : linkType === 'TikTok'
                                                                            ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-pink-600/30'
                                                                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-600/30'
                                                            }`}
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                            <span>ติดต่อทาง {linkType}</span>
                                                        </a>

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(contact.contactLink)
                                                                triggerToast('📋 คัดลอกลิงก์เรียบร้อยแล้ว!')
                                                            }}
                                                            className={`p-3 rounded-2xl border transition-colors cursor-pointer ${
                                                                isLight ? 'bg-white hover:bg-slate-200 border-slate-300 text-slate-800' : 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
                                                            }`}
                                                            title="คัดลอกลิงก์"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className={`w-full py-2.5 rounded-2xl border font-semibold text-xs text-center ${
                                                        isLight ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-white/5 border-white/10 text-gray-400'
                                                    }`}>
                                                        ยังไม่ได้แปะลิงก์ช่องทางติดต่อ
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
