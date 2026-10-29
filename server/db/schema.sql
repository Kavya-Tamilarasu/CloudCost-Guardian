-- ==========================================================
-- CLOUDCOST GUARDIAN: PostgreSQL Relational Database Schema
-- College Academic Project in Cloud Computing
-- Non-AI Rule-Based Resource Waste & Cost Leakage Detection
-- Compatible with PostgreSQL 14+, Supabase, Cloud SQL, Aurora
-- ==========================================================

-- 1. CLOUD RESOURCES TABLE
CREATE TABLE IF NOT EXISTS cloud_resources (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    service VARCHAR(32) NOT NULL,              -- 'EC2', 'EBS', 'S3', 'RDS', etc.
    resource_type VARCHAR(64) NOT NULL,        -- 'EC2 Instance', 'EBS Volume', etc.
    status VARCHAR(32) NOT NULL,               -- 'running', 'unattached', 'stopped', etc.
    region VARCHAR(32) NOT NULL DEFAULT 'ap-south-1',
    zone VARCHAR(32) NOT NULL DEFAULT 'ap-south-1a',
    instance_type VARCHAR(32),                 -- 't3.large', 'm5.2xlarge', etc.
    storage_type VARCHAR(32),                  -- 'gp3', 'io2', 'Standard'
    storage_size_gb NUMERIC(10, 2),
    cpu_utilization NUMERIC(5, 2),            -- 0.00 to 100.00 %
    monthly_cost NUMERIC(12, 2) NOT NULL,      -- INR (₹)
    waste_status VARCHAR(64) DEFAULT 'Healthy',
    severity VARCHAR(16) DEFAULT 'Info',       -- 'Critical', 'High', 'Medium', 'Low', 'Info'
    is_wasteful BOOLEAN DEFAULT FALSE,
    metrics JSONB DEFAULT '{}'::jsonb,        -- Raw CloudWatch telemetry snapshot
    tags JSONB DEFAULT '{}'::jsonb,           -- AWS Resource Tags
    last_checked TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. DETERMINISTIC DETECTION RULES TABLE
CREATE TABLE IF NOT EXISTS detection_rules (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) UNIQUE NOT NULL,          -- 'RULE-001', 'RULE-002', etc.
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,             -- 'Underutilized Resource', 'Orphaned Storage'
    resource_type VARCHAR(64) NOT NULL,
    severity VARCHAR(16) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    metric VARCHAR(64) NOT NULL,               -- 'cpuUtilization', 'status', etc.
    operator VARCHAR(8) NOT NULL,              -- '<', '>', '==', '!=', '<=', '>='
    threshold VARCHAR(64) NOT NULL,            -- e.g. '10', 'unattached', '90'
    threshold_unit VARCHAR(32) NOT NULL,       -- '%', 'days', 'state', '₹/mo'
    condition_description TEXT NOT NULL,
    recommendation_template TEXT NOT NULL,
    savings_factor NUMERIC(4, 2) DEFAULT 0.70, -- Fraction of monthly cost recovered
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. WASTE DETECTIONS TABLE
CREATE TABLE IF NOT EXISTS waste_detections (
    id VARCHAR(64) PRIMARY KEY,
    resource_id VARCHAR(64) REFERENCES cloud_resources(id) ON DELETE CASCADE,
    rule_id VARCHAR(64) REFERENCES detection_rules(id) ON DELETE CASCADE,
    rule_code VARCHAR(32) NOT NULL,
    waste_category VARCHAR(64) NOT NULL,
    observed_value VARCHAR(128) NOT NULL,
    threshold_value VARCHAR(128) NOT NULL,
    condition_met TEXT NOT NULL,
    severity VARCHAR(16) NOT NULL,
    estimated_monthly_waste NUMERIC(12, 2) NOT NULL,
    estimated_potential_savings NUMERIC(12, 2) NOT NULL,
    recommended_action TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'Open',         -- 'Open', 'Resolved', 'Ignored'
    explanation JSONB,                         -- Step-by-step deterministic trace
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. PROACTIVE SYSTEM ALERTS TABLE
CREATE TABLE IF NOT EXISTS system_alerts (
    id VARCHAR(64) PRIMARY KEY,
    resource_id VARCHAR(64) REFERENCES cloud_resources(id) ON DELETE CASCADE,
    rule_code VARCHAR(32) NOT NULL,
    service VARCHAR(32) NOT NULL,
    reason TEXT NOT NULL,
    severity VARCHAR(16) NOT NULL,
    estimated_cost_impact NUMERIC(12, 2) NOT NULL,
    recommended_action TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'Active',       -- 'Active', 'Reviewed', 'Dismissed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. ACTIONABLE RECOMMENDATIONS TABLE
CREATE TABLE IF NOT EXISTS recommendations (
    id VARCHAR(64) PRIMARY KEY,
    resource_id VARCHAR(64) REFERENCES cloud_resources(id) ON DELETE CASCADE,
    problem TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    estimated_monthly_impact NUMERIC(12, 2) NOT NULL,
    priority VARCHAR(16) NOT NULL,
    action_type VARCHAR(32) NOT NULL,          -- 'Rightsize', 'Stop Instance', 'Delete Volume', etc.
    effort_level VARCHAR(16) DEFAULT 'Low',
    status VARCHAR(32) DEFAULT 'Pending',      -- 'Pending', 'Applied', 'Dismissed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. AUDIT & SCAN LOGS TABLE
CREATE TABLE IF NOT EXISTS scan_audit_logs (
    id SERIAL PRIMARY KEY,
    scan_type VARCHAR(32) NOT NULL,            -- 'Automated Scheduled', 'Manual Admin Scan'
    resources_scanned INTEGER NOT NULL,
    waste_detected_count INTEGER NOT NULL,
    total_waste_cost NUMERIC(12, 2) NOT NULL,
    potential_savings NUMERIC(12, 2) NOT NULL,
    duration_ms INTEGER NOT NULL,
    executed_by VARCHAR(128) DEFAULT 'system_admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR FAST QUERYING & METRIC AGGREGATIONS
CREATE INDEX IF NOT EXISTS idx_resources_service ON cloud_resources(service);
CREATE INDEX IF NOT EXISTS idx_resources_status ON cloud_resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_waste_status ON cloud_resources(waste_status);
CREATE INDEX IF NOT EXISTS idx_waste_detections_severity ON waste_detections(severity);
CREATE INDEX IF NOT EXISTS idx_waste_detections_category ON waste_detections(waste_category);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON system_alerts(status);
