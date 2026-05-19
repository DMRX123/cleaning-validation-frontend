// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A'
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'N/A'
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateOnly(date: string | Date | null | undefined): string {
  if (!date) return 'N/A'
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'N/A'
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatNumber(num: number | null | undefined, decimals: number = 2): string {
  if (num === null || num === undefined) return '0'
  return num.toFixed(decimals)
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function truncate(str: string | null | undefined, length: number = 50): string {
  if (!str) return ''
  if (str.length <= length) return str
  return str.substring(0, length) + '...'
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[0-9]{10}$/
  return phoneRegex.test(phone)
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'COMPLETED': 'bg-green-100 text-green-800',
    'IN_PROGRESS': 'bg-yellow-100 text-yellow-800',
    'DRAFT': 'bg-gray-100 text-gray-800',
    'APPROVED': 'bg-blue-100 text-blue-800',
    'PASS': 'bg-green-100 text-green-800',
    'FAIL': 'bg-red-100 text-red-800',
    'ACTIVE': 'bg-green-100 text-green-800',
    'INACTIVE': 'bg-gray-100 text-gray-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getRiskColor(risk: string): string {
  const colors: Record<string, string> = {
    'LOW': 'bg-green-100 text-green-800',
    'MEDIUM': 'bg-yellow-100 text-yellow-800',
    'HIGH': 'bg-orange-100 text-orange-800',
    'CRITICAL': 'bg-red-100 text-red-800',
  }
  return colors[risk] || 'bg-gray-100 text-gray-800'
}

export function formatPPM(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A'
  if (value === 0) return 'Below LOQ'
  return value.toFixed(2)
}