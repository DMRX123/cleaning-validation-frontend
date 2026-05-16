'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, HelpCircle, FileText, ChevronDown } from 'lucide-react'
import api from '@/lib/api'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface GuidanceQuestion {
  question_id: string
  question: string
  answer: string
  guideline_section: string
}

export default function GuidancePage() {
  const [questions, setQuestions] = useState<GuidanceQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [openQuestion, setOpenQuestion] = useState<string | null>(null)

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/guidance/questions')
      setQuestions(res.data)
    } catch (error) {
      console.error('Failed to fetch guidance:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleQuestion = (questionId: string) => {
    setOpenQuestion(openQuestion === questionId ? null : questionId)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Breadcrumb />
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="h-8 w-8 text-pharma-600" />
              <h1 className="text-2xl font-bold text-pharma-700">APIC Cleaning Validation Guidance</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Section 10.0</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium">Validation Questions</p>
                      <p className="text-xs text-blue-600 mt-1">
                        {questions.length} frequently asked questions with answers from APIC Guidance
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800 font-medium">Revalidation Assessment</p>
                      <p className="text-xs text-green-600 mt-1">
                        Use the revalidation checker to determine if changes require revalidation
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-800 font-medium">References</p>
                      <p className="text-xs text-purple-600 mt-1">
                        EMA/CHMP/CVMP/SWP/169430/2012<br />
                        ICH Q9 Quality Risk Management
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Questions List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5" />
                      Frequently Asked Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {questions.map((q) => (
                      <div key={q.question_id} className="border rounded-lg overflow-hidden">
                        <button
                          className="flex w-full items-center justify-between p-4 text-left font-medium transition-all hover:bg-gray-50"
                          onClick={() => toggleQuestion(q.question_id)}
                        >
                          <div className="flex items-start gap-3 text-left">
                            <span className="font-mono text-xs text-pharma-600 bg-pharma-50 px-2 py-0.5 rounded">
                              {q.question_id}
                            </span>
                            <span className="text-sm font-medium">{q.question}</span>
                          </div>
                          <ChevronDown className={`h-4 w-4 transition-transform ${openQuestion === q.question_id ? 'rotate-180' : ''}`} />
                        </button>
                        {openQuestion === q.question_id && (
                          <div className="p-4 pt-0">
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{q.answer}</p>
                              <div className="mt-2 flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  Section {q.guideline_section}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}