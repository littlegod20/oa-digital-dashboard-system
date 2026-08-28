import type { Deal, Transaction, TeamMember, Contact, KpiSummary, MonthlyRevenue } from './types'

export const TEAM: TeamMember[] = [
  { id: 't1', name: 'Asante Frimpong', role: 'Managing Director', email: 'asante@oadigital.com', phone: '+233 24 000 0001', activeDeals: 6, totalRevenue: 182000 },
  { id: 't2', name: 'Andrew Mensah',   role: 'Lead Developer',    email: 'andrew@oadigital.com', phone: '+233 24 000 0002', activeDeals: 4, totalRevenue: 98000 },
  { id: 't3', name: 'Victoria Acheampong', role: 'Project Manager', email: 'victoria@oadigital.com', phone: '+233 24 000 0003', activeDeals: 5, totalRevenue: 143000 },
  { id: 't4', name: 'Kofi Asamoah',   role: 'UI/UX Designer',    email: 'kofi@oadigital.com', phone: '+233 24 000 0004', activeDeals: 3, totalRevenue: 72000 },
]

export const DEALS: Deal[] = [
  { id: 'd1', client: 'OMNI Group',       title: 'HR & Attendance Platform',        value: 85000,  currency: 'GHS', phase: 'progress', assignee: 'Asante Frimpong',    paid: 42500,  nextAction: 'Deploy Phase 1 demo to staging', notes: 'ZKTeco integration pending site visit', createdAt: '2026-06-01', updatedAt: '2026-08-20' },
  { id: 'd2', client: 'Boardscan Ltd',    title: 'Board Management SaaS',           value: 12000,  currency: 'USD', phase: 'progress', assignee: 'Andrew Mensah',      paid: 6000,   nextAction: 'Deliver v2 release notes', notes: 'Client happy with progress', createdAt: '2026-05-10', updatedAt: '2026-08-18' },
  { id: 'd3', client: 'BookIt Ghana',     title: 'Hotel Booking Platform',          value: 45000,  currency: 'GHS', phase: 'proposal', assignee: 'Victoria Acheampong',paid: 0,      nextAction: 'Send revised proposal by Fri', notes: 'Budget sensitivity – offer phased payment', createdAt: '2026-07-20', updatedAt: '2026-08-22' },
  { id: 'd4', client: 'Dwaso Farms',      title: 'AgriTech Mobile App',             value: 28000,  currency: 'GHS', phase: 'await',    assignee: 'Asante Frimpong',    paid: 14000,  nextAction: 'Awaiting client contract sign-off', notes: 'Decision expected end of week', createdAt: '2026-07-01', updatedAt: '2026-08-15' },
  { id: 'd5', client: 'CommerceEveryday', title: 'E-commerce Integration',          value: 8500,   currency: 'USD', phase: 'meet',     assignee: 'Kofi Asamoah',       paid: 0,      nextAction: 'Discovery call Thu 2pm', notes: 'Referred by existing client', createdAt: '2026-08-10', updatedAt: '2026-08-25' },
  { id: 'd6', client: 'Tuaka Ltd',        title: 'Logistics Dashboard',             value: 32000,  currency: 'GHS', phase: 'lead',     assignee: 'Victoria Acheampong', paid: 0,      nextAction: 'Send capability deck', notes: 'Initial contact via LinkedIn', createdAt: '2026-08-18', updatedAt: '2026-08-26' },
  { id: 'd7', client: 'Smart Security',   title: 'ZKTeco Sync Dashboard',           value: 15000,  currency: 'GHS', phase: 'progress', assignee: 'Andrew Mensah',      paid: 7500,   nextAction: 'Complete BambooHR integration', notes: 'Closed local network – need on-site', createdAt: '2026-06-15', updatedAt: '2026-08-24' },
  { id: 'd8', client: 'Farmercy',         title: 'Farm Management System v2',       value: 18000,  currency: 'GHS', phase: 'done',     assignee: 'Asante Frimpong',    paid: 18000,  nextAction: 'Archive project', notes: 'Delivered and signed off', createdAt: '2026-02-01', updatedAt: '2026-07-30' },
]

export const TRANSACTIONS: Transaction[] = [
  { id: 'tx1',  type: 'payment_received', description: 'OMNI Group – Phase 1 deposit',     amount: 42500,  currency: 'GHS', person: 'OMNI Group',       category: 'Project Payment', date: '2026-08-01' },
  { id: 'tx2',  type: 'payment_received', description: 'Boardscan – milestone 1',           amount: 6000,   currency: 'USD', person: 'Boardscan Ltd',    category: 'Project Payment', date: '2026-08-05' },
  { id: 'tx3',  type: 'expense',          description: 'AWS hosting – July',                amount: 320,    currency: 'USD', category: 'Infrastructure',  date: '2026-08-03' },
  { id: 'tx4',  type: 'expense',          description: 'Team salaries – August',            amount: 18000,  currency: 'GHS', category: 'Payroll',         date: '2026-08-28' },
  { id: 'tx5',  type: 'expense',          description: 'Figma subscription',                amount: 75,     currency: 'USD', category: 'Software',        date: '2026-08-07' },
  { id: 'tx6',  type: 'income',           description: 'Smart Security – ZKTeco deposit',  amount: 7500,   currency: 'GHS', person: 'Smart Security',   category: 'Project Payment', date: '2026-08-10' },
  { id: 'tx7',  type: 'expense',          description: 'Office supplies',                   amount: 850,    currency: 'GHS', category: 'Operations',      date: '2026-08-12' },
  { id: 'tx8',  type: 'transfer',         description: 'USD to GHS conversion – $3000',    amount: 3000,   currency: 'USD', category: 'Transfer',        date: '2026-08-15' },
  { id: 'tx9',  type: 'income',           description: 'Dwaso Farms – milestone',           amount: 14000,  currency: 'GHS', person: 'Dwaso Farms',      category: 'Project Payment', date: '2026-08-18' },
  { id: 'tx10', type: 'expense',          description: 'Convex Pro plan',                   amount: 29,     currency: 'USD', category: 'Infrastructure',  date: '2026-08-20' },
  { id: 'tx11', type: 'payment_received', description: 'Farmercy – final payment',          amount: 9000,   currency: 'GHS', person: 'Farmercy',         category: 'Project Payment', date: '2026-08-22' },
  { id: 'tx12', type: 'expense',          description: 'Internet & utilities',              amount: 1200,   currency: 'GHS', category: 'Operations',      date: '2026-08-25' },
]

export const CONTACTS: Contact[] = [
  { id: 'c1', name: 'Mr Anny',           company: 'OMNI Group',      email: 'anny@omnigroup.com',       phone: '+233 24 100 0001', tags: ['client', 'enterprise'], notes: 'Decision maker on OMNI platform project', createdAt: '2026-05-20' },
  { id: 'c2', name: 'Gerhard Opare-Addo',company: 'Smart Security',  email: 'gerhard@smartsec.com',    phone: '+233 24 100 0002', tags: ['client', 'partner'],    notes: 'Gateway to OMNI Group relationship', createdAt: '2026-03-10' },
  { id: 'c3', name: 'Mr Zormelo',        company: 'OMNI Group',      email: 'zormelo@omnigroup.com',   phone: '+233 24 100 0003', tags: ['client'],               notes: 'Previous OMNI project contact', createdAt: '2026-04-01' },
  { id: 'c4', name: 'Steve Okyere',      company: 'CommerceEveryday',email: 'steve@commerceeveryday.com', tags: ['prospect', 'ecommerce'], notes: 'Interested in e-commerce integration', createdAt: '2026-08-10' },
  { id: 'c5', name: 'Tuaka Operations',  company: 'Tuaka Ltd',        email: 'ops@tuaka.com',            tags: ['prospect', 'logistics'], notes: 'Inbound via LinkedIn – logistics dashboard need', createdAt: '2026-08-18' },
]

export const KPI: KpiSummary = {
  revenueGHS: 73000,
  revenueUSD: 9000,
  expensesGHS: 20050,
  expensesUSD: 424,
  profitGHS: 52950,
  profitUSD: 8576,
  pipelineValue: 243500,
  pipelineCurrency: 'GHS',
  expectedIncoming: 78500,
  owedToUs: 42500,
  balanceGHS: 118500,
  balanceUSD: 14200,
}

export const MONTHLY_REVENUE: MonthlyRevenue[] = [
  { month: 'Mar', revenue: 28000, expenses: 12000, profit: 16000 },
  { month: 'Apr', revenue: 35000, expenses: 15000, profit: 20000 },
  { month: 'May', revenue: 42000, expenses: 18000, profit: 24000 },
  { month: 'Jun', revenue: 55000, expenses: 21000, profit: 34000 },
  { month: 'Jul', revenue: 68000, expenses: 19000, profit: 49000 },
  { month: 'Aug', revenue: 73000, expenses: 20050, profit: 52950 },
]
