export type Currency = 'GHS' | 'USD'

export type PipelinePhase =
  | 'lead'
  | 'proposal'
  | 'await'
  | 'meet'
  | 'action'
  | 'progress'
  | 'done'
  | 'hold'

export type TransactionType =
  | 'income'
  | 'expense'
  | 'transfer'
  | 'payment_received'

export interface Deal {
  id: string
  client: string
  title: string
  value: number
  currency: Currency
  phase: PipelinePhase
  assignee: string
  paid: number
  nextAction: string
  nextActionDate?: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  type: TransactionType
  description: string
  amount: number
  currency: Currency
  person?: string
  category: string
  date: string
  orderId?: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  email: string
  phone?: string
  avatar?: string
  activeDeals: number
  totalRevenue: number
}

export interface Contact {
  id: string
  name: string
  company?: string
  email?: string
  phone?: string
  notes?: string
  tags: string[]
  createdAt: string
}

export interface KpiSummary {
  revenueGHS: number
  revenueUSD: number
  expensesGHS: number
  expensesUSD: number
  profitGHS: number
  profitUSD: number
  pipelineValue: number
  pipelineCurrency: Currency
  expectedIncoming: number
  owedToUs: number
  balanceGHS: number
  balanceUSD: number
}

export interface MonthlyRevenue {
  month: string
  revenue: number
  expenses: number
  profit: number
}

export const PHASE_META: Record<PipelinePhase, { label: string; color: string; bg: string }> = {
  lead:     { label: 'Lead',       color: '#1D5FD1', bg: '#EAF1FF' },
  proposal: { label: 'Proposal',   color: '#0D7FB0', bg: '#E7F7FE' },
  await:    { label: 'Awaiting',   color: '#C77E12', bg: '#FFF4E0' },
  meet:     { label: 'Meeting',    color: '#6B3FC9', bg: '#F1EAFE' },
  action:   { label: 'Action Req', color: '#D64545', bg: '#FFE9E9' },
  progress: { label: 'In Progress',color: '#0E9F6E', bg: '#E3F6EE' },
  done:     { label: 'Done',       color: '#ffffff', bg: '#0B1F3B' },
  hold:     { label: 'On Hold',    color: '#5A6B85', bg: '#EEF1F6' },
}
