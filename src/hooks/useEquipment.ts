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

export function useEquipmentByPlant(plant: string) {
  return useQuery({
    queryKey: ['equipment', plant],
    queryFn: async () => {
      const res = await api.get(`/equipment/plant/${plant}`)
      return res.data as Equipment[]
    },
    enabled: !!plant,
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