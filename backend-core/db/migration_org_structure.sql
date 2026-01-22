-- Divisions
CREATE TABLE IF NOT EXISTS divisions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT
);

-- Roles
CREATE TABLE IF NOT EXISTS org_roles (
    id TEXT PRIMARY KEY,
    division_id TEXT REFERENCES divisions(id),
    title TEXT NOT NULL,
    responsibilities TEXT,
    kpi_metrics TEXT,
    reporting_to_role_id TEXT REFERENCES org_roles(id)
);

-- Seed Divisions
INSERT INTO divisions (id, name, description) VALUES
('interactive', 'Interactive Division (Game Studio)', 'Oversees creative vision and production pipeline'),
('creative', 'Creative Division (Comics, Books & Stories)', 'Guides overall artistic direction and brand consistency'),
('legal', 'Legal Department', 'Provides legal oversight and risk management'),
('operations', 'Operations', 'Oversees daily business operations and interdepartmental coordination'),
('executive', 'Executive Leadership', 'Provides strategic vision and overall company leadership')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Seed Roles
-- Executive
INSERT INTO org_roles (id, division_id, title, responsibilities, kpi_metrics) VALUES
('ceo', 'executive', 'CEO', 'Provides strategic vision and overall company leadership', 'Company Valuation, Strategic Goals Met'),
('cfo', 'executive', 'CFO', 'Manages financial planning, accounting, and investor relations', 'Cash Flow, ROI, Financial Health'),
('cmo', 'executive', 'CMO', 'Oversees marketing strategy and brand development', 'Brand Awareness, User Acquisition Cost'),
('cto', 'executive', 'CTO', 'Guides technological innovation and infrastructure', 'System Uptime, Tech Debt Reduction')
ON CONFLICT (id) DO UPDATE SET responsibilities = EXCLUDED.responsibilities;

-- Operations
INSERT INTO org_roles (id, division_id, title, responsibilities, kpi_metrics, reporting_to_role_id) VALUES
('coo', 'operations', 'COO', 'Oversees daily business operations and interdepartmental coordination', 'Operational Efficiency', 'ceo'),
('hr_director', 'operations', 'HR Director', 'Manages recruitment, training, and employee relations', 'Employee Retention, Hiring Time', 'coo'),
('it_manager', 'operations', 'IT Manager', 'Maintains technical infrastructure and security', 'System Security, Ticket Resolution Time', 'coo'),
('facilities', 'operations', 'Facilities Coordinator', 'Handles physical workspace needs', 'Facility Maintenance, Safety Compliance', 'coo')
ON CONFLICT (id) DO UPDATE SET responsibilities = EXCLUDED.responsibilities;

-- Interactive
INSERT INTO org_roles (id, division_id, title, responsibilities, kpi_metrics, reporting_to_role_id) VALUES
('game_director', 'interactive', 'Game Director', 'Oversees creative vision and production pipeline', 'Game Review Scores, Milestone Completion', 'ceo'),
('lead_dev', 'interactive', 'Lead Developer', 'Manages technical implementation and engineering teams', 'Code Quality, Bug Rates', 'game_director'),
('art_director', 'interactive', 'Art Director', 'Leads visual design and asset creation', 'Asset Quality, Pipeline Efficiency', 'game_director'),
('qa_manager', 'interactive', 'QA Manager', 'Coordinates testing and quality assurance processes', 'Bug Detection Rate, Test Coverage', 'game_director'),
('producer', 'interactive', 'Producer', 'Handles project scheduling and resource allocation', 'On-time Delivery, Budget Adherence', 'game_director')
ON CONFLICT (id) DO UPDATE SET responsibilities = EXCLUDED.responsibilities;

-- Creative
INSERT INTO org_roles (id, division_id, title, responsibilities, kpi_metrics, reporting_to_role_id) VALUES
('creative_dir', 'creative', 'Creative Director', 'Guides overall artistic direction and brand consistency', 'Brand Consistency, Content Quality', 'ceo'),
('lead_writer', 'creative', 'Lead Writer', 'Oversees narrative development and writing teams', 'Story Consistency, Script Output', 'creative_dir'),
('illustrator_mgr', 'creative', 'Illustrator Manager', 'Coordinates visual storytelling and artwork production', 'Art Output, Visual Style', 'creative_dir'),
('editor_chief', 'creative', 'Editor-in-Chief', 'Ensures content quality and publishing standards', 'Error Rates, Publication Schedule', 'creative_dir'),
('licensing_mgr', 'creative', 'Licensing Manager', 'Handles intellectual property adaptations and partnerships', 'Licensing Revenue, Partner Satisfaction', 'creative_dir')
ON CONFLICT (id) DO UPDATE SET responsibilities = EXCLUDED.responsibilities;

-- Legal
INSERT INTO org_roles (id, division_id, title, responsibilities, kpi_metrics, reporting_to_role_id) VALUES
('general_counsel', 'legal', 'General Counsel', 'Provides legal oversight and risk management', 'Risk Mitigation, Legal Compliance', 'ceo'),
('contracts_spec', 'legal', 'Contracts Specialist', 'Drafts and reviews business agreements', 'Contract Turnaround Time', 'general_counsel'),
('ip_attorney', 'legal', 'IP Attorney', 'Manages copyrights, trademarks, and patents', 'IP Portfolio Growth, Protection Success', 'general_counsel'),
('compliance_off', 'legal', 'Compliance Officer', 'Ensures regulatory adherence across all divisions', 'Audit Results, Compliance Incidents', 'general_counsel')
ON CONFLICT (id) DO UPDATE SET responsibilities = EXCLUDED.responsibilities;
