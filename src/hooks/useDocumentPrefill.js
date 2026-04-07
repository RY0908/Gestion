import { useAuthStore } from '@/store/authStore.js'

/**
 * Returns default form values for document forms based on the logged-in user.
 * Usage: const { defaults, user } = useDocumentPrefill('DEMANDE_INTERV')
 *        then in useForm: defaultValues: defaults
 */
export function useDocumentPrefill(docType) {
    const user = useAuthStore(s => s.user)

    const now = new Date()
    const todayISO = now.toISOString().split('T')[0]
    const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    // Parse first name / last name from fullName
    const nameParts = (user?.fullName || '').split(' ')
    const prenom = nameParts[0] || ''
    const nom = nameParts.slice(1).join(' ') || ''

    const structure = user?.department?.code || user?.department?.name || ''
    const direction = structure

    const defaults = {}

    switch (docType) {
        case 'DECHARGE':
            defaults.activite = 'Activité AVAL'
            defaults.structure = structure
            defaults.dateRemise = todayISO
            // Pre-fill cedant (giver) for TECHNICIAN/ADMIN since they usually issue the discharge
            if (user?.role === 'TECHNICIAN' || user?.role === 'ADMIN') {
                defaults.cedantNom = nom
                defaults.cedantPrenom = prenom
                defaults.cedantStructure = structure
            }
            break

        case 'DEMANDE_INTERV':
            defaults.date = todayISO
            defaults.heure = nowTime
            defaults.nom = user?.fullName || ''
            defaults.matricule = user?.employeeId || ''
            defaults.direction = direction
            defaults.telephone = user?.phone || ''
            defaults.bureau = ''
            defaults.urgence = 'Normal'
            defaults.historique = 'Non'
            break

        case 'FICHE_INTERV':
            defaults.date = todayISO
            defaults.heure = nowTime
            if (['TECHNICIAN', 'ADMIN', 'SUPERVISOR'].includes(user?.role)) {
                defaults.technicienNom = user?.fullName || ''
                defaults.technicienMatricule = user?.employeeId || ''
            }
            break

        case 'BON_COMMANDE':
            defaults.activite = 'Activité AVAL'
            defaults.date = todayISO
            defaults.demandeur = user?.fullName || ''
            defaults.structure = structure
            break

        case 'BON_RECEPTION':
            defaults.date = todayISO
            defaults.receptionnaire = user?.fullName || ''
            defaults.structure = structure
            break

        case 'DEMANDE_MATERIEL':
            defaults.activite = 'Activité AVAL'
            defaults.structure = structure
            defaults.date = todayISO
            defaults.nom = nom
            defaults.prenom = prenom
            defaults.nomComplet = user?.fullName || ''
            defaults.matricule = user?.employeeId || ''
            defaults.direction = direction
            defaults.telephone = user?.phone || ''
            break

        case 'FICHE_INVENTAIRE':
            defaults.date = todayISO
            defaults.responsable = user?.fullName || ''
            defaults.structure = structure
            break

        case 'RAPPORT_INTERV':
            defaults.date = todayISO
            defaults.technicien = user?.fullName || ''
            defaults.technicienMatricule = user?.employeeId || ''
            defaults.direction = direction
            break

        case 'FICHE_BESOIN':
            defaults.activite = 'Activité AVAL'
            defaults.date = todayISO
            defaults.demandeur = user?.fullName || ''
            defaults.structure = structure
            defaults.direction = direction
            break

        case 'DEMANDE_GARANTIE':
            defaults.date = todayISO
            defaults.demandeur = user?.fullName || ''
            defaults.structure = structure
            defaults.direction = direction
            break

        case 'BON_SORTIE':
            defaults.date = todayISO
            defaults.emetteur = user?.fullName || ''
            defaults.structure = structure
            defaults.activite = 'Activité AVAL'
            break

        default:
            break
    }

    return { defaults, user }
}
