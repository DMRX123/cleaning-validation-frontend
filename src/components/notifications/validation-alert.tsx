'use client'

import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react'

interface ValidationAlertProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  onClose?: () => void
}

export function ValidationAlert({ type, title, message, onClose }: ValidationAlertProps) {
  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      titleColor: 'text-green-800',
      messageColor: 'text-green-700'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: AlertCircle,
      iconColor: 'text-red-600',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: AlertTriangle,
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-800',
      messageColor: 'text-yellow-700'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: Info,
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-700'
    }
  }

  const style = styles[type]
  const Icon = style.icon

  return (
    <div className={'p-4 ' + style.bg + ' border ' + style.border + ' rounded-lg flex items-start gap-3'}>
      <Icon className={'h-5 w-5 ' + style.iconColor + ' mt-0.5'} />
      <div className="flex-1">
        <p className={'font-medium ' + style.titleColor}>{title}</p>
        <p className={'text-sm ' + style.messageColor + ' mt-1'}>{message}</p>
      </div>
      {onClose && (
        <button 
          onClick={onClose} 
          className={style.iconColor + ' hover:opacity-70'}
          aria-label="Close notification"
          title="Close"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
