// src/app/(dashboard)/guidance/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, HelpCircle, FileText, ChevronDown, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'
import { Breadcrumb } from '@/components/layout/breadcrumb'

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
      
      // Handle different response structures
      let questionsData = res.data
      
      // If response has data property
      if (res.data.data && Array.isArray(res.data.data)) {
        questionsData = res.data.data
      }
      // If response has questions property
      else if (res.data.questions && Array.isArray(res.data.questions)) {
        questionsData = res.data.questions
      }
      // If response is not an array, try to extract from data
      else if (!Array.isArray(res.data)) {
        // If it's an object with numeric keys
        if (typeof res.data === 'object' && res.data !== null) {
          const possibleArray = Object.values(res.data).find(v => Array.isArray(v))
          if (possibleArray) {
            questionsData = possibleArray
          } else {
            questionsData = []
          }
        } else {
          questionsData = []
        }
      }
      
      setQuestions(questionsData)
    } catch (error) {
      console.error('Failed to fetch guidance:', error)
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }

  const toggleQuestion = (questionId: string) => {
    setOpenQuestion(openQuestion === questionId ? null : questionId)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Breadcrumb />
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-pharma-600" />
            </div>
          </main>
        </div>
      </div>
    )
  }

  // Fallback questions if API returns empty
  const fallbackQuestions: GuidanceQuestion[] = [
    {
      question_id: "Q1",
      question: "When should a company validate/revalidate cleaning procedures?",
      answer: "Revalidation is required when there are changes to cleaning procedure, equipment, product, or analytical method. Periodic evaluation (typically annually) is recommended.",
      guideline_section: "10.0"
    },
    {
      question_id: "Q2",
      question: "What number of cleans should be run in order to validate a cleaning procedure?",
      answer: "Generally three consecutive successful replicates are required.",
      guideline_section: "9.0"
    },
    {
      question_id: "Q3",
      question: "Is it necessary to validate a maximum time allowed for a piece of equipment to be dirty before cleaning?",
      answer: "YES. Dirty Hold Time (DHT) should be validated.",
      guideline_section: "9.7"
    },
    {
      question_id: "Q4",
      question: "Is it necessary to validate a maximum time allowed for a piece of equipment to be left clean before re-use?",
      answer: "YES. Clean Hold Time (CHT) should be validated if there is any risk of contamination.",
      guideline_section: "9.7"
    },
    {
      question_id: "Q5",
      question: "Is it necessary to include microbiological testing in cleaning validation?",
      answer: "YES if water is used for final cleaning or for biotech/parenteral products.",
      guideline_section: "8.1"
    },
    {
      question_id: "Q6",
      question: "Which analytical methods should be used in cleaning validation studies?",
      answer: "Any method suitable for intended use (HPLC, GC, TLC, TOC, dry residue, conductivity, pH).",
      guideline_section: "8.0"
    },
    {
      question_id: "Q7",
      question: "Do we have to wait for swab and rinse samples to be approved prior using the equipment for production?",
      answer: "During cleaning validation studies it is recommended to wait for completion of all planned tests.",
      guideline_section: "10.0"
    },
    {
      question_id: "Q8",
      question: "What is the maximum time allowed after cleaning with water as last rinse?",
      answer: "Equipment should not be left with water in it after cleaning.",
      guideline_section: "9.7"
    },
    {
      question_id: "Q9",
      question: "Is it possible that deterioration of equipment may take place over time, invalidating original validation results?",
      answer: "Yes, equipment materials should be evaluated for durability over time as part of preventative maintenance program.",
      guideline_section: "8.2"
    },
    {
      question_id: "Q10",
      question: "If a company has validated a worst case scenario, should they also validate a 'less' worst case?",
      answer: "For operational reasons it may be beneficial to validate a 'less' stringent cleaning procedure for some products.",
      guideline_section: "7.0"
    }
  ]

  const displayQuestions = questions.length > 0 ? questions : fallbackQuestions

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
                        {displayQuestions.length} frequently asked questions with answers from APIC Guidance
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
                    {displayQuestions.map((q) => (
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