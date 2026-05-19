// src/store/useValidationStore.ts
import { create } from 'zustand'

interface ValidationStep {
  id: number
  name: string
  completed: boolean
  data: Record<string, any>
}

interface ValidationState {
  currentSession: any | null
  currentStep: number
  steps: ValidationStep[]
  sessionData: Record<string, any>
  isComplete: boolean
  
  setCurrentSession: (session: any | null) => void
  setCurrentStep: (step: number) => void
  setSessionData: (data: Record<string, any>) => void
  updateStepData: (stepId: number, data: Record<string, any>) => void
  completeStep: (stepId: number) => void
  resetValidation: () => void
  markComplete: () => void
}

const initialSteps: ValidationStep[] = [
  { id: 1, name: 'Products', completed: false, data: {} },
  { id: 2, name: 'Equipment', completed: false, data: {} },
  { id: 3, name: 'MACO', completed: false, data: {} },
  { id: 4, name: 'Swab Limit', completed: false, data: {} },
  { id: 5, name: 'Rinse Limit', completed: false, data: {} },
  { id: 6, name: 'Standards', completed: false, data: {} },
  { id: 7, name: 'Swab Results', completed: false, data: {} },
  { id: 8, name: 'Rinse Results', completed: false, data: {} },
  { id: 9, name: 'Review', completed: false, data: {} },
]

export const useValidationStore = create<ValidationState>((set) => ({
  currentSession: null,
  currentStep: 1,
  steps: initialSteps,
  sessionData: {},
  isComplete: false,
  
  setCurrentSession: (session) => set({ currentSession: session }),
  
  setCurrentStep: (step) => set({ currentStep: step }),
  
  setSessionData: (data) => set((state) => ({ 
    sessionData: { ...state.sessionData, ...data } 
  })),
  
  updateStepData: (stepId, data) => set((state) => ({
    steps: state.steps.map(step =>
      step.id === stepId ? { ...step, data: { ...step.data, ...data } } : step
    ),
    sessionData: { ...state.sessionData, ...data }
  })),
  
  completeStep: (stepId) => set((state) => ({
    steps: state.steps.map(step =>
      step.id === stepId ? { ...step, completed: true } : step
    )
  })),
  
  resetValidation: () => set({
    currentSession: null,
    currentStep: 1,
    steps: initialSteps,
    sessionData: {},
    isComplete: false,
  }),
  
  markComplete: () => set({ isComplete: true }),
}))