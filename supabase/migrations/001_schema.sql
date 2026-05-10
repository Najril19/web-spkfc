-- MJMScan+ — PostgreSQL schema for Supabase (port of spkdb MySQL)
-- Run this in Supabase SQL Editor after creating a project.

-- ---------- Profiles (linked to auth.users) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  nama_lengkap text not null default '',
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, nama_lengkap, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nama_lengkap', split_part(coalesce(new.email, 'user'), '@', 1)),
    'user'
  )
  on conflict (id) do update set
    email = excluded.email,
    nama_lengkap = coalesce(excluded.nama_lengkap, public.profiles.nama_lengkap);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Domain tables ----------
create table if not exists public.penyakit (
  kode_penyakit text primary key,
  nama_penyakit text not null,
  deskripsi text,
  solusi text,
  pencegahan text
);

create table if not exists public.gejala (
  kode_gejala text primary key,
  nama_gejala text not null
);

create table if not exists public.relasi (
  id bigint generated always as identity primary key,
  kode_penyakit text not null references public.penyakit (kode_penyakit) on delete cascade,
  kode_gejala text not null references public.gejala (kode_gejala) on delete cascade,
  unique (kode_penyakit, kode_gejala)
);

create table if not exists public.diagnosa (
  id bigint generated always as identity primary key,
  id_user uuid not null references public.profiles (id) on delete cascade,
  tanggal_diagnosa timestamptz default now(),
  hasil_penyakit text references public.penyakit (kode_penyakit),
  confidence double precision
);

create table if not exists public.diagnosa_detail (
  id bigint generated always as identity primary key,
  id_diagnosa bigint not null references public.diagnosa (id) on delete cascade,
  kode_gejala text not null references public.gejala (kode_gejala),
  unique (id_diagnosa, kode_gejala)
);

alter table public.penyakit enable row level security;
alter table public.gejala enable row level security;
alter table public.relasi enable row level security;
alter table public.diagnosa enable row level security;
alter table public.diagnosa_detail enable row level security;

-- ---------- RLS ----------
-- Profiles
create policy profiles_select on public.profiles
  for select to authenticated using (
    id = auth.uid()
    or exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
  );

create policy profiles_update on public.profiles
  for update to authenticated using (
    id = auth.uid()
    or exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
  )
  with check (
    id = auth.uid()
    or exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
  );

create policy profiles_delete_admin on public.profiles
  for delete to authenticated using (
    exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
    and id <> auth.uid()
  );

-- Reference data: read all authenticated; write admin only
create policy penyakit_read on public.penyakit
  for select to authenticated using (true);

create policy penyakit_write on public.penyakit
  for all to authenticated using (
    exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
  );

create policy gejala_read on public.gejala
  for select to authenticated using (true);

create policy gejala_write on public.gejala
  for all to authenticated using (
    exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
  );

create policy relasi_read on public.relasi
  for select to authenticated using (true);

create policy relasi_write on public.relasi
  for all to authenticated using (
    exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
  );

-- Diagnosa
create policy diagnosa_select on public.diagnosa
  for select to authenticated using (
    id_user = auth.uid()
    or exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
  );

create policy diagnosa_insert on public.diagnosa
  for insert to authenticated with check (id_user = auth.uid());

create policy diagnosa_delete on public.diagnosa
  for delete to authenticated using (
    id_user = auth.uid()
    or exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
  );

-- Detail rows
create policy detail_select on public.diagnosa_detail
  for select to authenticated using (
    exists (
      select 1 from public.diagnosa d
      where d.id = diagnosa_detail.id_diagnosa
      and (
        d.id_user = auth.uid()
        or exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
      )
    )
  );

create policy detail_insert on public.diagnosa_detail
  for insert to authenticated with check (
    exists (
      select 1 from public.diagnosa d
      where d.id = diagnosa_detail.id_diagnosa and d.id_user = auth.uid()
    )
  );

create policy detail_delete on public.diagnosa_detail
  for delete to authenticated using (
    exists (
      select 1 from public.diagnosa d
      where d.id = diagnosa_detail.id_diagnosa
      and (
        d.id_user = auth.uid()
        or exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
      )
    )
  );

-- ---------- Seed (from spkdb.sql) ----------
insert into public.gejala (kode_gejala, nama_gejala) values
('GK001', 'Mobil Kehilangan Tenaga'),
('GK002', 'Mobil Sulit Dinyalakan / Distarter'),
('GK003', 'Mesin Mati Sesaat'),
('GK004', 'Terjadi Gejala Surging Dada Mesin'),
('GK005', 'Akselerasi Mobil Tidak Optimal'),
('GK006', 'Suara Mesin Kasar Dan Terasa Getaran'),
('GK007', 'Mesin Mobil Mati Mendadak'),
('GK008', 'Konsumsi Bahan Bakar Boros'),
('GK009', 'Asap Hitam Keluar Dari Knalpot'),
('GK010', 'Terdengar Letupan (Nembak-Nembak) Dari Knalpot'),
('GK011', 'Mesin Mbrebet Saat Akselerasi'),
('GK012', 'Asap Putih Keluar Dari Knalpot'),
('GK013', 'Oli Mesin Cepat Berkurang')
on conflict (kode_gejala) do nothing;

insert into public.penyakit (kode_penyakit, nama_penyakit, deskripsi, solusi, pencegahan) values
('JK01', 'Busi Bermasalah', 'Busi bermasalah dapat menyebabkan kinerja mesin menjadi tidak optimal, seperti sulitnya mesin menyala, mesin tersendat-sendat, atau konsumsi bahan bakar yang boros.', 'Mengecek jalur pengapian dan lihatlah apakah ada kabel yang terbakar atau terlihat krosleting, pastikan posisi busi pas, setting ulang setelan bahan bakar.', 'Pemeriksaan rutin, Penggantian busi secara berkala, Menggunakan bahan bakar berkualitas, Menghindari penggunaan mesin yang berlebihan'),
('JK02', 'Masalah Pada Sistem Transmisi (CVT)', 'Masalah pada sistem transmisi CVT (Continuously Variable Transmission) dapat menyebabkan kinerja mobil menjadi tidak optimal.', 'Ganti komponen CVT yang rusak dengan suku cadang berkualitas baik untuk mencegah kerusakan menyebar ke bagian mesin lainnya.', 'Perawatan rutin, Pemeriksaan sistem transmisi, Menggunakan oli transmisi yang sesuai, Menghindari penggunaan mobil yang berlebihan'),
('JK03', ' Filter Udara Tersumbat', 'Filter udara tersumbat dapat menyebabkan kinerja mesin menjadi tidak optimal seperti mesin tidak bertenaga, mobil menjadi boros bahan bakar karena mesin harus bekerja lebih keras dan mesin tersendat-sendat.', 'Bersihkan filter udara dan karburator (jika mobil masih menggunakan sistem karburator) agar aliran udara kembali lancar.', 'Perawatan rutin, Pemeriksaan filter udara, Menggunakan filter udara berkualitas, Menghindari penggunaan mobil di lingkungan yang kotor.'),
('JK04', 'Pengaturan Knalpot Tidak Tepat', 'Pengaturan knalpot yang tidak tepat dapat menyebabkan kinerja mesin menjadi tidak optimal seperti suara knalpot yang tidak normal, kinerja mesin menurun, emisi gas buang meningkat.', E'Ganti knalpot jika diperlukan dan lakukan penyetelan ulang sistem bahan bakar atau ECU (jika menggunakan injeksi).\r\n', 'Pemasangan knalpot yang benar, Perawatan rutin, Pemeriksaan knalpot, Menggunakan knalpot yang sesuai'),
('JK05', 'Pengaturan Jarum Skep Tidak Sesuai', 'Pengaturan jarum skep yang tidak sesuai dapat menyebabkan kinerja karburator menjadi tidak optimal.', 'Pastikan jarum skep terpasang dengan lurus dan presisi. Jika longgar, bisa menggunakan perekat instan secukupnya. Lakukan penyetelan ulang karburator.', 'Pengaturan jarum skep yang benar, Perawatan rutin, Pemeriksaan karburator, Menggunakan komponen yang sesuai.'),
('JK06', 'Piston Haus atau Tergores', 'Piston haus atau tergores dapat menyebabkan kinerja mesin menjadi tidak optimal seperti, mesin tidak bertenaga, konsumsi oli meningkat, suara mesin tidak normal, kerusakan mesin lebih lanjut.', 'Lakukan penggantian piston dan perawatan berkala seperti penggantian oli secara rutin menggunakan oli berkualitas tinggi.', 'Perawatan rutin, Menggunakan oli berkualitas, Pemeriksaan sistem pendingin, Menghindari penggunaan mesin yang berlebihan.'),
('JK07', 'Aki Soak atau Lemah', 'Aki soak atau lemah dapat menyebabkan kinerja mobil menjadi tidak optimal seperti, Mesin tidak bisa dihidupkan, Lampu mobil tidak menyala, Sistem kelistrikan tidak berfungsi.', 'Lakukan pengisian ulang daya (cas aki), periksa voltase, dan lakukan pengecekan kondisi aki secara berkala. Jika perlu, ganti aki dengan yang baru.', 'Perawatan rutin, Menggunakan aki yang sesuai, Menghindari penggunaan aki yang berlebihan, Mengisi aki secara teratur.')
on conflict (kode_penyakit) do nothing;

insert into public.relasi (kode_penyakit, kode_gejala) values
('JK01', 'GK001'), ('JK01', 'GK002'), ('JK01', 'GK003'), ('JK01', 'GK004'), ('JK01', 'GK005'), ('JK01', 'GK006'),
('JK02', 'GK001'), ('JK02', 'GK005'), ('JK02', 'GK006'), ('JK02', 'GK007'),
('JK03', 'GK001'), ('JK03', 'GK002'), ('JK03', 'GK006'), ('JK03', 'GK008'), ('JK03', 'GK009'),
('JK04', 'GK001'), ('JK04', 'GK010'),
('JK06', 'GK001'), ('JK06', 'GK002'), ('JK06', 'GK006'), ('JK06', 'GK012'), ('JK06', 'GK013'),
('JK07', 'GK001'), ('JK07', 'GK002'),
('JK05', 'GK001'), ('JK05', 'GK011')
on conflict (kode_penyakit, kode_gejala) do nothing;

-- Promote your account to admin after first signup (replace email):
-- update public.profiles set role = 'admin' where email = 'you@example.com';
