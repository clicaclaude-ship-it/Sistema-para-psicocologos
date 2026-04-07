'use client'

import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DatePickerProps {
  value?: string // formato YYYY-MM-DD
  onChange: (value: string) => void
  placeholder?: string
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: currentYear - 1920 + 1 }, (_, i) => currentYear - i)
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)

function pad(n: number | string) {
  return String(n).padStart(2, '0')
}

function parseDate(value?: string) {
  if (value && value.length === 10) {
    const parts = value.split('-')
    return { year: parts[0] ?? '', month: parts[1] ?? '', day: parts[2] ?? '' }
  }
  return { year: '', month: '', day: '' }
}

export function DatePicker({ value, onChange }: DatePickerProps) {
  const parsed = parseDate(value)
  // Estado interno para guardar seleções parciais (ex: escolheu dia mas ainda não escolheu mês/ano)
  const [day, setDay] = useState(parsed.day)
  const [month, setMonth] = useState(parsed.month)
  const [year, setYear] = useState(parsed.year)

  // Sincroniza quando o value externo muda (ex: ao carregar dados de edição)
  useEffect(() => {
    const p = parseDate(value)
    setDay(p.day)
    setMonth(p.month)
    setYear(p.year)
  }, [value])

  function update(newDay: string, newMonth: string, newYear: string) {
    setDay(newDay)
    setMonth(newMonth)
    setYear(newYear)
    if (newDay && newMonth && newYear) {
      onChange(`${newYear}-${pad(newMonth)}-${pad(newDay)}`)
    } else {
      onChange('')
    }
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      <Select
        value={day}
        onValueChange={(val) => update(val ?? '', month, year)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Dia" />
        </SelectTrigger>
        <SelectContent>
          {DAYS.map((d) => (
            <SelectItem key={d} value={pad(d)}>
              {pad(d)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={month}
        onValueChange={(val) => update(day, val ?? '', year)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((name, idx) => (
            <SelectItem key={idx + 1} value={pad(idx + 1)}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={year}
        onValueChange={(val) => update(day, month, val ?? '')}
      >
        <SelectTrigger>
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          {YEARS.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
