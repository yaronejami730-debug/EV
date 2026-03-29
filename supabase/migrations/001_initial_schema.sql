-- ============================================================
-- LBC Marketplace - Schéma complet
-- ============================================================

-- Extension pour UUID
create extension if not exists "uuid-ossp";
create extension if not exists "postgis"; -- pour la géolocalisation (optionnel)

-- ============================================================
-- PROFILS UTILISATEURS
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  phone text,
  bio text,
  location_city text,
  location_lat double precision,
  location_lng double precision,
  is_verified boolean default false,
  rating_avg numeric(3,2) default 0,
  rating_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Profils visibles par tous" on public.profiles
  for select using (true);

create policy "Utilisateur modifie son profil" on public.profiles
  for update using (auth.uid() = id);

create policy "Création profil auto" on public.profiles
  for insert with check (auth.uid() = id);

-- Trigger pour créer un profil automatiquement à l'inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- CATÉGORIES
-- ============================================================
create table public.categories (
  id serial primary key,
  name text not null,
  slug text unique not null,
  icon text,
  parent_id integer references public.categories(id),
  sort_order integer default 0
);

insert into public.categories (name, slug, icon, sort_order) values
  ('Véhicules', 'vehicules', 'car', 1),
  ('Immobilier', 'immobilier', 'home', 2),
  ('Multimédia', 'multimedia', 'smartphone', 3),
  ('Maison & Jardin', 'maison-jardin', 'sofa', 4),
  ('Mode', 'mode', 'shirt', 5),
  ('Loisirs', 'loisirs', 'gamepad-2', 6),
  ('Services', 'services', 'wrench', 7),
  ('Emploi', 'emploi', 'briefcase', 8),
  ('Animaux', 'animaux', 'paw-print', 9),
  ('Autres', 'autres', 'package', 10);

-- Sous-catégories véhicules
insert into public.categories (name, slug, icon, parent_id) values
  ('Voitures', 'voitures', 'car', 1),
  ('Motos', 'motos', 'bike', 1),
  ('Caravaning', 'caravaning', 'truck', 1),
  ('Utilitaires', 'utilitaires', 'truck', 1);

-- Sous-catégories immobilier
insert into public.categories (name, slug, icon, parent_id) values
  ('Ventes immobilières', 'ventes-immobilieres', 'home', 2),
  ('Locations', 'locations', 'key', 2),
  ('Colocations', 'colocations', 'users', 2);

-- Sous-catégories multimédia
insert into public.categories (name, slug, icon, parent_id) values
  ('Informatique', 'informatique', 'laptop', 3),
  ('Téléphonie', 'telephonie', 'smartphone', 3),
  ('Photo & vidéo', 'photo-video', 'camera', 3),
  ('TV & audio', 'tv-audio', 'tv', 3);

-- ============================================================
-- ANNONCES
-- ============================================================
create type listing_status as enum ('draft', 'active', 'sold', 'expired', 'deleted');
create type listing_condition as enum ('new', 'like_new', 'good', 'fair', 'poor');
create type listing_type as enum ('sale', 'rent', 'free', 'wanted');

create table public.listings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  category_id integer references public.categories(id) not null,
  title text not null,
  description text not null,
  price numeric(12,2),
  price_negotiable boolean default false,
  listing_type listing_type default 'sale',
  condition listing_condition,
  status listing_status default 'active',

  -- Localisation
  location_city text,
  location_zip text,
  location_lat double precision,
  location_lng double precision,

  -- Statistiques
  views_count integer default 0,
  favorites_count integer default 0,

  -- Métadonnées
  is_boosted boolean default false,
  boosted_until timestamptz,
  expires_at timestamptz default (now() + interval '60 days'),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.listings enable row level security;

create policy "Annonces actives visibles par tous" on public.listings
  for select using (status = 'active' or auth.uid() = user_id);

create policy "Utilisateur crée ses annonces" on public.listings
  for insert with check (auth.uid() = user_id);

create policy "Utilisateur modifie ses annonces" on public.listings
  for update using (auth.uid() = user_id);

create policy "Utilisateur supprime ses annonces" on public.listings
  for delete using (auth.uid() = user_id);

-- Index pour les recherches
create index listings_category_idx on public.listings(category_id);
create index listings_user_idx on public.listings(user_id);
create index listings_status_idx on public.listings(status);
create index listings_created_idx on public.listings(created_at desc);
create index listings_price_idx on public.listings(price);

-- Mise à jour automatique updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger listings_updated_at
  before update on public.listings
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- IMAGES DES ANNONCES
-- ============================================================
create table public.listing_images (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  url text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.listing_images enable row level security;

create policy "Images visibles par tous" on public.listing_images
  for select using (true);

create policy "Propriétaire gère ses images" on public.listing_images
  for all using (
    auth.uid() = (select user_id from public.listings where id = listing_id)
  );

-- ============================================================
-- MESSAGERIE
-- ============================================================
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete set null,
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  seller_id uuid references public.profiles(id) on delete cascade not null,
  last_message text,
  last_message_at timestamptz default now(),
  buyer_unread_count integer default 0,
  seller_unread_count integer default 0,
  created_at timestamptz default now(),
  unique(listing_id, buyer_id, seller_id)
);

alter table public.conversations enable row level security;

create policy "Participants voient leurs conversations" on public.conversations
  for select using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Acheteur crée une conversation" on public.conversations
  for insert with check (auth.uid() = buyer_id);

create policy "Participants mettent à jour la conversation" on public.conversations
  for update using (auth.uid() = buyer_id or auth.uid() = seller_id);

create index conversations_buyer_idx on public.conversations(buyer_id);
create index conversations_seller_idx on public.conversations(seller_id);
create index conversations_last_msg_idx on public.conversations(last_message_at desc);

create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

create policy "Participants voient les messages" on public.messages
  for select using (
    auth.uid() in (
      select buyer_id from public.conversations where id = conversation_id
      union
      select seller_id from public.conversations where id = conversation_id
    )
  );

create policy "Participant envoie un message" on public.messages
  for insert with check (
    auth.uid() = sender_id and
    auth.uid() in (
      select buyer_id from public.conversations where id = conversation_id
      union
      select seller_id from public.conversations where id = conversation_id
    )
  );

create index messages_conversation_idx on public.messages(conversation_id, created_at asc);

-- Trigger : mise à jour conversation après nouveau message
create or replace function public.handle_new_message()
returns trigger language plpgsql security definer
as $$
declare
  conv record;
begin
  select * into conv from public.conversations where id = new.conversation_id;

  update public.conversations
  set
    last_message = new.content,
    last_message_at = new.created_at,
    buyer_unread_count = case
      when new.sender_id = conv.seller_id then buyer_unread_count + 1
      else buyer_unread_count
    end,
    seller_unread_count = case
      when new.sender_id = conv.buyer_id then seller_unread_count + 1
      else seller_unread_count
    end
  where id = new.conversation_id;

  return new;
end;
$$;

create trigger on_new_message
  after insert on public.messages
  for each row execute procedure public.handle_new_message();

-- ============================================================
-- FAVORIS
-- ============================================================
create table public.favorites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  listing_id uuid references public.listings(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, listing_id)
);

alter table public.favorites enable row level security;

create policy "Utilisateur voit ses favoris" on public.favorites
  for select using (auth.uid() = user_id);

create policy "Utilisateur gère ses favoris" on public.favorites
  for all using (auth.uid() = user_id);

-- Trigger : mise à jour compteur favoris sur l'annonce
create or replace function public.handle_favorite_change()
returns trigger language plpgsql security definer
as $$
begin
  if TG_OP = 'INSERT' then
    update public.listings set favorites_count = favorites_count + 1 where id = new.listing_id;
  elsif TG_OP = 'DELETE' then
    update public.listings set favorites_count = favorites_count - 1 where id = old.listing_id;
  end if;
  return null;
end;
$$;

create trigger on_favorite_change
  after insert or delete on public.favorites
  for each row execute procedure public.handle_favorite_change();

-- ============================================================
-- AVIS / ÉVALUATIONS
-- ============================================================
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  reviewer_id uuid references public.profiles(id) on delete cascade not null,
  reviewed_id uuid references public.profiles(id) on delete cascade not null,
  listing_id uuid references public.listings(id) on delete set null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now(),
  unique(reviewer_id, listing_id)
);

alter table public.reviews enable row level security;

create policy "Avis visibles par tous" on public.reviews
  for select using (true);

create policy "Utilisateur laisse un avis" on public.reviews
  for insert with check (auth.uid() = reviewer_id);

-- Trigger : mise à jour note moyenne du profil
create or replace function public.handle_review_change()
returns trigger language plpgsql security definer
as $$
begin
  update public.profiles
  set
    rating_avg = (select avg(rating) from public.reviews where reviewed_id = new.reviewed_id),
    rating_count = (select count(*) from public.reviews where reviewed_id = new.reviewed_id)
  where id = new.reviewed_id;
  return new;
end;
$$;

create trigger on_review_created
  after insert on public.reviews
  for each row execute procedure public.handle_review_change();

-- ============================================================
-- SIGNALEMENTS
-- ============================================================
create type report_type as enum ('spam', 'fraud', 'inappropriate', 'duplicate', 'other');

create table public.reports (
  id uuid default uuid_generate_v4() primary key,
  reporter_id uuid references public.profiles(id) on delete cascade not null,
  listing_id uuid references public.listings(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  type report_type not null,
  description text,
  created_at timestamptz default now()
);

alter table public.reports enable row level security;

create policy "Utilisateur signale" on public.reports
  for insert with check (auth.uid() = reporter_id);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
insert into storage.buckets (id, name, public) values
  ('listing-images', 'listing-images', true),
  ('avatars', 'avatars', true);

create policy "Images annonces publiques" on storage.objects
  for select using (bucket_id = 'listing-images');

create policy "Utilisateur upload ses images" on storage.objects
  for insert with check (
    bucket_id = 'listing-images' and auth.role() = 'authenticated'
  );

create policy "Utilisateur supprime ses images" on storage.objects
  for delete using (
    bucket_id = 'listing-images' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Avatars publics" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Utilisateur upload son avatar" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Utilisateur remplace son avatar" on storage.objects
  for update using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- FONCTIONS UTILITAIRES
-- ============================================================

-- Incrémenter les vues d'une annonce
create or replace function public.increment_listing_views(listing_id uuid)
returns void language plpgsql security definer
as $$
begin
  update public.listings set views_count = views_count + 1 where id = listing_id;
end;
$$;

-- Recherche full-text
create index listings_fts_idx on public.listings
  using gin(to_tsvector('french', title || ' ' || description));

create or replace function public.search_listings(query text)
returns setof public.listings language sql
as $$
  select * from public.listings
  where status = 'active'
    and to_tsvector('french', title || ' ' || description) @@ plainto_tsquery('french', query)
  order by
    ts_rank(to_tsvector('french', title || ' ' || description), plainto_tsquery('french', query)) desc,
    created_at desc;
$$;

-- ============================================================
-- REALTIME
-- ============================================================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.listings;
