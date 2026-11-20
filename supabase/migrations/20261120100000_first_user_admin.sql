-- The first account created becomes the academy admin; everyone after is a learner.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  first_user boolean;
begin
  select count(*) = 0 into first_user from public.profiles;
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    new.email,
    case when first_user then 'admin' else 'learner' end
  )
  on conflict (id) do nothing;
  return new;
end; $$;
