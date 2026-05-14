import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export interface ValidationSession {
  id: number
  session_code: string
  status: string
  previous_product_id: number
  next_product_id: number
  extra_area_percentage: number
  total_surface_area: number | null
  maco_10ppm: number | null
  maco_tdd: number | null
  maco_ade_pde: number | null
  lowest_maco: number | null
  swab_limit_mg: number | null
  swab_limit_ppm: number | null
  rinse_limit_mg: number | null
  rinse_limit_ppm: number | null
  created_at: string
  updated_at: string
}

export function useValidationSessions() {
  return useQuery({
    queryKey: ['validation-sessions'],
    queryFn: async () => {
      const res = await api.get('/validation/history')
      return res.data as ValidationSession[]
    },
  })
}

export function useValidationSession(sessionId: number) {
  return useQuery({
    queryKey: ['validation-session', sessionId],
    queryFn: async () => {
      const res = await api.get(`/validation/session/${sessionId}`)
      return res.data as ValidationSession
    },
    enabled: !!sessionId,
  })
}

export function useCreateSession() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: { previous_product_id: number; next_product_id: number; extra_area_percentage?: number }) => {
      const res = await api.post('/validation/session', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['validation-sessions'] })
      toast.success('Validation session created')
    },
    onError: () => {
      toast.error('Failed to create session')
    },
  })
}

export function useUpdateSession() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ValidationSession> }) => {
      const res = await api.put(`/validation/session/${id}`, data)
      return res.data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['validation-session', id] })
      queryClient.invalidateQueries({ queryKey: ['validation-sessions'] })
      toast.success('Session updated')
    },
    onError: () => {
      toast.error('Failed to update session')
    },
  })
}

export function useCalculateMACO() {
  return useMutation({
    mutationFn: async ({ previousProductId, nextProductId }: { previousProductId: number; nextProductId: number }) => {
      const res = await api.post('/calculations/maco', {
        previous_product_id: previousProductId,
        next_product_id: nextProductId,
      })
      return res.data
    },
  })
}

export function useCalculateSwabLimit() {
  return useMutation({
    mutationFn: async ({ sessionId, totalSurfaceArea }: { sessionId: number; totalSurfaceArea: number }) => {
      const res = await api.post('/calculations/swab-limit', {
        session_id: sessionId,
        total_surface_area: totalSurfaceArea,
      })
      return res.data
    },
  })
}

export function useCalculateRinseLimit() {
  return useMutation({
    mutationFn: async ({ sessionId, equipmentSurfaceArea }: { sessionId: number; equipmentSurfaceArea: number }) => {
      const res = await api.post('/calculations/rinse-limit', {
        session_id: sessionId,
        equipment_surface_area: equipmentSurfaceArea,
      })
      return res.data
    },
  })
}

export function useSaveStandardPrep() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: { session_id: number; wt_of_std: number; first_dilution: number; second_dilution: number; third_dilution: number; fourth_dilution: number; fifth_dilution: number; potency: number }) => {
      const res = await api.post('/validation/standard-prep', data)
      return res.data
    },
    onSuccess: (_, { session_id }) => {
      queryClient.invalidateQueries({ queryKey: ['validation-session', session_id] })
      toast.success('Standard preparation saved')
    },
    onError: () => {
      toast.error('Failed to save standard preparation')
    },
  })
}

export function useSaveSwabResult() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: { session_id: number; location_name: string; absorbance_sample: number; absorbance_std: number }) => {
      const res = await api.post('/validation/swab-result', data)
      return res.data
    },
    onSuccess: (_, { session_id }) => {
      queryClient.invalidateQueries({ queryKey: ['validation-session', session_id] })
      toast.success('Swab result saved')
    },
    onError: () => {
      toast.error('Failed to save swab result')
    },
  })
}

export function useSaveRinseResult() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: { session_id: number; equipment_name: string; actual_rinse_volume: number; absorbance_sample: number; absorbance_std: number }) => {
      const res = await api.post('/validation/rinse-result', data)
      return res.data
    },
    onSuccess: (_, { session_id }) => {
      queryClient.invalidateQueries({ queryKey: ['validation-session', session_id] })
      toast.success('Rinse result saved')
    },
    onError: () => {
      toast.error('Failed to save rinse result')
    },
  })
}