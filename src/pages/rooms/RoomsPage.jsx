import { useState, useMemo } from 'react'
import { PageHeader } from '@/components/layout/PageHeader.jsx'
import { EmptyState } from '@/components/atoms/EmptyState.jsx'
import { cn } from '@/lib/utils.js'
import { DoorOpen, Users, Monitor, Wifi, Calendar, Clock, Plus, ChevronLeft, ChevronRight } from 'lucide-react'

// Mock rooms
const ROOMS = [
    { id: 'r1', name: 'Salle Hassi Messaoud', building: 'Siège', floor: 2, capacity: 20, equipment: ['Vidéoprojecteur', 'Visioconférence', 'Tableau blanc'], isAvailable: true },
    { id: 'r2', name: 'Salle Skikda', building: 'Siège', floor: 2, capacity: 8, equipment: ['Écran TV', 'Visioconférence'], isAvailable: false },
    { id: 'r3', name: 'Salle Arzew', building: 'Siège', floor: 3, capacity: 12, equipment: ['Vidéoprojecteur', 'Tableau blanc'], isAvailable: true },
    { id: 'r4', name: 'Salle Béjaïa', building: 'Annexe', floor: 1, capacity: 6, equipment: ['Écran TV'], isAvailable: true },
    { id: 'r5', name: 'Salle In Aménas', building: 'Siège', floor: 4, capacity: 30, equipment: ['Vidéoprojecteur', 'Visioconférence', 'Sonorisation'], isAvailable: false },
    { id: 'r6', name: 'Salle Adrar', building: 'Annexe', floor: 1, capacity: 4, equipment: ['Écran'], isAvailable: true },
]

const HOURS = Array.from({ length: 10 }, (_, i) => `${8 + i}:00`)

// Mock reservations
const MOCK_RESERVATIONS = [
    { id: 'res1', roomId: 'r1', title: 'Réunion DSI', startHour: 9, endHour: 11, color: 'bg-sonatrach-green/20 border-sonatrach-green text-sonatrach-green-dark' },
    { id: 'res2', roomId: 'r2', title: 'Sprint Planning', startHour: 10, endHour: 12, color: 'bg-blue-100 border-blue-500 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
    { id: 'res3', roomId: 'r1', title: 'Point projet SIGMA', startHour: 14, endHour: 15, color: 'bg-amber-100 border-amber-500 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
    { id: 'res4', roomId: 'r3', title: 'Formation sécurité', startHour: 8, endHour: 12, color: 'bg-purple-100 border-purple-500 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
    { id: 'res5', roomId: 'r5', title: 'Comité de direction', startHour: 9, endHour: 11, color: 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
    { id: 'res6', roomId: 'r4', title: 'Entretien candidat', startHour: 14, endHour: 15, color: 'bg-cyan-100 border-cyan-500 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300' },
]

export default function RoomsPage() {
    const [view, setView] = useState('grid')
    const today = new Date()
    const dateStr = today.toLocaleDateString('fr-DZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <PageHeader
                title="Salles de Réunion"
                count={ROOMS.length}
                description="Réservez et gérez les salles de réunion."
            >
                <div className="flex items-center border border-[var(--color-border)] rounded-lg overflow-hidden">
                    <button
                        onClick={() => setView('grid')}
                        className={cn('px-3 py-2 text-sm font-medium transition-colors', view === 'grid' ? 'bg-sonatrach-green/10 text-sonatrach-green' : 'text-[var(--color-muted)] hover:bg-[var(--color-bg)]')}
                    >
                        Grille
                    </button>
                    <button
                        onClick={() => setView('calendar')}
                        className={cn('px-3 py-2 text-sm font-medium transition-colors', view === 'calendar' ? 'bg-sonatrach-green/10 text-sonatrach-green' : 'text-[var(--color-muted)] hover:bg-[var(--color-bg)]')}
                    >
                        Calendrier
                    </button>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-sonatrach-green hover:bg-sonatrach-green-light text-white rounded-lg text-sm font-medium transition-colors btn-press">
                    <Plus className="w-4 h-4" /> Réserver
                </button>
            </PageHeader>

            {view === 'grid' ? (
                /* Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ROOMS.map((room, i) => (
                        <div key={room.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 shadow-sm card-hover animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="font-semibold">{room.name}</h3>
                                <span className={cn(
                                    'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                                    room.isAvailable
                                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                        : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                )}>
                                    {room.isAvailable ? 'Disponible' : 'Occupée'}
                                </span>
                            </div>
                            <div className="space-y-2 text-sm text-[var(--color-muted)]">
                                <div className="flex items-center gap-2">
                                    <DoorOpen className="w-4 h-4" />
                                    {room.building}, Étage {room.floor}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    {room.capacity} places
                                </div>
                                <div className="flex flex-wrap gap-1.5 pt-2">
                                    {room.equipment.map(eq => (
                                        <span key={eq} className="text-[10px] bg-[var(--color-bg)] px-2 py-0.5 rounded-full border border-[var(--color-border)]">{eq}</span>
                                    ))}
                                </div>
                            </div>
                            <button className={cn(
                                'w-full mt-4 py-2 rounded-lg text-sm font-medium transition-colors btn-press',
                                room.isAvailable
                                    ? 'bg-sonatrach-green hover:bg-sonatrach-green-light text-white'
                                    : 'bg-[var(--color-bg)] text-[var(--color-muted)] cursor-not-allowed'
                            )} disabled={!room.isAvailable}>
                                {room.isAvailable ? 'Réserver cette salle' : 'Indisponible'}
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                /* Calendar / Time Grid View */
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button className="p-1 rounded hover:bg-[var(--color-bg)] transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                            <span className="text-sm font-semibold capitalize">{dateStr}</span>
                            <button className="p-1 rounded hover:bg-[var(--color-bg)] transition-colors"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                        <span className="text-xs text-[var(--color-muted)]">Aujourd'hui</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[var(--color-border)]">
                                    <th className="text-left p-3 text-xs text-[var(--color-muted)] font-medium w-36">Salle</th>
                                    {HOURS.map(h => (
                                        <th key={h} className="text-center p-2 text-[10px] text-[var(--color-muted)] font-medium min-w-[80px]">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {ROOMS.map(room => {
                                    const roomRes = MOCK_RESERVATIONS.filter(r => r.roomId === room.id)
                                    return (
                                        <tr key={room.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg)] transition-colors">
                                            <td className="p-3">
                                                <div className="font-medium text-xs">{room.name}</div>
                                                <div className="text-[10px] text-[var(--color-muted)]">{room.capacity} pl.</div>
                                            </td>
                                            {HOURS.map((h, hIdx) => {
                                                const hour = 8 + hIdx
                                                const res = roomRes.find(r => hour >= r.startHour && hour < r.endHour)
                                                const isStart = res && hour === res.startHour
                                                if (res && !isStart) return null // merged cell
                                                if (res && isStart) {
                                                    return (
                                                        <td key={h} colSpan={res.endHour - res.startHour} className="p-1">
                                                            <div className={cn('px-2 py-1.5 rounded-lg border-l-2 text-[10px] font-medium truncate', res.color)}>
                                                                {res.title}
                                                            </div>
                                                        </td>
                                                    )
                                                }
                                                return (
                                                    <td key={h} className="p-1">
                                                        <div className="h-8 rounded bg-[var(--color-bg)] border border-dashed border-[var(--color-border)] opacity-30 hover:opacity-100 hover:border-sonatrach-green/30 cursor-pointer transition-opacity" />
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
