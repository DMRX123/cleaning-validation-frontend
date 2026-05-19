// src/hooks/useOperatorQualification.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export interface OperatorQualification {
  id: number
  user_id: number
  username?: string
  eyesight_certified: boolean
  eyesight_certified_date: string | null
  eyesight_certified_by: string | null
  left_eye_vision: string | null
  right_eye_vision: string | null
  color_blindness_test_passed: boolean
  color_blindness_test_date: string | null
  training_completed: boolean
  training_date: string | null
  training_duration_hours: number | null
  trainer_name: string | null
  training_scores: number | null
  practical_demo_passed: boolean
  practical_demo_date: string | null
  qualification_valid_until: string | null
  qualified_by: string | null
  is_active: boolean
  created_at: string
}

export interface OperatorQualificationCreate {
  user_id: number
  qualified_by: string
  eyesight_certified?: boolean
  color_blindness_test_passed?: boolean
  training_completed?: boolean
  practical_demo_passed?: boolean
  eyesight_certified_date?: string
  eyesight_certified_by?: string
  color_blindness_test_date?: string
  training_date?: string
  training_duration_hours?: number
  trainer_name?: string
  training_scores?: number
  practical_demo_date?: string
}

// ============================================
// GET ALL OPERATOR QUALIFICATIONS
// ============================================

export function useOperatorQualifications() {
  return useQuery({
    queryKey: ['operator-qualifications'],
    queryFn: async () => {
      const res = await api.get('/operator-qualifications')
      return res.data as OperatorQualification[]
    },
  })
}

// ============================================
// GET OPERATOR QUALIFICATION BY ID
// ============================================

export function useOperatorQualification(id: number) {
  return useQuery({
    queryKey: ['operator-qualifications', id],
    queryFn: async () => {
      const res = await api.get(`/operator-qualifications/${id}`)
      return res.data as OperatorQualification
    },
    enabled: !!id,
  })
}

// ============================================
// GET QUALIFIED OPERATORS (Active & Valid)
// ============================================

export function useQualifiedOperators() {
  return useQuery({
    queryKey: ['operator-qualifications', 'qualified'],
    queryFn: async () => {
      const res = await api.get('/operator-qualifications/qualified')
      return res.data as OperatorQualification[]
    },
  })
}

// ============================================
// CREATE OPERATOR QUALIFICATION
// ============================================

export function useCreateOperatorQualification() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: OperatorQualificationCreate) => {
      const res = await api.post('/operator-qualifications', {
        user_id: data.user_id,
        qualified_by: data.qualified_by,
        eyesight_certified: data.eyesight_certified || false,
        eyesight_certified_date: data.eyesight_certified_date || new Date().toISOString(),
        eyesight_certified_by: data.qualified_by,
        color_blindness_test_passed: data.color_blindness_test_passed || false,
        color_blindness_test_date: data.color_blindness_test_date || new Date().toISOString(),
        training_completed: data.training_completed || false,
        training_date: data.training_date || new Date().toISOString(),
        training_duration_hours: data.training_duration_hours || 2,
        trainer_name: data.trainer_name || data.qualified_by,
        training_scores: data.training_scores || 100,
        practical_demo_passed: data.practical_demo_passed || false,
        practical_demo_date: data.practical_demo_date || new Date().toISOString(),
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator-qualifications'] })
      toast.success('Operator qualification created successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create operator qualification')
    },
  })
}

// ============================================
// UPDATE OPERATOR QUALIFICATION
// ============================================

export function useUpdateOperatorQualification() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<OperatorQualification> }) => {
      const res = await api.put(`/operator-qualifications/${id}`, data)
      return res.data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['operator-qualifications'] })
      queryClient.invalidateQueries({ queryKey: ['operator-qualifications', id] })
      toast.success('Operator qualification updated successfully')
    },
    onError: () => {
      toast.error('Failed to update operator qualification')
    },
  })
}

// ============================================
// DELETE OPERATOR QUALIFICATION
// ============================================

export function useDeleteOperatorQualification() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/operator-qualifications/${id}`)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator-qualifications'] })
      toast.success('Operator qualification deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete operator qualification')
    },
  })
}

// ============================================
// APPROVE OPERATOR QUALIFICATION
// ============================================

export function useApproveOperatorQualification() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, validUntil }: { id: number; validUntil?: string }) => {
      const res = await api.put(`/operator-qualifications/${id}/approve`, {
        valid_until: validUntil || new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString(), // 2 years
      })
      return res.data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['operator-qualifications'] })
      queryClient.invalidateQueries({ queryKey: ['operator-qualifications', id] })
      toast.success('Operator qualification approved successfully')
    },
    onError: () => {
      toast.error('Failed to approve operator qualification')
    },
  })
}

// ============================================
// RENEW OPERATOR QUALIFICATION
// ============================================

export function useRenewOperatorQualification() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, validUntil }: { id: number; validUntil?: string }) => {
      const res = await api.put(`/operator-qualifications/${id}/renew`, {
        valid_until: validUntil || new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString(), // 2 years
      })
      return res.data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['operator-qualifications'] })
      queryClient.invalidateQueries({ queryKey: ['operator-qualifications', id] })
      toast.success('Operator qualification renewed successfully')
    },
    onError: () => {
      toast.error('Failed to renew operator qualification')
    },
  })
}