-- Age band for one-time skin onboarding (privacy-friendly; no exact DOB).
alter table public.profiles
  add column if not exists age_band text;

alter table public.profiles
  drop constraint if exists profiles_age_band_check;

alter table public.profiles
  add constraint profiles_age_band_check
  check (
    age_band is null
    or age_band in ('18_24', '25_34', '35_44', '45_plus')
  );
