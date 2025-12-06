-- ============================================
-- ROW LEVEL SECURITY POLICIES FOR LEADS TABLE
-- ============================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_teams ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES FOR LEADS
-- ============================================

-- Policy 1: SELECT policy for leads
-- Admins can read all leads in their tenant
-- Counselors can read leads assigned to them or their team
CREATE POLICY "leads_select_policy" ON leads
    FOR SELECT USING (
        -- Check if user has admin role in JWT
        (auth.jwt() ->> 'role' = 'admin' AND tenant_id IN (
            SELECT id FROM tenants WHERE id::text = auth.jwt() ->> 'tenant_id'
        ))
        OR
        -- Check if user has counselor role
        (auth.jwt() ->> 'role' = 'counselor' AND tenant_id IN (
            SELECT id FROM tenants WHERE id::text = auth.jwt() ->> 'tenant_id'
        ) AND (
            -- Leads assigned to the counselor
            owner_id = auth.uid()::uuid
            OR
            -- Leads assigned to counselor's team members
            owner_id IN (
                SELECT user_id 
                FROM user_teams 
                WHERE team_id IN (
                    SELECT team_id 
                    FROM user_teams 
                    WHERE user_id = auth.uid()::uuid
                )
            )
            OR
            -- Leads without owner (unassigned)
            owner_id IS NULL
        ))
    );

-- Policy 2: INSERT policy for leads
-- Admins and counselors can insert leads
CREATE POLICY "leads_insert_policy" ON leads
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'role' IN ('admin', 'counselor')
        AND tenant_id IN (
            SELECT id FROM tenants WHERE id::text = auth.jwt() ->> 'tenant_id'
        )
        AND (
            -- Can assign to themselves
            owner_id = auth.uid()::uuid
            OR
            -- Can assign to team members (admins only)
            (auth.jwt() ->> 'role' = 'admin' AND owner_id IN (
                SELECT user_id FROM user_teams WHERE team_id IN (
                    SELECT team_id FROM teams 
                    WHERE tenant_id IN (
                        SELECT id FROM tenants WHERE id::text = auth.jwt() ->> 'tenant_id'
                    )
                )
            ))
            OR
            -- Can leave unassigned
            owner_id IS NULL
        )
    );

-- Policy 3: UPDATE policy for leads
CREATE POLICY "leads_update_policy" ON leads
    FOR UPDATE USING (
        (auth.jwt() ->> 'role' = 'admin' AND tenant_id IN (
            SELECT id FROM tenants WHERE id::text = auth.jwt() ->> 'tenant_id'
        ))
        OR
        (auth.jwt() ->> 'role' = 'counselor' AND tenant_id IN (
            SELECT id FROM tenants WHERE id::text = auth.jwt() ->> 'tenant_id'
        ) AND (
            owner_id = auth.uid()::uuid
            OR owner_id IS NULL
        ))
    );

-- Policy 4: DELETE policy for leads (admins only)
CREATE POLICY "leads_delete_policy" ON leads
    FOR DELETE USING (
        auth.jwt() ->> 'role' = 'admin'
        AND tenant_id IN (
            SELECT id FROM tenants WHERE id::text = auth.jwt() ->> 'tenant_id'
        )
    );

-- ============================================
-- POLICIES FOR APPLICATIONS
-- ============================================

CREATE POLICY "applications_select_policy" ON applications
    FOR SELECT USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE id::text = auth.jwt() ->> 'tenant_id'
        )
        AND (
            auth.jwt() ->> 'role' = 'admin'
            OR
            lead_id IN (
                SELECT id FROM leads WHERE owner_id = auth.uid()::uuid
                OR owner_id IN (
                    SELECT user_id FROM user_teams WHERE team_id IN (
                        SELECT team_id FROM user_teams WHERE user_id = auth.uid()::uuid
                    )
                )
            )
        )
    );

CREATE POLICY "applications_insert_policy" ON applications
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'role' IN ('admin', 'counselor')
        AND tenant_id IN (
            SELECT id FROM tenants WHERE id::text = auth.jwt() ->> 'tenant_id'
        )
        AND lead_id IN (
            SELECT id FROM leads WHERE tenant_id IN (
                SELECT id FROM tenants WHERE id::text = auth.jwt() ->> 'tenant_id'
            )
        )
    );

-- ============================================
-- POLICIES FOR TASKS
-- ============================================

CREATE POLICY "tasks_select_policy" ON tasks
    FOR SELECT USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE id::text = auth.jwt() ->> 'tenant_id'
        )
        AND (
            auth.jwt() ->> 'role' = 'admin'
            OR
            assigned_to = auth.uid()::uuid
            OR assigned_to IS NULL
            OR related_id IN (
                SELECT id FROM applications WHERE lead_id IN (
                    SELECT id FROM leads WHERE owner_id = auth.uid()::uuid
                )
            )
        )
    );

CREATE POLICY "tasks_insert_policy" ON tasks
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'role' IN ('admin', 'counselor')
        AND tenant_id IN (
            SELECT id FROM tenants WHERE id::text = auth.jwt() ->> 'tenant_id'
        )
        AND related_id IN (
            SELECT id FROM applications WHERE tenant_id IN (
                SELECT id FROM tenants WHERE id::text = auth.jwt() ->> 'tenant_id'
            )
        )
    );

CREATE POLICY "tasks_update_policy" ON tasks
    FOR UPDATE USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE id::text = auth.jwt() ->> 'tenant_id'
        )
        AND (
            auth.jwt() ->> 'role' = 'admin'
            OR assigned_to = auth.uid()::uuid
        )
    );

-- ============================================
-- POLICIES FOR SUPPORTING TABLES
-- ============================================

-- Teams policies
CREATE POLICY "teams_select_policy" ON teams
    FOR SELECT USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE id::text = auth.jwt() ->> 'tenant_id'
        )
    );

-- User_teams policies
CREATE POLICY "user_teams_select_policy" ON user_teams
    FOR SELECT USING (
        team_id IN (
            SELECT id FROM teams WHERE tenant_id IN (
                SELECT id FROM tenants WHERE id::text = auth.jwt() ->> 'tenant_id'
            )
        )
    );

-- ============================================
-- FUNCTIONS FOR JWT CLAIMS
-- ============================================

-- Function to get user role (for JWT)
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS VARCHAR AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    -- In a real scenario, this would check from a users table
    -- For now, we'll return based on email or other logic
    SELECT 
        CASE 
            WHEN EXISTS (SELECT 1 FROM user_teams WHERE user_id = $1 AND role = 'admin') THEN 'admin'
            ELSE 'counselor'
        END INTO user_role;
    
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;