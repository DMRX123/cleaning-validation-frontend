import { create } from 'zustand'

interface ValidationState {
  currentSession: any | null
  currentStep: number
  sessionData: Record<string, any>
  setCurrentSession: (session: any | null) => void
  setCurrentStep: (step: number) => void
  setSessionData: (data: Record<string, any>) => void
  resetValidation: () => void
}

export const useValidationStore = create<ValidationState>((set) => ({
  currentSession: null,
  currentStep: 1,
  sessionData: {},
  setCurrentSession: (session) => set({ currentSession: session }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setSessionData: (data) => set((state) => ({ sessionData: { ...state.sessionData, ...data } })),
  resetValidation: () => set({ currentSession: null, currentStep: 1, sessionData: {} }),
}))