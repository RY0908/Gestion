// Secure Mock Data (Matching Sonatrach Décharge Schema)
export const decharges = [
    {
        id: 'dch-1001',
        date: '2013-05-28T00:00:00.000Z',
        items: [
            {
                designation: 'PHOTOCOPIEUR MULTIFONCTION',
                marque: 'PRINT_PRO',
                modele: 'PRO 281 C',
                serialNumber: 'PRN 748473',
                observation: 'Affectation nouveau service'
            }
        ],
        partieCedante: { nom: 'Admin', prenom: 'Système' },
        partieRecevante: { nom: 'Directeur', prenom: 'Adjoint', structure: 'Direction Projets' },
        dateSignature: '2013-05-28T00:00:00.000Z',
        status: 'SIGNED',
        createdAt: '2013-05-28T00:00:00.000Z'
    },
    {
        id: 'dch-1002',
        date: '2024-02-15T00:00:00.000Z',
        items: [
            {
                designation: 'IMPRIMANTE LASER',
                marque: 'TECH_CORP',
                modele: 'LaserJet P20',
                serialNumber: 'LJP2055-2024-A',
                observation: 'Transfert de département'
            },
            {
                designation: 'SCANNER',
                marque: 'TECH_CORP',
                modele: 'ScanJet 90',
                serialNumber: 'SJN9120-2024-A',
                observation: 'Transfert de département'
            }
        ],
        partieCedante: { nom: 'Technicien', prenom: 'IT' },
        partieRecevante: { nom: 'Chef', prenom: 'Service', structure: 'Ressources Humaines' },
        dateSignature: '2024-02-15T00:00:00.000Z',
        status: 'SIGNED',
        createdAt: '2024-02-15T00:00:00.000Z'
    },
    {
        id: 'dch-1003',
        date: '2024-05-03T00:00:00.000Z',
        items: [
            {
                designation: 'MICRO-ORDINATEUR',
                marque: 'COMPU_SYS',
                modele: 'SysPro 70',
                serialNumber: 'SYS-PRO-2024-001',
                observation: 'Nouveau poste'
            },
            {
                designation: 'ECRAN 24 POUCES',
                marque: 'COMPU_SYS',
                modele: 'P24',
                serialNumber: 'SYS-P24-001',
                observation: ''
            },
            {
                designation: 'CLAVIER + SOURIS',
                marque: 'COMPU_SYS',
                modele: 'KB + MS',
                serialNumber: 'SYS-KBMS-001',
                observation: ''
            }
        ],
        partieCedante: { nom: 'Support', prenom: 'Niveau 2' },
        partieRecevante: { nom: 'Ingénieur', prenom: 'Données', structure: 'Division IT' },
        dateSignature: '2024-05-03T00:00:00.000Z',
        status: 'SIGNED',
        createdAt: '2024-05-03T00:00:00.000Z'
    },
    {
        id: 'dch-1004',
        date: '2024-08-20T00:00:00.000Z',
        items: [
            {
                designation: 'PHOTOCOPIEUR',
                marque: 'DOCU_SYS',
                modele: 'DP 80',
                serialNumber: 'BGP500035',
                observation: 'Remplacement d\'équipement'
            }
        ],
        partieCedante: { nom: 'Agent', prenom: 'Logistique' },
        partieRecevante: { nom: 'Assistant', prenom: 'Direction', structure: 'Ressources Humaines' },
        dateSignature: null,
        status: 'PENDING',
        createdAt: '2024-08-20T00:00:00.000Z'
    }
]
