// src/hooks/useHoldTime.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { DirtyHoldTime, DirtyHoldTimeCreate, DirtyHoldTimeUpdate, CleanHoldTime, CleanHoldTimeCreate, CleanHoldTimeUpdate, HoldTimeValidation } from '@/types/api'

// ============================================
// DIRTY HOLD TIME (DHT) CRUD
// ============================================

export function useDirtyHoldTimes(equipmentId?: number) {
  const url = equipmentId ? `/hold-times/dirty?equipment_id=${equipmentId}` : '/hold-times/dirty'
  return useQuery({
    queryKey: ['dirty-hold-times', equipmentId],
    queryFn: async () => {
      const res = await api.get(url)
      return res.data as DirtyHoldTime[]
    },
  })
}

export function useCreateDirtyHoldTime() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: DirtyHoldTimeCreate) => {
      const res = await api.post('/hold-times/dirty', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dirty-hold-times'] })
      toast.success('Dirty hold time recorded')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to record dirty hold time')
    },
  })
}

export function useUpdateDirtyHoldTime() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: DirtyHoldTimeUpdate }) => {
      const res = await api.put(`/hold-times/dirty/${id}`, data)
      return res.data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['dirty-hold-times'] })
      toast.success('Dirty hold time updated')
    },
    onError: () => toast.error('Failed to update'),
  })
}

export function useDeleteDirtyHoldTime() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/hold-times/dirty/${id}`)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dirty-hold-times'] })
      toast.success('Dirty hold time deleted')
    },
    onError: () => toast.error('Failed to delete'),
  })
}

// ============================================
// CLEAN HOLD TIME (CHT) CRUD
// ============================================

export function useCleanHoldTimes(equipmentId?: number) {
  const url = equipmentId ? `/hold-times/clean?equipment_id=${equipmentId}` : '/hold-times/clean'
  return useQuery({
    queryKey: ['clean-hold-times', equipmentId],
    queryFn: async () => {
      const res = await api.get(url)
      return res.data as CleanHoldTime[]
    },
  })
}

export function useCreateCleanHoldTime() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CleanHoldTimeCreate) => {
      const res = await api.post('/hold-times/clean', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clean-hold-times'] })
      toast.success('Clean hold time recorded')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to record clean hold time')
    },
  })
}

export function useUpdateCleanHoldTime() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CleanHoldTimeUpdate }) => {
      const res = await api.put(`/hold-times/clean/${id}`, data)
      return res.data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['clean-hold-times'] })
      toast.success('Clean hold time updated')
    },
    onError: () => toast.error('Failed to update'),
  })
}

export function useDeleteCleanHoldTime() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/hold-times/clean/${id}`)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clean-hold-times'] })
      toast.success('Clean hold time deleted')
    },
    onError: () => toast.error('Failed to delete'),
  })
}

// ============================================
// HOLD TIME VALIDATION
// ============================================

export function useHoldTimeValidations(equipmentId?: number, holdType?: string) {
  let url = '/hold-times/validation'
  const params = new URLSearchParams()
  if (equipmentId) params.append('equipment_id', equipmentId.toString())
  if (holdType) params.append('hold_type', holdType)
  if (params.toString()) url += `?${params.toString()}`
  
  return useQuery({
    queryKey: ['hold-time-validations', equipmentId, holdType],
    queryFn: async () => {
      const res = await api.get(url)
      return res.data as HoldTimeValidation[]
    },
  })
}

export function useApproveHoldTimeValidation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, successfulRuns, conclusions }: { id: number; successfulRuns?: number; conclusions?: string }) => {
      const res = await api.put(`/hold-times/validation/${id}/approve`, {
        successful_runs: successfulRuns || 3,
        conclusions: conclusions || '',
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hold-time-validations'] })
      toast.success('Hold time validation approved')
    },
    onError: () => toast.error('Failed to approve'),
  })
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function useCheckDirtyHoldTime() {
  return useMutation({
    mutationFn: async ({ equipmentId, endOfBatchTime, cleaningStartTime, maxDhtHours }: {
      equipmentId: number
      endOfBatchTime: string
      cleaningStartTime: string
      maxDhtHours?: number
    }) => {
      const res = await api.get(`/hold-times/dht/check/${equipmentId}`, {
        params: { end_of_batch_time: endOfBatchTime, cleaning_start_time: cleaningStartTime, max_dht_hours: maxDhtHours || 24 }
      })
      return res.data
    },
  })
}

export function useCheckCleanHoldTime() {
  return useMutation({
    mutationFn: async ({ equipmentId, cleaningCompletionTime, nextUseTime, maxChtHours }: {
      equipmentId: number
      cleaningCompletionTime: string
      nextUseTime: string
      maxChtHours?: number
    }) => {
      const res = await api.get(`/hold-times/cht/check/${equipmentId}`, {
        params: { cleaning_completion_time: cleaningCompletionTime, next_use_time: nextUseTime, max_cht_hours: maxChtHours || 72 }
      })
      return res.data
    },
  })
}