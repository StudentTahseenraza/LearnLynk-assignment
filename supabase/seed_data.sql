-- ============================================
-- SEED DATA FOR LEARNLYNK CRM
-- ============================================

-- Insert sample tenant (if not exists)
INSERT INTO tenants (id, name) VALUES 
('11111111-1111-1111-1111-111111111111', 'LearnLynk University')
ON CONFLICT (id) DO NOTHING;

-- Insert sample team
INSERT INTO teams (id, tenant_id, name) VALUES 
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Admissions Team')
ON CONFLICT (id) DO NOTHING;

-- Insert sample leads
INSERT INTO leads (id, tenant_id, first_name, last_name, email, phone, stage, source) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'John', 'Doe', 'john.doe@example.com', '+1234567890', 'qualified', 'website'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Jane', 'Smith', 'jane.smith@example.com', '+1987654321', 'contacted', 'referral'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Robert', 'Johnson', 'robert.j@example.com', '+1122334455', 'new', 'event')
ON CONFLICT (id) DO NOTHING;

-- Insert sample applications
INSERT INTO applications (id, tenant_id, lead_id, program, intake, status) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'MBA', 'Fall 2024', 'under_review'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Computer Science', 'Spring 2024', 'documents_pending'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Engineering', 'Fall 2024', 'application_received')
ON CONFLICT (id) DO NOTHING;

-- Insert sample tasks for today
INSERT INTO tasks (id, tenant_id, related_id, type, title, description, due_at, status, priority) VALUES
('11111111-2222-3333-4444-555555555555', '11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'call', 'Follow-up call with John Doe', 'Discuss MBA program options and answer questions', NOW() + INTERVAL '2 hours', 'pending', 'high'),
('22222222-3333-4444-5555-666666666666', '11111111-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'email', 'Send program information email', 'Send detailed program brochure and admission requirements', NOW() + INTERVAL '4 hours', 'pending', 'medium'),
('33333333-4444-5555-6666-777777777777', '11111111-1111-1111-1111-111111111111', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'review', 'Review application documents', 'Check completeness of submitted documents', NOW() + INTERVAL '6 hours', 'in_progress', 'high'),
('44444444-5555-6666-7777-888888888888', '11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'call', 'Schedule interview with admissions committee', 'Coordinate timing and send calendar invites', NOW() + INTERVAL '8 hours', 'pending', 'medium')
ON CONFLICT (id) DO NOTHING;

-- Insert completed tasks from yesterday
INSERT INTO tasks (id, tenant_id, related_id, type, title, description, due_at, status, priority, completed_at) VALUES
('55555555-6666-7777-8888-999999999999', '11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'email', 'Welcome email sent', 'Sent welcome package and next steps', NOW() - INTERVAL '1 day', 'completed', 'low', NOW() - INTERVAL '23 hours'),
('66666666-7777-8888-9999-000000000000', '11111111-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'review', 'Initial document review', 'Checked basic application requirements', NOW() - INTERVAL '1 day', 'completed', 'medium', NOW() - INTERVAL '20 hours')
ON CONFLICT (id) DO NOTHING;