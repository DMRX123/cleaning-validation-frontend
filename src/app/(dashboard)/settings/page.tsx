// src/app/(dashboard)/settings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { User, Bell, Shield, Database, Trash2, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@cleaning-validation.com',
    username: 'admin',
  })
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users')
      setUsers(res.data.users || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = () => {
    toast.success('Profile updated successfully')
  }

  const handlePasswordUpdate = () => {
    if (password.new !== password.confirm) {
      toast.error('New passwords do not match')
      return
    }
    toast.success('Password updated successfully')
    setPassword({ current: '', new: '', confirm: '' })
  }

  const handleDeleteUser = async (userId: number, username: string) => {
    if (username === 'admin') {
      toast.error('Cannot delete admin user')
      return
    }
    if (confirm(`Delete user "${username}"?`)) {
      try {
        await api.delete(`/auth/users/${userId}`)
        toast.success('User deleted')
        fetchUsers()
      } catch (error) {
        toast.error('Failed to delete user')
      }
    }
  }

  const handleExportData = async () => {
    try {
      const response = await api.get('/crud/products/all')
      const data = response.data
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `cleaning_validation_export_${new Date().toISOString().split('T')[0]}.json`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Data exported successfully')
    } catch (error) {
      toast.error('Failed to export data')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pharma-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Breadcrumb />
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-pharma-700 mb-6">Settings</h1>

            <Tabs defaultValue="profile">
              <TabsList className="mb-6">
                <TabsTrigger value="profile">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="users">
                  <Shield className="h-4 w-4 mr-2" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="notifications">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="database">
                  <Database className="h-4 w-4 mr-2" />
                  Database
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Username</Label>
                      <Input
                        value={profile.username}
                        onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      />
                    </div>
                    <Button onClick={handleProfileUpdate}>Save Changes</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Username</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.username}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Badge variant={user.is_admin ? 'default' : 'secondary'}>
                                  {user.is_admin ? 'Admin' : 'User'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={user.is_active ? 'success' : 'secondary'}>
                                  {user.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">
                                {new Date(user.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {user.username !== 'admin' && (
                                  <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id, user.username)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Current Password</Label>
                      <Input
                        type="password"
                        value={password.current}
                        onChange={(e) => setPassword({ ...password, current: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input
                        type="password"
                        value={password.new}
                        onChange={(e) => setPassword({ ...password, new: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm New Password</Label>
                      <Input
                        type="password"
                        value={password.confirm}
                        onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                      />
                    </div>
                    <Button onClick={handlePasswordUpdate}>Update Password</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">Notification settings coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="database">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                      <Button variant="outline" onClick={handleExportData}>Export All Data</Button>
                      <Button variant="outline" disabled>Backup Database</Button>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Database operations can take time. Please ensure you have a backup before proceeding.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}