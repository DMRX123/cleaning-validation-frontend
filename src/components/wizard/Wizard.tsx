// src/components/wizard/Wizard.tsx
'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Save, Loader2, AlertCircle } from 'lucide-react'
import { StepIndicator } from './StepIndicator'
import { Step1_SelectProducts } from './Step1_SelectProducts'
import { Step2_EquipmentDetails } from './Step2_EquipmentDetails'
import { Step3_MACO } from './Step3_MACO'
import { Step4_SwabLimit } from './Step4_SwabLimit'
import { Step5_RinseLimit } from './Step5_RinseLimit'
import { Step6_Standards } from './Step6_Standards'
import { Step7_SwabResults } from './Step7_SwabResults'
import { Step8_RinseResults } from './Step8_RinseResults'
import { Step9_ReviewReport } from './Step9_ReviewReport'
import api from '@/lib/api'
import toast from 'react-hot-toast'

// Wizard Context for state management
interface WizardContextType {
  data: any
  setData: (data: any) => void
  currentStep: number
  goToStep: (step: number) => void
  isStepValid: (step: number) => boolean
  saveProgress: () => Promise<void>
}

const WizardContext = createContext<WizardContextType | null>(null)

export const useWizard = () => {
  const context = useContext(WizardContext)
  if (!context) {
    throw new Error('useWizard must be used within Wizard')
  }
  return context
}

// Step definitions with validation
export const STEPS = [
  { id: 1, name: 'Products', description: 'Select previous and next product', validation: (data: any) => !!data.previousProductId && !!data.nextProductId },
  { id: 2, name: 'Equipment', description: 'Select equipment and surface area', validation: (data: any) => data.selectedEquipments?.length > 0 },
  { id: 3, name: 'MACO', description: 'Calculate MACO limits', validation: (data: any) => !!data.maco?.lowest_maco },
  { id: 4, name: 'Swab Limit', description: 'Calculate swab limits', validation: (data: any) => !!data.swabLimit?.ppm },
  { id: 5, name: 'Rinse Limit', description: 'Calculate rinse limits', validation: (data: any) => !!data.rinseLimit?.limit_mg },
  { id: 6, name: 'Standards', description: 'Standard preparation', validation: (data: any) => !!data.standardPrep?.dilution_factor },
  { id: 7, name: 'Swab Results', description: 'Enter swab test results', validation: (data: any) => data.swabResults?.length > 0 },
  { id: 8, name: 'Rinse Results', description: 'Enter rinse test results', validation: (data: any) => data.rinseResults?.length > 0 },
  { id: 9, name: 'Review', description: 'Review and generate report', validation: (data: any) => true },
]

interface WizardProps {
  sessionId?: string
  initialData?: any
  onComplete?: (sessionId: number) => void
}

export function Wizard({ sessionId, initialData, onComplete }: WizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<any>({
    sessionId: sessionId ? parseInt(sessionId) : null,
    ...initialData,
    swabResults: initialData?.swabResults || [],
    rinseResults: initialData?.rinseResults || [],
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load session data if sessionId provided
  useEffect(() => {
    if (sessionId && !data.sessionId) {
      loadSessionData()
    }
  }, [sessionId])

  const loadSessionData = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/validation/session/${sessionId}`)
      const sessionData = res.data.data || res.data
      
      setData((prev: any) => ({
        ...prev,
        ...sessionData,
        sessionId: parseInt(sessionId as string),
        previousProductId: sessionData.previous_product_id,
        nextProductId: sessionData.next_product_id,
        extraAreaPercentage: sessionData.extra_area_percentage,
        totalSurfaceArea: sessionData.total_surface_area,
        maco: {
          method_10ppm: sessionData.maco_10ppm,
          method_tdd: sessionData.maco_tdd,
          method_ade_pde: sessionData.maco_ade_pde,
          lowest_maco: sessionData.lowest_maco,
        },
        swabLimit: {
          mg_per_swab: sessionData.swab_limit_mg,
          ppm: sessionData.swab_limit_ppm,
        },
        rinseLimit: {
          limit_mg: sessionData.rinse_limit_mg,
          limit_ppm: sessionData.rinse_limit_ppm,
        },
        swabResults: sessionData.swab_results || [],
        rinseResults: sessionData.rinse_results || [],
        standardPrep: sessionData.standard_prep,
      }))
      
      // Determine current step based on completed data
      if (sessionData.swab_results?.length > 0) {
        setCurrentStep(9)
      } else if (sessionData.rinse_results?.length > 0) {
        setCurrentStep(8)
      } else if (sessionData.standard_prep) {
        setCurrentStep(7)
      } else if (sessionData.rinse_limit_ppm) {
        setCurrentStep(6)
      } else if (sessionData.swab_limit_ppm) {
        setCurrentStep(5)
      } else if (sessionData.lowest_maco) {
        setCurrentStep(4)
      } else if (sessionData.total_surface_area) {
        setCurrentStep(3)
      } else if (sessionData.previous_product_id) {
        setCurrentStep(2)
      }
    } catch (error) {
      toast.error('Failed to load session data')
    } finally {
      setLoading(false)
    }
  }

  const isStepValid = (step: number): boolean => {
    const stepDef = STEPS.find(s => s.id === step)
    if (!stepDef) return false
    return stepDef.validation(data)
  }

  const goToStep = (step: number) => {
    if (step >= 1 && step <= STEPS.length) {
      let allPreviousValid = true
      for (let i = 1; i < step; i++) {
        if (!isStepValid(i)) {
          allPreviousValid = false
          break
        }
      }
      if (allPreviousValid) {
        setCurrentStep(step)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        toast.error('Please complete previous steps first')
      }
    }
  }

  const saveProgress = async () => {
    if (!data.sessionId) {
      toast.error('No active session to save')
      return
    }

    setSaving(true)
    try {
      await api.put(`/validation/session/${data.sessionId}`, {
        step: currentStep,
        previous_product_id: data.previousProductId,
        next_product_id: data.nextProductId,
        extra_area_percentage: data.extraAreaPercentage,
        total_surface_area: data.totalSurfaceArea,
        maco_10ppm: data.maco?.method_10ppm,
        maco_tdd: data.maco?.method_tdd,
        maco_ade_pde: data.maco?.method_ade_pde,
        lowest_maco: data.maco?.lowest_maco,
        swab_limit_mg: data.swabLimit?.mg_per_swab,
        swab_limit_ppm: data.swabLimit?.ppm,
        rinse_limit_mg: data.rinseLimit?.limit_mg,
        rinse_limit_ppm: data.rinseLimit?.limit_ppm,
      })
      toast.success('Progress saved successfully')
      setError(null)
    } catch (error) {
      toast.error('Failed to save progress')
      setError('Could not save progress. Please check your connection.')
    } finally {
      setSaving(false)
    }
  }

  const createSession = async () => {
    setSaving(true)
    try {
      const res = await api.post('/validation/session', {
        previous_product_id: data.previousProductId,
        next_product_id: data.nextProductId,
        extra_area_percentage: data.extraAreaPercentage || 0,
      })
      setData({ ...data, sessionId: res.data.id, sessionCode: res.data.session_code })
      toast.success('Session created successfully')
      setError(null)
      return res.data.id
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to create session'
      toast.error(errorMsg)
      setError(errorMsg)
      return null
    } finally {
      setSaving(false)
    }
  }

  const handleNext = async () => {
    if (!isStepValid(currentStep)) {
      toast.error(`Please complete all required fields in ${STEPS[currentStep - 1].name}`)
      return
    }

    if (currentStep === 1 && !data.sessionId) {
      const newSessionId = await createSession()
      if (!newSessionId) return
    }

    setCurrentStep(currentStep + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleComplete = () => {
    if (onComplete && data.sessionId) {
      onComplete(data.sessionId)
    } else if (data.sessionId) {
      router.push(`/reports/${data.sessionId}`)
    }
  }

  const renderStep = () => {
    const stepProps = { data, onChange: setData }
    
    switch (currentStep) {
      case 1: return <Step1_SelectProducts {...stepProps} />
      case 2: return <Step2_EquipmentDetails {...stepProps} />
      case 3: return <Step3_MACO {...stepProps} />
      case 4: return <Step4_SwabLimit {...stepProps} />
      case 5: return <Step5_RinseLimit {...stepProps} />
      case 6: return <Step6_Standards {...stepProps} />
      case 7: return <Step7_SwabResults {...stepProps} />
      case 8: return <Step8_RinseResults {...stepProps} />
      case 9: return <Step9_ReviewReport {...stepProps} />
      default: return null
    }
  }

  const getStepStatus = (stepId: number): 'completed' | 'current' | 'pending' | 'locked' => {
    if (stepId < currentStep) {
      return isStepValid(stepId) ? 'completed' : 'pending'
    }
    if (stepId === currentStep) return 'current'
    if (stepId > currentStep) {
      let allPreviousValid = true
      for (let i = 1; i < stepId; i++) {
        if (!isStepValid(i)) {
          allPreviousValid = false
          break
        }
      }
      return allPreviousValid ? 'pending' : 'locked'
    }
    return 'pending'
  }

  const getProgressPercent = () => {
    return Math.floor((currentStep / STEPS.length) * 100)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-pharma-600" />
        <p className="text-gray-500">Loading validation session...</p>
      </div>
    )
  }

  return (
    <WizardContext.Provider value={{ data, setData, currentStep, goToStep, isStepValid, saveProgress }}>
      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
              ×
            </button>
          </div>
        )}

        <StepIndicator 
          steps={STEPS.map(s => ({ id: s.id, name: s.name, description: s.description }))}
          currentStep={currentStep}
          getStepStatus={getStepStatus}
          onStepClick={goToStep}
        />

        <Card className="mt-6">
          <CardContent className="p-6">
            {renderStep()}
            
            <div className="flex justify-between mt-8 pt-4 border-t">
              <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex gap-2">
                {data.sessionId && (
                  <Button variant="outline" onClick={saveProgress} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Progress'}
                  </Button>
                )}
                
                {currentStep === STEPS.length ? (
                  <Button onClick={handleComplete} className="bg-pharma-600 hover:bg-pharma-700">
                    Complete & View Report
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleNext} disabled={!isStepValid(currentStep)}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].name}
          </p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-pharma-600 h-2 rounded-full transition-all duration-300 w-full" 
                 style={{ width: `${getProgressPercent()}%` }} />
          </div>
        </div>
      </div>
    </WizardContext.Provider>
  )
}