import { format, parseISO } from 'date-fns'

export function formatCurrency(amount, currency = 'NGN') {
  const n = parseFloat(amount) || 0
  if (currency === 'NGN') {
    return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)
}

export function formatDate(dateStr) {
  if (!dateStr) return '–'
  try {
    const d = typeof dateStr === 'string' && dateStr.includes('T') ? parseISO(dateStr) : new Date(dateStr)
    return format(d, 'MMM d, yyyy')
  } catch {
    return dateStr
  }
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '–'
  try {
    const d = parseISO(dateStr)
    return format(d, 'MMM d, yyyy · h:mm a')
  } catch {
    return dateStr
  }
}

export function formatRelative(dateStr) {
  if (!dateStr) return '–'
  try {
    const d = parseISO(dateStr)
    const now = new Date()
    const diff = Math.floor((now - d) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
    return formatDate(dateStr)
  } catch {
    return dateStr
  }
}

export const SPLIT_TYPES = {
  equal: 'Equal split',
  exact: 'Exact amounts',
  percentage: 'Percentage',
}

export const CATEGORIES = {
  food: 'Food & Drinks',
  transport: 'Transport',
  accommodation: 'Accommodation',
  entertainment: 'Entertainment',
  utilities: 'Utilities',
  shopping: 'Shopping',
  health: 'Health',
  other: 'Other',
}

export function getCategoryLabel(cat) {
  return CATEGORIES[cat] || 'Other'
}

export function getInitials(name = '') {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export function truncate(str, len = 40) {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '…' : str
}
