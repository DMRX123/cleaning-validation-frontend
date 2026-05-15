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

// Step definitions
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
      setData((prev: any) => ({
        ...prev,
        ...res.data,
        sessionId: parseInt(sessionId as string),
        maco: {
          method_10ppm: res.data.maco_10ppm,
          method_tdd: res.data.maco_tdd,
          method_ade_pde: res.data.maco_ade_pde,
          lowest_maco: res.data.lowest_maco,
        },
        swabLimit: {
          mg_per_swab: res.data.swab_limit_mg,
          ppm: res.data.swab_limit_ppm,
        },
        rinseLimit: {
          limit_mg: res.data.rinse_limit_mg,
          limit_ppm: res.data.rinse_limit_ppm,
        },
      }))
      
      // Determine current step based on completed data
      if (res.data.swab_results?.length > 0) {
        setCurrentStep(9)
      } else if (res.data.rinse_results?.length > 0) {
        setCurrentStep(8)
      } else if (res.data.standard_prep) {
        setCurrentStep(7)
      } else if (res.data.rinse_limit_ppm) {
        setCurrentStep(6)
      } else if (res.data.swab_limit_ppm) {
        setCurrentStep(5)
      } else if (res.data.lowest_maco) {
        setCurrentStep(4)
      } else if (res.data.total_surface_area) {
        setCurrentStep(3)
      } else if (res.data.previous_product_id) {
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
      setCurrentStep(step)
      window.scrollTo({ top: 0, behavior: 'smooth' })
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
        data: {
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
        },
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
    } catch (error) {
      toast.error('Failed to create session')
      setError('Could not create session. Please try again.')
      return null
    } finally {
      setSaving(false)
    }
  }

  const handleNext = async () => {
    // Validate current step
    if (!isStepValid(currentStep)) {
      toast.error(`Please complete all required fields in ${STEPS[currentStep - 1].name}`)
      return
    }

    // Create session if on step 1 and no session exists
    if (currentStep === 1 && !data.sessionId) {
      const newSessionId = await createSession()
      if (!newSessionId) return
    }

    setCurrentStep(currentStep + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
      case 1:
        return <Step1_SelectProducts {...stepProps} />
      case 2:
        return <Step2_EquipmentDetails {...stepProps} />
      case 3:
        return <Step3_MACO {...stepProps} />
      case 4:
        return <Step4_SwabLimit {...stepProps} />
      case 5:
        return <Step5_RinseLimit {...stepProps} />
      case 6:
        return <Step6_Standards {...stepProps} />
      case 7:
        return <Step7_SwabResults {...stepProps} />
      case 8:
        return <Step8_RinseResults {...stepProps} />
      case 9:
        return <Step9_ReviewReport {...stepProps} />
      default:
        return null
    }
  }

  const getStepStatus = (stepId: number): 'completed' | 'current' | 'pending' | 'locked' => {
    if (stepId < currentStep) {
      return isStepValid(stepId) ? 'completed' : 'pending'
    }
    if (stepId === currentStep) return 'current'
    if (stepId > currentStep) {
      // Check if previous steps are valid
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

  // Calculate progress percentage
  const progressPercentage = (currentStep / STEPS.length) * 100

  if (loading) {
    return (
      <div className="wizard-loading-container">
        <Loader2 className="wizard-loading-spinner" />
        <p className="wizard-loading-text">Loading validation session...</p>
      </div>
    )
  }

  return (
    <WizardContext.Provider value={{ data, setData, currentStep, goToStep, isStepValid, saveProgress }}>
      <div className="wizard-container">
        {/* Error Banner */}
        {error && (
          <div className="wizard-error-banner">
            <AlertCircle className="wizard-error-icon" />
            <p className="wizard-error-text">{error}</p>
            <button onClick={() => setError(null)} className="wizard-error-close" aria-label="Close">
              ×
            </button>
          </div>
        )}

        {/* Step Indicator */}
        <StepIndicator 
          steps={STEPS.map(s => ({ id: s.id, name: s.name, description: s.description }))}
          currentStep={currentStep}
          getStepStatus={getStepStatus}
          onStepClick={goToStep}
        />

        {/* Step Content */}
        <Card className="wizard-step-card">
          <CardContent className="wizard-step-content">
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="wizard-nav-container">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="wizard-nav-icon" />
                Previous
              </Button>

              <div className="wizard-nav-buttons-group">
                <Button 
                  variant="outline" 
                  onClick={saveProgress} 
                  disabled={saving || !data.sessionId}
                >
                  <Save className="wizard-nav-icon" />
                  {saving ? 'Saving...' : 'Save Progress'}
                </Button>

                {currentStep === STEPS.length ? (
                  <Button 
                    onClick={handleComplete}
                    disabled={!isStepValid(currentStep)}
                    className="wizard-complete-btn"
                  >
                    Complete & View Report
                    <ChevronRight className="wizard-nav-icon" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleNext}
                    disabled={!isStepValid(currentStep)}
                  >
                    Next
                    <ChevronRight className="wizard-nav-icon" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Info */}
        <div className="wizard-progress-container">
          <p className="wizard-progress-text">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].name}
          </p>
          <div 
            className="wizard-progress-bar-bg"
            data-progress={progressPercentage}
          >
            <div className="wizard-progress-bar-fill" />
          </div>
        </div>
      </div>
    </WizardContext.Provider>
  )
}