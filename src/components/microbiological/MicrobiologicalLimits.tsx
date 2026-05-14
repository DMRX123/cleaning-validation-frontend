'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface MicrobiologicalLimitsProps {
  productType: string
}

export function MicrobiologicalLimits({ productType }: MicrobiologicalLimitsProps) {
  const [selectedType, setSelectedType] = useState(productType || 'oral')
  
  const limitsData: Record<string, any> = {
    oral: {
      total_germ_count: 100,
      yeast_mold: 50,
      endotoxin: 'Not required',
      sampling_method: 'Swab',
      reference: 'EP 2.6.12'
    },
    parenteral: {
      total_germ_count: 10,
      yeast_mold: 5,
      endotoxin: 0.25,
      sampling_method: 'Rinse',
      reference: 'EP 2.6.14'
    },
    topical: {
      total_germ_count: 100,
      yeast_mold: 50,
      endotoxin: 'Not required',
      sampling_method: 'Contact plate',
      reference: 'EP 2.6.12'
    },
    biotech: {
      total_germ_count: 10,
      yeast_mold: 5,
      endotoxin: 0.25,
      sampling_method: 'Swab',
      reference: 'PDA TR No. 29'
    },
    inhalation: {
      total_germ_count: 10,
      yeast_mold: 5,
      endotoxin: 0.25,
      sampling_method: 'Rinse',
      reference: 'Ph.Eur. 2.6.12'
    }
  }

  const getRiskLevel = (productType: string) => {
    const risks: Record<string, string> = {
      parenteral: 'HIGH',
      biotech: 'HIGH',
      inhalation: 'HIGH',
      topical: 'MEDIUM',
      oral: 'LOW'
    }
    return risks[productType] || 'MEDIUM'
  }

  const limits = limitsData[selectedType] || limitsData.oral

  return (
    <Card>
      <CardHeader>
        <CardTitle>Microbiological Limits (Section 8.1)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Product Type</Label>
          <Select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            <option value="oral">Oral</option>
            <option value="parenteral">Parenteral</option>
            <option value="topical">Topical</option>
            <option value="biotech">Biotech</option>
            <option value="inhalation">Inhalation</option>
          </Select>
        </div>

        <div className="p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Risk Level:</strong> {getRiskLevel(selectedType)}
          </p>
          <p className="text-sm text-yellow-700 mt-1">
            Reference: EMA 158/01 'Note for Guidance on Quality of Water for Pharmaceutical Use'
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Parameter</TableHead>
              <TableHead>Limit</TableHead>
              <TableHead>Sampling Method</TableHead>
              <TableHead>Reference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Total Germ Count</TableCell>
              <TableCell>{limits.total_germ_count} CFU/dm²</TableCell>
              <TableCell>{limits.sampling_method}</TableCell>
              <TableCell>{limits.reference}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Yeast & Mold</TableCell>
              <TableCell>{limits.yeast_mold} CFU/dm²</TableCell>
              <TableCell>{limits.sampling_method}</TableCell>
              <TableCell>{limits.reference}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Endotoxin</TableCell>
              <TableCell>{limits.endotoxin} {limits.endotoxin !== 'Not required' ? 'EU/ml' : ''}</TableCell>
              <TableCell>{limits.sampling_method}</TableCell>
              <TableCell>{limits.reference}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Microbiological testing is required when water is used for final cleaning
            or for biotech/parenteral products. Results below LOQ should be reported as LOQ value.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}