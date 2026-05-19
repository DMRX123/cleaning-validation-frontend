// src/app/(dashboard)/guidelines/page.tsx
'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CleaningLevelSelector } from '@/components/cleaning-levels/CleaningLevelSelector'
import { HoldTimeValidator } from '@/components/hold-time/HoldTimeValidator'
import { MicrobiologicalLimits } from '@/components/microbiological/MicrobiologicalLimits'
import { WorstCaseMatrix } from '@/components/bracketing/WorstCaseMatrix'
import { FMEAMatrix } from '@/components/fmea/FMEAMatrix'
import { RecoveryStudyManager } from '@/components/recovery/RecoveryStudyManager'
import { NitrosamineAssessment } from '@/components/nitrosamine/NitrosamineAssessment'
import { OperatorQualificationManager } from '@/components/operator-qualification/OperatorQualificationManager'
import { BracketingGroupManager } from '@/components/bracketing/BracketingGroupManager'
import { ProtocolManager } from '@/components/protocols/ProtocolManager'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Clock, Microscope, Trophy, AlertTriangle, FlaskConical, Radiation, GraduationCap, GitBranch, FileText } from 'lucide-react'
import { useState } from 'react'

export default function GuidelinesPage() {
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [selectedProtocol, setSelectedProtocol] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Breadcrumb />
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-pharma-700 mb-6">
              APIC Cleaning Validation Guide - Complete Implementation
            </h1>

            <Tabs defaultValue="cleaning-levels">
              <TabsList className="flex flex-wrap h-auto mb-6">
                <TabsTrigger value="cleaning-levels">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Cleaning Levels
                </TabsTrigger>
                <TabsTrigger value="hold-times">
                  <Clock className="h-4 w-4 mr-2" />
                  Hold Times
                </TabsTrigger>
                <TabsTrigger value="microbiological">
                  <Microscope className="h-4 w-4 mr-2" />
                  Microbiological
                </TabsTrigger>
                <TabsTrigger value="bracketing">
                  <Trophy className="h-4 w-4 mr-2" />
                  Bracketing/Worst Case
                </TabsTrigger>
                <TabsTrigger value="fmea">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  FMEA (Section 8.1)
                </TabsTrigger>
                <TabsTrigger value="recovery">
                  <FlaskConical className="h-4 w-4 mr-2" />
                  Recovery Studies
                </TabsTrigger>
                <TabsTrigger value="nitrosamine">
                  <Radiation className="h-4 w-4 mr-2" />
                  Nitrosamines
                </TabsTrigger>
                <TabsTrigger value="operator">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Operator Qualification
                </TabsTrigger>
                <TabsTrigger value="protocols">
                  <FileText className="h-4 w-4 mr-2" />
                  Protocols
                </TabsTrigger>
              </TabsList>

              <TabsContent value="cleaning-levels">
                <CleaningLevelSelector
                  previousProductId={1}
                  nextProductId={2}
                  onLevelDetermined={(level, requirements) => {
                    console.log('Level:', level, requirements)
                  }}
                />
              </TabsContent>

              <TabsContent value="hold-times">
                <HoldTimeValidator equipmentId={1} />
              </TabsContent>

              <TabsContent value="microbiological">
                <MicrobiologicalLimits productType="parenteral" />
              </TabsContent>

              <TabsContent value="bracketing">
                <div className="space-y-6">
                  <BracketingGroupManager />
                  <WorstCaseMatrix productIds={selectedProducts.length ? selectedProducts : [1, 2, 3, 4, 5]} />
                </div>
              </TabsContent>

              <TabsContent value="fmea">
                <FMEAMatrix />
              </TabsContent>

              <TabsContent value="recovery">
                <RecoveryStudyManager />
              </TabsContent>

              <TabsContent value="nitrosamine">
                <NitrosamineAssessment />
              </TabsContent>

              <TabsContent value="operator">
                <OperatorQualificationManager />
              </TabsContent>

              <TabsContent value="protocols">
                <ProtocolManager
                  equipmentId={1}
                  previousProductId={1}
                  nextProductId={2}
                />
              </TabsContent>
            </Tabs>

            {/* Reference Card */}
            <Card className="mt-6 bg-gray-50">
              <CardHeader>
                <CardTitle className="text-sm font-medium">APIC Cleaning Validation Guide Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="p-2 bg-white rounded">
                    <strong>Section 5.0</strong><br />
                    Levels of Cleaning
                  </div>
                  <div className="p-2 bg-white rounded">
                    <strong>Section 7.0</strong><br />
                    Bracketing & Worst Case
                  </div>
                  <div className="p-2 bg-white rounded">
                    <strong>Section 8.1</strong><br />
                    Microbiological Testing & FMEA
                  </div>
                  <div className="p-2 bg-white rounded">
                    <strong>Section 8.3</strong><br />
                    Recovery Studies
                  </div>
                  <div className="p-2 bg-white rounded">
                    <strong>Section 9.7</strong><br />
                    Hold Times (DHT/CHT)
                  </div>
                  <div className="p-2 bg-white rounded">
                    <strong>Section 9.0</strong><br />
                    Validation Protocol
                  </div>
                  <div className="p-2 bg-white rounded">
                    <strong>Section 10.0</strong><br />
                    Revalidation & Change Control
                  </div>
                  <div className="p-2 bg-white rounded">
                    <strong>Section 11</strong><br />
                    Operator Qualification
                  </div>
                  <div className="p-2 bg-white rounded">
                    <strong>Section 13</strong><br />
                    Nitrosamines Risk Assessment
                  </div>
                  <div className="p-2 bg-white rounded">
                    <strong>Section 4.2.1</strong><br />
                    ADE/PDE Calculation
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}