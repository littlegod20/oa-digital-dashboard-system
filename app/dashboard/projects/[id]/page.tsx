'use client'

import { Suspense, useCallback, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useMutation, useQuery } from 'convex/react'
import {
  ArrowLeftIcon,
  CalendarBlankIcon,
  ChartBarHorizontalIcon,
  CrownSimpleIcon,
  FileTextIcon,
  KanbanIcon,
  LockKeyIcon,
  PencilSimpleIcon,
  PlusIcon,
  SquaresFourIcon,
  TrashIcon,
  UsersThreeIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { Badge } from '@/components/ui/badge'
import { EmptyState, PageSkeleton } from '@/components/ui/states'
import { ConfirmDialog, Modal, ModalActions } from '@/components/ui/modal'
import { Alert, Field, Input, Select, Textarea } from '@/components/ui/field'
import { ProjectDialog } from '@/components/projects/project-dialog'
import { TaskDrawer } from '@/components/projects/task-drawer'
import { Board } from '@/components/projects/board'
import { ProjectCalendar } from '@/components/projects/calendar'
import { Gantt } from '@/components/projects/gantt'
import { DocumentsTab, OverviewTab, TeamTab, type ProjectDetail } from '@/components/projects/tabs'
import { PRIORITY, PROJECT_STATUS, TASK_COLUMNS, formatShortDate, type TaskPriority, type TaskStatus } from '@/components/projects/meta'
import { useRole } from '@/lib/role-context'
import { errorMessage } from '@/lib/utils'

const TABS = [
  { value: 'overview', label: 'Overview', icon: SquaresFourIcon },
  { value: 'team', label: 'Team', icon: UsersThreeIcon },
  { value: 'documents', label: 'Documents', icon: FileTextIcon },
  { value: 'board', label: 'Board', icon: KanbanIcon },
  { value: 'calendar', label: 'Calendar', icon: CalendarBlankIcon },
  { value: 'gantt', label: 'Gantt', icon: ChartBarHorizontalIcon },
] as const
type Tab = (typeof TABS)[number]['value']

export default function ProjectPage() {
  return (
    <Suspense>
      <ProjectContent />
    </Suspense>
  )
}

function ProjectContent() {
  const { id } = useParams<{ id: string }>()
  const projectId = id as Id<'projects'>
  const router = useRouter()
  const params = useSearchParams()
  const tab = (TABS.some((t) => t.value === params.get('tab')) ? params.get('tab') : 'overview') as Tab
  const openTaskId = params.get('task')
  const { can } = useRole()

  const project = useQuery(api.projects.get, { id: projectId })
  const tasks = useQuery(api.tasks.list, { projectId })
  const removeProject = useMutation(api.projects.remove)
  const [editOpen, setEditOpen] = useState(false)
  const [newTaskOpen, setNewTaskOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const setParam = useCallback(
    (key: 'tab' | 'task', value: string | null) => {
      const next = new URLSearchParams(params.toString())
      if (value) next.set(key, value)
      else next.delete(key)
      router.replace(`/dashboard/projects/${id}?${next.toString()}`, { scroll: false })
    },
    [params, router, id],
  )
  const openTask = useCallback((taskId: string) => setParam('task', taskId), [setParam])
  const closeTask = useCallback(() => setParam('task', null), [setParam])

  if (project === undefined) return <PageSkeleton />
  if (project === null) {
    return (
      <div className="card mt-6">
        <EmptyState icon={WarningCircleIcon} title="Project not found" description="It may have been deleted." action={<Link href="/dashboard/projects" className="btn btn-secondary">All projects</Link>} />
      </div>
    )
  }
  if (project.forbidden) {
    return (
      <div className="card mt-6">
        <EmptyState icon={LockKeyIcon} title="You're not on this project" description="Ask the project lead to add you to the team." action={<Link href="/dashboard/projects" className="btn btn-secondary">Your projects</Link>} />
      </div>
    )
  }

  const p = project as ProjectDetail
  const status = PROJECT_STATUS[p.status]
  const lead = p.members.find((m) => m.isLead)
  const members = p.members.map((m) => ({ id: m.id as string, name: m.name }))
  const openTask_ = tasks?.find((t) => t.id === openTaskId) ?? null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard/projects" className="mb-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-fg-3 hover:text-fg">
          <ArrowLeftIcon size={14} weight="bold" />
          Projects
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="kbd !h-6 !text-[11px]">{p.key}</span>
              <Badge tone={status.tone} dot>{status.label}</Badge>
              {p.overdue && <Badge tone="danger">Overdue</Badge>}
            </div>
            <h1 className="font-display text-[28px] font-semibold leading-[1.1] text-fg md:text-[34px]">{p.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-fg-2">
              <span>{p.client || 'Internal'}</span>
              {lead && (
                <span className="flex items-center gap-1.5">
                  <CrownSimpleIcon size={14} weight="fill" className="text-peach" />
                  {lead.name}
                </span>
              )}
              {(p.startDate || p.dueDate) && (
                <span className="flex items-center gap-1.5">
                  <CalendarBlankIcon size={14} />
                  {p.startDate ? formatShortDate(p.startDate) : '…'} → {p.dueDate ? formatShortDate(p.dueDate) : '…'}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {can('projects.manageAll') && (
              <button onClick={() => setDeleting(true)} className="icon-btn icon-btn-danger" aria-label="Delete project" title="Delete project">
                <TrashIcon size={18} />
              </button>
            )}
            {p.canManage && (
              <button onClick={() => setEditOpen(true)} className="btn btn-secondary">
                <PencilSimpleIcon size={16} />
                Edit
              </button>
            )}
            <button onClick={() => setNewTaskOpen(true)} className="btn btn-primary">
              <PlusIcon size={16} weight="bold" />
              New task
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label="Project sections" className="segmented">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={tab === t.value}
            onClick={() => setParam('tab', t.value)}
            className="segment"
          >
            <t.icon size={15} weight={tab === t.value ? 'duotone' : 'regular'} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab project={p} onOpenTask={openTask} />}
      {tab === 'team' && <TeamTab project={p} />}
      {tab === 'documents' && <DocumentsTab projectId={projectId} />}
      {tab === 'board' && (tasks ? <Board projectId={projectId} tasks={tasks} onOpen={openTask} /> : <PageSkeleton rows={1} />)}
      {tab === 'calendar' && (tasks ? <ProjectCalendar tasks={tasks} onOpen={openTask} /> : <PageSkeleton rows={1} />)}
      {tab === 'gantt' && (tasks ? <Gantt tasks={tasks} projectDue={p.dueDate} onOpen={openTask} /> : <PageSkeleton rows={1} />)}

      <TaskDrawer task={openTask_} members={members} canManage={p.canManage} viewerId={p.viewerId} onClose={closeTask} />
      <NewTaskDialog open={newTaskOpen} onClose={() => setNewTaskOpen(false)} projectId={projectId} members={members} onCreated={openTask} />
      <ProjectDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initial={{
          id: p.id,
          name: p.name,
          client: p.client,
          description: p.description,
          status: p.status,
          startDate: p.startDate ?? '',
          dueDate: p.dueDate ?? '',
        }}
      />
      <ConfirmDialog
        open={deleting}
        title={`Delete ${p.name}?`}
        message="This permanently removes the project with all its tasks, comments and documents. To keep the history, set its status to Cancelled instead."
        confirmLabel="Delete project"
        onClose={() => setDeleting(false)}
        onConfirm={async () => {
          await removeProject({ id: projectId })
          router.replace('/dashboard/projects')
        }}
      />
    </div>
  )
}

function NewTaskDialog({
  open,
  onClose,
  projectId,
  members,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  projectId: Id<'projects'>
  members: { id: string; name: string }[]
  onCreated: (id: string) => void
}) {
  return (
    <Modal open={open} onClose={onClose} title="New task" icon={PlusIcon} width="34rem">
      {open && <NewTaskForm projectId={projectId} members={members} onClose={onClose} onCreated={onCreated} />}
    </Modal>
  )
}

function NewTaskForm({
  projectId,
  members,
  onClose,
  onCreated,
}: {
  projectId: Id<'projects'>
  members: { id: string; name: string }[]
  onClose: () => void
  onCreated: (id: string) => void
}) {
  const create = useMutation(api.tasks.create)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('todo')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [assigneeId, setAssigneeId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault()
        setSaving(true)
        setError('')
        try {
          const id = await create({
            projectId,
            title,
            description,
            status,
            priority,
            assigneeId: (assigneeId || undefined) as Id<'employees'> | undefined,
            startDate: startDate || undefined,
            dueDate: dueDate || undefined,
          })
          onClose()
          onCreated(id)
        } catch (err) {
          setError(errorMessage(err))
          setSaving(false)
        }
      }}
    >
      {error && <Alert icon={WarningCircleIcon}>{error}</Alert>}
      <Field label="Title">
        <Input required autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Set up ZKTeco device sync" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Status">
          <Select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
            {TASK_COLUMNS.map((c) => (
              <option key={c.status} value={c.status}>{c.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Priority">
          <Select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
            {(Object.keys(PRIORITY) as TaskPriority[]).map((k) => (
              <option key={k} value={k}>{PRIORITY[k].label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Assignee">
          <Select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Start">
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </Field>
        <Field label="Due">
          <Input type="date" min={startDate || undefined} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </Field>
      </div>
      <Field label="Description">
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
      </Field>
      <ModalActions onClose={onClose} submitLabel={saving ? 'Creating…' : 'Create task'} />
    </form>
  )
}
