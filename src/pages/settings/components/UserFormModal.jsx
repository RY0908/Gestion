import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Modal } from '@/components/atoms/Modal.jsx'
import { useCreateUser, useUpdateUser } from '@/hooks/useUsers.js'

export function UserFormModal({ isOpen, onClose, user }) {
    const isEditing = !!user
    const createMutation = useCreateUser()
    const updateMutation = useUpdateUser()

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            fullName: '',
            email: '',
            password: '', // only required on create
            employeeId: '',
            departmentId: '', // Ideally we fetch departments, for now just text or we leave it if not required
            position: '',
            role: 'USER',
        }
    })

    // Update form when editing a specific user
    useEffect(() => {
        if (isOpen) {
            if (isEditing && user) {
                reset({
                    fullName: user.fullName || '',
                    email: user.email || '',
                    password: '', // leave empty, backend might ignore if empty on update
                    employeeId: user.employeeId || '',
                    departmentId: user.departmentId || '',
                    position: user.position || '',
                    role: user.role || 'USER',
                })
            } else {
                reset({
                    fullName: '',
                    email: '',
                    password: '',
                    employeeId: '',
                    departmentId: '',
                    position: '',
                    role: 'USER',
                })
            }
        }
    }, [isOpen, isEditing, user, reset])

    const onSubmit = (data) => {
        // Clean up empty password if editing
        if (isEditing && !data.password) {
            delete data.password
        }

        if (isEditing) {
            updateMutation.mutate({ id: user.id, data }, {
                onSuccess: () => onClose()
            })
        } else {
            createMutation.mutate(data, {
                onSuccess: () => onClose()
            })
        }
    }

    const isPending = createMutation.isPending || updateMutation.isPending

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
            description={isEditing ? 'Modifiez les informations de l\'employé.' : 'Ajoutez un nouvel employé au système.'}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Nom complet <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            {...register('fullName', { required: 'Ce champ est requis' })}
                            className="w-full form-input h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20"
                            placeholder="Ex: Ahmed Benali"
                        />
                        {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
                        <input
                            type="email"
                            {...register('email', { required: 'Ce champ est requis' })}
                            className="w-full form-input h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20"
                            placeholder="ahmed@sonatrach.dz"
                        />
                        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Mot de passe {isEditing ? <span className="text-gray-400 text-xs font-normal">(Optionnel)</span> : <span className="text-red-500">*</span>}</label>
                        <input
                            type="password"
                            {...register('password', { required: !isEditing ? 'Ce champ est requis' : false })}
                            className="w-full form-input h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20"
                            placeholder={isEditing ? 'Laisser vide pour ne pas changer' : 'Mot de passe'}
                        />
                        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Matricule</label>
                        <input
                            type="text"
                            {...register('employeeId')}
                            className="w-full form-input h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20"
                            placeholder="Ex: MAT12345"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Fonction</label>
                        <input
                            type="text"
                            {...register('position')}
                            className="w-full form-input h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20"
                            placeholder="Ex: Ingénieur IT"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Rôle Système</label>
                        <select
                            {...register('role')}
                            className="w-full form-input h-9 px-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-sonatrach-green focus:ring-1 focus:ring-sonatrach-green/20"
                        >
                            <option value="USER">Utilisateur (Employé)</option>
                            <option value="TECHNICIAN">Technicien</option>
                            <option value="SUPERVISOR">Superviseur</option>
                            <option value="ADMIN">Administrateur</option>
                        </select>
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-[var(--color-border)] mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                        disabled={isPending}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="px-4 py-2 text-sm font-medium bg-sonatrach-green hover:bg-sonatrach-green-light text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        {isPending && <span className="w-4 h-4 border-2 border-white/border-t-transparent rounded-full animate-spin" />}
                        {isEditing ? 'Enregistrer les modifications' : 'Créer l\'utilisateur'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
