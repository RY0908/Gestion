import { useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore.js'
import { initials } from '@/lib/utils.js'
import { cn } from '@/lib/utils.js'
import {
    User, Mail, Phone, Building2, Calendar, Shield,
    Package, Edit2
} from 'lucide-react'
import ProfileEquipmentTab from './ProfileEquipmentTab.jsx'
import ProfileHistoryTab from './ProfileHistoryTab.jsx'

const ROLE_LABELS = {
    ADMIN: { label: 'Chef Département Informatique', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
    SUPERVISOR: { label: 'Superviseur', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' },
    TECHNICIAN: { label: 'Technicien', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300' },
    USER: { label: 'Utilisateur', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
}

const InfoRow = ({ icon: Icon, label, children }) => (
    <div className="flex items-start gap-3 py-3 border-b border-[var(--color-border)] last:border-0">
        <div className="p-2 rounded-lg bg-[var(--color-bg)] shrink-0">
            <Icon className="w-4 h-4 text-[var(--color-muted)]" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-[var(--color-muted)] font-medium mb-0.5">{label}</p>
            <div className="text-sm font-medium">{children}</div>
        </div>
    </div>
)

const TABS = [
    { value: 'infos', label: 'Informations' },
    { value: 'materiel', label: 'Mon Matériel' },
    { value: 'historique', label: 'Historique' },
]

export default function ProfilePage() {
    const user = useAuthStore(s => s.user)
    const navigate = useNavigate()
    const roleConfig = ROLE_LABELS[user?.role] || ROLE_LABELS.USER

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            {/* ── Header Card ─── */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
                {/* Banner */}
                <div className="h-28 bg-gradient-to-br from-sonatrach-green via-sonatrach-green-dark to-[var(--color-navy)] relative">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 60%)' }} />
                </div>

                <div className="px-6 pb-6">
                    <div className="flex items-end gap-4 -mt-12 mb-4">
                        <div className="w-24 h-24 rounded-2xl bg-sonatrach-green/15 border-4 border-[var(--color-surface)] flex items-center justify-center text-sonatrach-green text-2xl font-bold shadow-lg shrink-0">
                            {initials(user?.fullName || '')}
                        </div>
                        <div className="pb-2 flex-1 min-w-0">
                            <h1 className="text-xl font-display font-bold truncate">{user?.fullName}</h1>
                            <p className="text-sm text-[var(--color-muted)]">{user?.position}</p>
                        </div>
                        <div className="pb-2 flex items-center gap-2 shrink-0">
                            <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', roleConfig.color)}>
                                {roleConfig.label}
                            </span>
                            <button
                                onClick={() => navigate('/settings/preferences')}
                                className="p-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg)] transition-colors"
                                title="Modifier les préférences"
                            >
                                <Edit2 className="w-4 h-4 text-[var(--color-muted)]" />
                            </button>
                        </div>
                    </div>

                    {/* Quick tags */}
                    <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted)] bg-[var(--color-bg)] px-2.5 py-1.5 rounded-lg">
                            <Shield className="w-3.5 h-3.5" />
                            <span className="font-mono">{user?.employeeId || '—'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted)] bg-[var(--color-bg)] px-2.5 py-1.5 rounded-lg">
                            <Mail className="w-3.5 h-3.5" />
                            <span>{user?.email || '—'}</span>
                        </div>
                        {user?.department?.name && (
                            <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted)] bg-[var(--color-bg)] px-2.5 py-1.5 rounded-lg">
                                <Building2 className="w-3.5 h-3.5" />
                                <span>{user.department.name}</span>
                            </div>
                        )}
                        <div className={cn(
                            'flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg',
                            user?.isActive
                                ? 'bg-green-50 dark:bg-green-900/20 text-sonatrach-green'
                                : 'bg-red-50 dark:bg-red-900/20 text-red-600'
                        )}>
                            <div className={cn('w-1.5 h-1.5 rounded-full', user?.isActive ? 'bg-sonatrach-green' : 'bg-red-500')} />
                            {user?.isActive ? 'Actif' : 'Inactif'}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tabs ─── */}
            <Tabs.Root defaultValue="infos">
                <Tabs.List className="flex gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-1 shadow-sm">
                    {TABS.map(tab => (
                        <Tabs.Trigger
                            key={tab.value}
                            value={tab.value}
                            className={cn(
                                'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]',
                                'data-[state=active]:bg-sonatrach-green data-[state=active]:text-white data-[state=active]:shadow-sm'
                            )}
                        >
                            {tab.label}
                        </Tabs.Trigger>
                    ))}
                </Tabs.List>

                {/* Tab: Informations */}
                <Tabs.Content value="infos" className="mt-4">
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-4">Informations personnelles</h2>
                        <InfoRow icon={User} label="Nom complet">{user?.fullName || '—'}</InfoRow>
                        <InfoRow icon={Mail} label="Email">
                            <a href={`mailto:${user?.email}`} className="text-sonatrach-green hover:underline">{user?.email || '—'}</a>
                        </InfoRow>
                        <InfoRow icon={Phone} label="Téléphone">{user?.phone || '—'}</InfoRow>
                        <InfoRow icon={Shield} label="Matricule">
                            <span className="font-mono text-xs bg-[var(--color-bg)] px-2 py-0.5 rounded">{user?.employeeId || '—'}</span>
                        </InfoRow>
                        <InfoRow icon={Building2} label="Département">
                            {user?.department?.name || '—'}
                            {user?.department?.code && (
                                <span className="text-[var(--color-muted)] ml-2 text-xs">({user.department.code})</span>
                            )}
                        </InfoRow>
                        <InfoRow icon={Package} label="Fonction / Poste">{user?.position || '—'}</InfoRow>
                        <InfoRow icon={Calendar} label="Date d'embauche">
                            {user?.hireDate
                                ? new Date(user.hireDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                                : '—'}
                        </InfoRow>
                    </div>
                </Tabs.Content>

                {/* Tab: Mon Matériel */}
                <Tabs.Content value="materiel" className="mt-4">
                    <ProfileEquipmentTab userId={user?.id} />
                </Tabs.Content>

                {/* Tab: Historique */}
                <Tabs.Content value="historique" className="mt-4">
                    <ProfileHistoryTab userId={user?.id} />
                </Tabs.Content>
            </Tabs.Root>
        </div>
    )
}
