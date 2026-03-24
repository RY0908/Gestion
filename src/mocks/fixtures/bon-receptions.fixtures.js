// Secure Mock Data (Matching Sonatrach Bon de Réception M-103 Schema)
export const bonReceptions = [
    {
        id: 'br-1001',
        receptionNumber: 'BR-2005-001',
        supplier: { name: 'DOCU_SYS Algérie', code: 'DSYS', address: 'Zone Industrielle' },
        commandeNumber: 'BC N° 08/2005',
        livraisonNumber: 'BL-DSYS-2005-034',
        livraisonDate: '2005-06-15T00:00:00.000Z',
        items: [
            {
                code: 'PRN-281C',
                designation: 'Photocopieur PRO Estudio 281',
                udm: 'U',
                qtyCommandee: 1,
                soldeALivrer: 0,
                qtyReceptionnee: 1,
                prixUnitaire: 450000,
                valeur: 450000,
                serialNumber: 'PRN748473',
                articlesNonStockables: { numOT: 'OT-2005-089', centreCout: 'DEP-NORD', casier: '' }
            }
        ],
        signatures: {
            receptionnaire: 'Agent Réception',
            valorisePar: 'Cellule Comptabilité',
            fichiste: 'Service Fichier',
            comptabilite: 'Direction Comptabilité'
        },
        factureN: 'FAC-DSYS-2005-034',
        droitDouane: 0,
        fretAssurance: 12000,
        transport: 5000,
        observations: 'Réception conforme — matériel testé et opérationnel',
        articlesStockables: { classe: '' },
        status: 'VALIDATED',
        createdAt: '2005-06-15T00:00:00.000Z'
    },
    {
        id: 'br-1002',
        receptionNumber: 'BR-2006-012',
        supplier: { name: 'PRINT_PRO Algérie', code: 'PPRO', address: 'Zone Industrielle' },
        commandeNumber: 'BC N° 03/2006',
        livraisonNumber: 'BL-PPRO-2006-015',
        livraisonDate: '2006-04-20T00:00:00.000Z',
        items: [
            {
                code: 'PPRO-2020D',
                designation: 'Photocopieur MULTI 2020',
                udm: 'U',
                qtyCommandee: 5,
                soldeALivrer: 0,
                qtyReceptionnee: 5,
                prixUnitaire: 380000,
                valeur: 1900000,
                serialNumber: 'K835 (série)',
                articlesNonStockables: { numOT: 'OT-2006-033', centreCout: 'DEP-SUD', casier: '' }
            }
        ],
        signatures: {
            receptionnaire: 'Agent Réception',
            valorisePar: 'Cellule Comptabilité',
            fichiste: 'Service Fichier',
            comptabilite: 'Direction Comptabilité'
        },
        factureN: 'FAC-PPRO-2006-015',
        droitDouane: 0,
        fretAssurance: 25000,
        transport: 15000,
        observations: '5 photocopieurs réceptionnés — à distribuer aux structures',
        articlesStockables: { classe: '' },
        status: 'VALIDATED',
        createdAt: '2006-04-20T00:00:00.000Z'
    },
    {
        id: 'br-1003',
        receptionNumber: 'BR-2024-007',
        supplier: { name: 'TECH_CORP Solutions', code: 'TCS', address: 'Parc Technologique' },
        commandeNumber: 'BC N° 22/2024',
        livraisonNumber: 'BL-TCS-2024-089',
        livraisonDate: '2024-07-08T00:00:00.000Z',
        items: [
            {
                code: 'TCS-PRN-05',
                designation: 'Imprimante Réseau PRO 55',
                udm: 'U',
                qtyCommandee: 5,
                soldeALivrer: 2,
                qtyReceptionnee: 3,
                prixUnitaire: 85000,
                valeur: 255000,
                serialNumber: 'PRN2055-2024-A/B/C',
                articlesNonStockables: { numOT: 'OT-2024-145', centreCout: 'DEP-EST', casier: 'C-12' }
            },
            {
                code: 'TCS-SCN-09',
                designation: 'Scanner Documentaire PRO 90',
                udm: 'U',
                qtyCommandee: 2,
                soldeALivrer: 0,
                qtyReceptionnee: 2,
                prixUnitaire: 120000,
                valeur: 240000,
                serialNumber: 'SCN9120-2024-A/B',
                articlesNonStockables: { numOT: 'OT-2024-146', centreCout: 'DEP-OUEST', casier: 'C-15' }
            }
        ],
        signatures: {
            receptionnaire: 'Chef Magasinier',
            valorisePar: 'Comptabilité',
            fichiste: 'Service Fichier',
            comptabilite: 'Direction Financière'
        },
        factureN: 'FAC-TCS-2024-089',
        droitDouane: 0,
        fretAssurance: 8000,
        transport: 5000,
        observations: 'Réception partielle — 2 imprimantes en attente de livraison',
        articlesStockables: { classe: 'A' },
        status: 'PARTIAL',
        createdAt: '2024-07-08T00:00:00.000Z'
    }
]
