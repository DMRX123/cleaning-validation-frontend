'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CleaningLevelSelector } from '@/components/cleaning-levels/CleaningLevelSelector'
import { HoldTimeValidator } from '@/components/hold-time/HoldTimeValidator'
import { MicrobiologicalLimits } from '@/components/microbiological/MicrobiologicalLimits'
import { WorstCaseMatrix } from '@/components/bracketing/WorstCaseMatrix'
import { ProtocolGenerator } from '@/components/protocols/ProtocolGenerator'
import { ProtocolExecution } from '@/components/protocols/ProtocolExecution'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, FileText, Clock, Microscope, Trophy, ClipboardCheck } from 'lucide-react'

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
              APIC Cleaning Validation Guide Implementation
            </h1>

            <Tabs defaultValue="cleaning-levels">
              <TabsList className="mb-6">
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
                  Worst Case/Rating
                </TabsTrigger>
                <TabsTrigger value="protocols">
                  <FileText className="h-4 w-4 mr-2" />
                  Protocols
                </TabsTrigger>
                <TabsTrigger value="execution">
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Execution
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
                <WorstCaseMatrix productIds={[1, 2, 3, 4, 5]} />
              </TabsContent>

              <TabsContent value="protocols">
                <ProtocolGenerator
                  equipmentId={1}
                  previousProductId={1}
                  nextProductId={2}
                />
              </TabsContent>

              <TabsContent value="execution">
                {selectedProtocol ? (
                  <ProtocolExecution
                    protocolId={selectedProtocol}
                    onComplete={() => setSelectedProtocol(null)}
                  />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Protocol Execution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-500">
                        First generate a protocol from the Protocols tab, then execute it here.
                      </p>
                    </CardContent>
                  </Card>
                )}
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
                    Microbiological Testing
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
                    <strong>Section 4.2.1</strong><br />
                    ADE/PDE Calculation
                  </div>
                  <div className="p-2 bg-white rounded">
                    <strong>Section 4.2.6</strong><br />
                    Different Limits Rationale
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