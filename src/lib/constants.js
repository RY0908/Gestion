export const ASSET_CATEGORIES = [
    { value: 'LAPTOP', label: 'Ordinateur Portable', icon: 'Laptop' },
    { value: 'DESKTOP', label: 'Ordinateur de Bureau', icon: 'Monitor' },
    { value: 'SERVER', label: 'Serveur', icon: 'Server' },
    { value: 'PRINTER', label: 'Imprimante', icon: 'Printer' },
    { value: 'PHOTOCOPIEUR', label: 'Photocopieur', icon: 'Copy' },
    { value: 'FAX', label: 'Fax / Télécopieur', icon: 'Phone' },
    { value: 'SCANNER', label: 'Scanner', icon: 'ScanLine' },
    { value: 'DESTRUCTEUR', label: 'Destructeur', icon: 'Trash2' },
    { value: 'RELIEUSE', label: 'Relieuse à boudin', icon: 'BookOpen' },
    { value: 'TABLET', label: 'Tablette', icon: 'Tablet' },
    { value: 'SMARTPHONE', label: 'Smartphone', icon: 'Smartphone' },
    { value: 'MONITOR', label: 'Écran', icon: 'Monitor' },
    { value: 'NETWORK_DEVICE', label: 'Équip. Réseau', icon: 'Network' },
    { value: 'STORAGE', label: 'Stockage', icon: 'HardDrive' },
    { value: 'PROJECTOR', label: 'Projecteur', icon: 'Projector' },
    { value: 'PERIPHERAL', label: 'Périphérique', icon: 'Keyboard' },
    { value: 'TELEPHONE', label: 'Poste Téléphonique', icon: 'Phone' },
    { value: 'CLIMATISEUR', label: 'Climatiseur', icon: 'Thermometer' },
    { value: 'ONDULEUR', label: 'Onduleur / UPS', icon: 'Zap' },
    { value: 'MOBILIER', label: 'Mobilier de Bureau', icon: 'Armchair' },
    { value: 'OTHER', label: 'Autre', icon: 'Package' },
]

export const ASSET_STATUSES = [
    { value: 'EN_SERVICE', label: 'En service', color: 'text-sonatrach-green bg-green-50' },
    { value: 'IN_STOCK', label: 'En stock', color: 'text-blue-600 bg-blue-50' },
    { value: 'ASSIGNED', label: 'Affecté', color: 'text-sonatrach-green bg-green-50' },
    { value: 'IN_MAINTENANCE', label: 'En maintenance', color: 'text-amber-600 bg-amber-50' },
    { value: 'EN_PANNE', label: 'En panne', color: 'text-red-600 bg-red-50' },
    { value: 'REMPLACEMENT', label: 'Remplacement', color: 'text-orange-600 bg-orange-50' },
    { value: 'RETIRED', label: 'Retiré / Réformé', color: 'text-gray-500 bg-gray-100' },
    { value: 'LOST', label: 'Perdu', color: 'text-red-600 bg-red-50' },
    { value: 'RESERVED', label: 'Réservé', color: 'text-purple-600 bg-purple-50' },
]

export const USER_ROLES = [
    { value: 'ADMIN', label: 'Administrateur' },
    { value: 'IT_MANAGER', label: 'Responsable IT' },
    { value: 'IT_TECHNICIAN', label: 'Technicien IT' },
    { value: 'EMPLOYEE', label: 'Employé' },
    { value: 'AUDITOR', label: 'Auditeur' },
]

// Real Sonatrach Activité AVAL structures
export const STRUCTURES = [
    { code: 'DRH', label: 'Direction des Ressources Humaines' },
    { code: 'SEC/VP', label: 'Secrétariat Vice-Président' },
    { code: 'CCS', label: 'Cellule Communication et Sécurité' },
    { code: 'DIV', label: 'Division' },
    { code: 'DMG/SEC', label: 'Direction Moyens Généraux / Secrétariat' },
    { code: 'SIE', label: 'Service Informatique et Équipements' },
    { code: 'SCE/ACHAT', label: 'Service Achats' },
    { code: 'DPT/PRG', label: 'Département Programmation' },
    { code: 'DPT/RELEX', label: 'Département Relations Extérieures' },
    { code: 'SEC/BSD', label: 'Secrétariat BSD' },
    { code: 'SEC/CMT', label: 'Secrétariat CMT' },
    { code: 'SEC/VTC/CMT', label: 'Secrétariat VTC/CMT' },
    { code: 'SEC/CPT', label: 'Secrétariat Comptabilité' },
    { code: 'SEC/PAG', label: 'Secrétariat PAG' },
    { code: 'ADM', label: 'Administration' },
    { code: 'PLS', label: 'Planification et Suivi' },
    { code: 'DFJ', label: 'Direction Finances et Juridique' },
    { code: 'DCM', label: 'Direction Commercialisation' },
    { code: 'DEV', label: 'Développement' },
    { code: 'S/TIRAGE', label: 'Salle de Tirage' },
    { code: 'MAGASIEN', label: 'Magasin' },
    { code: 'IRATENE', label: 'Base IRATENE' },
    { code: 'BOUZOURANE', label: 'Base BOUZOURANE' },
]

export const DEPARTMENTS = [
    { id: 'd1', name: 'Direction Informatique (SIE)', code: 'SIE', headCount: 45 },
    { id: 'd2', name: 'Direction Ressources Humaines', code: 'DRH', headCount: 60 },
    { id: 'd3', name: 'Direction Moyens Généraux', code: 'DMG', headCount: 35 },
    { id: 'd4', name: 'Direction Finances et Juridique', code: 'DFJ', headCount: 40 },
    { id: 'd5', name: 'Direction Commercialisation', code: 'DCM', headCount: 55 },
    { id: 'd6', name: 'Département Programmation', code: 'DPT/PRG', headCount: 30 },
    { id: 'd7', name: 'Département Relations Extérieures', code: 'DPT/RELEX', headCount: 25 },
    { id: 'd8', name: 'Cellule Communication et Sécurité', code: 'CCS', headCount: 20 },
    { id: 'd9', name: 'Planification et Suivi', code: 'PLS', headCount: 15 },
    { id: 'd10', name: 'Administration', code: 'ADM', headCount: 30 },
    { id: 'd11', name: 'Service Achats', code: 'SCE/ACHAT', headCount: 20 },
    { id: 'd12', name: 'Division', code: 'DIV', headCount: 50 },
]

export const LOCATIONS = [
    { id: 'l1', name: 'Siège Activité AVAL', city: 'Alger', building: '127 Bd Krim Belkacem', floors: ['RDC', '1er', '2ème', '3ème', '4ème', '5ème'] },
    { id: 'l2', name: 'Base Sidi Arcine', city: 'Sidi Arcine', building: 'CCS/AVAL', floors: ['RDC', '1er', '2ème'] },
    { id: 'l3', name: 'Base IRATENE', city: 'IRATENE', building: 'Centre Technique', floors: ['RDC', '1er'] },
    { id: 'l4', name: 'Base BOUZOURANE', city: 'BOUZOURANE', building: 'Centre Logistique', floors: ['RDC'] },
    { id: 'l5', name: 'Projet 84 Stations', city: 'Alger', building: 'Site Projet', floors: ['RDC'] },
]

export const DOCUMENT_TYPES = [
    { value: 'BON_COMMANDE', label: 'Bon de Commande' },
    { value: 'BON_RECEPTION', label: 'Bon de Réception (M-103)' },
    { value: 'FACTURE', label: 'Facture' },
    { value: 'DECHARGE', label: 'Décharge' },
    { value: 'FICHE_INVENTAIRE', label: "Fiche d'Inventaire" },
    { value: 'PV_RECEPTION', label: 'Procès Verbal de Réception (M-203)' },
    { value: 'ACCUSE_RECEPTION', label: 'Accusé de Réception' },
]

export const SUPPLIERS = [
    { id: 's1', name: 'LOUABAR Industries', code: 'LOUAB', city: 'Alger', address: '26, rue Abou Hamou' },
    { id: 's2', name: 'PROMO EQUIPEMENT', code: 'PROMO', city: 'Alger' },
    { id: 's3', name: 'HAMMOUDI Solutions', code: 'HAMM', city: 'Alger' },
    { id: 's4', name: 'CEVITAL IT Solutions', code: 'CEV', city: 'Alger' },
    { id: 's5', name: 'XEROX Algérie', code: 'XRX', city: 'Alger' },
    { id: 's6', name: 'TOSHIBA Algérie', code: 'TSB', city: 'Alger' },
    { id: 's7', name: 'RICOH Algérie', code: 'RCH', city: 'Alger' },
    { id: 's8', name: 'HP Algérie', code: 'HP', city: 'Alger' },
]

export const PAGE_SIZES = [20, 50, 100]
