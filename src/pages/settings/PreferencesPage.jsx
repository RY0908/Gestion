import { useState } from 'react'
import { useUIStore } from '@/store/uiStore.js'
import { cn } from '@/lib/utils.js'
import { Sun, Moon, Bell, Lock, Check, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageHeader } from '@/components/layout/PageHeader.jsx'

function SettingSection({ title, icon: Icon, children }) {
    return (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
                <div className="p-2 rounded-lg bg-sonatrach-green/10">
                    <Icon className="w-4 h-4 text-sonatrach-green" />
                </div>
                <h2 className="font-semibold">{title}</h2>
            </div>
            {children}
        </div>
    )
}

function ToggleRow({ label, description, checked, onChange }) {
    return (
        <div className="flex items-start justify-between gap-4 py-3 border-b border-[var(--color-border)] last:border-0">
            <div>
                <p className="text-sm font-medium">{label}</p>
                {description && <p className="text-xs text-[var(--color-muted)] mt-0.5">{description}</p>}
            </div>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={cn(
                    'relative w-10 h-5 rounded-full transition-colors shrink-0 mt-0.5',
                    checked ? 'bg-sonatrach-green' : 'bg-[var(--color-border)]'
                )}
                role="switch"
                aria-checked={checked}
            >
                <span className={cn(
                    'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                    checked ? 'translate-x-5' : 'translate-x-0'
                )} />
            </button>
        </div>
    )
}

export default function PreferencesPage() {
    const { theme, setTheme } = useUIStore()

    const [notifs, setNotifs] = useState({
        newTickets: true,
        maintenance: true,
        assignments: true,
        licenses: false,
    })

    const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
    const [pwLoading, setPwLoading] = useState(false)

    const handleNotifToggle = (key) => (val) => {
        setNotifs(prev => ({ ...prev, [key]: val }))
        toast.success('Préférence mise à jour')
    }

    const handlePasswordSubmit = async (e) => {
        e.preventDefault()
        if (pwForm.next !== pwForm.confirm) {
            toast.error('Les mots de passe ne correspondent pas')
            return
        }
        if (pwForm.next.length < 6) {
            toast.error('Minimum 6 caractères requis')
            return
        }
        setPwLoading(true)
        await new Promise(r => setTimeout(r, 800))
        setPwLoading(false)
        setPwForm({ current: '', next: '', confirm: '' })
        toast.success('Mot de passe mis à jour')
    }

    const inputClass = "w-full h-9 px-3 rounded-lg border border-[var(--color-border)] bg-transparent text-sm focus:outline-none focus:border-sonatrach-green/50 focus:ring-1 focus:ring-sonatrach-green/20"

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6">
            <PageHeader title="Préférences" description="Personnalisez votre expérience SIGMA" />

            {/* ── Apparence ── */}
            <SettingSection title="Apparence" icon={Sun}>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { value: 'light', label: 'Clair', icon: Sun },
                        { value: 'dark', label: 'Sombre', icon: Moon },
                    ].map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => { setTheme(opt.value); toast.success(`Thème ${opt.label.toLowerCase()} appliqué`) }}
                            className={cn(
                                'flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left',
                                theme === opt.value
                                    ? 'border-sonatrach-green bg-sonatrach-green/5'
                                    : 'border-[var(--color-border)] hover:border-sonatrach-green/30 hover:bg-[var(--color-bg)]'
                            )}
                        >
                            <opt.icon className={cn('w-5 h-5', theme === opt.value ? 'text-sonatrach-green' : 'text-[var(--color-muted)]')} />
                            <span className={cn('font-medium text-sm flex-1', theme === opt.value ? 'text-sonatrach-green' : '')}>{opt.label}</span>
                            {theme === opt.value && <Check className="w-4 h-4 text-sonatrach-green" />}
                        </button>
                    ))}
                </div>
            </SettingSection>

            {/* ── Notifications ── */}
            <SettingSection title="Notifications" icon={Bell}>
                <ToggleRow
                    label="Nouveaux tickets"
                    description="Recevoir une alerte lors d'un nouveau ticket de demande"
                    checked={notifs.newTickets}
                    onChange={handleNotifToggle('newTickets')}
                />
                <ToggleRow
                    label="Maintenance"
                    description="Être notifié lors de nouvelles interventions"
                    checked={notifs.maintenance}
                    onChange={handleNotifToggle('maintenance')}
                />
                <ToggleRow
                    label="Affectations matériel"
                    description="Recevoir une alerte lors d'une affectation ou d'un retour"
                    checked={notifs.assignments}
                    onChange={handleNotifToggle('assignments')}
                />
                <ToggleRow
                    label="Expiration de licences"
                    description="Être notifié 30 jours avant l'expiration d'une licence"
                    checked={notifs.licenses}
                    onChange={handleNotifToggle('licenses')}
                />
            </SettingSection>

            {/* ── Sécurité ── */}
            <SettingSection title="Sécurité" icon={Lock}>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider mb-1.5">
                            Mot de passe actuel
                        </label>
                        <input
                            type="password"
                            value={pwForm.current}
                            onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
                            className={inputClass}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider mb-1.5">
                                Nouveau mot de passe
                            </label>
                            <input
                                type="password"
                                value={pwForm.next}
                                onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))}
                                className={inputClass}
                                placeholder="Min. 6 caractères"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider mb-1.5">
                                Confirmation
                            </label>
                            <input
                                type="password"
                                value={pwForm.confirm}
                                onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                                className={inputClass}
                                placeholder="Répéter le mot de passe"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-1">
                        <button
                            type="submit"
                            disabled={pwLoading || !pwForm.current || !pwForm.next || !pwForm.confirm}
                            className="flex items-center gap-2 px-4 py-2 bg-sonatrach-green hover:bg-sonatrach-green-light text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed btn-press"
                        >
                            <Save className="w-4 h-4" />
                            {pwLoading ? 'Mise à jour...' : 'Changer le mot de passe'}
                        </button>
                    </div>
                </form>
            </SettingSection>
        </div>
    )
}
