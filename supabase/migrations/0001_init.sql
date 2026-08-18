-- Better Week — initial schema
-- Tables: categories, habits, weekly_records, habit_completions
-- Weekly identifier: week_start_date is always the Monday of that week (local-calendar concept).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  icon text not null,
  is_predefined boolean not null default false,
  created_at timestamptz not null default now()
);

alter table categories enable row level security;

create policy "categories_select" on categories
  for select using (user_id is null or user_id = auth.uid());

create policy "categories_insert" on categories
  for insert with check (user_id = auth.uid());

create policy "categories_update" on categories
  for update using (user_id = auth.uid());

create policy "categories_delete" on categories
  for delete using (user_id = auth.uid());

insert into categories (user_id, name, icon, is_predefined) values
  (null, 'Sport', 'basketball', true),
  (null, 'Health', 'heart-pulse', true),
  (null, 'Nutrition', 'food-apple', true),
  (null, 'Work', 'briefcase', true),
  (null, 'Finances', 'cash', true),
  (null, 'Creativity', 'palette', true),
  (null, 'Social', 'account-group', true),
  (null, 'Home', 'home', true),
  (null, 'Growth', 'sprout', true),
  (null, 'Lifestyle', 'weather-sunny', true)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- habits
-- ---------------------------------------------------------------------------
create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references categories(id),
  name text not null,
  icon text,
  default_weekly_target smallint not null check (default_weekly_target > 0),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists habits_user_id_idx on habits(user_id);

alter table habits enable row level security;

create policy "habits_select" on habits
  for select using (user_id = auth.uid());

create policy "habits_insert" on habits
  for insert with check (user_id = auth.uid());

create policy "habits_update" on habits
  for update using (user_id = auth.uid());

create policy "habits_delete" on habits
  for delete using (user_id = auth.uid());

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists habits_set_updated_at on habits;
create trigger habits_set_updated_at
  before update on habits
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- weekly_records — one row per habit per week; target_for_week is a snapshot
-- of habits.default_weekly_target at the time the week's row is created, so a
-- future per-week target override only needs to update this one column.
-- ---------------------------------------------------------------------------
create table if not exists weekly_records (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start_date date not null,
  target_for_week smallint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (habit_id, week_start_date)
);

create index if not exists weekly_records_user_week_idx on weekly_records(user_id, week_start_date);

alter table weekly_records enable row level security;

create policy "weekly_records_select" on weekly_records
  for select using (user_id = auth.uid());

drop trigger if exists weekly_records_set_updated_at on weekly_records;
create trigger weekly_records_set_updated_at
  before update on weekly_records
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- habit_completions — one row per habit per checked day (true daily checkbox
-- model). A week's completion count is derived by counting rows in range,
-- not stored as a counter.
-- ---------------------------------------------------------------------------
create table if not exists habit_completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  completed_on date not null,
  created_at timestamptz not null default now(),
  unique (habit_id, completed_on)
);

create index if not exists habit_completions_user_date_idx on habit_completions(user_id, completed_on);

alter table habit_completions enable row level security;

create policy "habit_completions_select" on habit_completions
  for select using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- RPC: get_week_dashboard(p_week_start)
-- Ensures a weekly_records row exists for every active habit for that week
-- (creating it lazily with the current default_weekly_target as a snapshot),
-- then returns each habit's target plus the array of completed_on dates
-- within that week — everything the dashboard's 7-dot grid needs in one call.
-- ---------------------------------------------------------------------------
create or replace function get_week_dashboard(p_week_start date)
returns table (
  habit_id uuid,
  target_for_week smallint,
  completed_dates date[]
)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
begin
  insert into weekly_records (habit_id, user_id, week_start_date, target_for_week)
  select h.id, h.user_id, p_week_start, h.default_weekly_target
  from habits h
  where h.user_id = auth.uid() and h.archived_at is null
  on conflict (habit_id, week_start_date) do nothing;

  return query
  select
    wr.habit_id,
    wr.target_for_week,
    coalesce(
      array_agg(hc.completed_on order by hc.completed_on) filter (where hc.completed_on is not null),
      array[]::date[]
    ) as completed_dates
  from weekly_records wr
  left join habit_completions hc
    on hc.habit_id = wr.habit_id
    and hc.user_id = auth.uid()
    and hc.completed_on between p_week_start and p_week_start + 6
  where wr.user_id = auth.uid() and wr.week_start_date = p_week_start
  group by wr.habit_id, wr.target_for_week;
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: toggle_habit_completion(p_habit_id, p_date)
-- Atomic toggle of a single day's completion for a habit. Ensures that
-- week's weekly_records row exists first (target snapshot), then deletes the
-- habit_completions row if present (uncheck) or inserts it (check). Serves
-- both "log a completion" and "undo" — a checkbox is its own undo.
-- ---------------------------------------------------------------------------
create or replace function toggle_habit_completion(p_habit_id uuid, p_date date)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_week_start date;
  v_default_target smallint;
  v_now_checked boolean;
begin
  select default_weekly_target into v_default_target
  from habits
  where id = p_habit_id and user_id = auth.uid();

  if v_default_target is null then
    raise exception 'Habit not found or not owned by current user';
  end if;

  v_week_start := p_date - (extract(isodow from p_date)::int - 1);

  insert into weekly_records (habit_id, user_id, week_start_date, target_for_week)
  values (p_habit_id, auth.uid(), v_week_start, v_default_target)
  on conflict (habit_id, week_start_date) do nothing;

  if exists (
    select 1 from habit_completions
    where habit_id = p_habit_id and user_id = auth.uid() and completed_on = p_date
  ) then
    delete from habit_completions
    where habit_id = p_habit_id and user_id = auth.uid() and completed_on = p_date;
    v_now_checked := false;
  else
    insert into habit_completions (habit_id, user_id, completed_on)
    values (p_habit_id, auth.uid(), p_date);
    v_now_checked := true;
  end if;

  return v_now_checked;
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: list_past_weeks(p_before)
-- Read-only aggregate for the history list: one row per past week the user
-- has any weekly_records for, with planned/completed totals across all
-- habits that existed that week (active or since archived/deleted — deleted
-- habits cascade away, but archived ones still count toward their history).
-- Unlike get_week_dashboard, this never creates rows — history is read-only.
-- ---------------------------------------------------------------------------
-- "To avoid" habits don't add to planned (their target is a max-not-to-exceed,
-- not something to fulfill) and their completions subtract from completed
-- instead of adding to it — a slip should read as regression, not progress.
create or replace function list_past_weeks(p_before date)
returns table (
  week_start_date date,
  planned bigint,
  completed bigint
)
language sql
security definer
set search_path = public
as $$
  select
    wr.week_start_date,
    sum(case when h.habit_type = 'to_do' then wr.target_for_week else 0 end)::bigint as planned,
    sum(
      case when h.habit_type = 'to_do' then coalesce(hc.cnt, 0) else -coalesce(hc.cnt, 0) end
    )::bigint as completed
  from weekly_records wr
  join habits h on h.id = wr.habit_id
  left join lateral (
    select count(*) as cnt
    from habit_completions
    where habit_id = wr.habit_id
      and user_id = auth.uid()
      and completed_on between wr.week_start_date and wr.week_start_date + 6
  ) hc on true
  where wr.user_id = auth.uid() and wr.week_start_date < p_before
  group by wr.week_start_date
  order by wr.week_start_date desc;
$$;

-- ---------------------------------------------------------------------------
-- RPC: get_week_detail(p_week_start)
-- Read-only per-habit breakdown for a single week (used both for history
-- drill-in on past weeks and could serve the current week read-only). Never
-- creates weekly_records rows, unlike get_week_dashboard.
-- ---------------------------------------------------------------------------
create or replace function get_week_detail(p_week_start date)
returns table (
  habit_id uuid,
  habit_name text,
  habit_type text,
  target_for_week smallint,
  completed_dates date[]
)
language sql
security definer
set search_path = public
as $$
  select
    wr.habit_id,
    h.name,
    h.habit_type,
    wr.target_for_week,
    coalesce(
      array_agg(hc.completed_on order by hc.completed_on) filter (where hc.completed_on is not null),
      array[]::date[]
    ) as completed_dates
  from weekly_records wr
  join habits h on h.id = wr.habit_id
  left join habit_completions hc
    on hc.habit_id = wr.habit_id
    and hc.user_id = auth.uid()
    and hc.completed_on between p_week_start and p_week_start + 6
  where wr.user_id = auth.uid() and wr.week_start_date = p_week_start
  group by wr.habit_id, h.name, h.habit_type, wr.target_for_week
  order by h.name;
$$;

-- ---------------------------------------------------------------------------
-- RPC: get_habit_streaks(p_current_week_start)
-- Per active habit, counts consecutive PAST weeks (strictly before the given
-- current week) where completions met that week's target, walking backward
-- week by week from p_current_week_start - 7. Stops at the first week that's
-- missing a weekly_records row (habit didn't exist / wasn't tracked yet) or
-- that didn't meet target. The current in-progress week never counts toward
-- the streak since it isn't finished yet.
-- ---------------------------------------------------------------------------
create or replace function get_habit_streaks(p_current_week_start date)
returns table (habit_id uuid, streak_weeks int)
language plpgsql
security definer
set search_path = public
as $$
declare
  h record;
  v_week date;
  v_streak int;
  v_target smallint;
  v_completed int;
begin
  for h in select id from habits where user_id = auth.uid() and archived_at is null loop
    v_week := p_current_week_start - 7;
    v_streak := 0;

    loop
      select wr.target_for_week into v_target
      from weekly_records wr
      where wr.habit_id = h.id and wr.week_start_date = v_week and wr.user_id = auth.uid();

      exit when v_target is null;

      select count(*) into v_completed
      from habit_completions hc
      where hc.habit_id = h.id and hc.user_id = auth.uid()
        and hc.completed_on between v_week and v_week + 6;

      exit when v_completed < v_target;

      v_streak := v_streak + 1;
      v_week := v_week - 7;
    end loop;

    habit_id := h.id;
    streak_weeks := v_streak;
    return next;
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- habits: habit_type ("to do" vs "to avoid" — a display/framing label only,
-- a checked day always means "this day counted as a success" either way, no
-- change to completion semantics) and frequency (weekly/biweekly/monthly —
-- stored for the form, but only "weekly" is functionally wired up right now;
-- the dashboard, RPCs, and streak logic all still operate on a single
-- Monday-start week regardless of this value).
-- ---------------------------------------------------------------------------
alter table habits add column if not exists habit_type text not null default 'to_do'
  check (habit_type in ('to_do', 'to_avoid'));

alter table habits add column if not exists frequency text not null default 'weekly'
  check (frequency in ('weekly', 'biweekly', 'monthly'));

-- Re-key the predefined categories' icons to the Lucide icon set used by the
-- redesigned frontend (previously used MaterialCommunityIcons names).
update categories set icon = 'dumbbell' where is_predefined and name = 'Sport';
update categories set icon = 'apple' where is_predefined and name = 'Nutrition';
update categories set icon = 'wallet' where is_predefined and name = 'Finances';
update categories set icon = 'users' where is_predefined and name = 'Social';
-- Health ('heart-pulse'), Work ('briefcase'), Creativity ('palette'), Home ('home'),
-- Growth ('sprout') already match Lucide names, no change needed.
update categories set icon = 'sun' where is_predefined and name = 'Lifestyle';

-- ---------------------------------------------------------------------------
-- Manual reordering: habits.sort_order (per-user, per-habit, drag position
-- within its category) and category_positions (per-user category display
-- order — categories themselves are shared/predefined rows, so the order
-- preference has to live in a separate per-user table rather than on the
-- category row itself).
-- ---------------------------------------------------------------------------
alter table habits add column if not exists sort_order integer not null default 0;

-- Backfill existing habits with a stable order (creation order) so drag
-- reordering has a sane starting point instead of everything at 0.
with ranked as (
  select id, row_number() over (partition by user_id, category_id order by created_at) - 1 as rn
  from habits
)
update habits set sort_order = ranked.rn
from ranked
where habits.id = ranked.id;

create table if not exists category_positions (
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  position integer not null default 0,
  primary key (user_id, category_id)
);

alter table category_positions enable row level security;

create policy "category_positions_select" on category_positions
  for select using (user_id = auth.uid());
create policy "category_positions_insert" on category_positions
  for insert with check (user_id = auth.uid());
create policy "category_positions_update" on category_positions
  for update using (user_id = auth.uid());
create policy "category_positions_delete" on category_positions
  for delete using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- RPC: reorder_habits(p_habit_ids) — sets sort_order to array position for
-- each habit id, scoped to the caller's own habits only.
-- ---------------------------------------------------------------------------
create or replace function reorder_habits(p_habit_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  i int;
begin
  for i in 1 .. array_length(p_habit_ids, 1) loop
    update habits
    set sort_order = i - 1
    where id = p_habit_ids[i] and user_id = auth.uid();
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: reorder_categories(p_category_ids) — upserts this user's display
-- position for each category id in the given order.
-- ---------------------------------------------------------------------------
create or replace function reorder_categories(p_category_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  i int;
begin
  for i in 1 .. array_length(p_category_ids, 1) loop
    insert into category_positions (user_id, category_id, position)
    values (auth.uid(), p_category_ids[i], i - 1)
    on conflict (user_id, category_id) do update set position = excluded.position;
  end loop;
end;
$$;
