'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, User, Bell } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Header() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('token')
    toast.success('Logged out successfully')
    router.push('/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex justify-between items-center px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-pharma-700">Cleaning Validation System</h1>
          <p className="text-sm text-gray-500">Gopal Mandloi - Automated Validation Tools</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}