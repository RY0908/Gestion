import { DEPARTMENTS, LOCATIONS } from './departments.fixtures.js'
import { users } from './users.fixtures.js'
import { generateAssetTag } from '../../lib/utils.js'

// ─── Secure Mock Data Implementation (Matching Sonatrach Schemas) ───

const PHOTOCOPIERS = [
    { brand: 'COPIER_PRO', model: 'X-5900', serial: 'CPW-350-A1', affectation: 'DRH', bureau: '301', year: 2020 },
    { brand: 'COPIER_PRO', model: 'X-5000', serial: 'CPW-350-A2', affectation: 'DFJ', bureau: '402', year: 2021 },
    { brand: 'COPIER_PRO', model: 'X-5000', serial: 'CPW-350-A3', affectation: 'DCM', bureau: '201', year: 2021 },
    { brand: 'COPIER_PRO', model: 'X-5700', serial: 'CPW-350-A4', affectation: 'S/TIRAGE', bureau: '01', year: 2019 },
    { brand: 'PRINT_MASTER', model: '1550-D', serial: 'PMF-258-B1', affectation: 'SEC/PAG', bureau: '', year: 2020 },
    { brand: 'PRINT_MASTER', model: '2860-C', serial: 'PMF-236-B2', affectation: 'S/TIRAGE', bureau: '', year: 2018 },
    { brand: 'DOCU_TECH', model: '2020-Z', serial: 'DTK-835-C1', affectation: 'SIE', bureau: '305', year: 2022 },
    { brand: 'DOCU_TECH', model: '2020-Z', serial: 'DTK-835-C2', affectation: 'ADM', bureau: '', year: 2022 },
    { brand: 'DOCU_TECH', model: '2020-Z', serial: 'DTK-835-C3', affectation: 'Remplacement', bureau: '', year: 2022, status: 'EN_PANNE' },
    { brand: 'OFFICE_SYS', model: 'DP-80', serial: 'OSB-500-D1', affectation: 'DIV', bureau: '450', year: 2021 },
    { brand: 'OFFICE_SYS', model: 'DP-80', serial: 'OSB-500-D2', affectation: 'DRH', bureau: '350', year: 2021 },
    { brand: 'OFFICE_SYS', model: 'DP-80', serial: 'OSB-500-D3', affectation: 'Remplacement', bureau: '', year: 2021, status: 'REMPLACEMENT' },
]

const FAX_MACHINES = [
    { brand: 'COMMS_TECH', model: 'KX-600', serial: 'CTX-041-F1', affectation: 'SEC/CMT', bureau: '', year: 2018 },
    { brand: 'COMMS_TECH', model: 'KX-600', serial: 'CTX-041-F2', affectation: 'SEC/VP', bureau: '', year: 2018 },
    { brand: 'QUICK_FAX', model: 'TF-65', serial: 'QFX-971-F3', affectation: 'DPT/RELEX', bureau: '', year: 2019 },
    { brand: 'DOCU_SEND', model: 'T-90', serial: 'DSF-622-F4', affectation: 'DPT/RELEX', bureau: '', year: 2020 },
]

const OFFICE_IT = [
    { brand: 'TECH_CORP', model: 'DeskPro 7', serial: 'TCP-001', affectation: 'SIE', bureau: '01', category: 'DESKTOP', year: 2022 },
    { brand: 'TECH_CORP', model: 'PrintJet 13', serial: 'TCP-601', affectation: 'CCS', bureau: '401', category: 'PRINTER', year: 2021 },
    { brand: 'TECH_CORP', model: 'ScanJet 9', serial: 'TCP-912', affectation: 'SIE', bureau: '402', category: 'SCANNER', year: 2022 },
    { brand: 'COMPU_SYS', model: 'Micro Sys', serial: 'CSM-001', affectation: 'CCS', bureau: '401', category: 'DESKTOP', year: 2023 },
    { brand: 'COMPU_SYS', model: 'Micro Sys', serial: 'CSM-002', affectation: 'CCS', bureau: '403', category: 'DESKTOP', year: 2023 },
    { brand: 'BIND_PRO', model: 'Bind 110', serial: 'BDP-110', affectation: 'CCS', bureau: '', category: 'RELIEUSE', year: 2019 },
    { brand: 'COMMS_TECH', model: 'Poste IP', serial: 'CTP-001', affectation: 'SIE', bureau: '01', category: 'TELEPHONE', year: 2021 },
    { brand: 'POWER_SAFE', model: 'Onduleur 1K', serial: 'PWS-001', affectation: 'SIE', bureau: '01', category: 'ONDULEUR', year: 2020 },
    { brand: 'COOL_SYS', model: 'Clim Mono', serial: 'CLS-155', affectation: 'SIE', bureau: '01', category: 'CLIMATISEUR', year: 2018 },
]

const FURNITURE = [
    { designation: 'Bureau Ergonomique 2m', code: 'MOB-1024', brand: 'FurniTech', year: 2018 },
    { designation: 'Retour bureau mobile tiroirs', code: 'MOB-1124', brand: 'FurniTech', year: 2018 },
    { designation: 'Caisson mobile 3 tiroirs', code: 'MOB-1224', brand: 'FurniTech', year: 2018 },
    { designation: 'Armoire vitrée', code: 'MOB-1563', brand: 'OfficePlus', year: 2020 },
    { designation: 'Armoire en bois', code: 'MOB-1564', brand: 'OfficePlus', year: 2020 },
    { designation: 'Fauteuil Direction P1', code: 'MOB-1457', brand: 'ErgoSeat', year: 2021 },
    { designation: 'Chaise Visiteur Tissus', code: 'MOB-1345', brand: 'ErgoSeat', year: 2021 },
]

const INVENTORY_ITEMS = [
    { designation: 'Armoire basse', qty: 1, bureau: '402', structure: 'SEC/CCS', model: '' },
    { designation: 'Caisson mobile', qty: 1, bureau: '402', structure: 'SEC/CCS', model: '' },
    { designation: 'Photocopieur', qty: 1, bureau: '402', structure: 'SEC/CCS', model: 'X-5000' },
    { designation: 'Micro Ordinateur', qty: 1, bureau: '402', structure: 'SEC/CCS', model: 'DeskPro' },
]

// ─── Helper ───

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}

function getDepartmentByCode(code) {
    return DEPARTMENTS.find(d => d.code === code) || DEPARTMENTS[0]
}

// ─── Generate assets from real data ───

let assetIndex = 0

// Photocopiers → assets
const photocopierAssets = PHOTOCOPIERS.map((pc, i) => {
    assetIndex++
    const purchaseDate = new Date(pc.year, 3, 15)
    const dept = getDepartmentByCode(pc.affectation) || getRandomItem(DEPARTMENTS)
    return {
        id: `ast-${1000 + assetIndex}`,
        assetTag: generateAssetTag('PHOTOCOPIEUR', pc.year, assetIndex),
        serialNumber: pc.serial,
        category: 'PHOTOCOPIEUR',
        brand: pc.brand,
        model: pc.model,
        specifications: {},
        status: pc.status || 'EN_SERVICE',
        condition: pc.status === 'EN_PANNE' ? 'POOR' : 'GOOD',
        purchaseDate: purchaseDate.toISOString(),
        purchasePrice: 250000 + (Math.random() * 150000),
        currentValue: 80000 + (Math.random() * 50000),
        warrantyExpiry: new Date(pc.year + 3, 3, 15).toISOString(),
        supplier: getRandomItem([{ id: 's5', name: 'PRINT_PRO Algérie' }, { id: 's6', name: 'TECH_CORP Solutions' }, { id: 's7', name: 'DOCU_SYS Algérie' }]),
        invoiceNumber: `FAC-${pc.year}-${String(100 + i).padStart(4, '0')}`,
        location: getRandomItem(LOCATIONS),
        department: dept,
        affectation: pc.affectation,
        bureau: pc.bureau,
        inventoryNumber: `INV-PC-${String(assetIndex).padStart(4, '0')}`,
        assignedTo: null,
        assignedAt: null,
        notes: pc.status === 'EN_PANNE' ? 'Équipement en panne — en attente de remplacement' : `Affecté à ${pc.affectation}`,
        photos: [],
        createdAt: purchaseDate.toISOString(),
        updatedAt: purchaseDate.toISOString()
    }
})

// Fax → assets
const faxAssets = FAX_MACHINES.map((fax, i) => {
    assetIndex++
    const purchaseDate = new Date(fax.year, 6, 1)
    const dept = getDepartmentByCode(fax.affectation) || getRandomItem(DEPARTMENTS)
    return {
        id: `ast-${1000 + assetIndex}`,
        assetTag: generateAssetTag('FAX', fax.year, assetIndex),
        serialNumber: fax.serial,
        category: 'FAX',
        brand: fax.brand,
        model: fax.model,
        specifications: {},
        status: 'EN_SERVICE',
        condition: 'GOOD',
        purchaseDate: purchaseDate.toISOString(),
        purchasePrice: 45000 + (Math.random() * 30000),
        currentValue: 15000 + (Math.random() * 10000),
        warrantyExpiry: new Date(fax.year + 2, 6, 1).toISOString(),
        supplier: getRandomItem([{ id: 's6', name: 'TECH_CORP Solutions' }, { id: 's8', name: 'COMPU_SYS Algérie' }]),
        invoiceNumber: `FAC-${fax.year}-FAX-${String(i + 1).padStart(3, '0')}`,
        location: getRandomItem(LOCATIONS),
        department: dept,
        affectation: fax.affectation,
        bureau: fax.bureau || '',
        inventoryNumber: `INV-FAX-${String(assetIndex).padStart(4, '0')}`,
        assignedTo: null,
        assignedAt: null,
        notes: `Télécopieur affecté à ${fax.affectation}`,
        photos: [],
        createdAt: purchaseDate.toISOString(),
        updatedAt: purchaseDate.toISOString()
    }
})

// Office IT → assets
const officeITAssets = OFFICE_IT.map((item, i) => {
    assetIndex++
    const purchaseDate = new Date(item.year, 1, 10)
    const dept = getDepartmentByCode(item.affectation) || getRandomItem(DEPARTMENTS)
    const isAssigned = Math.random() > 0.3
    const assignedTo = isAssigned ? getRandomItem(users) : null
    return {
        id: `ast-${1000 + assetIndex}`,
        assetTag: generateAssetTag(item.category, item.year, assetIndex),
        serialNumber: item.serial,
        category: item.category,
        brand: item.brand,
        model: item.model,
        specifications: {},
        status: isAssigned ? 'ASSIGNED' : 'EN_SERVICE',
        condition: 'GOOD',
        purchaseDate: purchaseDate.toISOString(),
        purchasePrice: 80000 + (Math.random() * 100000),
        currentValue: 30000 + (Math.random() * 40000),
        warrantyExpiry: new Date(item.year + 3, 1, 10).toISOString(),
        supplier: getRandomItem([{ id: 's8', name: 'COMPU_SYS Algérie' }, { id: 's4', name: 'TECH_CORP IT Solutions' }]),
        invoiceNumber: `FAC-${item.year}-IT-${String(i + 1).padStart(3, '0')}`,
        location: getRandomItem(LOCATIONS),
        department: dept,
        affectation: item.affectation,
        bureau: item.bureau,
        inventoryNumber: `INV-IT-${String(assetIndex).padStart(4, '0')}`,
        assignedTo,
        assignedAt: assignedTo ? new Date().toISOString() : null,
        notes: `Équipement IT Bureau ${item.bureau}`,
        photos: [],
        createdAt: purchaseDate.toISOString(),
        updatedAt: purchaseDate.toISOString()
    }
})

// Furniture → assets
const furnitureAssets = FURNITURE.map((item, i) => {
    assetIndex++
    const purchaseDate = new Date(item.year, 9, 1)
    return {
        id: `ast-${1000 + assetIndex}`,
        assetTag: item.code || generateAssetTag('MOBILIER', item.year, assetIndex),
        serialNumber: item.code,
        category: 'MOBILIER',
        brand: item.brand || 'Mobilier Algérie',
        model: item.designation,
        specifications: {},
        status: 'EN_SERVICE',
        condition: 'GOOD',
        purchaseDate: purchaseDate.toISOString(),
        purchasePrice: 22000 + (Math.random() * 40000),
        currentValue: 10000 + (Math.random() * 15000),
        warrantyExpiry: new Date(item.year + 5, 9, 1).toISOString(),
        supplier: { id: 's1', name: 'FURNI_CORP Industries' },
        invoiceNumber: `FAC-0422/99`,
        location: LOCATIONS[0], // Siège AVAL
        department: getRandomItem(DEPARTMENTS),
        affectation: '',
        bureau: '',
        inventoryNumber: item.code,
        assignedTo: null,
        assignedAt: null,
        notes: `Ensemble de bureau ${item.brand || ''} — ${item.designation}`,
        photos: [],
        createdAt: purchaseDate.toISOString(),
        updatedAt: purchaseDate.toISOString()
    }
})

export const assets = [
    ...photocopierAssets,
    ...faxAssets,
    ...officeITAssets,
    ...furnitureAssets,
]
