'use client'

import { useState } from 'react'
import { FormSheet, SelectField } from '@/components/primitives'
import type { FinanceFormOptions } from '@/features/finance/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export type FinanceQuickKind = 'payment' | 'expense'

export interface FinanceQuickFormValues {
  kind: FinanceQuickKind
  clientId: string
  relation: string
  amount: string
  fileName: string
  description: string
}

interface FinanceQuickFormSheetProps {
  kind: FinanceQuickKind
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: FinanceQuickFormValues) => void
  options?: FinanceFormOptions
}

export function FinanceQuickFormSheet({ kind, open, onOpenChange, onSubmit, options }: FinanceQuickFormSheetProps) {
  const [clientId, setClientId] = useState('')
  const [relation, setRelation] = useState('')
  const [amount, setAmount] = useState('')
  const [fileName, setFileName] = useState('')
  const [description, setDescription] = useState('')
  const isPayment = kind === 'payment'

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    setFileName(file?.name || '')
  }

  function handleSubmit() {
    onSubmit({
      kind,
      clientId,
      relation,
      amount: amount.trim(),
      fileName,
      description: description.trim(),
    })
    setClientId('')
    setRelation('')
    setAmount('')
    setFileName('')
    setDescription('')
    onOpenChange(false)
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isPayment ? 'Tahsilat gir' : 'Masraf gir'}
      description={isPayment ? 'Tahsilat bilgisini hızlıca kaydedin.' : 'Masraf bilgisini hızlıca kaydedin.'}
      footer={<Button className="w-full" onClick={handleSubmit}>Kaydet</Button>}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`quick-finance-client-${kind}`}>Müvekkil</Label>
          <SelectField id={`quick-finance-client-${kind}`} value={clientId} onChange={setClientId} options={(options?.clients || []).map((item) => ({ value: item.id, label: item.label }))} placeholder="Müvekkil seç" />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`quick-finance-relation-${kind}`}>Dosya</Label>
          <SelectField id={`quick-finance-relation-${kind}`} value={relation} onChange={setRelation} options={[...(options?.caseFiles || []).map((item) => ({ value: `case:${item.id}`, label: item.label })), ...(options?.enforcementFiles || []).map((item) => ({ value: `enforcement:${item.id}`, label: item.label }))]} placeholder="İsteğe bağlı" />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`quick-finance-amount-${kind}`}>Tutar</Label>
          <Input id={`quick-finance-amount-${kind}`} type="number" min="0" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0,00" />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`quick-finance-file-${kind}`}>Dosya</Label>
          <Input id={`quick-finance-file-${kind}`} type="file" onChange={handleFileChange} />
          {fileName ? <p className="text-xs text-muted-foreground">Seçilen dosya: {fileName}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`quick-finance-description-${kind}`}>Açıklama</Label>
          <Textarea id={`quick-finance-description-${kind}`} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Kısa açıklama" />
        </div>
      </div>
    </FormSheet>
  )
}
