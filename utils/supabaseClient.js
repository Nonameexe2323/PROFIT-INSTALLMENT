import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gwblbeaggzcbsfnklphz.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3YmxiZWFnZ3pjYnNmbmtscGh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0ODA4NzYsImV4cCI6MjEwMTA1Njg3Nn0.UWpwSZ3UwLr4iaR6XtIbMvo6F8Eh5XSVfp7wOYDp9jo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const USERS_STORAGE_KEY = 'jiksaw_users_v1'
const SESSION_KEY = 'jiksaw_current_user_v1'
const INVITE_CODE_KEY = 'jiksaw_invite_code_v1'
const OWNER_PASSWORD_KEY = 'jiksaw_owner_password_v1'

// Default Admin User (sakchawit - เจ้าของระบบ)
const DEFAULT_DEMO_USER = {
    id: 'user_admin_default',
    name: 'sakchawit',
    email: 'admin@system.com',
    password: 'password123',
    isAdmin: true
}

// Initial Sample Data for default admin user
export const DEFAULT_PROFIT_LOGS = [
    {
        id: 'PR001',
        title: 'ขายไอดี RoV - Rank Conqueror (สกิน 120+)',
        category: 'ขายไอดี',
        cost: 2000,
        price: 3500,
        profit: 1500,
        date: '2026-08-01',
        month: 'ส.ค.',
        note: 'ลูกค้าโอนผ่าน พร้อมเพย์'
    },
    {
        id: 'PR002',
        title: 'ขายไอดี Valorant - Prime Vandal + Kuronami',
        category: 'ขายไอดี',
        cost: 3000,
        price: 5000,
        profit: 2000,
        date: '2026-08-02',
        month: 'ส.ค.',
        note: 'ดาวน์งวดแรก 1,500 ฿ ผ่อนต่อ 3 งวด'
    }
]

export const DEFAULT_INSTALLMENTS = [
    {
        id: 'IV001',
        customer: 'คุณสมชาย',
        item: 'ไอดีเกม RoV แรงค์ Conq (สกิน 120+)',
        total: 3500,
        paid: 1500,
        nextDue: '15 ส.ค. 67',
        contact: 'https://lin.ee/VjBjIVjU',
        contactType: 'Line',
        status: 'active'
    }
]

// ==================== SUPABASE REMOTE SYNC FOR USERS ====================

export async function saveUserToSupabase(user) {
    try {
        const { data, error } = await supabase
            .from('users')
            .upsert([{
                id: user.id,
                name: user.name,
                email: user.email,
                password: user.password,
                is_admin: user.isAdmin || false
            }], { onConflict: 'id' })
        
        if (error) {
            console.error('Supabase user save error:', error)
        }
        return { success: !error }
    } catch (e) {
        console.warn('Sync user to Supabase exception:', e)
        return { success: false }
    }
}

export async function getUsersFromSupabaseRemote() {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
        if (error || !data) return null
        return data.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            password: u.password,
            isAdmin: u.is_admin || false
        }))
    } catch {
        return null
    }
}

// ==================== AUTHENTICATION & INVITE CODE SERVICES ====================

export function getOwnerPassword() {
    if (typeof window === 'undefined') return 'password123'
    try {
        const saved = localStorage.getItem(OWNER_PASSWORD_KEY)
        if (saved) return saved
    } catch (e) {
        console.warn('Get owner password error:', e)
    }
    return 'password123'
}

export function saveOwnerPassword(newPassword) {
    if (typeof window === 'undefined') return
    try {
        localStorage.setItem(OWNER_PASSWORD_KEY, newPassword.trim())
    } catch (e) {
        console.warn('Save owner password error:', e)
    }
}

export function getInviteCodeFromStorage() {
    if (typeof window === 'undefined') return 'sakchawit'
    try {
        const saved = localStorage.getItem(INVITE_CODE_KEY)
        if (saved) return saved
    } catch (e) {
        console.warn('Get invite code error:', e)
    }
    return 'sakchawit'
}

export function saveInviteCodeToStorage(code) {
    if (typeof window === 'undefined') return
    try {
        localStorage.setItem(INVITE_CODE_KEY, code.trim())
    } catch (e) {
        console.warn('Save invite code error:', e)
    }
}

export function getUsersFromStorage() {
    if (typeof window === 'undefined') return [DEFAULT_DEMO_USER]
    try {
        const data = localStorage.getItem(USERS_STORAGE_KEY)
        const currentPass = getOwnerPassword()
        const ownerUserWithCurrentPass = { ...DEFAULT_DEMO_USER, password: currentPass }

        if (data) {
            const parsed = JSON.parse(data)
            const index = parsed.findIndex(u => u.name?.toLowerCase() === 'sakchawit')
            if (index !== -1) {
                parsed[index].password = currentPass
            } else {
                parsed.unshift(ownerUserWithCurrentPass)
            }
            return parsed
        }
    } catch (e) {
        console.warn('User storage error:', e)
    }
    return [{ ...DEFAULT_DEMO_USER, password: getOwnerPassword() }]
}

export function saveUsersToStorage(users) {
    if (typeof window === 'undefined') return
    try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
    } catch (e) {
        console.warn('Save user storage error:', e)
    }
}

export function getCurrentUser() {
    if (typeof window === 'undefined') return null
    try {
        const session = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY)
        if (session) {
            return JSON.parse(session)
        }
    } catch (e) {
        console.warn('Get current user error:', e)
    }
    return null
}

export function setCurrentUserSession(user, remember = true) {
    if (typeof window === 'undefined') return
    try {
        const json = JSON.stringify(user)
        if (remember) {
            localStorage.setItem(SESSION_KEY, json)
        } else {
            sessionStorage.setItem(SESSION_KEY, json)
        }
    } catch (e) {
        console.warn('Set user session error:', e)
    }
}

export function logoutUserSession() {
    if (typeof window === 'undefined') return
    try {
        localStorage.removeItem(SESSION_KEY)
        sessionStorage.removeItem(SESSION_KEY)
    } catch (e) {
        console.warn('Logout error:', e)
    }
}

export async function registerNewUser(name, email, password, inviteCode) {
    const users = getUsersFromStorage()
    const trimmedName = name.trim()
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedCode = (inviteCode || '').trim().toLowerCase()

    // Validate Owner Invite Code
    const activeInviteCode = getInviteCodeFromStorage().toLowerCase()
    const validCodes = [activeInviteCode, 'sakchawit', 'sakchawit2026', 'admin', 'sakchawitshop']
    
    if (!trimmedCode || !validCodes.includes(trimmedCode)) {
        return { 
            success: false, 
            error: 'คุณต้องมีรหัสสมัครจากเจ้าของเว็บ (sakchawit)' 
        }
    }

    // Check existing name or email
    const existing = users.find(u => 
        (u.email && u.email.toLowerCase() === trimmedEmail) || 
        (u.name && u.name.toLowerCase() === trimmedName.toLowerCase())
    )
    if (existing && existing.name?.toLowerCase() !== 'sakchawit') {
        return { success: false, error: 'ชื่อผู้ใช้หรืออีเมลนี้มีในระบบแล้ว' }
    }

    const newUser = {
        id: `user_${Date.now()}`,
        name: trimmedName,
        email: trimmedEmail,
        password: password,
        isAdmin: trimmedName.toLowerCase() === 'sakchawit',
        createdAt: new Date().toISOString()
    }

    const filteredUsers = users.filter(u => u.name?.toLowerCase() !== trimmedName.toLowerCase())
    filteredUsers.push(newUser)
    saveUsersToStorage(filteredUsers)
    
    // Await Supabase insertion
    await saveUserToSupabase(newUser)

    // Set current active user session
    setCurrentUserSession(newUser, true)

    return { success: true, user: newUser }
}

// Owner Admin Function: Directly Create User Account
export async function adminCreateUserAccount(name, email, password) {
    const users = getUsersFromStorage()
    const trimmedName = name.trim()
    const trimmedEmail = email.trim().toLowerCase()

    const existing = users.find(u => 
        (u.email && u.email.toLowerCase() === trimmedEmail) || 
        (u.name && u.name.toLowerCase() === trimmedName.toLowerCase())
    )
    if (existing) {
        return { success: false, error: 'ชื่อผู้ใช้หรืออีเมลนี้มีในระบบแล้ว' }
    }

    const newUser = {
        id: `user_${Date.now()}`,
        name: trimmedName,
        email: trimmedEmail,
        password: password,
        createdAt: new Date().toISOString()
    }

    users.push(newUser)
    saveUsersToStorage(users)
    await saveUserToSupabase(newUser)

    return { success: true, user: newUser }
}

export function loginUserAccount(identifier, password) {
    const users = getUsersFromStorage()
    const trimmedId = (identifier || '').trim().toLowerCase()
    const trimmedPass = (password || '').trim().toLowerCase()
    const currentOwnerPass = getOwnerPassword().trim().toLowerCase()

    // 1. Guaranteed Owner Login for sakchawit & admin (Mobile Friendly Case-Insensitive)
    if (trimmedId === 'sakchawit' || trimmedId === 'admin@system.com' || trimmedId === 'admin') {
        if (
            trimmedPass === currentOwnerPass || 
            trimmedPass === 'password123' || 
            trimmedPass === 'sakchawit' ||
            trimmedPass === '123456'
        ) {
            const ownerUser = {
                id: 'user_admin_default',
                name: 'sakchawit',
                email: 'admin@system.com',
                password: getOwnerPassword(),
                isAdmin: true
            }
            setCurrentUserSession(ownerUser, true)
            saveUserToSupabase(ownerUser)
            return { success: true, user: ownerUser }
        }
    }

    // 2. Normal User Login Match
    const user = users.find(u => {
        const matchesEmail = u.email && u.email.trim().toLowerCase() === trimmedId
        const matchesName = u.name && u.name.trim().toLowerCase() === trimmedId
        return (matchesEmail || matchesName) && (u.password || '').trim() === password.trim()
    })

    if (!user) {
        return { success: false, error: 'ชื่อผู้ใช้/อีเมล หรือรหัสผ่านไม่ถูกต้อง' }
    }

    setCurrentUserSession(user, true)
    return { success: true, user }
}

// ==================== USER-ISOLATED DATA SERVICES ====================

export function getUserProfitsStorageKey(userId) {
    return `jiksaw_user_profits_${userId || 'guest'}`
}

export function getUserInstallmentsStorageKey(userId) {
    return `jiksaw_user_installments_${userId || 'guest'}`
}

export function getUserProfits(userId) {
    if (typeof window === 'undefined') return []
    const key = getUserProfitsStorageKey(userId)
    try {
        const saved = localStorage.getItem(key)
        if (saved) return JSON.parse(saved)
    } catch (e) {
        console.warn('Get user profits error:', e)
    }
    if (userId === DEFAULT_DEMO_USER.id) {
        return DEFAULT_PROFIT_LOGS
    }
    return []
}

export function saveUserProfits(userId, profits) {
    if (typeof window === 'undefined') return
    const key = getUserProfitsStorageKey(userId)
    try {
        localStorage.setItem(key, JSON.stringify(profits))
    } catch (e) {
        console.warn('Save user profits error:', e)
    }
}

export function getUserInstallments(userId) {
    if (typeof window === 'undefined') return []
    const key = getUserInstallmentsStorageKey(userId)
    try {
        const saved = localStorage.getItem(key)
        if (saved) return JSON.parse(saved)
    } catch (e) {
        console.warn('Get user installments error:', e)
    }
    if (userId === DEFAULT_DEMO_USER.id) {
        return DEFAULT_INSTALLMENTS
    }
    return []
}

export function saveUserInstallments(userId, installments) {
    if (typeof window === 'undefined') return
    const key = getUserInstallmentsStorageKey(userId)
    try {
        localStorage.setItem(key, JSON.stringify(installments))
    } catch (e) {
        console.warn('Save user installments error:', e)
    }
}

// Supabase Remote Sync (User-Scoped)
export async function getProfitsFromSupabase(userId) {
    try {
        const { data, error } = await supabase
            .from('profit_logs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error || !data) {
            return { data: getUserProfits(userId), isDatabase: false }
        }

        const formatted = data.map(item => ({
            id: item.code || item.id,
            dbId: item.id,
            title: item.title,
            category: item.category || 'ขายไอดี',
            cost: Number(item.cost || 0),
            price: Number(item.price || 0),
            profit: Number(item.profit || 0),
            date: item.date || item.created_at?.split('T')[0],
            month: item.month || 'ส.ค.',
            note: item.note || '',
            image: item.image || ''
        }))

        return { data: formatted, isDatabase: true }
    } catch {
        return { data: getUserProfits(userId), isDatabase: false }
    }
}

export async function saveProfitToSupabase(record, userId) {
    try {
        const { data, error } = await supabase
            .from('profit_logs')
            .insert([{
                user_id: userId,
                title: record.title,
                category: record.category,
                cost: record.cost,
                price: record.price,
                profit: record.profit,
                date: record.date,
                month: record.month,
                note: record.note,
                image: record.image || ''
            }])
        return { success: !error }
    } catch {
        return { success: false }
    }
}

export async function deleteProfitFromSupabase(dbIdOrTitle, userId) {
    try {
        const { error } = await supabase
            .from('profit_logs')
            .delete()
            .eq('user_id', userId)
            .or(`id.eq.${dbIdOrTitle},title.eq.${dbIdOrTitle}`)
        return { success: !error }
    } catch {
        return { success: false }
    }
}

export async function getInstallmentsFromSupabase(userId) {
    try {
        const { data, error } = await supabase
            .from('installments')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error || !data) {
            return { data: getUserInstallments(userId), isDatabase: false }
        }

        const formatted = data.map(item => ({
            id: item.code || item.id,
            dbId: item.id,
            customer: item.customer,
            item: item.item,
            total: Number(item.total || 0),
            paid: Number(item.paid || 0),
            nextDue: item.next_due || 'ชำระครบแล้ว',
            contact: item.contact || '#',
            contactType: item.contact_type || 'Line',
            status: item.status || 'active',
            image: item.image || ''
        }))
        return { data: formatted, isDatabase: true }
    } catch {
        return { data: getUserInstallments(userId), isDatabase: false }
    }
}

export async function saveInstallmentToSupabase(record, userId) {
    try {
        const { data, error } = await supabase
            .from('installments')
            .insert([{
                user_id: userId,
                code: record.id,
                customer: record.customer,
                item: record.item,
                total: record.total,
                paid: record.paid,
                next_due: record.nextDue,
                contact: record.contact,
                contact_type: record.contactType || 'Line',
                status: record.status,
                image: record.image || ''
            }])
        return { success: !error }
    } catch {
        return { success: false }
    }
}

export async function updatePaymentInSupabase(recordId, newPaidAmount, newStatus, newNextDue, userId) {
    try {
        const { data, error } = await supabase
            .from('installments')
            .update({
                paid: newPaidAmount,
                status: newStatus,
                next_due: newNextDue
            })
            .eq('user_id', userId)
            .or(`code.eq.${recordId},id.eq.${recordId}`)
        return { success: !error }
    } catch {
        return { success: false }
    }
}

export async function deleteInstallmentFromSupabase(recordId, userId) {
    try {
        const { error } = await supabase
            .from('installments')
            .delete()
            .eq('user_id', userId)
            .or(`code.eq.${recordId},id.eq.${recordId}`)
        return { success: !error }
    } catch {
        return { success: false }
    }
}