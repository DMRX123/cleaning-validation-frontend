// src/hooks/useFMEA.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { FMEARiskAssessment, FMEACreate } from '@/types/api'

export function useFMEAAssessments(equipmentId?: number) {
  const url = equipmentId ? `/fmea?equipment_id=${equipmentId}` : '/fmea'
  return useQuery({
    queryKey: ['fmea', equipmentId],
    queryFn: async () => {
      const res = await api.get(url)
      return res.data as FMEARiskAssessment[]
    },
  })
}

export function useCreateFMEA() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: FMEACreate) => {
      const res = await api.post('/fmea', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fmea'] })
      toast.success('FMEA assessment created')
    },
    onError: () => toast.error('Failed to create FMEA'),
  })
}

export function useDeleteFMEA() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/fmea/${id}`)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fmea'] })
      toast.success('FMEA deleted')
    },
    onError: () => toast.error('Failed to delete FMEA'),
  })
}