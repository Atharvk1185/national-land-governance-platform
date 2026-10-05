-- ==============================================================================
-- National Digital Platform for Land Governance (NLGIRP)
-- Enterprise PostgreSQL 16 + PostGIS 3.4 + pgvector Schema
-- ==============================================================================

-- Enable Geospatial & Vector Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. ROLES & ACCESS CONTROL
CREATE TYPE user_role_enum AS ENUM (
    'SUPER ADMIN',
    'GOVERNMENT OFFICIAL',
    'RESEARCHER',
    'ACADEMIC INSTITUTION',
    'INDUSTRY EXPERT',
    'POLICY ANALYST',
    'DATA ANALYST',
    'PUBLIC USER'
);

CREATE TABLE institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL, -- Central Ministry, State Revenue Dept, IIT/IIM, Think Tank, University
    state VARCHAR(100),
    nodal_officer_email VARCHAR(255),
    website_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(200) NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'PUBLIC USER',
    institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
    designation VARCHAR(150),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. POLICIES & MONITORING INDICATORS
CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(200) NOT NULL,
    notification_year INTEGER NOT NULL,
    target_mandate TEXT NOT NULL,
    geographic_coverage VARCHAR(150),
    budget_allocation_cr NUMERIC(14, 2),
    implementation_status VARCHAR(100) NOT NULL, -- Active, Needs Attention, Underperforming, Archived
    score INTEGER CHECK (score >= 0 AND score <= 100),
    status_color VARCHAR(20) DEFAULT 'green', -- green, yellow, red
    indicators_json JSONB,
    description TEXT,
    outcomes TEXT,
    challenges TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. RESEARCH DOCUMENTS & VECTOR EMBEDDINGS
CREATE TABLE research (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(300) NOT NULL,
    authors TEXT NOT NULL,
    institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
    publication_year INTEGER NOT NULL,
    state VARCHAR(100),
    district VARCHAR(150),
    topic VARCHAR(150) NOT NULL,
    document_type VARCHAR(100) NOT NULL, -- Scientific Journal Article, Policy Brief, Evaluation Report
    access_level VARCHAR(50) DEFAULT 'Public', -- Public, Restricted, Confidential
    license VARCHAR(100) DEFAULT 'CC-BY-4.0',
    keywords TEXT[],
    citations_count INTEGER DEFAULT 0,
    summary TEXT NOT NULL,
    findings JSONB,
    policy_recommendations JSONB,
    embedding vector(384), -- 384-dimensional dense vector embeddings for RAG
    file_path VARCHAR(500),
    file_checksum_sha256 VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_research_embedding ON research USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_research_state ON research(state);
CREATE INDEX idx_research_topic ON research(topic);

-- 4. DATASETS CATALOG
CREATE TABLE datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    publisher VARCHAR(255) NOT NULL,
    department VARCHAR(200),
    coverage VARCHAR(100),
    temporal_range VARCHAR(100),
    format VARCHAR(50) NOT NULL, -- GeoJSON, CSV, Shapefile, GeoTIFF, API
    size_mb NUMERIC(10, 2),
    records_count BIGINT,
    update_frequency VARCHAR(50),
    access_level VARCHAR(50) DEFAULT 'Public',
    license VARCHAR(100),
    quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
    api_available BOOLEAN DEFAULT FALSE,
    api_endpoint VARCHAR(300),
    description TEXT,
    usage_guidelines TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. GEOSPATIAL POSTGIS LAYERS & PARCELS
CREATE TABLE gis_layers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    layer_name VARCHAR(150) NOT NULL UNIQUE,
    layer_type VARCHAR(50) NOT NULL, -- vector_polygon, vector_line, raster_lulc, heatmap
    default_opacity NUMERIC(3, 2) DEFAULT 0.75,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cadastral_parcels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ulpin VARCHAR(14) UNIQUE NOT NULL, -- 14-digit Bhu-Aadhaar
    state VARCHAR(100) NOT NULL,
    district VARCHAR(150) NOT NULL,
    taluk VARCHAR(150) NOT NULL,
    village VARCHAR(150) NOT NULL,
    survey_number VARCHAR(50),
    land_use_type VARCHAR(50), -- Agricultural, Residential, Commercial, Forest, Waterbody
    area_hectares NUMERIC(10, 4) NOT NULL,
    geom geometry(Polygon, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cadastral_geom ON cadastral_parcels USING GIST (geom);
CREATE INDEX idx_cadastral_ulpin ON cadastral_parcels(ulpin);

-- 6. IMMOVABLE PROPERTY DISPUTES
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number VARCHAR(100) UNIQUE NOT NULL,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(150) NOT NULL,
    court_type VARCHAR(100) NOT NULL, -- District Civil Court, High Court, Revenue Tribunal
    dispute_category VARCHAR(150) NOT NULL, -- Title & Ownership, Boundary Encroachment, Partition, Acquisition
    filing_year INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL, -- Pending, Disposed, Under Mediation
    disposal_year INTEGER,
    litigation_cost_estimated NUMERIC(12, 2),
    anonymized_claim_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_disputes_state_status ON disputes(state, status);

-- 7. COLLABORATIVE RESEARCH WORKSPACE
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    lead_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    members_count INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'Active',
    progress_pct INTEGER DEFAULT 0,
    datasets_used UUID[],
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, In Progress, Completed
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    due_date DATE
);

-- 8. INNOVATION CHALLENGES & PROPOSALS
CREATE TABLE innovation_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    organizer VARCHAR(255) NOT NULL,
    grant_pool_inr VARCHAR(50),
    deadline DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Accepting Proposals',
    themes TEXT[],
    submissions_count INTEGER DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE innovation_proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID REFERENCES innovation_challenges(id) ON DELETE CASCADE,
    applicant_name VARCHAR(200) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    institution VARCHAR(255) NOT NULL,
    title VARCHAR(300) NOT NULL,
    abstract TEXT NOT NULL,
    methodology TEXT,
    review_status VARCHAR(50) DEFAULT 'Submitted',
    evaluation_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. AUDIT LOGS
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(100),
    details TEXT,
    ip_address INET
);
