import PropTypes from 'prop-types'
import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Mail, Phone, Building2, Calendar, Shield, MapPin, Package } from 'lucide-react'
import { StatusBadge } from '@/components/atoms/StatusBadge.jsx'
import { initials, formatDate } from '@/lib/utils.js'
import { cn } from '@/lib/utils.js'

const ROLE_CONFIG = {
    ADMIN: { label: 'Administrateur', bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-300' },
    IT_MANAGER: { label: 'Responsable IT', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300' },
    IT_TECHNICIAN: { label: 'Technicien IT', bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-800 dark:text-cyan-300' },
    EMPLOYEE: { label: 'Employé', bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300' },
    AUDITOR: { label: 'Auditeur', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-800 dark:text-amber-300' },
}

const InfoRow = ({ icon: Icon, label, children }) => (
    <div className="flex items-start gap-3 py-2.5">
        <div className="p-1.5 rounded-lg bg-[var(--color-bg)] shrink-0 mt-0.5">
            <Icon className="w-3.5 h-3.5 text-[var(--color-muted)]" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-muted)] font-medium mb-0.5">{label}</p>
            <p className="text-sm font-medium">{children}</p>
        </div>
    </div>
)

export const UserCard = ({ user, trigger, assetCount }) => {
    if (!user) return null

    const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.EMPLOYEE

    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                {trigger || (
                    <button className="flex items-center gap-2 hover:bg-[var(--color-bg)] px-2 py-1 rounded-lg transition-colors">
                        <div className="w-8 h-8 rounded-full bg-sonatrach-green/10 text-sonatrach-green flex items-center justify-center text-xs font-bold shrink-0">
                            {initials(user.fullName)}
                        </div>
                        <span className="text-sm font-medium">{user.fullName}</span>
                    </button>
                )}
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fade-in" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl z-50 animate-scale-in overflow-hidden">
                    {/* Header gradient */}
                    <div className="h-24 bg-gradient-to-br from-sonatrach-green via-sonatrach-green-dark to-navy relative">
                        <Dialog.Close asChild>
                            <button className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </Dialog.Close>
                    </div>

                    {/* Avatar overlay */}
                    <div className="px-6 -mt-10 relative z-10">
                        <div className="w-20 h-20 rounded-2xl bg-sonatrach-green/10 border-4 border-[var(--color-surface)] flex items-center justify-center text-sonatrach-green text-2xl font-bold shadow-lg">
                            {initials(user.fullName)}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="px-6 pt-3 pb-6">
                        <div className="flex items-start justify-between mb-1">
                            <div>
                                <Dialog.Title className="text-xl font-display font-bold">{user.fullName}</Dialog.Title>
                                <p className="text-sm text-[var(--color-muted)]">{user.position}</p>
                            </div>
                            <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', roleConfig.bg, roleConfig.text)}>
                                {roleConfig.label}
                            </span>
                        </div>

                        {user.isActive !== undefined && (
                            <div className="mt-2">
                                <StatusBadge status={user.isActive ? 'ACTIVE' : 'RETIRED'} label={user.isActive ? 'Actif' : 'Inactif'} />
                            </div>
                        )}

                        <div className="mt-5 space-y-0.5 border-t border-[var(--color-border)] pt-4">
                            <InfoRow icon={Mail} label="Email">
                                <a href={`mailto:${user.email}`} className="text-sonatrach-green hover:underline">{user.email}</a>
                            </InfoRow>
                            {user.phone && (
                                <InfoRow icon={Phone} label="Téléphone">{user.phone}</InfoRow>
                            )}
                            {user.employeeId && (
                                <InfoRow icon={Shield} label="Matricule">
                                    <span className="font-mono text-xs">{user.employeeId}</span>
                                </InfoRow>
                            )}
                            {user.department && (
                                <InfoRow icon={Building2} label="Département">
                                    {user.department.name}
                                    {user.department.code && <span className="text-[var(--color-muted)] ml-1">({user.department.code})</span>}
                                </InfoRow>
                            )}
                            {user.hireDate && (
                                <InfoRow icon={Calendar} label="Date d'embauche">{formatDate(user.hireDate)}</InfoRow>
                            )}
                            {typeof assetCount === 'number' && (
                                <InfoRow icon={Package} label="Actifs assignés">
                                    <span className="font-semibold">{assetCount}</span> équipement{assetCount !== 1 ? 's' : ''}
                                </InfoRow>
                            )}
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}

UserCard.propTypes = {
    user: PropTypes.object.isRequired,
    trigger: PropTypes.node,
    assetCount: PropTypes.number,
}
