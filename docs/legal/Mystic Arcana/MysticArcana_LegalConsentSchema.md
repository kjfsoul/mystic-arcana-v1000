-- Supabase schema for tracking legal consents
create table legal_consents (
id uuid primary key default gen_random_uuid(),
user_id uuid not null references auth.users(id),
version text not null,
accepted_terms boolean default false,
accepted_privacy boolean default false,
accepted_disclaimer boolean default false,
accepted_at timestamp default now()
);
