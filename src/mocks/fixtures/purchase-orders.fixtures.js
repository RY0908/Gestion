import { DEPARTMENTS, LOCATIONS } from './departments.fixtures.js'

// Secure Mock Data (Matching Sonatrach Bon de Commande Schema)
export const purchaseOrders = [
    {
        id: 'po-1001',
        orderNumber: 'BC N° 10/2023',
        date: '2023-07-07T00:00:00.000Z',
        supplier: { name: 'DOCU_SYS Algérie', code: 'DSYS' },
        deliveryAddress: 'Siège Principal - Zone Industrielle',
        conditions: {
            referenceDevis: 'Facture Prochaine',
            dateLivraison: '',
            modeExpedition: ''
        },
        items: [
            { code: 'ART-001', designation: 'CONFECTION CACHET OFFICIEL', quantity: 1, unitPrice: 2500, total: 2500 }
        ],
        totalGeneral: 2500,
        imputation: { compteGeneral: 'CG-100', compteAnalytique: 'CA-200' },
        requestedBy: 'Service Administratif',
        approvedBy: 'Direction Générale',
        status: 'APPROVED',
        createdAt: '2023-07-07T00:00:00.000Z'
    },
    {
        id: 'po-1002',
        orderNumber: 'BC N° 0422/23',
        date: '2023-12-29T00:00:00.000Z',
        supplier: { name: 'FURNI_CORP Industries', code: 'FCORP' },
        deliveryAddress: 'Centre de Distribution',
        conditions: { referenceDevis: 'Devis n° 0422/23', dateLivraison: '15/01/24' },
        items: [
            { code: 'MOB-1001', designation: 'Bureau de Direction Ergonomique', quantity: 1, unitPrice: 38100, total: 38100 },
            { code: 'MOB-1002', designation: 'Retour de bureau mobile', quantity: 1, unitPrice: 22900, total: 22900 },
            { code: 'MOB-1003', designation: 'Caisson mobile 3 tiroirs', quantity: 1, unitPrice: 14800, total: 14800 },
            { code: 'MOB-1004', designation: 'Bahut de rangement', quantity: 1, unitPrice: 42000, total: 42000 },
            { code: 'MOB-1005', designation: 'Bibliothèque classex', quantity: 1, unitPrice: 55500, total: 55500 },
            { code: 'MOB-1006', designation: "Table de réunion", quantity: 1, unitPrice: 18100, total: 18100 },
            { code: 'MOB-1007', designation: 'Fauteuil cuir visiteur', quantity: 3, unitPrice: 22500, total: 67500 },
            { code: 'MOB-1008', designation: 'Fauteuil Direction basculant', quantity: 1, unitPrice: 30000, total: 30000 }
        ],
        totalGeneral: 288900,
        tvaRate: 19,
        imputation: { compteGeneral: 'CG-218', compteAnalytique: 'CA-MOB-01' },
        requestedBy: 'Direction Financière',
        approvedBy: 'Direction Générale',
        status: 'DELIVERED',
        createdAt: '2023-12-29T00:00:00.000Z'
    },
    {
        id: 'po-1003',
        orderNumber: 'BC N° 15/2024',
        date: '2024-03-15T00:00:00.000Z',
        supplier: { name: 'PRINT_PRO Algérie', code: 'PPRO' },
        deliveryAddress: 'Direction Informatique Centrale',
        conditions: { referenceDevis: 'Devis N° PPRO-2024-089', dateLivraison: '2024-04-15' },
        items: [
            { code: 'PRN-C123', designation: 'Photocopieur Multifonction PRO', quantity: 3, unitPrice: 350000, total: 1050000 },
            { code: 'PRN-TON1', designation: 'Cartouche Toner Haute Capacité', quantity: 12, unitPrice: 8500, total: 102000 }
        ],
        totalGeneral: 1152000,
        tvaRate: 19,
        imputation: { compteGeneral: 'CG-2400', compteAnalytique: 'CA-INFRA-001' },
        requestedBy: 'Département IT',
        approvedBy: 'DSI',
        status: 'APPROVED',
        createdAt: '2024-03-15T00:00:00.000Z'
    },
    {
        id: 'po-1004',
        orderNumber: 'BC N° 22/2024',
        date: '2024-06-10T00:00:00.000Z',
        supplier: { name: 'TECH_CORP Solutions', code: 'TCS' },
        deliveryAddress: 'Site Administratif Nord',
        conditions: { referenceDevis: 'Devis N° TCS-2024-156', dateLivraison: '2024-07-10' },
        items: [
            { code: 'IT-PRR-05', designation: 'Imprimante Réseau Départementale', quantity: 5, unitPrice: 85000, total: 425000 },
            { code: 'IT-SCN-02', designation: 'Scanner Documentaire Réseau', quantity: 2, unitPrice: 120000, total: 240000 }
        ],
        totalGeneral: 665000,
        tvaRate: 19,
        imputation: { compteGeneral: 'CG-2400', compteAnalytique: 'CA-INFRA-002' },
        requestedBy: 'Département IT',
        approvedBy: 'DSI',
        status: 'PENDING',
        createdAt: '2024-06-10T00:00:00.000Z'
    }
]
