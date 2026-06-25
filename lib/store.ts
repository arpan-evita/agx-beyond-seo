// lib/store.ts
// Simple JSON file-based store for local dev + Vercel
// For production scale, swap this with Vercel KV or Supabase

import fs from 'fs'
import path from 'path'
import type { User, AuditReport } from './types'

const IS_VERCEL = !!process.env.VERCEL
const DATA_DIR = IS_VERCEL ? '/tmp/data' : path.join(/*turbopackIgnore: true*/ process.cwd(), 'data')

const USERS_FILE = IS_VERCEL 
  ? path.join('/tmp/data', 'users.json') 
  : path.join(/*turbopackIgnore: true*/ process.cwd(), 'data', 'users.json')

const REPORTS_FILE = IS_VERCEL 
  ? path.join('/tmp/data', 'reports.json') 
  : path.join(/*turbopackIgnore: true*/ process.cwd(), 'data', 'reports.json')

function ensureDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    
    if (IS_VERCEL) {
      const files = ['users.json', 'reports.json', 'settings.json']
      files.forEach(file => {
        const src = path.join(/*turbopackIgnore: true*/ process.cwd(), 'data', file)
        const dest = path.join(DATA_DIR, file)
        if (!fs.existsSync(dest) && fs.existsSync(src)) {
          try {
            fs.copyFileSync(src, dest)
          } catch (e) {
            console.error(`Failed to copy ${file}:`, e)
          }
        }
      })
    }
  } catch (e) {
    console.error('Failed to ensure data directory:', e)
  }
}

function readJson<T>(file: string, defaultVal: T): T {
  try {
    ensureDir()
    if (!fs.existsSync(file)) return defaultVal
    const raw = fs.readFileSync(file, 'utf-8')
    return JSON.parse(raw) as T
  } catch (e) {
    console.error(`Failed to read JSON file ${file}:`, e)
    return defaultVal
  }
}

function writeJson<T>(file: string, data: T) {
  try {
    ensureDir()
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8')
  } catch (e) {
    console.error(`Failed to write JSON file ${file}:`, e)
  }
}

// ── USERS ──────────────────────────────────────────────────────────────

export function getUsers(): User[] {
  const users = readJson<User[]>(USERS_FILE, [])
  // Ensure admin always exists
  if (!users.find(u => u.email === (process.env.ADMIN_EMAIL || 'admin@agx.com'))) {
    const admin: User = {
      id: 'admin',
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@agx.com',
      password: process.env.ADMIN_PASSWORD || 'agxseo2024',
      role: 'admin',
      createdAt: new Date().toISOString(),
    }
    users.unshift(admin)
    writeJson(USERS_FILE, users)
  }
  return users
}

export function getUserByEmail(email: string): User | null {
  return getUsers().find(u => u.email === email) ?? null
}

export function getUserById(id: string): User | null {
  return getUsers().find(u => u.id === id) ?? null
}

export function createUser(data: Omit<User, 'id' | 'createdAt'>): User {
  const users = getUsers()
  const user: User = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  users.push(user)
  writeJson(USERS_FILE, users)
  return user
}

export function updateUser(id: string, data: Partial<User>) {
  const users = getUsers()
  const idx = users.findIndex(u => u.id === id)
  if (idx === -1) return null
  users[idx] = { ...users[idx], ...data }
  writeJson(USERS_FILE, users)
  return users[idx]
}

export function deleteUser(id: string) {
  const users = getUsers().filter(u => u.id !== id)
  writeJson(USERS_FILE, users)
}

// ── REPORTS ────────────────────────────────────────────────────────────

export function getReports(): AuditReport[] {
  return readJson<AuditReport[]>(REPORTS_FILE, [])
}

export function getReportById(id: string): AuditReport | null {
  return getReports().find(r => r.id === id) ?? null
}

export function createReport(data: Omit<AuditReport, 'id' | 'createdAt'>): AuditReport {
  const reports = getReports()
  const report: AuditReport = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  reports.unshift(report)
  writeJson(REPORTS_FILE, reports)
  return report
}

export function updateReport(id: string, data: Partial<AuditReport>) {
  const reports = getReports()
  const idx = reports.findIndex(r => r.id === id)
  if (idx === -1) return null
  reports[idx] = { ...reports[idx], ...data }
  writeJson(REPORTS_FILE, reports)
  return reports[idx]
}

export function deleteReport(id: string) {
  const reports = getReports().filter(r => r.id !== id)
  writeJson(REPORTS_FILE, reports)
}

// ── SETTINGS ───────────────────────────────────────────────────────────

const SETTINGS_FILE = IS_VERCEL 
  ? path.join('/tmp/data', 'settings.json') 
  : path.join(/*turbopackIgnore: true*/ process.cwd(), 'data', 'settings.json')

export interface AppSettings {
  apifyToken?: string
  geminiApiKey?: string
}

export function getSettings(): AppSettings {
  const defaults: AppSettings = {
    apifyToken: process.env.APIFY_API_TOKEN || '',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
  }
  return readJson<AppSettings>(SETTINGS_FILE, defaults)
}

export function updateSettings(data: Partial<AppSettings>): AppSettings {
  const settings = getSettings()
  const updated = { ...settings, ...data }
  writeJson(SETTINGS_FILE, updated)
  return updated
}

