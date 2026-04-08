import { ASSET_CATEGORIES } from '@/lib/constants.js'

const COMMON_SPEC_FIELDS = {
  asset: [
    { key: 'brand', label: 'Marque suggérée', type: 'text', placeholder: 'Dell, HP, Lenovo...' },
    { key: 'model', label: 'Modèle suggéré', type: 'text', placeholder: 'Latitude 5440' },
    { key: 'quantity', label: 'Quantité', type: 'number', min: 1, placeholder: '1' },
  ],
}

const ASSET_SPECIFICATION_FIELDS = {
  LAPTOP: [
    { key: 'processor', label: 'Processeur', type: 'text', placeholder: 'Intel Core i5 / Ryzen 5' },
    { key: 'ram', label: 'Mémoire RAM', type: 'text', placeholder: '16 Go' },
    { key: 'storage', label: 'Stockage', type: 'text', placeholder: '512 Go SSD' },
    { key: 'screen', label: 'Taille écran', type: 'text', placeholder: '14 pouces' },
    { key: 'os', label: 'Système d’exploitation', type: 'text', placeholder: 'Windows 11' },
  ],
  DESKTOP: [
    { key: 'processor', label: 'Processeur', type: 'text', placeholder: 'Intel Core i5 / Ryzen 5' },
    { key: 'ram', label: 'Mémoire RAM', type: 'text', placeholder: '16 Go' },
    { key: 'storage', label: 'Stockage', type: 'text', placeholder: '512 Go SSD' },
    { key: 'formFactor', label: 'Format', type: 'text', placeholder: 'Tour / SFF / Mini PC' },
  ],
  SERVER: [
    { key: 'cpu', label: 'CPU', type: 'text', placeholder: 'Xeon Silver / EPYC' },
    { key: 'ram', label: 'Mémoire RAM', type: 'text', placeholder: '64 Go' },
    { key: 'storage', label: 'Stockage', type: 'text', placeholder: '2x1 To SSD' },
    { key: 'raid', label: 'RAID', type: 'text', placeholder: 'RAID 1 / RAID 5' },
  ],
  PRINTER: [
    { key: 'technology', label: 'Technologie', type: 'text', placeholder: 'Laser / Jet d’encre' },
    { key: 'color', label: 'Couleur', type: 'text', placeholder: 'N&B / Couleur' },
    { key: 'duplex', label: 'Recto-verso', type: 'text', placeholder: 'Oui / Non' },
  ],
  PHOTOCOPIEUR: [
    { key: 'speed', label: 'Vitesse', type: 'text', placeholder: '30 ppm' },
    { key: 'color', label: 'Couleur', type: 'text', placeholder: 'N&B / Couleur' },
    { key: 'scan', label: 'Scanner', type: 'text', placeholder: 'Oui / Non' },
  ],
  FAX: [
    { key: 'line', label: 'Ligne', type: 'text', placeholder: 'Analogique / IP' },
    { key: 'memory', label: 'Mémoire', type: 'text', placeholder: '2 Mo' },
  ],
  SCANNER: [
    { key: 'resolution', label: 'Résolution', type: 'text', placeholder: '600 dpi' },
    { key: 'speed', label: 'Vitesse', type: 'text', placeholder: '20 ppm' },
  ],
  DESTRUCTEUR: [
    { key: 'securityLevel', label: 'Niveau de sécurité', type: 'text', placeholder: 'P-4 / P-5' },
    { key: 'capacity', label: 'Capacité', type: 'text', placeholder: '20 feuilles' },
  ],
  RELIEUSE: [
    { key: 'format', label: 'Format', type: 'text', placeholder: 'A4 / A3' },
    { key: 'capacity', label: 'Capacité', type: 'text', placeholder: '200 feuilles' },
  ],
  TABLET: [
    { key: 'screen', label: 'Taille écran', type: 'text', placeholder: '10 pouces' },
    { key: 'storage', label: 'Stockage', type: 'text', placeholder: '128 Go' },
    { key: 'os', label: 'Système', type: 'text', placeholder: 'Android / iPadOS' },
  ],
  SMARTPHONE: [
    { key: 'screen', label: 'Taille écran', type: 'text', placeholder: '6.5 pouces' },
    { key: 'storage', label: 'Stockage', type: 'text', placeholder: '256 Go' },
    { key: 'os', label: 'Système', type: 'text', placeholder: 'Android / iOS' },
  ],
  MONITOR: [
    { key: 'size', label: 'Taille', type: 'text', placeholder: '24 pouces' },
    { key: 'resolution', label: 'Résolution', type: 'text', placeholder: '1920x1080' },
    { key: 'panel', label: 'Dalle', type: 'text', placeholder: 'IPS / VA / TN' },
  ],
  NETWORK_DEVICE: [
    { key: 'ports', label: 'Ports', type: 'text', placeholder: '24 ports' },
    { key: 'speed', label: 'Débit', type: 'text', placeholder: '1 Gbps' },
    { key: 'wifi', label: 'Wi-Fi', type: 'text', placeholder: 'Oui / Non' },
  ],
  STORAGE: [
    { key: 'capacity', label: 'Capacité', type: 'text', placeholder: '4 To' },
    { key: 'interface', label: 'Interface', type: 'text', placeholder: 'SATA / NVMe / SAS' },
    { key: 'raid', label: 'RAID', type: 'text', placeholder: 'Oui / Non' },
  ],
  PROJECTOR: [
    { key: 'lumens', label: 'Luminosité', type: 'text', placeholder: '3500 lumens' },
    { key: 'resolution', label: 'Résolution', type: 'text', placeholder: '1080p' },
    { key: 'lampLife', label: 'Durée lampe', type: 'text', placeholder: '10 000 h' },
  ],
  PERIPHERAL: [
    { key: 'type', label: 'Type', type: 'text', placeholder: 'Clavier / Souris / Casque' },
    { key: 'connection', label: 'Connexion', type: 'text', placeholder: 'USB / Bluetooth' },
  ],
  TELEPHONE: [
    { key: 'type', label: 'Type', type: 'text', placeholder: 'IP / Fixe' },
    { key: 'line', label: 'Ligne', type: 'text', placeholder: 'Interne / externe' },
  ],
  CLIMATISEUR: [
    { key: 'btu', label: 'Puissance', type: 'text', placeholder: '12 000 BTU' },
    { key: 'inverter', label: 'Inverter', type: 'text', placeholder: 'Oui / Non' },
  ],
  ONDULEUR: [
    { key: 'power', label: 'Puissance', type: 'text', placeholder: '1500 VA' },
    { key: 'runtime', label: 'Autonomie', type: 'text', placeholder: '15 min' },
  ],
  MOBILIER: [
    { key: 'material', label: 'Matériau', type: 'text', placeholder: 'Bois / Métal' },
    { key: 'dimensions', label: 'Dimensions', type: 'text', placeholder: '120x60x75 cm' },
  ],
  OTHER: [
    { key: 'note', label: 'Spécification libre', type: 'text', placeholder: 'Précisez le besoin' },
  ],
}

const REQUEST_SPECIFICATION_FIELDS = {
  PC: [
    { key: 'quantity', label: 'Quantité souhaitée', type: 'number', min: 1, placeholder: '1' },
    { key: 'processor', label: 'Processeur minimum', type: 'text', placeholder: 'Intel Core i5' },
    { key: 'ram', label: 'RAM minimum', type: 'text', placeholder: '8 Go' },
    { key: 'storage', label: 'Stockage minimum', type: 'text', placeholder: '256 Go SSD' },
  ],
  LAPTOP: [
    { key: 'quantity', label: 'Quantité souhaitée', type: 'number', min: 1, placeholder: '1' },
    { key: 'processor', label: 'Processeur minimum', type: 'text', placeholder: 'Intel Core i5' },
    { key: 'ram', label: 'RAM minimum', type: 'text', placeholder: '8 Go' },
    { key: 'storage', label: 'Stockage minimum', type: 'text', placeholder: '256 Go SSD' },
    { key: 'screen', label: 'Taille écran', type: 'text', placeholder: '14 pouces' },
  ],
  PRINTER: [
    { key: 'quantity', label: 'Quantité souhaitée', type: 'number', min: 1, placeholder: '1' },
    { key: 'technology', label: 'Technologie', type: 'text', placeholder: 'Laser' },
    { key: 'color', label: 'Couleur', type: 'text', placeholder: 'Couleur / N&B' },
    { key: 'duplex', label: 'Recto-verso', type: 'text', placeholder: 'Oui / Non' },
  ],
  NETWORK: [
    { key: 'quantity', label: 'Quantité souhaitée', type: 'number', min: 1, placeholder: '1' },
    { key: 'ports', label: 'Ports', type: 'text', placeholder: '24 ports' },
    { key: 'speed', label: 'Débit', type: 'text', placeholder: '1 Gbps' },
    { key: 'wifi', label: 'Wi-Fi', type: 'text', placeholder: 'Oui / Non' },
  ],
  ACCESSORY: [
    { key: 'quantity', label: 'Quantité souhaitée', type: 'number', min: 1, placeholder: '1' },
    { key: 'type', label: 'Type d’accessoire', type: 'text', placeholder: 'Clavier / Souris / Casque' },
    { key: 'connection', label: 'Connexion', type: 'text', placeholder: 'USB / Bluetooth' },
  ],
  SOFTWARE: [
    { key: 'softwareName', label: 'Nom du logiciel', type: 'text', placeholder: 'Microsoft Office' },
    { key: 'version', label: 'Version', type: 'text', placeholder: '2024' },
    { key: 'licenses', label: 'Nombre de licences', type: 'number', min: 1, placeholder: '1' },
  ],
  OTHER: [
    { key: 'quantity', label: 'Quantité souhaitée', type: 'number', min: 1, placeholder: '1' },
    { key: 'note', label: 'Description complémentaire', type: 'text', placeholder: 'Précisez votre besoin' },
  ],
  MAINTENANCE: [
    { key: 'issueType', label: 'Type de panne', type: 'text', placeholder: 'Matériel, logiciel, réseau...' },
    { key: 'symptoms', label: 'Symptômes observés', type: 'text', placeholder: 'Décrivez le problème constaté' },
    { key: 'preferredDate', label: 'Date souhaitée', type: 'text', placeholder: 'Dès que possible / date précise' },
  ],
}

export const REQUEST_CATEGORIES = [
  { value: 'PC', label: 'PC Fixe / Unité Centrale' },
  { value: 'LAPTOP', label: 'Ordinateur Portable' },
  { value: 'PRINTER', label: 'Imprimante / Scanner' },
  { value: 'NETWORK', label: 'Équipement Réseau (Routeur, Switch)' },
  { value: 'ACCESSORY', label: 'Accessoire (Clavier, Souris, Casque)' },
  { value: 'SOFTWARE', label: 'Licence Logiciel' },
  { value: 'MAINTENANCE', label: 'Demande de maintenance' },
  { value: 'OTHER', label: 'Autre' },
]

export function getAssetSpecificationFields(category) {
  return ASSET_SPECIFICATION_FIELDS[category] || ASSET_SPECIFICATION_FIELDS.OTHER
}

export function getRequestSpecificationFields(category) {
  return REQUEST_SPECIFICATION_FIELDS[category] || REQUEST_SPECIFICATION_FIELDS.OTHER
}

export function getCategoryLabel(category) {
  return ASSET_CATEGORIES.find(item => item.value === category)?.label
    || REQUEST_CATEGORIES.find(item => item.value === category)?.label
    || category
}

export function normalizeSpecifications(specifications) {
  if (!specifications) return {}
  if (typeof specifications === 'object') return specifications
  if (typeof specifications === 'string') {
    try {
      return JSON.parse(specifications)
    } catch {
      return {}
    }
  }
  return {}
}

export function compactSpecifications(specifications) {
  return Object.fromEntries(
    Object.entries(specifications || {}).filter(([, value]) => value !== '' && value !== null && value !== undefined)
  )
}

export function getSpecificationEntries(category, specifications, kind = 'asset') {
  const fields = kind === 'request'
    ? getRequestSpecificationFields(category)
    : getAssetSpecificationFields(category)

  const normalized = normalizeSpecifications(specifications)

  return fields.map(field => ({
    ...field,
    value: normalized[field.key],
  }))
}

export function summarizeSpecifications(category, specifications, kind = 'asset', maxItems = 2) {
  return getSpecificationEntries(category, specifications, kind)
    .filter(entry => entry.value !== undefined && entry.value !== null && entry.value !== '')
    .slice(0, maxItems)
    .map(entry => `${entry.label}: ${entry.value}`)
    .join(' • ')
}
