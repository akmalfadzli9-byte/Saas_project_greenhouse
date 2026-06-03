# Saas_project_greenhouse


```markdown
# 🌱 SmartFarm Manager

> Sistem Pengurusan Operasi Ladang yang **kritikal** untuk greenhouse, fertigasi, hidroponik, kebun sayur dan ladang buah.

[![Deploy to Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-Deploy-blue?logo=google)](https://script.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Version](https://img.shields.io/badge/version-2.0.0-green)

**SmartFarm Manager** menyelesaikan masalah sebenar pengusaha ladang yang masih merekod suhu, pH, EC, jadual pembajaan, dan hasil tuaian secara manual (buku log, Excel, WhatsApp). Sistem ini memberi amaran awal, mengelakkan kerugian ribuan ringgit akibat parameter tersasar, serta meningkatkan kecekapan operasi harian.

---

## 📌 Ciri Utama (MoSCoW)

| Modul | Status | Keterangan |
|-------|--------|-------------|
| 📊 Dashboard & Monitoring | ✅ Must Have | Paparan suhu, pH, EC, amaran, metrik utama |
| 🌿 Crop Management | ✅ Must Have | Rekod lot tanaman, tarikh semai/pindah/tuai |
| ✅ Task Management | ✅ Must Have | Tugasan siraman, pembajaan, racun, pemeriksaan |
| 📦 Inventory | ✅ Must Have | Stok baja, benih, racun, media tanam + amaran minimum |
| 📈 Harvest Tracking | ✅ Must Have | Berat hasil, kualiti, harga jualan |
| 👷 Worker Attendance | ✅ Must Have | Check‑in/out melalui QR code |
| 💰 Sales Tracking | ⏳ Should Have | Transaksi jualan, invois, hutang pelanggan |
| 💵 Profit & Loss | ⏳ Should Have | Kos input vs hasil jualan, margin keuntungan |
| 🔔 Notifikasi WhatsApp/Email | ⏳ Should Have | Peringatan automatik tugasan & parameter |
| 📄 Export Laporan (PDF/Excel) | ⭐ Could Have | Laporan bulanan, stok, kehadiran, P&L |
| 📡 Integrasi Sensor IoT | ⭐ Could Have | Auto‑log suhu, pH, EC dari peranti |

---

## 🧰 Teknologi

- **Backend & Hosting** – Google Apps Script (doGet, doPost)
- **Database** – Google Sheets (sesuai untuk MVP sehingga 100k baris)
- **Frontend** – HTML5, Tailwind CSS, Font Awesome, JavaScript Vanilla
- **Notifikasi** – UrlFetchApp (WhatsApp Business API / Email)
- **Authentication** – Token rawak + CacheService

---

## 🚀 Panduan Deployment (5 Minit)

### 1. Buat projek Google Apps Script
Buka [script.google.com](https://script.google.com), klik **+ New project**. Padam kod sedia ada.

### 2. Tambah fail berikut (tepat seperti dalam repositori)

| Fail | Kandungan |
|------|-----------|
| `Code.gs` | doGet, CRUD, modul utama (dashboard, crop, task, inventory, harvest, attendance, report) |
| `index.html` | UI lengkap dengan sidebar, router, dan semua halaman modul |
| `sheets.gs` | Inisialisasi spreadsheet dan helper sheet |
| `sensors.gs` | Penerimaan data IoT, sempadan amaran |
| `notifications.gs` | Hantar WhatsApp / email |
| `config.gs` **(rahasia)** | API key, ID spreadsheet, token |

> **Nota:** Salin kod dari setiap fail yang disediakan dalam repositori ini.

### 3. Sediakan Google Sheet
- Buka [sheets.new](https://sheets.new), catat **Sheet ID** (dari URL: `https://docs.google.com/spreadsheets/d/<<ID_INI>>/edit`).
- Buka `config.gs`, masukkan ID tersebut ke `SPREADSHEET_ID`.
- Jalankan fungsi `initializeSheets()` sekali sahaja (pilih fungsi > Run).

### 4. Konfigurasi notifikasi (pilihan)
- Untuk WhatsApp: Dapatkan token dari Meta Business dan nombor telefon.
- Untuk email: Guna `MailApp.sendEmail()` – sudah sedia ada.

### 5. Deploy sebagai Web App
- Klik **Deploy > New deployment**.
- Pilih **Web app**, Execute as: **Me**, Access: **Anyone** (atau *Anyone with link* untuk private).
- Klik **Deploy**, izinkan kebenaran jika diminta.
- Salin URL yang terhasil – contoh:  
  `https://script.google.com/macros/s/ABC123.../exec`

### 6. Akses sistem
Buka URL dari mana‑mana peranti (desktop, tablet, telefon).  
**Demo login:**  
`demo@smartfarm.com` / `demo123`  
> *Anda boleh menukar kredensial ini dalam fungsi `login()` di `Code.gs`.*

---

## 📁 Struktur Pangkalan Data (Google Sheets)

Sistem akan mencipta 9 sheet secara automatik:

| Sheet | Kegunaan |
|-------|----------|
| `CropLots` | ID, jenis, varieti, tarikh semai, tarikh pindah, tarikh tuai anggaran, status |
| `Tasks` | ID lot, jenis tugas (siraman/pembajaan/racun/pemeriksaan), assigned to, due date, status |
| `Inventory` | Nama item, kategori (baja/benih/racun/media), stok, unit, threshold minimum |
| `InventoryUsage` | ID tugas, ID item, kuantiti digunakan, tarikh |
| `Harvests` | ID lot, tarikh tuai, berat(kg), kualiti (A/B/C), harga jual/kg, pendapatan |
| `Sales` | ID pelanggan, tarikh, kuantiti, jumlah harga, invois |
| `Attendance` | ID pekerja, greenhouse, check‑in, check‑out |
| `Expenses` | Kategori (elektrik/air/gaji/pembaikan), jumlah, tarikh, nota, lampiran URL |
| `SensorReadings` | timestamp, greenhouseId, suhu, kelembapan, pH, EC |

---

## 📡 Integrasi Sensor IoT

Peranti (Arduino/ESP32) boleh menghantar data suhu, pH, EC, kelembapan secara automatik.

**Contoh request menggunakan curl:**
```bash
curl -X POST "https://script.google.com/macros/s/ABC123/exec?action=sensor" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_production_xxx" \
  -d '{
    "greenhouseId": "GH1",
    "temperature": 30.5,
    "humidity": 78,
    "ph": 6.2,
    "ec": 1.8
  }'
```

Nota: API key diperoleh daripada CONFIG.API_KEY dalam config.gs.

Sistem akan:

· Simpan data ke sheet SensorReadings.
· Periksa jika parameter di luar julat (contoh: pH < 5.5 atau > 7.0).
· Hantar amaran WhatsApp/email jika kritikal.

---

🖥️ Tangkapan Skrin Antara Muka

Dashboard Crop Management Task Management
https://via.placeholder.com/300x200?text=Dashboard+Mockup https://via.placeholder.com/300x200?text=Crop+List https://via.placeholder.com/300x200?text=Tasks

Reka bentuk responsif, menggunakan komponen dari square-ui sebagai inspirasi.

---

📊 Contoh Laporan yang Boleh Dieksport

Laporan Format Kegunaan
Ringkasan Bulanan (P&L) PDF, Excel Mesyuarat lembaga, pelabur
Rekod Tuian & Jualan CSV, Excel Analisis hasil mengikut lot
Stok Inventory PDF, Excel Pesanan pembelian
Kehadiran Pekerja CSV Pengiraan gaji
Prestasi Lot Tanaman PDF Banding efisiensi varieti

Cara eksport:
Di halaman Reports, klik butang yang dikehendaki. Fail akan dimuat turun secara automatik.

---

🔐 Keselamatan

· Token sementara (6 jam) disimpan di CacheService.
· API key untuk IoT diasingkan dalam config.gs (tidak dihantar ke frontend).
· Hanya pengguna yang diberi kebenaran boleh mengakses web app (bergantung pada tetapan deployment).
· Disarankan: Gunakan Anyone with link dan kongsi URL hanya dengan pekerja.

---

🛣️ Peta Pembangunan (Roadmap)

Fasa Bulan Modul / Ciri
1 1 MVP – Dashboard, Crop, Task, Inventory, Harvest, Attendance
2 2 Sales Tracking, P&L, Notifikasi WhatsApp, Export CSV/PDF
3 3 Integrasi sensor IoT, Expense Tracking, Multi‑tenant
4 4‑6 Mobile App (PWA), AI diagnosis penyakit, Forecasting hasil

---

🤝 Sumbangan (Contributing)

Kami mengalu‑alukan pull request. Untuk perubahan besar, sila buka isu dahulu untuk berbincang.

1. Fork repositori
2. Buat branch (git checkout -b feature/ciri-baharu)
3. Commit perubahan
4. Push ke branch
5. Buka Pull Request

---

📄 Lesen

Dilesenkan di bawah MIT License.

---

📧 Hubungan

· Penulis – Nama Anda
· Laporan isu – GitHub Issues
· Demo langsung – https://smartfarm-manager.demo.com (jika disediakan)

---

❓ Soalan Lazim (FAQ)

Berapa kos penggunaan?

· Google Apps Script – percuma sehingga kuota harian (20,000 panggilan/hari untuk pengguna biasa).
· Google Sheets – percuma sehingga 15GB.
· WhatsApp Business API – ada caj (ikut meta).

Boleh digunakan di luar talian?

Untuk MVP, offline tidak disokong. Pelan akan datang: PWA dengan sync apabila online.

Bagaimana dengan data besar (>100k baris)?

Google Sheets sesuai untuk peringkat permulaan. Untuk skala besar, kami akan menyediakan migrasi ke Firebase atau Supabase.

Adakah sistem ini sesuai untuk kebun kecil?

Ya, sangat sesuai. Tiada kos bulanan, guna GSheet percuma.

---

🌟 Penghargaan

· Reka bentuk UI diinspirasikan oleh shadcn/ui dan square-ui.
· Ikon daripada FontAwesome.
· CSS framework – TailwindCSS.

---

SmartFarm Manager – Selamatkan hasil tanaman anda, dari greenhouse ke meja.

```
```