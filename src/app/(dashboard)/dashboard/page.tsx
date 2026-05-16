'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Package, 
  Settings, 
  Beaker, 
  FileText, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  BookOpen,
  Calculator,
  GitBranch,
  GraduationCap,
  History,
  Shield,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'

interface DashboardStats {
  products: number
  equipment: number
  active_sessions: number
  pass_rate: number
  trends: {
    products: string
    equipment: string
    sessions: string
    pass_rate: string
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/stats')
      .then((res) => {
        const responseData = res.data.data || res.data
        setStats({
          products: responseData.products || 0,
          equipment: responseData.equipment || 0,
          active_sessions: responseData.active_sessions || 0,
          pass_rate: responseData.pass_rate || 0,
          trends: {
            products: responseData.trends?.products || "+0",
            equipment: responseData.trends?.equipment || "0",
            sessions: responseData.trends?.sessions || "+0",
            pass_rate: responseData.trends?.pass_rate || "+0%"
          }
        })
        setLoading(false)
      })
      .catch(() => {
        setStats({
          products: 0,
          equipment: 0,
          active_sessions: 0,
          pass_rate: 0,
          trends: {
            products: "+0",
            equipment: "0",
            sessions: "+0",
            pass_rate: "+0%"
          }
        })
        setLoading(false)
      })
  }, [])

  // Primary Menu Items (Core Features)
  const primaryMenuItems = [
    { title: 'Products', icon: Package, href: '/products', color: 'bg-blue-500', description: 'Manage product database' },
    { title: 'Equipment', icon: Settings, href: '/equipment', color: 'bg-green-500', description: 'Manage equipment list' },
    { title: 'New Validation', icon: Beaker, href: '/validation/new', color: 'bg-purple-500', description: 'Start 9-step validation wizard' },
    { title: 'Reports', icon: FileText, href: '/reports', color: 'bg-orange-500', description: 'View validation reports' },
  ]

  // APIC Guidelines Menu Items (New Features)
  const apicMenuItems = [
    { title: 'Cleaning Process', icon: Settings, href: '/cleaning-process', color: 'bg-teal-500', description: 'Section 6.0 - Process Control' },
    { title: 'APIC Guidance', icon: BookOpen, href: '/guidance', color: 'bg-indigo-500', description: 'Section 10.0 - FAQ & Revalidation' },
    { title: 'ADE/PDE Calculator', icon: Calculator, href: '/ade-calculator', color: 'bg-pink-500', description: 'Section 4.2.1.1 - Health-Based Limits' },
    { title: 'Worst Case Matrix', icon: TrendingUp, href: '/guidelines?tab=bracketing', color: 'bg-amber-500', description: 'Section 7.0 - Bracketing & Rating' },
  ]

  // Management Menu Items
  const managementMenuItems = [
    { title: 'Change Control', icon: GitBranch, href: '/change-control', color: 'bg-red-500', description: 'Section 10.0 - Change Management' },
    { title: 'Training', icon: GraduationCap, href: '/training', color: 'bg-cyan-500', description: 'Section 9.8 - Training Records' },
    { title: 'Validation History', icon: History, href: '/validation/history', color: 'bg-gray-500', description: 'Past validation sessions' },
    { title: 'Settings', icon: Shield, href: '/settings', color: 'bg-slate-500', description: 'Profile & preferences' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Stats Cards */}
            {!loading && stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Total Products</p>
                        <p className="text-2xl font-bold">{stats.products}</p>
                        <p className="text-sm text-green-600">{stats.trends.products} this month</p>
                      </div>
                      <Package className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Equipment</p>
                        <p className="text-2xl font-bold">{stats.equipment}</p>
                        <p className="text-sm text-gray-500">{stats.trends.equipment} change</p>
                      </div>
                      <Settings className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Active Studies</p>
                        <p className="text-2xl font-bold">{stats.active_sessions}</p>
                        <p className="text-sm text-green-600">{stats.trends.sessions} new</p>
                      </div>
                      <Beaker className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Validation Pass Rate</p>
                        <p className="text-2xl font-bold">{stats.pass_rate}%</p>
                        <p className="text-sm text-green-600">{stats.trends.pass_rate} vs last month</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Primary Features Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-pharma-600" />
                Core Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {primaryMenuItems.map((item) => (
                  <Link key={item.title} href={item.href}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full card-hover">
                      <CardContent className="pt-6">
                        <div className={`${item.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                          <item.icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* APIC Guidelines Section - NEW FEATURES */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-pharma-600" />
                APIC Guidelines Implementation
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {apicMenuItems.map((item) => (
                  <Link key={item.title} href={item.href}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full card-hover">
                      <CardContent className="pt-6">
                        <div className={`${item.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                          <item.icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Management Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-pharma-600" />
                System Management
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {managementMenuItems.map((item) => (
                  <Link key={item.title} href={item.href}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full card-hover">
                      <CardContent className="pt-6">
                        <div className={`${item.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                          <item.icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Info Section */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-800">Complete APIC 2021 Compliance</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      The system implements all sections of APIC Cleaning Validation Guide 2021:
                      MACO calculations (4.2), Cleaning Levels (5.0), Process Control (6.0), 
                      Bracketing (7.0), Microbiological limits (8.1), Protocols (9.0), 
                      Hold Times (9.7), and Change Control (10.0).
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Section 4.2.1 ADE/PDE</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Section 5.0 Cleaning Levels</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Section 6.0 Process Capability</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Section 7.0 Worst Case Rating</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Section 9.7 Hold Times</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}