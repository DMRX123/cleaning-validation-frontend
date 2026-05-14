'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Save, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

const steps = [
  { id: 1, name: 'Products', description: 'Select previous and next product' },
  { id: 2, name: 'Equipment', description: 'Select equipment and surface area' },
  { id: 3, name: 'MACO', description: 'Calculate MACO limits' },
  { id: 4, name: 'Swab Limit', description: 'Calculate swab limits' },
  { id: 5, name: 'Rinse Limit', description: 'Calculate rinse limits' },
  { id: 6, name: 'Standards', description: 'Standard preparation' },
  { id: 7, name: 'Swab Results', description: 'Enter swab test results' },
  { id: 8, name: 'Rinse Results', description: 'Enter rinse test results' },
  { id: 9, name: 'Review', description: 'Review and generate report' },
]

interface ValidationWizardProps {
  sessionId?: string
  initialData?: any
}

export function ValidationWizard({ sessionId, initialData }: ValidationWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [sessionData, setSessionData] = useState<any>({
    sessionId: sessionId ? parseInt(sessionId) : null,
    ...initialData
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (sessionId && !sessionData.sessionId) {
      fetchSessionData()
    }
  }, [sessionId])

  const fetchSessionData = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/validation/session/${sessionId}`)
      setSessionData((prev: any) => ({ ...prev, ...res.data, sessionId: parseInt(sessionId as string) }))
    } catch (error) {
      toast.error('Failed to load session data')
    } finally {
      setLoading(false)
    }
  }

  const handleNext = async () => {
    // Check if products are selected before creating session
    if (currentStep === 1 && !sessionData.sessionId) {
      if (!sessionData.previousProductId || !sessionData.nextProductId) {
        toast.error('Please select both previous and next products')
        return
      }
      
      setSaving(true)
      try {
        const res = await api.post('/validation/session', {
          previous_product_id: sessionData.previousProductId,
          next_product_id: sessionData.nextProductId,
          extra_area_percentage: sessionData.extraAreaPercentage || 0,
        })
        setSessionData({ ...sessionData, sessionId: res.data.id, sessionCode: res.data.session_code })
        toast.success('Session created successfully')
      } catch (error: any) {
        console.error('Session creation error:', error.response?.data || error.message)
        toast.error(error.response?.data?.detail || 'Failed to create session')
        setSaving(false)
        return
      }
      setSaving(false)
    }
    setCurrentStep(currentStep + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSaveProgress = async () => {
    if (!sessionData.sessionId) {
      toast.error('No active session to save')
      return
    }
    setSaving(true)
    try {
      await api.put(`/validation/session/${sessionData.sessionId}`, {
        step: currentStep,
        data: sessionData
      })
      toast.success('Progress saved successfully')
    } catch (error) {
      toast.error('Failed to save progress')
    } finally {
      setSaving(false)
    }
  }

  const renderStep = () => {
    const props = { data: sessionData, onChange: setSessionData }
    
    switch (currentStep) {
      case 1: return <Step1_SelectProducts {...props} />
      case 2: return <Step2_EquipmentDetails {...props} />
      case 3: return <Step3_MACO {...props} />
      case 4: return <Step4_SwabLimit {...props} />
      case 5: return <Step5_RinseLimit {...props} />
      case 6: return <Step6_Standards {...props} />
      case 7: return <Step7_SwabResults {...props} />
      case 8: return <Step8_RinseResults {...props} />
      case 9: return <Step9_ReviewReport {...props} />
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-pharma-600" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <StepIndicator steps={steps} currentStep={currentStep} />
      
      <Card className="mt-6">
        <CardContent className="p-6">
          {renderStep()}
          
          <div className="flex justify-between mt-8 pt-4 border-t">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSaveProgress} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Progress'}
              </Button>
              
              {currentStep === steps.length ? (
                <Button onClick={() => router.push(`/reports/${sessionData.sessionId}`)}>
                  View Report
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={saving}>
                  {saving ? 'Processing...' : 'Next'}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}