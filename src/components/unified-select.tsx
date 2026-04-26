'use client'

import { Label } from '@/components/ui/label'
import Select, { StylesConfig } from 'react-select'
import { cn } from '@/lib/utils'

export interface SelectItem {
  id: string
  label: string
  name?: string
  [key: string]: string | number | boolean | null | undefined
}

interface UnifiedSelectProps {
  value: string
  onChange: (value: string | null) => void
  label?: string
  required?: boolean
  placeholder?: string
  disabled?: boolean
  items: SelectItem[]
  searchable?: boolean
  className?: string
}

const selectStyles: StylesConfig<{ value: string; label: string }, false> = {
  container: (base) => ({
    ...base,
    width: '100%',
  }),
  control: (base, state) => ({
    ...base,
    minHeight: '32px',
    height: '32px',
    fontSize: '0.875rem',
    backgroundColor: 'white',
    borderColor: state.isFocused ? '#2563eb' : '#e2e8f0',
    borderRadius: '0.5rem',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none',
    '&:hover': {
      borderColor: '#2563eb',
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0 8px',
    height: '32px',
    color: '#0f172a',
  }),
  input: (base) => ({
    ...base,
    margin: '0',
    padding: '0',
    color: '#0f172a',
  }),
  placeholder: (base) => ({
    ...base,
    color: '#64748b',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#0f172a',
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: '32px',
  }),
  indicatorSeparator: (base) => ({
    ...base,
    backgroundColor: '#e2e8f0',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: '#64748b',
    '&:hover': {
      color: '#0f172a',
    },
  }),
  menu: (base) => ({
    ...base,
    fontSize: '0.875rem',
    zIndex: 50,
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    width: '100%',
  }),
  menuList: (base) => ({
    ...base,
    padding: '0.25rem',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#f1f5f9' : 'transparent',
    color: state.isSelected ? 'white' : '#0f172a',
    '&:active': {
      backgroundColor: '#f1f5f9',
    },
  }),
}

export function UnifiedSelect({
  value,
  onChange,
  label,
  required,
  placeholder = 'Seçin',
  disabled = false,
  items,
  searchable = false,
  className,
}: UnifiedSelectProps) {
  const options = items.map((item) => ({
    value: item.id,
    label: item.label || item.name || item.id,
  }))

  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <div className={cn("space-y-2 w-full", className)}>
      {label && (
        <Label className="text-sm font-medium">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <Select
        value={selectedOption || null}
        onChange={(option) => onChange(option?.value || null)}
        options={options}
        isDisabled={disabled}
        isSearchable={searchable}
        placeholder={placeholder}
        styles={selectStyles}
        isClearable={false}
      />
    </div>
  )
}
