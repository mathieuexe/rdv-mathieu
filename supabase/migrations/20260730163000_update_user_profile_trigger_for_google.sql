create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_first_name text;
  v_last_name text;
  v_full_name text;
  v_split_pos int;
begin
  v_first_name := coalesce(new.raw_user_meta_data->>'first_name', '');
  v_last_name := coalesce(new.raw_user_meta_data->>'last_name', '');
  v_full_name := coalesce(new.raw_user_meta_data->>'full_name', coalesce(new.raw_user_meta_data->>'name', ''));

  -- Si first_name et last_name sont vides mais qu'on a un full_name (cas de Google OAuth)
  if v_first_name = '' and v_last_name = '' and v_full_name != '' then
    v_split_pos := strpos(v_full_name, ' ');
    if v_split_pos > 0 then
      v_first_name := substr(v_full_name, 1, v_split_pos - 1);
      v_last_name := substr(v_full_name, v_split_pos + 1);
    else
      v_first_name := v_full_name;
      v_last_name := '';
    end if;
  end if;

  insert into public.user_profiles (
    user_id,
    email,
    first_name,
    last_name,
    role
  )
  values (
    new.id,
    coalesce(new.email, ''),
    v_first_name,
    v_last_name,
    'Prospect'
  )
  on conflict (user_id) do update
    set email = excluded.email,
        first_name = case when public.user_profiles.first_name = '' then excluded.first_name else public.user_profiles.first_name end,
        last_name = case when public.user_profiles.last_name = '' then excluded.last_name else public.user_profiles.last_name end,
        updated_at = now();

  return new;
end;
$$;