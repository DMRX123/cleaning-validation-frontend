import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export interface CleaningProcess {
  id: number
  process_code: string
  name: string
  cleaning_type: string
  is_validated: boolean
  is_active: boolean
  created_at: string
}

export function useCleaningProcesses() {
  return useQuery({
    queryKey: ['cleaning-processes'],
    queryFn: async () => {
      const res = await api.get('/cleaning-process')
      return res.data as CleaningProcess[]
    },
  })
}

export function useCleaningProcess(id: number) {
  return useQuery({
    queryKey: ['cleaning-process', id],
    queryFn: async () => {
      const res = await api.get(`/cleaning-process/${id}`)
      return res.data
    },
    enabled: !!id,
  })
}

export function useCreateCleaningProcess() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/cleaning-process/create', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-processes'] })
      toast.success('Cleaning process created successfully')
    },
    onError: () => {
      toast.error('Failed to create cleaning process')
    },
  })
}

export function useValidateCleaningProcess() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ processId, protocolId }: { processId: number; protocolId: number }) => {
      const res = await api.post(`/cleaning-process/${processId}/validate`, {
        validation_protocol_id: protocolId
      })
      return res.data
    },
    onSuccess: (_, { processId }) => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-process', processId] })
      queryClient.invalidateQueries({ queryKey: ['cleaning-processes'] })
      toast.success('Process validated successfully')
    },
    onError: () => {
      toast.error('Failed to validate process')
    },
  })
}

export function useProcessCapability(processId: number, executionsCount: number = 10) {
  return useQuery({
    queryKey: ['process-capability', processId, executionsCount],
    queryFn: async () => {
      const res = await api.post('/cleaning-process/capability', {
        process_id: processId,
        historical_executions_count: executionsCount
      })
      return res.data
    },
    enabled: !!processId,
  })
}