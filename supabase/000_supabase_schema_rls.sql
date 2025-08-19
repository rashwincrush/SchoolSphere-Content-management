-- Supabase RLS and Indexes for SchoolSphere
-- Matches schema in shared/schema.ts and migrations/0000_boring_quentin_quire.sql
-- Apply in Supabase SQL editor. Assumes tables already exist via your migrations.

-- Helper functions to reference the authenticated user (from Supabase JWT)
create or replace function public.current_user_id()
returns text
language sql
stable
as $$
  select auth.uid()::text;
$$;

create or replace function public.current_user_org_id()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select u.organization_id
  from public.users u
  where u.id = auth.uid()::text
  limit 1;
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select u.role::text
  from public.users u
  where u.id = auth.uid()::text
  limit 1;
$$;

-- Utility: check if the current JWT is the service role (for server-side maintenance)
create or replace function public.is_service_role()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() ->> 'role') = 'service_role', false);
$$;

-- Enable RLS on all relevant tables
alter table if exists public.users enable row level security;
alter table if exists public.organizations enable row level security;
alter table if exists public.branches enable row level security;
alter table if exists public.events enable row level security;
alter table if exists public.event_rsvps enable row level security;
alter table if exists public.posts enable row level security;
alter table if exists public.notifications enable row level security;
alter table if exists public.activity_logs enable row level security;
alter table if exists public.subscription_plans enable row level security;
alter table if exists public.subscription_history enable row level security;
alter table if exists public.usage_tracking enable row level security;
alter table if exists public.sessions enable row level security;

-- USERS
-- Select: any org member can see users in their org
drop policy if exists users_select_same_org on public.users;
create policy users_select_same_org
on public.users for select
using (organization_id = public.current_user_org_id());

-- Update: self can update self; owners/admins can update anyone in same org
drop policy if exists users_update_self_or_admin on public.users;
create policy users_update_self_or_admin
on public.users for update
using (
  id = public.current_user_id()
  or (organization_id = public.current_user_org_id() and public.current_user_role() in ('owner','admin'))
)
with check (
  id = public.current_user_id()
  or (organization_id = public.current_user_org_id() and public.current_user_role() in ('owner','admin'))
);

-- Insert: service role only
drop policy if exists users_insert_service_only on public.users;
create policy users_insert_service_only
on public.users for insert
with check (public.is_service_role());

-- Delete: owners/admins in same org (aligns with server routes)
drop policy if exists users_delete_admin on public.users;
create policy users_delete_admin
on public.users for delete
using (organization_id = public.current_user_org_id() and public.current_user_role() in ('owner','admin'));

-- ORGANIZATIONS
drop policy if exists orgs_select_own on public.organizations;
create policy orgs_select_own
on public.organizations for select
using (id = public.current_user_org_id());

drop policy if exists orgs_update_admin on public.organizations;
create policy orgs_update_admin
on public.organizations for update
using (id = public.current_user_org_id() and public.current_user_role() in ('owner','admin'))
with check (id = public.current_user_org_id() and public.current_user_role() in ('owner','admin'));

-- Insert/Delete via service role only
drop policy if exists orgs_service_insert on public.organizations;
create policy orgs_service_insert
on public.organizations for insert
with check (public.is_service_role());

drop policy if exists orgs_service_delete on public.organizations;
create policy orgs_service_delete
on public.organizations for delete
using (public.is_service_role());

-- BRANCHES
drop policy if exists branches_select_same_org on public.branches;
create policy branches_select_same_org
on public.branches for select
using (organization_id = public.current_user_org_id());

-- Admins can manage branches within org
drop policy if exists branches_cud_admin on public.branches;
create policy branches_cud_admin
on public.branches for all
using (organization_id = public.current_user_org_id() and public.current_user_role() in ('owner','admin'))
with check (organization_id = public.current_user_org_id() and public.current_user_role() in ('owner','admin'));

-- EVENTS
-- Select: org members only
drop policy if exists events_select_same_org on public.events;
create policy events_select_same_org
on public.events for select
using (organization_id = public.current_user_org_id());

-- Insert: must belong to same org; created_by must be current user
drop policy if exists events_insert_same_org on public.events;
create policy events_insert_same_org
on public.events for insert
with check (
  organization_id = public.current_user_org_id()
  and created_by = public.current_user_id()
);

-- Update/Delete: allow any org member (matches server which doesn't restrict by role)
drop policy if exists events_update_same_org on public.events;
create policy events_update_same_org
on public.events for update
using (organization_id = public.current_user_org_id())
with check (organization_id = public.current_user_org_id());

drop policy if exists events_delete_same_org on public.events;
create policy events_delete_same_org
on public.events for delete
using (organization_id = public.current_user_org_id());

-- EVENT RSVPs
-- Select RSVPs for events in same org
drop policy if exists rsvps_select_same_org on public.event_rsvps;
create policy rsvps_select_same_org
on public.event_rsvps for select
using (exists (
  select 1 from public.events e
  where e.id = event_rsvps.event_id
    and e.organization_id = public.current_user_org_id()
));

-- Insert/Update: only for self and events in same org
drop policy if exists rsvps_upsert_self on public.event_rsvps;
create policy rsvps_upsert_self
on public.event_rsvps for insert
with check (
  user_id = public.current_user_id()
  and exists (
    select 1 from public.events e
    where e.id = event_rsvps.event_id
      and e.organization_id = public.current_user_org_id()
  )
);

drop policy if exists rsvps_update_self on public.event_rsvps;
create policy rsvps_update_self
on public.event_rsvps for update
using (user_id = public.current_user_id())
with check (
  user_id = public.current_user_id()
  and exists (
    select 1 from public.events e
    where e.id = event_rsvps.event_id
      and e.organization_id = public.current_user_org_id()
  )
);

-- POSTS
-- Select: org members only
drop policy if exists posts_select_same_org on public.posts;
create policy posts_select_same_org
on public.posts for select
using (organization_id = public.current_user_org_id());

-- Insert: same org and created_by = current user
drop policy if exists posts_insert_same_org on public.posts;
create policy posts_insert_same_org
on public.posts for insert
with check (
  organization_id = public.current_user_org_id()
  and created_by = public.current_user_id()
);

-- Update/Delete: allow any org member (server doesn't restrict by role)
drop policy if exists posts_update_same_org on public.posts;
create policy posts_update_same_org
on public.posts for update
using (organization_id = public.current_user_org_id())
with check (organization_id = public.current_user_org_id());

drop policy if exists posts_delete_same_org on public.posts;
create policy posts_delete_same_org
on public.posts for delete
using (organization_id = public.current_user_org_id());

-- NOTIFICATIONS
-- Select: only the recipient user can see their notifications
drop policy if exists notifications_select_self on public.notifications;
create policy notifications_select_self
on public.notifications for select
using (user_id = public.current_user_id());

-- Update (mark read): only the recipient
drop policy if exists notifications_update_self on public.notifications;
create policy notifications_update_self
on public.notifications for update
using (user_id = public.current_user_id())
with check (user_id = public.current_user_id());

-- Insert/Delete: service role only
drop policy if exists notifications_insert_service on public.notifications;
create policy notifications_insert_service
on public.notifications for insert
with check (public.is_service_role());

drop policy if exists notifications_delete_service on public.notifications;
create policy notifications_delete_service
on public.notifications for delete
using (public.is_service_role());

-- ACTIVITY LOGS
-- Select: org members only
drop policy if exists activity_select_same_org on public.activity_logs;
create policy activity_select_same_org
on public.activity_logs for select
using (organization_id = public.current_user_org_id());

-- Insert: service role only
drop policy if exists activity_insert_service on public.activity_logs;
create policy activity_insert_service
on public.activity_logs for insert
with check (public.is_service_role());

-- SUBSCRIPTION PLANS (global public catalog)
-- Allow all authenticated users to read
drop policy if exists plans_select_all on public.subscription_plans;
create policy plans_select_all
on public.subscription_plans for select
using (true);

-- Admin operations via service role only
drop policy if exists plans_cud_service on public.subscription_plans;
create policy plans_cud_service
on public.subscription_plans for all
using (public.is_service_role())
with check (public.is_service_role());

-- SUBSCRIPTION HISTORY (per org, admin visibility)
drop policy if exists subhist_select_admin on public.subscription_history;
create policy subhist_select_admin
on public.subscription_history for select
using (organization_id = public.current_user_org_id() and public.current_user_role() in ('owner','admin'));

drop policy if exists subhist_cud_service on public.subscription_history;
create policy subhist_cud_service
on public.subscription_history for all
using (public.is_service_role())
with check (public.is_service_role());

-- USAGE TRACKING (per org, admin visibility)
drop policy if exists usage_select_admin on public.usage_tracking;
create policy usage_select_admin
on public.usage_tracking for select
using (organization_id = public.current_user_org_id() and public.current_user_role() in ('owner','admin'));

drop policy if exists usage_cud_service on public.usage_tracking;
create policy usage_cud_service
on public.usage_tracking for all
using (public.is_service_role())
with check (public.is_service_role());

-- SESSIONS (app/server only)
drop policy if exists sessions_service_all on public.sessions;
create policy sessions_service_all
on public.sessions for all
using (public.is_service_role())
with check (public.is_service_role());

-- Recommended Indexes (for filtering and ordering patterns)
-- USERS
create index if not exists idx_users_org on public.users (organization_id);
create index if not exists idx_users_org_branch on public.users (organization_id, branch_id);
create index if not exists idx_users_org_lastname on public.users (organization_id, last_name);

-- BRANCHES
create index if not exists idx_branches_org on public.branches (organization_id);
create index if not exists idx_branches_org_name on public.branches (organization_id, name);

-- EVENTS
create index if not exists idx_events_org_branch_date on public.events (organization_id, branch_id, start_date desc);
create index if not exists idx_events_org_date on public.events (organization_id, start_date desc);

-- POSTS
create index if not exists idx_posts_org_branch_created on public.posts (organization_id, branch_id, created_at desc);
create index if not exists idx_posts_org_created on public.posts (organization_id, created_at desc);

-- NOTIFICATIONS
create index if not exists idx_notifications_user_created on public.notifications (user_id, created_at desc);
create index if not exists idx_notifications_user_isread on public.notifications (user_id, is_read);

-- ACTIVITY LOGS
create index if not exists idx_activity_org_branch_created on public.activity_logs (organization_id, branch_id, created_at desc);
create index if not exists idx_activity_org_created on public.activity_logs (organization_id, created_at desc);

-- SUBSCRIPTION HISTORY
create index if not exists idx_subhist_org_start on public.subscription_history (organization_id, start_date desc);

-- USAGE TRACKING
create unique index if not exists ux_usage_org_month_year on public.usage_tracking (organization_id, year, month);

-- EVENT RSVPs
create index if not exists idx_rsvps_event on public.event_rsvps (event_id);
create index if not exists idx_rsvps_user on public.event_rsvps (user_id);
-- Prevent duplicates of (event_id, user_id)
create unique index if not exists ux_rsvps_event_user on public.event_rsvps (event_id, user_id);
