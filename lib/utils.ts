import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { differenceInYears, format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calcAge(birthDate: string | null): number | null {
  if (!birthDate) return null
  try {
    return differenceInYears(new Date(), parseISO(birthDate))
  } catch {
    return null
  }
}

export function formatDate(date: string | null, fmt = 'dd/MM/yyyy'): string {
  if (!date) return '-'
  try {
    return format(parseISO(date), fmt, { locale: ptBR })
  } catch {
    return '-'
  }
}

export function formatDatetime(date: string | null): string {
  if (!date) return '-'
  try {
    return format(parseISO(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  } catch {
    return '-'
  }
}

export function maskCPF(cpf: string): string {
  return cpf
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function maskPhone(phone: string): string {
  return phone
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+$/, '$1')
}

export function greetingByTime(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function truncate(str: string | null, max = 80): string {
  if (!str) return ''
  if (str.length <= max) return str
  return str.slice(0, max) + '...'
}
