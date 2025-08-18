-- Seed data for SchoolSphere application

-- Organizations
INSERT INTO organizations (id, name, domain, billing_email, subscription_tier, is_active, created_at, updated_at)
VALUES 
(1, 'Demo School', 'demoschool.edu', 'billing@demoschool.edu', 'premium', true, NOW(), NOW()),
(2, 'Test Academy', 'testacademy.org', 'admin@testacademy.org', 'basic', true, NOW(), NOW());

-- Branches
INSERT INTO branches (id, name, address, city, state, country, phone, email, organization_id, is_active, created_at, updated_at)
VALUES 
(1, 'Main Campus', '123 Education St', 'Learning City', 'CA', 'USA', '555-1234', 'main@demoschool.edu', 1, true, NOW(), NOW()),
(2, 'North Campus', '456 Knowledge Ave', 'Learning City', 'CA', 'USA', '555-2345', 'north@demoschool.edu', 1, true, NOW(), NOW()),
(3, 'Downtown Branch', '789 Academy Rd', 'Test City', 'NY', 'USA', '555-3456', 'downtown@testacademy.org', 2, true, NOW(), NOW());

-- Additional Users (admin user is auto-created by dev auth)
INSERT INTO users (id, email, first_name, last_name, profile_image_url, organization_id, role, language, is_active, last_login_at, created_at, updated_at)
VALUES 
('demo-teacher', 'teacher@demo.school', 'Demo', 'Teacher', '', 1, 'teacher', 'en', true, NOW(), NOW(), NOW()),
('demo-staff', 'staff@demo.school', 'Demo', 'Staff', '', 1, 'staff', 'en', true, NOW(), NOW(), NOW()),
('demo-parent', 'parent@demo.school', 'Demo', 'Parent', '', 1, 'parent', 'en', true, NOW(), NOW(), NOW());

-- Events
INSERT INTO events (id, title, description, start_date, end_date, location, is_all_day, category, visibility, branch_id, created_by, updated_by, is_approved, created_at, updated_at)
VALUES 
(1, 'Parent-Teacher Conference', 'Annual parent-teacher conference for discussing student progress', '2025-09-15 13:00:00', '2025-09-15 19:00:00', 'Main Campus Auditorium', false, 'academic', 'public', 1, 'demo-admin', 'demo-admin', true, NOW(), NOW()),
(2, 'Science Fair', 'Annual science fair showcasing student projects', '2025-10-05 09:00:00', '2025-10-05 16:00:00', 'North Campus Gymnasium', false, 'academic', 'public', 2, 'demo-teacher', 'demo-teacher', true, NOW(), NOW()),
(3, 'Sports Day', 'Annual sports competition between houses', '2025-11-12 08:30:00', '2025-11-12 17:00:00', 'Main Campus Field', true, 'sports', 'public', 1, 'demo-admin', 'demo-admin', true, NOW(), NOW());

-- Posts
INSERT INTO posts (id, title, content, image_url, published_at, branch_id, created_by, updated_by, is_published, created_at, updated_at)
VALUES 
(1, 'Welcome to the New School Year', 'We are excited to welcome all students back to campus for an exciting new academic year!', 'https://placehold.co/600x400/png', NOW(), 1, 'demo-admin', 'demo-admin', true, NOW(), NOW()),
(2, 'Science Fair Announcement', 'Registration for the annual science fair is now open. Please register your projects by September 15th.', 'https://placehold.co/600x400/png', NOW(), 2, 'demo-teacher', 'demo-teacher', true, NOW(), NOW()),
(3, 'Sports Day Information', 'All students are required to participate in at least one event during Sports Day. Sign up sheets will be available next week.', 'https://placehold.co/600x400/png', NOW(), 1, 'demo-admin', 'demo-admin', true, NOW(), NOW());

-- Event RSVPs
INSERT INTO event_rsvps (id, event_id, user_id, status, created_at)
VALUES 
(1, 1, 'demo-admin', 'going', NOW()),
(2, 1, 'demo-teacher', 'going', NOW()),
(3, 2, 'demo-admin', 'maybe', NOW()),
(4, 2, 'demo-teacher', 'going', NOW()),
(5, 3, 'demo-parent', 'going', NOW());

-- Notifications
INSERT INTO notifications (id, title, content, type, is_read, recipient_id, related_entity_type, related_entity_id, created_at, updated_at)
VALUES 
(1, 'New Event Created', 'A new event "Parent-Teacher Conference" has been created', 'event', false, 'demo-teacher', 'event', 1, NOW(), NOW()),
(2, 'Post Published', 'Your post "Welcome to the New School Year" has been published', 'post', true, 'demo-admin', 'post', 1, NOW(), NOW()),
(3, 'Event RSVP', 'Demo Parent has RSVP\'d to Sports Day', 'event_rsvp', false, 'demo-admin', 'event', 3, NOW(), NOW());

-- Activity Logs
INSERT INTO activity_logs (id, action, description, entity_type, entity_id, performed_by, branch_id, organization_id, created_at)
VALUES 
(1, 'create', 'Created new event: Parent-Teacher Conference', 'event', 1, 'demo-admin', 1, 1, NOW()),
(2, 'create', 'Created new post: Welcome to the New School Year', 'post', 1, 'demo-admin', 1, 1, NOW()),
(3, 'create', 'Created new event: Science Fair', 'event', 2, 'demo-teacher', 2, 1, NOW());
