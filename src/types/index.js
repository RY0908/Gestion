// src/types/index.js
// All application data shapes documented as JSDoc typedefs.

/**
 * @typedef {'LAPTOP'|'DESKTOP'|'SERVER'|'PRINTER'|'SCANNER'|'TABLET'|'SMARTPHONE'|'MONITOR'|'NETWORK_DEVICE'|'STORAGE'|'PROJECTOR'|'PERIPHERAL'|'OTHER'} AssetCategory
 */

/**
 * @typedef {'IN_STOCK'|'ASSIGNED'|'IN_MAINTENANCE'|'RETIRED'|'LOST'|'RESERVED'} AssetStatus
 */

/**
 * @typedef {'NEW'|'GOOD'|'FAIR'|'POOR'} AssetCondition
 */

/**
 * @typedef {Object} Department
 * @property {string} id
 * @property {string} name - e.g. "Direction Informatique"
 * @property {string} code - e.g. "DI"
 * @property {number} headCount
 */

/**
 * @typedef {Object} Location
 * @property {string} id
 * @property {string} name - e.g. "Siège Social Hydra"
 * @property {string} city
 * @property {string} building
 * @property {string|null} floor
 * @property {string|null} room
 */

/**
 * @typedef {'ADMIN'|'SUPERVISOR'|'TECHNICIAN'|'USER'} UserRole
 */

/**
 * @typedef {Object} Employee
 * @property {string} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} fullName
 * @property {string} email
 * @property {string} phone
 * @property {string} employeeId - e.g. "STR-EMP-00342"
 * @property {Department} department
 * @property {string} departmentId
 * @property {string} locationId
 * @property {string|null} managerId
 * @property {string} position
 * @property {UserRole} role
 * @property {string|null} avatar
 * @property {boolean} isActive
 * @property {string} hireDate - ISO date string
 */

/**
 * @typedef {Object} Asset
 * @property {string} id
 * @property {string} assetTag - e.g. "STR-LAP-2024-0042"
 * @property {string} serialNumber
 * @property {AssetCategory} category
 * @property {string} brand
 * @property {string} model
 * @property {Object.<string, string>} specifications
 * @property {AssetStatus} status
 * @property {AssetCondition} condition
 * @property {string} purchaseDate - ISO date string
 * @property {number} purchasePrice - DZD
 * @property {number} currentValue - after depreciation, DZD
 * @property {string|null} warrantyExpiry - ISO date string
 * @property {string} supplier
 * @property {string} invoiceNumber
 * @property {Location} location
 * @property {Department} department
 * @property {Employee|null} assignedTo
 * @property {string|null} assignedAt - ISO date string
 * @property {string} notes
 * @property {string[]} photos
 * @property {string} createdAt - ISO date string
 * @property {string} updatedAt - ISO date string
 */

/**
 * @typedef {Object} Assignment
 * @property {string} id
 * @property {Asset} asset
 * @property {Employee} assignedTo
 * @property {Employee} assignedBy
 * @property {string} assignedAt - ISO date string
 * @property {string|null} returnedAt
 * @property {string|null} expectedReturn
 * @property {string} reason
 * @property {'ACTIVE'|'RETURNED'|'OVERDUE'} status
 * @property {'GOOD'|'DAMAGED'|'LOST'|null} returnCondition
 * @property {string|null} returnNotes
 */

/**
 * @typedef {'PERPETUAL'|'SUBSCRIPTION'|'VOLUME'|'OEM'|'OPEN_SOURCE'} LicenseType
 */

/**
 * @typedef {Object} SoftwareLicense
 * @property {string} id
 * @property {string} softwareName
 * @property {string} vendor
 * @property {string} version
 * @property {LicenseType} licenseType
 * @property {string} licenseKey - masked in display
 * @property {number} totalSeats
 * @property {number} usedSeats
 * @property {number} availableSeats
 * @property {string} purchaseDate
 * @property {string|null} expiryDate
 * @property {number} annualCost - DZD
 * @property {string[]} assignedAssets - asset IDs
 * @property {'COMPLIANT'|'OVER_LICENSED'|'UNDER_LICENSED'|'EXPIRED'} complianceStatus
 */

/**
 * @typedef {'PREVENTIVE'|'CORRECTIVE'|'UPGRADE'|'INSPECTION'} MaintenanceType
 */

/**
 * @typedef {Object} MaintenanceRecord
 * @property {string} id
 * @property {Asset} asset
 * @property {MaintenanceType} type
 * @property {string} description
 * @property {string} technicianName
 * @property {string} startDate
 * @property {string|null} endDate
 * @property {number} cost - DZD
 * @property {'SCHEDULED'|'IN_PROGRESS'|'COMPLETED'|'CANCELLED'} status
 * @property {string|null} nextMaintenanceDate
 */

/**
 * @typedef {Object} EquipmentRequest
 * @property {string} id
 * @property {string} requestNumber - e.g. "REQ-2024-0156"
 * @property {Employee} requestedBy
 * @property {Employee} requestedFor
 * @property {AssetCategory} assetCategory
 * @property {string} justification
 * @property {'LOW'|'MEDIUM'|'HIGH'|'URGENT'} priority
 * @property {'PENDING'|'APPROVED'|'REJECTED'|'FULFILLED'|'CANCELLED'} status
 * @property {string} createdAt
 * @property {Employee|null} reviewedBy
 * @property {string|null} reviewedAt
 * @property {string|null} reviewNotes
 * @property {Asset|null} fulfilledWithAsset
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {Array} data
 * @property {number} total
 * @property {number} page
 * @property {number} pageSize
 * @property {number} totalPages
 */

/**
 * @typedef {Object} AuditLogEntry
 * @property {string} id
 * @property {string} action - e.g. "ASSET_CREATED", "ASSET_ASSIGNED"
 * @property {string} entityType - e.g. "Asset", "License"
 * @property {string} entityId
 * @property {string} description
 * @property {Employee} performedBy
 * @property {string} performedAt
 * @property {Object} changes - { fieldName: { before, after } }
 */
