-- Base schema for SchoolSphere on Supabase (public schema)
-- Run this BEFORE applying RLS policies.

create table if not exists public.organizations (
  id serial primary key,
  name varchar(255) not null,
  slug varchar(100) not null,
  domain varchar(255),
  logo varchar(500),
  settings jsonb default '{}'::jsonb,
  stripe_customer_id varchar(255),
  stripe_subscription_id varchar(255),
  subscription_status varchar default 'trial',
  subscription_plan varchar default 'starter',
  trial_ends_at timestamp,
  billing_email varchar(255),
  max_branches integer default 1,
  max_users integer default 50,
  is_active boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  constraint organizations_slug_unique unique (slug)
);

create table if not exists public.branches (
  id serial primary key,
  organization_id integer not null,
  name varchar(255) not null,
  address text,
  phone varchar(50),
  email varchar(255),
  is_active boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table if not exists public.users (
  id varchar primary key not null,
  email varchar,
  first_name varchar,
  last_name varchar,
  profile_image_url varchar,
  organization_id integer,
  role varchar default 'parent',
  branch_id integer,
  language varchar default 'en',
  is_active boolean default true,
  last_login_at timestamp,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  constraint users_email_unique unique (email)
);

create table if not exists public.events (
  id serial primary key,
  organization_id integer not null,
  title varchar(255) not null,
  description text,
  start_date date not null,
  start_time time not null,
  end_date date,
  end_time time,
  location varchar(255),
  category varchar default 'other',
  branch_id integer not null,
  created_by varchar not null,
  max_attendees integer,
  requires_rsvp boolean default false,
  is_active boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table if not exists public.event_rsvps (
  id serial primary key,
  event_id integer not null,
  user_id varchar not null,
  status varchar default 'attending',
  created_at timestamp default now()
);

create table if not exists public.posts (
  id serial primary key,
  organization_id integer not null,
  title varchar(255) not null,
  content text not null,
  type varchar default 'announcement',
  branch_id integer not null,
  created_by varchar not null,
  scheduled_for timestamp,
  published_at timestamp,
  is_published boolean default false,
  social_platforms jsonb default '[]'::jsonb,
  image_url varchar(500),
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table if not exists public.notifications (
  id serial primary key,
  organization_id integer not null,
  user_id varchar not null,
  title varchar(255) not null,
  message text not null,
  type varchar default 'system',
  is_read boolean default false,
  related_id integer,
  related_type varchar,
  created_at timestamp default now()
);

create table if not exists public.activity_logs (
  id serial primary key,
  organization_id integer not null,
  user_id varchar not null,
  action varchar(255) not null,
  entity_type varchar(100) not null,
  entity_id integer,
  details jsonb,
  branch_id integer,
  created_at timestamp default now()
);

create table if not exists public.subscription_plans (
  id serial primary key,
  name varchar(100) not null,
  slug varchar(50) not null,
  description text,
  price numeric(10,2) not null,
  currency varchar(3) default 'USD',
  interval varchar default 'month',
  stripe_price_id varchar(255),
  features jsonb default '[]'::jsonb,
  max_branches integer default 1,
  max_users integer default 50,
  max_storage_gb integer default 10,
  is_active boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  constraint subscription_plans_slug_unique unique (slug)
);

create table if not exists public.subscription_history (
  id serial primary key,
  organization_id integer not null,
  plan_id integer not null,
  stripe_subscription_id varchar(255),
  status varchar not null,
  start_date timestamp not null,
  end_date timestamp,
  canceled_at timestamp,
  amount numeric(10,2) not null,
  currency varchar(3) default 'USD',
  created_at timestamp default now()
);

create table if not exists public.usage_tracking (
  id serial primary key,
  organization_id integer not null,
  month integer not null,
  year integer not null,
  active_users integer default 0,
  total_events integer default 0,
  total_posts integer default 0,
  storage_used_mb integer default 0,
  api_calls integer default 0,
  created_at timestamp default now()
);

create table if not exists public.sessions (
  sid varchar primary key not null,
  sess jsonb not null,
  expire timestamp not null
);

-- Foreign keys
do $$ begin
  if not exists (
    select 1 from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    join pg_namespace n on t.relnamespace = n.oid
    where c.conname = 'activity_logs_organization_id_organizations_id_fk'
      and n.nspname = 'public' and t.relname = 'activity_logs'
  ) then
    alter table public.activity_logs
      add constraint activity_logs_organization_id_organizations_id_fk
      foreign key (organization_id) references public.organizations(id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    join pg_namespace n on t.relnamespace = n.oid
    where c.conname = 'activity_logs_user_id_users_id_fk'
      and n.nspname = 'public' and t.relname = 'activity_logs'
  ) then
    alter table public.activity_logs
      add constraint activity_logs_user_id_users_id_fk
      foreign key (user_id) references public.users(id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    join pg_namespace n on t.relnamespace = n.oid
    where c.conname = 'activity_logs_branch_id_branches_id_fk'
      and n.nspname = 'public' and t.relname = 'activity_logs'
  ) then
    alter table public.activity_logs
      add constraint activity_logs_branch_id_branches_id_fk
      foreign key (branch_id) references public.branches(id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    join pg_namespace n on t.relnamespace = n.oid
    where c.conname = 'branches_organization_id_organizations_id_fk'
      and n.nspname = 'public' and t.relname = 'branches'
  ) then
    alter table public.branches
      add constraint branches_organization_id_organizations_id_fk
      foreign key (organization_id) references public.organizations(id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    join pg_namespace n on t.relnamespace = n.oid
    where c.conname = 'event_rsvps_event_id_events_id_fk'
      and n.nspname = 'public' and t.relname = 'event_rsvps'
  ) then
    alter table public.event_rsvps
      add constraint event_rsvps_event_id_events_id_fk
      foreign key (event_id) references public.events(id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    join pg_namespace n on t.relnamespace = n.oid
    where c.conname = 'event_rsvps_user_id_users_id_fk'
      and n.nspname = 'public' and t.relname = 'event_rsvps'
  ) then
    alter table public.event_rsvps
      add constraint event_rsvps_user_id_users_id_fk
      foreign key (user_id) references public.users(id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    join pg_namespace n on t.relnamespace = n.oid
    where c.conname = 'events_organization_id_organizations_id_fk'
      and n.nspname = 'public' and t.relname = 'events'
  ) then
    alter table public.events
      add constraint events_organization_id_organizations_id_fk
      foreign key (organization_id) references public.organizations(id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    join pg_namespace n on t.relnamespace = n.oid
    where c.conname = 'events_branch_id_branches_id_fk'
      and n.nspname = 'public' and t.relname = 'events'
  ) then
    alter table public.events
      add constraint events_branch_id_branches_id_fk
      foreign key (branch_id) references public.branches(id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    join pg_namespace n on t.relnamespace = n.oid
    where c.conname = 'events_created_by_users_id_fk'
      and n.nspname = 'public' and t.relname = 'events'
  ) then
    alter table public.events
      add constraint events_created_by_users_id_fk
      foreign key (created_by) references public.users(id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    join pg_namespace n on t.relnamespace = n.oid
    where c.conname = 'notifications_organization_id_organizations_id_fk'
      and n.nspname = 'public' and t.relname = 'notifications'
  ) then
    alter table public.notifications
      add constraint notifications_organization_id_organizations_id_fk
      foreign key (organization_id) references public.organizations(id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    join pg_namespace n on t.relnamespace = n.oid
    where c.conname = 'notifications_user_id_users_id_fk'
      and n.nspname = 'public' and t.relname = 'notifications'
  ) then
    alter table public.notifications
      add constraint notifications_user_id_users_id_fk
      foreign key (user_id) references public.users(id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    join pg_namespace n on t.relnamespace = n.oid
    where c.conname = 'posts_organization_id_organizations_id_fk'
      and n.nspname = 'public' and t.relname = 'posts'
  ) then
    alter table public.posts
      add constraint posts_organization_id_organizations_id_fk
      foreign key (organization_id) references public.organizations(id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    join pg_namespace n on t.relnamespace = n.oid
    where c.conname = 'posts_branch_id_branches_id_fk'
      and n.nspname = 'public' and t.relname = 'posts'
  ) then
    alter table public.posts
      add constraint posts_branch_id_branches_id_fk
      foreign key (branch_id) references public.branches(id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    join pg_namespace n on t.relnamespace = n.oid
    where c.conname = 'posts_created_by_users_id_fk'
      and n.nspname = 'public' and t.relname = 'posts'
  ) then
    alter table public.posts
      add constraint posts_created_by_users_id_fk
      foreign key (created_by) references public.users(id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    join pg_namespace n on t.relnamespace = n.oid
    where c.conname = 'subscription_history_organization_id_organizations_id_fk'
      and n.nspname = 'public' and t.relname = 'subscription_history'
  ) then
    alter table public.subscription_history
      add constraint subscription_history_organization_id_organizations_id_fk
      foreign key (organization_id) references public.organizations(id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    join pg_namespace n on t.relnamespace = n.oid
    where c.conname = 'subscription_history_plan_id_subscription_plans_id_fk'
      and n.nspname = 'public' and t.relname = 'subscription_history'
  ) then
    alter table public.subscription_history
      add constraint subscription_history_plan_id_subscription_plans_id_fk
      foreign key (plan_id) references public.subscription_plans(id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    join pg_namespace n on t.relnamespace = n.oid
    where c.conname = 'usage_tracking_organization_id_organizations_id_fk'
      and n.nspname = 'public' and t.relname = 'usage_tracking'
  ) then
    alter table public.usage_tracking
      add constraint usage_tracking_organization_id_organizations_id_fk
      foreign key (organization_id) references public.organizations(id);
  end if;
end $$;

-- Indexes
create index if not exists "IDX_session_expire" on public.sessions using btree (expire);
