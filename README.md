# Ever After Memoir — Website + Admin CMS

Website portfolio wedding content creator (tema olive green) dengan admin dashboard tanpa coding.

**Aliran harian:** LOGIN → EDIT → PREVIEW → PUBLISH → LIVE. Tak perlu redeploy untuk tukar kandungan.

- Laman awam: Home, Stories, Story, Services, About, Contact (borang inquiry), Privacy, 404
- Admin (`/admin`): Overview, Homepage, Pages, Stories, Services & packages, Media library, Testimonials, Inquiries, Social, Settings & SEO, Account
- Stack: Next.js 16 · React 19 · TypeScript · Tailwind 4 · Motion · Supabase (Postgres, Auth, Storage) · Vercel

---

## 1. Sediakan Supabase (±10 minit)

1. Buat projek di [supabase.com](https://supabase.com) → **New project**. Pilih region **Singapore** (paling dekat dengan Malaysia).
2. **SQL Editor** → **New query**. Buka fail `supabase/migrations/0001_schema.sql`, salin semua, tampal, dan tekan **Run**.
3. Buat query baru. Buka `supabase/migrations/0002_seed.sql`, salin, tampal dan **Run**. Ini isi kandungan permulaan (teks dari brief + gambar anda).
4. Buat query baru lagi. Buka `supabase/migrations/0003_booking.sql`, salin, tampal dan **Run**. Ini untuk kalendar booking. **Ikut turutan 0001 → 0002 → 0003.**
5. **Authentication → Sign In / Providers**:
   - Pastikan **Email** dihidupkan.
   - **Matikan “Allow new users to sign up”**. Tiada sesiapa boleh daftar sendiri.
6. **Authentication → URL Configuration**:
   - **Site URL**: alamat website anda (contoh `https://ever-after-memoir.vercel.app`).
   - **Redirect URLs**: tambah `https://ALAMAT-ANDA/auth/callback`. Jika ada domain sendiri nanti, tambah juga untuk domain itu.
7. Cipta akaun admin pertama:
   - **Authentication → Users → Add user → Create new user**. Masukkan email & password, dan tandakan **Auto Confirm User**.
   - Kembali ke **SQL Editor** dan jalankan (tukar emel):
     ```sql
     insert into public.admin_users (user_id)
     select id from auth.users where email = 'emel-anda@contoh.com';
     ```
   Hanya akaun dalam `admin_users` boleh masuk admin. Akaun lain akan ditolak walaupun password betul.
8. **Project Settings → API Keys**, salin:
   - **Project URL**
   - **anon / publishable key**: kunci awam, selamat diletak dalam browser.
   - **service_role / secret key**: **RAHSIA**. Jangan kongsi dan jangan letak dalam kod.

## 2. Deploy ke Vercel

**Cara A — GitHub (disyorkan, auto-deploy bila kod berubah)**

1. Buat repo baru (private) di GitHub, kemudian upload folder ini:
   ```bash
   cd ever-after-memoir
   git init && git add . && git commit -m "Ever After Memoir"
   git branch -M main
   git remote add origin https://github.com/NAMA-ANDA/ever-after-memoir.git
   git push -u origin main
   ```
2. Di [vercel.com](https://vercel.com) → **Add New… → Project** → pilih repo tadi. Framework akan dikesan sebagai Next.js.
3. Buka **Environment Variables** dan masukkan semua pemboleh ubah dalam jadual di bawah, kemudian tekan **Deploy**.

**Cara B — Vercel CLI (terus dari komputer)**
```bash
cd ever-after-memoir
npm install
npx vercel          # login & ikut arahan
npx vercel env add  # masukkan setiap pemboleh ubah di bawah
npx vercel --prod
```

### Environment variables

| Nama | Jenis | Nilai |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | awam | Project URL Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | awam | anon / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | **rahsia** | service_role / secret key (hanya digunakan di server untuk simpan inquiry) |
| `NEXT_PUBLIC_SITE_URL` | awam | alamat website tanpa `/` di hujung, contoh `https://ever-after-memoir.vercel.app` |
| `INQUIRY_IP_SALT` | rahsia | teks rawak panjang, contoh hasil `openssl rand -hex 32` |
| `RESEND_API_KEY` | rahsia, pilihan | untuk notifikasi emel inquiry (lihat bahagian 5) |
| `INQUIRY_NOTIFY_EMAIL` | pilihan | emel yang menerima notifikasi |
| `RESEND_FROM` | pilihan | pengirim yang disahkan di Resend, contoh `Ever After Memoir <hello@domain-anda.com>` |

Selepas deploy pertama, semak `NEXT_PUBLIC_SITE_URL` sama dengan alamat sebenar. Jika berbeza, betulkan dan **Redeploy** sekali.

**URL:**
- Website: `https://ALAMAT-ANDA/`
- Admin: `https://ALAMAT-ANDA/admin`

## 3. Selepas live — senarai semak

Buka `/admin`. Halaman **Overview** ada senarai “Before you launch”:

- [ ] **Isi nombor WhatsApp di Settings & SEO** (format `60123456789`). Tanpa nombor ini, booking tak boleh terus ke WhatsApp — pasangan diminta isi emel sebagai ganti. Tiada nombor direka dalam kod.
- [ ] Tanda tarikh yang sudah ditempah di **Availability**.
- [ ] Gantikan 3 cerita sampel dengan majlis sebenar. Ia guna gambar anda tetapi bertanda “Sample story” sebab ceritanya contoh.
- [ ] Gantikan film & reels sampel (dibuat dari gambar) dengan video sebenar di **Homepage → Films**.
- [ ] Upload gambar asal resolusi tinggi (≥2000px). Gambar sekarang dari tangkapan Instagram/WhatsApp (±400–1200px), jadi nampak lembut di skrin besar.
- [ ] Semak semula teks **Privacy policy**
- [ ] Isi bahagian **About → About the founder** jika mahu (asalnya disembunyikan; tiada biodata direka)
- [ ] Testimonial: tambah hanya kata-kata pasangan yang telah bersetuju. Toggle “approved” wajib sebelum publish.

## 4. Cara guna admin (untuk owner)

1. **Login** di `/admin`.
2. **Edit**: pilih Homepage / Pages / Stories / Services… Perubahan disimpan sebagai *draft*. Ia juga autosave setiap 20 saat, dan boleh tekan Ctrl/Cmd+S.
3. **Preview**: butang Preview membuka website versi draft (hanya admin nampak). Di Homepage, ada *live preview* di sebelah kanan yang berubah bila anda menaip.
4. **Publish**: butang Publish menyalin draft ke website. Website dikemas kini dalam beberapa saat.
5. **Unpublish / Archive** buang dari website tanpa padam. **Version history** boleh pulihkan versi lama ke draft.

Tips teks: dalam tajuk, `*perkataan*` jadi *italic* dan Enter jadi baris baru. Dalam “Long text”, `## ` di awal baris jadi sub-tajuk.

**Media library**: drag & drop gambar (≤15 MB) dan video (≤50 MB).
- Isi *alt text* supaya mesra pembaca skrin dan Google.
- **Replace file** menukar fail di semua tempat ia digunakan.
- Fail yang sedang dipakai di website akan diberi amaran sebelum dipadam.

**Booking & Availability** (kalendar di `/contact#book`, butang “Check your date” di seluruh website):
- Pasangan pilih tarikh di kalendar → isi nama, jenis majlis, servis, lokasi → tekan *Continue on WhatsApp*. Inquiry disimpan dahulu, kemudian WhatsApp dibuka dengan mesej siap ditulis (ada nombor rujukan).
- **Availability** di admin: klik tarikh (Shift+klik untuk julat) → pilih *Booked*, *Few slots left*, *Not available* atau *Available*. Kalendar website berubah serta-merta, tanpa publish. Tarikh yang tidak ditanda dikira *available*.
- Bila inquiry ditukar ke **Booked**, tarikhnya ditutup di kalendar secara automatik.
- **Settings & SEO → Booking**: hidup/matikan booking, berapa hari notis minimum, berapa bulan ke depan, dan teks mesej WhatsApp. Placeholder: `{date}` (Bahasa Melayu), `{date_en}`, `{name}`, `{partner}`, `{type}`, `{service}`, `{location}`, `{notes}`, `{ref}`. Baris yang kosong dibuang sendiri.
- Nota peribadi tarikh hanya admin nampak; awam cuma nampak status.

**Seksyen homepage baru**: *Reel* (gambar bertukar macam story, tekan & tahan untuk pause), *Image break* (gambar penuh dengan petikan), *Collage* (gambar bertaburan dengan parallax). Semua boleh disusun semula dengan drag, disembunyikan, atau dibuang. Pilih banyak gambar sekaligus dalam Media library.

**Inquiries**: borang Contact dan booking WhatsApp masuk ke sini (sumber ditunjuk).
- Status boleh ditukar: New / Contacted / Booked / Closed.
- Nota peribadi hanya admin nampak.
- Ada butang Email & WhatsApp, dan muat turun CSV.

## 5. Notifikasi emel inquiry (pilihan)

1. Daftar di [resend.com](https://resend.com) dan sahkan domain anda (tambah rekod DNS yang diberi).
2. Cipta API key, kemudian masukkan `RESEND_API_KEY`, `INQUIRY_NOTIFY_EMAIL` dan `RESEND_FROM` di Vercel → Redeploy.

Tanpa langkah ini, inquiry tetap disimpan dan muncul di admin. Cuma tiada emel dihantar.

Untuk emel reset password yang lebih dipercayai, set **Supabase → Authentication → Emails → SMTP Settings** guna SMTP Resend. SMTP bawaan Supabase sangat terhad.

## 6. Domain sendiri (contoh everaftermemoir.com)

1. Vercel → Project → **Settings → Domains → Add**, kemudian taip domain.
2. Ikut rekod DNS yang Vercel tunjuk di tempat anda beli domain. Biasanya:
   - `A` record `@` → `76.76.21.21`
   - `CNAME` `www` → `cname.vercel-dns.com`
   
   Ikut nilai yang Vercel paparkan jika berbeza.
3. Bila status “Valid”:
   - Tukar `NEXT_PUBLIC_SITE_URL` kepada domain baru → Redeploy.
   - Kemas kini **Site URL** dan **Redirect URLs** di Supabase.

## 7. Keselamatan — apa yang dibina

- **Row Level Security** pada semua 14 jadual. Pengunjung awam hanya boleh baca kolum *published* untuk kandungan yang dipublish; kolum `draft` tidak boleh dibaca langsung.
- Inquiry & nota peribadi hanya untuk admin. Inquiry dimasukkan oleh server sahaja (service key tidak pernah sampai ke browser).
- Upload storage hanya untuk admin. Jenis & saiz fail disemak di browser, server dan bucket.
- Borang inquiry:
  - Pengesahan di browser + server.
  - Honeypot dan semakan masa isi.
  - Had **5 inquiry/booking sejam bagi setiap IP**. IP disimpan sebagai hash, bukan IP sebenar.
  - Hanya diterima dari domain sendiri.
- Tiada pendaftaran awam. Admin ditambah melalui SQL sahaja. Semua tindakan admin disemak semula di server.
- Publish berlaku dalam satu langkah atomik di database. Jika gagal, versi live lama kekal.

## 8. Ujian yang telah dijalankan

| Ujian | Keputusan |
|---|---|
| Ujian keselamatan database (`supabase/tests`) — RLS, publish, media, inquiry, availability | ✅ 18/18 |
| Ujian penerimaan end-to-end (`tests/e2e.py`) — 22 aliran dalam brief + booking → WhatsApp, pada stack Supabase tempatan (GoTrue + PostgREST + Postgres 16) | ✅ 23/23 |
| Lighthouse (mobile) — Accessibility / Best Practices / SEO | 100 / 100 / 100 |
| Lighthouse Performance (pelayan tempatan tanpa CDN) | 88–89 |
| Had kadar borang (permintaan ke-6 dalam sejam) | ✅ ditolak (429) |

Cara ulang ujian:
```bash
npm install && npm run typecheck && npm run build
# Database (perlu Postgres tempatan, BUKAN projek Supabase sebenar):
PGHOST=... PGUSER=postgres supabase/tests/run.sh
# End-to-end (lihat arahan di atas fail):
python3 tests/e2e.py
```

## 9. Perkara yang perlu anda buat sendiri

Saya tak boleh buat bahagian ini sebab ia perlukan akaun anda:

1. Cipta projek Supabase dan jalankan 3 fail SQL (bahagian 1)
2. Cipta akaun admin (bahagian 1, langkah 6)
3. Deploy ke Vercel & isi environment variables (bahagian 2)
4. Isi nombor WhatsApp & tanda tarikh booked di admin
5. Pilihan: Resend untuk emel, domain sendiri

Nota pelan:
- **Supabase Free** dijeda jika lama tidak aktif dan hadkan fail kepada 50 MB. Untuk bisnes, pertimbangkan Supabase Pro.
- **Vercel Hobby** untuk kegunaan peribadi/bukan komersial. Untuk bisnes, terma Vercel memerlukan pelan Pro.

## 10. Struktur projek

```
src/app/(site)/        laman awam (ISR, refresh automatik selepas publish)
src/app/preview/       paparan draft (admin sahaja)
src/app/admin/         admin dashboard
src/app/api/inquiry/   terima borang (server)
src/components/site/   komponen & seksyen website + motion
src/components/admin/  komponen admin (editor, media library, inbox)
src/lib/               data, keselamatan, skema kandungan, server actions
supabase/migrations/   skema database + kandungan permulaan
supabase/tests/        ujian keselamatan database
tests/e2e.py           ujian penerimaan end-to-end
public/samples/        gambar & video sampel (abstrak, original — gantikan)
```

Untuk tukar kandungan permulaan, edit `src/lib/content/defaults.ts`, kemudian jalankan `node scripts/generate-seed.mts`.
