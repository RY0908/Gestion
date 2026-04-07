-- SIGMA Database Schema for PostgreSQL

DROP TABLE IF EXISTS journal_audit CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS licence_equipement CASCADE;
DROP TABLE IF EXISTS licences CASCADE;
DROP TABLE IF EXISTS maintenance CASCADE;
DROP TABLE IF EXISTS demandes CASCADE;
DROP TABLE IF EXISTS affectations CASCADE;
DROP TABLE IF EXISTS equipements CASCADE;
DROP TABLE IF EXISTS employes CASCADE;
DROP TABLE IF EXISTS utilisateurs CASCADE;

-- ─── Table 1: utilisateurs ────────────────────────────────────────────────────
CREATE TABLE utilisateurs (
    id SERIAL PRIMARY KEY,
    nom_complet VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER'
        CHECK(role IN ('ADMIN','SUPERVISOR','TECHNICIAN','USER')),
    est_actif BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Table 2: employes ────────────────────────────────────────────────────────
CREATE TABLE employes (
    id SERIAL PRIMARY KEY,
    matricule VARCHAR(50) NOT NULL UNIQUE,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    nom_complet VARCHAR(100) GENERATED ALWAYS AS (prenom || ' ' || nom) STORED,
    email VARCHAR(100) NOT NULL UNIQUE,
    telephone VARCHAR(20),
    structure VARCHAR(100),
    poste_occupe VARCHAR(100),
    position VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'USER'
        CHECK(role IN ('ADMIN','SUPERVISOR','TECHNICIAN','USER')),
    est_actif BOOLEAN NOT NULL DEFAULT TRUE,
    date_embauche DATE,
    id_responsable INTEGER REFERENCES employes(id),
    department_id INTEGER,
    location_id INTEGER,
    avatar VARCHAR(255)
);

-- ─── Table 3: equipements ─────────────────────────────────────────────────────
CREATE TABLE equipements (
    id SERIAL PRIMARY KEY,
    code_inventaire VARCHAR(50) NOT NULL UNIQUE,
    num_serie VARCHAR(100) UNIQUE,
    categorie VARCHAR(50) NOT NULL
        CHECK(categorie IN ('LAPTOP','DESKTOP','SERVER','PRINTER','PHOTOCOPIEUR',
                            'FAX','SCANNER','DESTRUCTEUR','RELIEUSE','TABLET',
                            'SMARTPHONE','MONITOR','NETWORK_DEVICE','STORAGE',
                            'PROJECTOR','PERIPHERAL','TELEPHONE','CLIMATISEUR',
                            'ONDULEUR','MOBILIER','OTHER')),
    marque VARCHAR(100),
    modele VARCHAR(100),
    specifications JSONB,
    etat VARCHAR(50) NOT NULL DEFAULT 'IN_STOCK'
        CHECK(etat IN ('EN_SERVICE','IN_STOCK','ASSIGNED','IN_MAINTENANCE',
                       'EN_PANNE','REMPLACEMENT','RETIRED','LOST','RESERVED')),
    condition_physique VARCHAR(20) NOT NULL DEFAULT 'NEW'
        CHECK(condition_physique IN ('NEW','GOOD','FAIR','POOR')),
    date_acquisition DATE,
    prix_achat NUMERIC(15,2),
    valeur_actuelle NUMERIC(15,2),
    date_garantie DATE,
    fournisseur VARCHAR(150),
    num_facture VARCHAR(100),
    localisation VARCHAR(150),
    notes TEXT,
    date_creation TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_modification TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Table 4: affectations ────────────────────────────────────────────────────
CREATE TABLE affectations (
    id SERIAL PRIMARY KEY,
    date_affectation DATE NOT NULL DEFAULT CURRENT_DATE,
    date_retour DATE,
    motif TEXT,
    statut VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CHECK(statut IN ('ACTIVE','RETURNED','OVERDUE')),
    condition_retour VARCHAR(20)
        CHECK(condition_retour IN ('GOOD','DAMAGED','LOST') OR condition_retour IS NULL),
    notes_retour TEXT,
    id_equipement INTEGER NOT NULL REFERENCES equipements(id),
    id_employe INTEGER NOT NULL REFERENCES employes(id),
    id_attribue_par INTEGER REFERENCES employes(id),
    date_creation TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Table 5: demandes (Tickets) ──────────────────────────────────────────────
CREATE TABLE demandes (
    id SERIAL PRIMARY KEY,
    num_demande VARCHAR(50) NOT NULL UNIQUE,
    objet VARCHAR(255) NOT NULL,
    description TEXT,
    priorite VARCHAR(20) NOT NULL DEFAULT 'MEDIUM'
        CHECK(priorite IN ('LOW','MEDIUM','HIGH','URGENT')),
    statut VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK(statut IN ('PENDING','ASSIGNED','RESOLVED')),
    date_demande TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_resolution TIMESTAMPTZ,
    notes TEXT,
    id_demandeur INTEGER NOT NULL REFERENCES employes(id),
    id_superviseur_assignant INTEGER REFERENCES employes(id),
    id_technicien_assigne INTEGER REFERENCES employes(id)
);

-- ─── Table 6: maintenance ─────────────────────────────────────────────────────
CREATE TABLE maintenance (
    id SERIAL PRIMARY KEY,
    type_maintenance VARCHAR(50) NOT NULL
        CHECK(type_maintenance IN ('PREVENTIVE','CORRECTIVE','UPGRADE','INSPECTION')),
    description_panne TEXT,
    date_debut DATE NOT NULL DEFAULT CURRENT_DATE,
    date_fin DATE,
    cout_reparation NUMERIC(15,2) DEFAULT 0,
    technicien VARCHAR(150),
    pieces_utilisees TEXT,
    statut VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED'
        CHECK(statut IN ('SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED')),
    id_equipement INTEGER NOT NULL REFERENCES equipements(id),
    date_creation TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Table 7: licences ────────────────────────────────────────────────────────
CREATE TABLE licences (
    id SERIAL PRIMARY KEY,
    nom_logiciel VARCHAR(150) NOT NULL,
    editeur VARCHAR(100) NOT NULL,
    version VARCHAR(50),
    cle_licence VARCHAR(255),
    type_licence VARCHAR(50) NOT NULL DEFAULT 'PERPETUAL'
        CHECK(type_licence IN ('PERPETUAL','SUBSCRIPTION','VOLUME','OEM','OPEN_SOURCE')),
    nb_postes_autorises INTEGER NOT NULL DEFAULT 1,
    nb_postes_utilises INTEGER NOT NULL DEFAULT 0,
    date_acquisition DATE,
    date_expiration DATE,
    cout_annuel NUMERIC(15,2) DEFAULT 0,
    statut_conformite VARCHAR(50) NOT NULL DEFAULT 'COMPLIANT'
        CHECK(statut_conformite IN ('COMPLIANT','OVER_LICENSED','UNDER_LICENSED','EXPIRED')),
    date_creation TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Table 8: licence_equipement ─────────────────────────────────────────────
CREATE TABLE licence_equipement (
    id_licence INTEGER NOT NULL REFERENCES licences(id) ON DELETE CASCADE,
    id_equipement INTEGER NOT NULL REFERENCES equipements(id) ON DELETE CASCADE,
    PRIMARY KEY (id_licence, id_equipement)
);

-- ─── Table 9: documents ───────────────────────────────────────────────────────
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    type_document VARCHAR(50) NOT NULL,
    numero_document VARCHAR(100) NOT NULL,
    date_generation TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    donnees_json JSONB,
    id_affectation INTEGER REFERENCES affectations(id)
);

-- ─── Table 10: journal_audit ──────────────────────────────────────────────────
CREATE TABLE journal_audit (
    id SERIAL PRIMARY KEY,
    type_action VARCHAR(50) NOT NULL,
    entite_type VARCHAR(50) NOT NULL,
    entite_id INTEGER,
    description TEXT,
    modifications_json JSONB,
    date_action TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    id_utilisateur INTEGER REFERENCES utilisateurs(id)
);

-- ─── Indexes for performance ──────────────────────────────────────────────────
CREATE INDEX idx_demandes_statut ON demandes(statut);
CREATE INDEX idx_equipements_etat ON equipements(etat);
CREATE INDEX idx_equipements_categorie ON equipements(categorie);
CREATE INDEX idx_affectations_employe ON affectations(id_employe, statut);
CREATE INDEX idx_audit_date ON journal_audit(date_action);
CREATE INDEX idx_licences_expiration ON licences(date_expiration);

-- Nouveaux index pour optimisation (Mes demandes et vues diverses)
CREATE INDEX idx_demandes_demandeur ON demandes(id_demandeur);
CREATE INDEX idx_demandes_date ON demandes(date_demande DESC);
CREATE INDEX idx_affectations_equipement ON affectations(id_equipement);
CREATE INDEX idx_maintenance_equipement ON maintenance(id_equipement);
CREATE INDEX idx_journal_audit_date_desc ON journal_audit(date_action DESC);
