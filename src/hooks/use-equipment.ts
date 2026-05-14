import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export interface Equipment {
  id: number
  name: string
  equipment_id: string
  capacity: number | null
  surface_area: number
  used_for: string
  cleaning_procedure: string
  plant: string
}

export function useEquipment() {
  return useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const res = await api.get('/equipment')
      return res.data as Equipment[]
    },
  })
}

export function useCreateEquipment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Equipment>) => {
      const res = await api.post('/equipment', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      toast.success('Equipment created successfully')
    },
    onError: () => {
      toast.error('Failed to create equipment')
    },
  })
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Equipment> }) => {
      const res = await api.put(`/equipment/${id}`, data)
      return res.data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      queryClient.invalidateQueries({ queryKey: ['equipment', id] })
      toast.success('Equipment updated successfully')
    },
    onError: () => {
      toast.error('Failed to update equipment')
    },
  })
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/equipment/${id}`)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      toast.success('Equipment deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete equipment')
    },
  })
}