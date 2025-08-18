-- Seed data for SchoolSphere application that matches the actual schema

-- Organizations
INSERT INTO organizations (id, name, slug, domain, logo, settings, subscription_status, subscription_plan, billing_email, is_active, created_at, updated_at)
VALUES 
(1, 'Demo School', 'demo-school', 'demoschool.edu', NULL, '{}', 'active', 'professional', 'billing@demoschool.edu', true, NOW(), NOW()),
(2, 'Test Academy', 'test-academy', 'testacademy.org', NULL, '{}', 'active', 'starter', 'admin@testacademy.org', true, NOW(), NOW());

-- Branches
INSERT INTO branches (id, name, address, phone, email, organization_id, is_active, created_at, updated_at)
VALUES 
(1, 'Main Campus', '123 Education St, Learning City, CA', '555-1234', 'main@demoschool.edu', 1, true, NOW(), NOW()),
(2, 'North Campus', '456 Knowledge Ave, Learning City, CA', '555-2345', 'north@demoschool.edu', 1, true, NOW(), NOW()),
(3, 'Downtown Branch', '789 Academy Rd, Test City, NY', '555-3456', 'downtown@testacademy.org', 2, true, NOW(), NOW());

-- Users (admin user is auto-created by dev auth, but we'll define it for consistency)
INSERT INTO users (id, email, first_name, last_name, profile_image_url, organization_id, role, branch_id, language, is_active, last_login_at, created_at, updated_at)
VALUES 
('demo-admin', 'admin@demo.school', 'Demo', 'Admin', '', 1, 'owner', 1, 'en', true, NOW(), NOW(), NOW()),
('demo-teacher', 'teacher@demo.school', 'Demo', 'Teacher', '', 1, 'teacher', 1, 'en', true, NOW(), NOW(), NOW()),
('demo-staff', 'staff@demo.school', 'Demo', 'Staff', '', 1, 'admin', 2, 'en', true, NOW(), NOW(), NOW()),
('demo-parent', 'parent@demo.school', 'Demo', 'Parent', '', 1, 'parent', 1, 'en', true, NOW(), NOW(), NOW());

-- Events
INSERT INTO events (id, title, description, start_date, start_time, end_date, end_time, location, category, organization_id, branch_id, created_by, max_attendees, requires_rsvp, is_active, created_at, updated_at)
VALUES 
(1, 'Parent-Teacher Conference', 'Annual parent-teacher conference for discussing student progress', '2025-09-15', '13:00:00', '2025-09-15', '19:00:00', 'Main Campus Auditorium', 'academic', 1, 1, 'demo-admin', 100, true, true, NOW(), NOW()),
(2, 'Science Fair', 'Annual science fair showcasing student projects', '2025-10-05', '09:00:00', '2025-10-05', '16:00:00', 'North Campus Gymnasium', 'academic', 1, 2, 'demo-teacher', 200, true, true, NOW(), NOW()),
(3, 'Sports Day', 'Annual sports competition between houses', '2025-11-12', '08:30:00', '2025-11-12', '17:00:00', 'Main Campus Field', 'sports', 1, 1, 'demo-admin', NULL, false, true, NOW(), NOW());

-- Posts
INSERT INTO posts (id, title, content, type, image_url, published_at, organization_id, branch_id, created_by, is_published, social_platforms, created_at, updated_at)
VALUES 
(1, 'Welcome to the New School Year', 'We are excited to welcome all students back to campus for an exciting new academic year!', 'announcement', 'https://placehold.co/600x400/png', NOW(), 1, 1, 'demo-admin', true, '["facebook", "twitter"]', NOW(), NOW()),
(2, 'Science Fair Announcement', 'Registration for the annual science fair is now open. Please register your projects by September 15th.', 'announcement', 'https://placehold.co/600x400/png', NOW(), 1, 2, 'demo-teacher', true, '["facebook"]', NOW(), NOW()),
(3, 'Sports Day Information', 'All students are required to participate in at least one event during Sports Day. Sign up sheets will be available next week.', 'announcement', 'https://placehold.co/600x400/png', NOW(), 1, 1, 'demo-admin', true, '[]', NOW(), NOW());

-- Event RSVPs
INSERT INTO event_rsvps (id, event_id, user_id, status, created_at)
VALUES 
(1, 1, 'demo-admin', 'attending', NOW()),
(2, 1, 'demo-teacher', 'attending', NOW()),
(3, 2, 'demo-admin', 'maybe', NOW()),
(4, 2, 'demo-teacher', 'attending', NOW()),
(5, 3, 'demo-parent', 'attending', NOW());

-- Notifications
INSERT INTO notifications (id, title, message, type, is_read, user_id, related_type, related_id, organization_id, created_at)
VALUES 
(1, 'New Event Created', 'A new event "Parent-Teacher Conference" has been created', 'event', false, 'demo-teacher', 'event', 1, 1, NOW()),
(2, 'Post Published', 'Your post "Welcome to the New School Year" has been published', 'system', true, 'demo-admin', 'post', 1, 1, NOW()),
(3, 'Event RSVP', 'Demo Parent has RSVP''d to Sports Day', 'event', false, 'demo-admin', 'event', 3, 1, NOW());

-- Activity Logs
INSERT INTO activity_logs (id, action, entity_type, entity_id, user_id, branch_id, organization_id, details, created_at)
VALUES 
(1, 'create', 'event', 1, 'demo-admin', 1, 1, '{"title":"Parent-Teacher Conference"}', NOW()),
(2, 'create', 'post', 1, 'demo-admin', 1, 1, '{"title":"Welcome to the New School Year"}', NOW()),
(3, 'create', 'event', 2, 'demo-teacher', 2, 1, '{"title":"Science Fair"}', NOW());
