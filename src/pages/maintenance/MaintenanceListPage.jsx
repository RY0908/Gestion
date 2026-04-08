import { useState } from 'react'
import { useMaintenances, useDeleteMaintenance, useUpdateMaintenance, useCompleteMaintenance } from '@/hooks/useMaintenances.js'
import { DataTable } from '@/components/molecules/DataTable.jsx'
import { CopyableText } from '@/components/atoms/CopyableText.jsx'
import { StatusBadge } from '@/components/atoms/StatusBadge.jsx'
import { PriorityBadge } from '@/components/atoms/PriorityBadge.jsx'
import { PageHeader } from '@/components/layout/PageHeader.jsx'
import { EmptyState } from '@/components/atoms/EmptyState.jsx'
import { formatDate } from '@/lib/utils.js'
import { cn } from '@/lib/utils.js'
import { Kanban, List, Wrench, Clock, User, Plus, Edit2, Trash2 } from 'lucide-react'
import { MaintenanceFormModal } from './components/MaintenanceFormModal.jsx'

const KANBAN_COLUMNS = [
  { id: 'SCHEDULED', label: 'Planifie', color: 'border-t-sky-500', bg: 'bg-sky-50/70 dark:bg-sky-950/25', emoji: '1' },
  { id: 'IN_PROGRESS', label: 'En cours', color: 'border-t-amber-500', bg: 'bg-amber-50/70 dark:bg-amber-950/25', emoji: '2' },
  { id: 'CANCELLED', label: 'Annule', color: 'border-t-rose-500', bg: 'bg-rose-50/70 dark:bg-rose-950/25', emoji: '3' },
  { id: 'COMPLETED', label: 'Termine', color: 'border-t-emerald-500', bg: 'bg-emerald-50/70 dark:bg-emerald-950/25', emoji: '4' },
]

const priorityFromType = (type) => {
  if (type === 'CORRECTIVE') return 'HIGH'
  if (type === 'PREVENTIVE') return 'MEDIUM'
  if (type === 'UPGRADE') return 'LOW'
  return 'MEDIUM'
}

const KanbanCard = ({ ticket, onClick, onDelete, onStatusChange }) => {
  const priority = priorityFromType(ticket.type)

  return (
    <div
      onClick={() => onClick(ticket)}
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3.5 shadow-sm card-hover cursor-pointer group relative"
    >
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(ticket.id) }}
        className="absolute top-2.5 right-2 opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
        title="Supprimer"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      <div className="flex items-center justify-between mb-2 pr-6">
        <PriorityBadge priority={priority} />
        <StatusBadge status={ticket.status} />
      </div>

      <div className="mb-2">
        <p className="text-sm font-medium leading-tight line-clamp-2">{ticket.description || 'Aucune description'}</p>
        <p className="text-xs text-[var(--color-muted)] mt-1 flex items-center gap-1">
          <Wrench className="w-3 h-3" />
          {ticket.asset?.assetTag || 'N/A'} - {ticket.asset?.brand}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {ticket.status !== 'IN_PROGRESS' && (
          <button
            onClick={(e) => { e.stopPropagation(); onStatusChange(ticket, 'IN_PROGRESS') }}
            className="px-2 py-1 text-[10px] font-semibold rounded-full bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors"
          >
            Demarrer
          </button>
        )}
        {ticket.status !== 'COMPLETED' && (
          <button
            onClick={(e) => { e.stopPropagation(); onStatusChange(ticket, 'COMPLETED') }}
            className="px-2 py-1 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
          >
            Terminer
          </button>
        )}
        {ticket.status !== 'CANCELLED' && (
          <button
            onClick={(e) => { e.stopPropagation(); onStatusChange(ticket, 'CANCELLED') }}
            className="px-2 py-1 text-[10px] font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
          >
            Annuler
          </button>
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] text-[var(--color-muted)] pt-2 border-t border-[var(--color-border)]">
        <span className="flex items-center gap-1 line-clamp-1">
          <User className="w-3 h-3" />
          {ticket.technician || 'Non assigné'}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDate(ticket.startDate)}
        </span>
      </div>
    </div>
  )
}

export default function MaintenanceListPage() {
  const [viewMode, setViewMode] = useState('kanban')
  const { data, isLoading } = useMaintenances({})
  const deleteMutation = useDeleteMaintenance()
  const updateMutation = useUpdateMaintenance()
  const completeMutation = useCompleteMaintenance()

  const tickets = data?.data || []
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)

  const handleEdit = (ticket) => {
    setSelectedTicket(ticket)
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Etes-vous sur de vouloir supprimer ce ticket de maintenance ?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleStatusChange = (ticket, nextStatus) => {
    if (!ticket?.id || nextStatus === ticket.status) return

    if (nextStatus === 'COMPLETED') {
      completeMutation.mutate({
        id: ticket.id,
        data: {
          endDate: new Date().toISOString().split('T')[0],
          technician: ticket.technician || null,
        },
      })
      return
    }

    updateMutation.mutate({
      id: ticket.id,
      data: {
        status: nextStatus,
        technician: ticket.technician || null,
      },
    })
  }

  const openNewModal = () => {
    setSelectedTicket(null)
    setIsModalOpen(true)
  }

  const grouped = (() => {
    const groups = {}
    KANBAN_COLUMNS.forEach(col => { groups[col.id] = [] })
    tickets.forEach(t => {
      if (groups[t.status]) groups[t.status].push(t)
      else groups.SCHEDULED.push(t)
    })
    return groups
  })()

  const listColumns = [
    {
      accessorKey: 'asset.assetTag',
      header: 'Actif',
      cell: info => <CopyableText value={info.getValue()} className="font-semibold" />
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: info => {
        const type = info.getValue()
        return (
          <span className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-md',
            type === 'CORRECTIVE' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
              type === 'PREVENTIVE' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                type === 'UPGRADE' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' :
                  'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
          )}>
            {type}
          </span>
        )
      }
    },
    { accessorKey: 'description', header: 'Description' },
    {
      accessorFn: row => row.sourceRequest?.requestNumber,
      id: 'sourceRequest',
      header: 'Demande source',
      cell: info => info.getValue()
        ? <span className="font-mono text-xs font-semibold">{info.getValue()}</span>
        : <span className="text-xs text-[var(--color-muted)]">-</span>
    },
    {
      accessorKey: 'startDate',
      header: 'Date prévue',
      cell: info => formatDate(info.getValue())
    },
    {
      accessorKey: 'technician',
      header: 'Intervenant',
      cell: info => {
        const tech = info.getValue()
        if (!tech) return <span className="text-xs text-[var(--color-muted)]">Non assigné</span>
        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-sonatrach-green/10 text-sonatrach-green flex items-center justify-center text-[10px] font-bold uppercase">
              {tech.charAt(0) || '?'}
            </div>
            <span className="text-sm">{tech}</span>
          </div>
        )
      }
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: info => <StatusBadge status={info.getValue()} />
    },
    {
      id: 'actions',
      header: '',
      cell: info => {
        const rowTicket = info.row.original
        return (
          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleEdit(rowTicket)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
              title="Modifier"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(rowTicket.id)}
              className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )
      }
    }
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Maintenance"
        count={tickets.length}
          description="Planifiez et suivez les interventions sur le materiel."
      >
        <div className="flex items-center border border-[var(--color-border)] rounded-lg overflow-hidden mr-4">
          <button
            onClick={() => setViewMode('kanban')}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors',
              viewMode === 'kanban'
                ? 'bg-sonatrach-green/10 text-sonatrach-green'
                : 'text-[var(--color-muted)] hover:bg-[var(--color-bg)]'
            )}
          >
            <Kanban className="w-4 h-4" /> Kanban
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors',
              viewMode === 'list'
                ? 'bg-sonatrach-green/10 text-sonatrach-green'
                : 'text-[var(--color-muted)] hover:bg-[var(--color-bg)]'
            )}
          >
            <List className="w-4 h-4" /> Liste
          </button>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2 bg-sonatrach-green hover:bg-sonatrach-green-light text-white rounded-lg text-sm font-medium transition-colors btn-press"
        >
          <Plus className="w-4 h-4" /> Nouveau Ticket
        </button>
      </PageHeader>

      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {KANBAN_COLUMNS.map(col => {
            const colTickets = grouped[col.id] || []
            return (
              <div key={col.id} className={cn('rounded-xl border-t-4 p-4 min-h-[300px]', col.color, col.bg)}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <span>{col.emoji}</span>
                    {col.label}
                  </h3>
                  <span className="text-xs font-bold text-[var(--color-muted)] bg-[var(--color-surface)] px-2 py-0.5 rounded-full border border-[var(--color-border)]">
                    {colTickets.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {colTickets.length > 0 ? (
                    colTickets.map(ticket => (
                      <KanbanCard
                        key={ticket.id}
                        ticket={ticket}
                        onClick={handleEdit}
                        onDelete={handleDelete}
                        onStatusChange={handleStatusChange}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-sm text-[var(--color-muted)]">
                    Aucun ticket
                  </div>
                )}
              </div>
            </div>
            )
          })}
        </div>
      ) : (
        tickets.length > 0 ? (
          <DataTable
            columns={listColumns}
            data={tickets}
            isLoading={isLoading}
            rowClassName="group"
          />
        ) : (
          <EmptyState
            icon={Wrench}
            title="Aucune intervention"
            description="Aucun ticket de maintenance n'a ete cree."
            actionLabel="Planifier une intervention"
            onAction={openNewModal}
          />
        )
      )}

      <MaintenanceFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maintenance={selectedTicket}
      />
    </div>
  )
}
