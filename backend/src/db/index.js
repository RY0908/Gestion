import pg from 'pg'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import bcrypt from 'bcryptjs'

const { Pool } = pg
const __dirname = dirname(fileURLToPath(import.meta.url))

let pool = null

export function getPool() {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            max: 10,                  // max 10 connections in pool
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
        })

        pool.on('error', (err) => {
            console.error('[DB] Unexpected pool error', err)
        })
    }
    return pool
}

export async function initDb() {
    const client = await getPool().connect()
    try {
        console.log('[DB] Applying schema...')
        const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8')
        await client.query(schema)
        console.log('[DB] Schema ready.')

        const { rows } = await client.query('SELECT COUNT(*) as n FROM utilisateurs')
        if (parseInt(rows[0].n) === 0) {
            console.log('[DB] Seeding initial data...')
            await seed(client)
            console.log('[DB] Seed complete.')
        }
    } finally {
        client.release()
    }
}

async function seed(client) {
    const hash = await bcrypt.hash('sigma2024', 10)

    const seedUsers = [
        { nom_complet: 'Ahmed Boudiaf',      email: 'ahmed.boudiaf@sonatrach.dz',    role: 'ADMIN' },
        { nom_complet: 'Fatima Zeroual',     email: 'fatima.zeroual@sonatrach.dz',   role: 'SUPERVISOR' },
        { nom_complet: 'Omar Boussouf',      email: 'omar.boussouf@sonatrach.dz',    role: 'SUPERVISOR' },
        { nom_complet: 'Aisha Sellal',       email: 'aisha.sellal@sonatrach.dz',     role: 'TECHNICIAN' },
        { nom_complet: 'Hassan Ouyahia',     email: 'hassan.ouyahia@sonatrach.dz',   role: 'TECHNICIAN' },
        { nom_complet: 'Leila Benali',       email: 'leila.benali@sonatrach.dz',     role: 'TECHNICIAN' },
        { nom_complet: 'Nour Djerad',        email: 'nour.djerad@sonatrach.dz',      role: 'TECHNICIAN' },
        { nom_complet: 'Ali Benbitour',      email: 'ali.benbitour@sonatrach.dz',    role: 'TECHNICIAN' },
        { nom_complet: 'Sara Hamrouche',     email: 'sara.hamrouche@sonatrach.dz',   role: 'USER' },
        { nom_complet: 'Karim Ghozali',      email: 'karim.ghozali@sonatrach.dz',    role: 'USER' },
        { nom_complet: 'Amira Abdesselam',   email: 'amira.abdesselam@sonatrach.dz', role: 'USER' },
    ]

    const POSITIONS = {
        ADMIN: 'Chef Département Informatique',
        SUPERVISOR: 'Superviseur SI',
        TECHNICIAN: 'Technicien Helpdesk',
        USER: 'Employé'
    }

    for (let i = 0; i < seedUsers.length; i++) {
        const u = seedUsers[i]
        await client.query(
            `INSERT INTO utilisateurs (nom_complet, email, mot_de_passe, role) VALUES ($1,$2,$3,$4)`,
            [u.nom_complet, u.email, hash, u.role]
        )
        const parts = u.nom_complet.split(' ')
        const prenom = parts[0]
        const nom = parts.slice(1).join(' ')
        await client.query(
            `INSERT INTO employes (matricule, nom, prenom, email, telephone, structure, poste_occupe, position, role)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
            [
                `STR-${String(342 + i).padStart(5, '0')}`,
                nom, prenom, u.email,
                `+213 555 ${String(100 + i).padStart(3, '0')} ${String(10 + i).padStart(2, '0')}`,
                u.role === 'USER' ? 'DRH' : 'DC-ISI',
                POSITIONS[u.role],
                POSITIONS[u.role],
                u.role
            ]
        )
    }

    // Sample equipment
    const equipment = [
        { code: 'LP-2024-001', num_serie: 'LP-SN-001', cat: 'LAPTOP',         marque: 'Dell',    modele: 'Latitude 7420',  etat: 'ASSIGNED',      loc: 'Bureau SIE A104' },
        { code: 'LP-2024-002', num_serie: 'LP-SN-002', cat: 'LAPTOP',         marque: 'HP',      modele: 'EliteBook 840',  etat: 'IN_STOCK',      loc: 'Magasin SIE' },
        { code: 'PC-2024-001', num_serie: 'PC-SN-001', cat: 'DESKTOP',        marque: 'Dell',    modele: 'OptiPlex 7090',  etat: 'EN_SERVICE',    loc: 'Open Space DC-ISI' },
        { code: 'PC-2024-002', num_serie: 'PC-SN-002', cat: 'DESKTOP',        marque: 'Lenovo',  modele: 'ThinkCentre M90',etat: 'IN_STOCK',      loc: 'Magasin SIE' },
        { code: 'IMP-2024-001',num_serie: 'IMP-SN-001',cat: 'PRINTER',        marque: 'HP',      modele: 'LaserJet Pro',   etat: 'EN_SERVICE',    loc: 'Secrétariat' },
        { code: 'IMP-2024-002',num_serie: 'IMP-SN-002',cat: 'PRINTER',        marque: 'Canon',   modele: 'imageRUNNER',    etat: 'IN_MAINTENANCE',loc: 'Atelier Technique' },
        { code: 'SRV-2024-001',num_serie: 'SRV-SN-001',cat: 'SERVER',         marque: 'HP',      modele: 'ProLiant DL380', etat: 'EN_SERVICE',    loc: 'Salle Serveurs S01' },
        { code: 'ECR-2024-001',num_serie: 'ECR-SN-001',cat: 'MONITOR',        marque: 'Dell',    modele: 'P2422H',         etat: 'IN_STOCK',      loc: 'Magasin SIE' },
        { code: 'PHC-2024-001',num_serie: 'PHC-SN-001',cat: 'PHOTOCOPIEUR',   marque: 'Xerox',   modele: 'WorkCentre 7845',etat: 'EN_SERVICE',    loc: 'Couloir RDC' },
        { code: 'RES-2024-001',num_serie: 'RES-SN-001',cat: 'NETWORK_DEVICE', marque: 'Cisco',   modele: 'Catalyst 2960',  etat: 'EN_SERVICE',    loc: 'Baie réseau N1' },
        { code: 'LP-2024-003', num_serie: 'LP-SN-003', cat: 'LAPTOP',         marque: 'Lenovo',  modele: 'ThinkPad E15',   etat: 'ASSIGNED',      loc: 'Bureau SIE A105' },
        { code: 'PC-2024-003', num_serie: 'PC-SN-003', cat: 'DESKTOP',        marque: 'HP',      modele: 'ProDesk 600',    etat: 'RETIRED',       loc: 'Magasin SIE' },
    ]
    for (let i = 0; i < equipment.length; i++) {
        const eq = equipment[i]
        await client.query(
            `INSERT INTO equipements (code_inventaire, num_serie, categorie, marque, modele, etat, prix_achat, valeur_actuelle, localisation, condition_physique)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'GOOD')`,
            [eq.code, eq.num_serie, eq.cat, eq.marque, eq.modele, eq.etat, 150000 + i * 20000, 120000 + i * 15000, eq.loc]
        )
    }

    // Sample requests
    const objets = [
        'Demande de nouvel équipement — nouvelle recrue',
        'Remplacement matériel obsolète — ordinateur HS',
        'Imprimante en panne — intervention urgente',
        'Besoin de deuxième écran pour poste de travail',
        'Mise à jour réseau — nouveau commutateur',
        'Installation logiciel métier',
    ]
    const statuts = ['PENDING', 'ASSIGNED', 'RESOLVED']
    const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
    for (let i = 0; i < 14; i++) {
        await client.query(
            `INSERT INTO demandes (num_demande, objet, description, priorite, statut, id_demandeur)
             VALUES ($1,$2,$3,$4,$5,$6)`,
            [
                `REQ-2024-${String(156 + i).padStart(4, '0')}`,
                objets[i % objets.length],
                'Description détaillée de la demande soumise par l\'agent.',
                priorities[i % 4],
                statuts[i % statuts.length],
                9 + (i % 3)
            ]
        )
    }

    // Sample licences
    const licences = [
        { nom: 'Microsoft Office 365',    editeur: 'Microsoft', version: '2024', cle: 'XXXX-YYYY-ZZZZ-1111', type: 'SUBSCRIPTION', postes: 50, utilises: 43, cout: 2500000, exp: '2025-12-31', conf: 'COMPLIANT' },
        { nom: 'Adobe Creative Suite',    editeur: 'Adobe',     version: '2024', cle: 'AAAA-BBBB-CCCC-2222', type: 'SUBSCRIPTION', postes: 5,  utilises: 8,  cout: 1200000, exp: '2024-06-30', conf: 'OVER_LICENSED' },
        { nom: 'AutoCAD',                 editeur: 'Autodesk',  version: '2024', cle: 'DDDD-EEEE-FFFF-3333', type: 'PERPETUAL',    postes: 3,  utilises: 2,  cout: 3800000, exp: null,         conf: 'COMPLIANT' },
        { nom: 'Kaspersky Endpoint',      editeur: 'Kaspersky', version: '2024', cle: 'GGGG-HHHH-IIII-4444', type: 'SUBSCRIPTION', postes: 100,utilises: 87, cout: 900000,  exp: '2024-03-31', conf: 'EXPIRED' },
        { nom: 'Windows Server 2022',     editeur: 'Microsoft', version: '2022', cle: 'MMMM-NNNN-OOOO-5555', type: 'PERPETUAL',    postes: 5,  utilises: 3,  cout: 5000000, exp: null,         conf: 'COMPLIANT' },
    ]
    for (const l of licences) {
        await client.query(
            `INSERT INTO licences (nom_logiciel, editeur, version, cle_licence, type_licence, nb_postes_autorises, nb_postes_utilises, cout_annuel, date_expiration, statut_conformite)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [l.nom, l.editeur, l.version, l.cle, l.type, l.postes, l.utilises, l.cout, l.exp, l.conf]
        )
    }

    // Sample maintenance
    await client.query(
        `INSERT INTO maintenance (type_maintenance, description_panne, statut, technicien, id_equipement)
         VALUES ($1,$2,$3,$4,$5)`,
        ['CORRECTIVE', 'Bourrage papier récurrent, rouleau à remplacer', 'IN_PROGRESS', 'Hassan Ouyahia', 6]
    )
    await client.query(
        `INSERT INTO maintenance (type_maintenance, description_panne, statut, technicien, id_equipement)
         VALUES ($1,$2,$3,$4,$5)`,
        ['PREVENTIVE', 'Nettoyage et vérification annuelle', 'SCHEDULED', 'Aisha Sellal', 3]
    )

    // Sample affectation (laptop 1 → employee 9)
    await client.query(
        `INSERT INTO affectations (id_equipement, id_employe, id_attribue_par, motif, statut)
         VALUES ($1,$2,$3,$4,$5)`,
        [1, 9, 2, 'Attribution poste bureau', 'ACTIVE']
    )
    await client.query(
        `INSERT INTO affectations (id_equipement, id_employe, id_attribue_par, motif, statut)
         VALUES ($1,$2,$3,$4,$5)`,
        [11, 10, 2, 'Attribution nouvelle recrue', 'ACTIVE']
    )

    // Seed admin audit log
    await client.query(
        `INSERT INTO journal_audit (type_action, entite_type, description, id_utilisateur)
         VALUES ($1,$2,$3,$4)`,
        ['LOGIN', 'UTILISATEUR', 'Initialisation du système SIGMA', 1]
    )
}
