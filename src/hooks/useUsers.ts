// src/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export interface User {
  id: number
  username: string
  email: string
  is_active: boolean
  is_admin: boolean
  created_at: string
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/auth/users')
      return res.data.users as User[]
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/auth/users/${id}`)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User deleted')
    },
    onError: () => toast.error('Failed to delete user'),
  })
}