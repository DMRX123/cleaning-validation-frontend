'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, Settings, Beaker, FileText, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
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
        // Backend returns { success: true, data: { ... } }
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
        // Fallback data for demo/error case
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

  const menuItems = [
    { title: 'Products', icon: Package, href: '/products', color: 'bg-blue-500', description: 'Manage product database' },
    { title: 'Equipment', icon: Settings, href: '/equipment', color: 'bg-green-500', description: 'Manage equipment list' },
    { title: 'Validation', icon: Beaker, href: '/validation/new', color: 'bg-purple-500', description: 'Start new validation' },
    { title: 'Reports', icon: FileText, href: '/reports', color: 'bg-orange-500', description: 'View validation reports' },
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

            {/* Menu Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {menuItems.map((item) => (
                <Link key={item.title} href={item.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
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

            {/* Info Section */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-800">Follow the Validation Wizard</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Click on "Validation" to start the 9-step guided process for cleaning validation.
                      The system will automatically calculate MACO, Swab limits, Rinse limits, and validate results.
                    </p>
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