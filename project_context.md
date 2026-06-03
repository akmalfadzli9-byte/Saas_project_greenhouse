```markdown
# Project Context: SmartFarm Manager

## 1. Ringkasan Eksekutif

**SmartFarm Manager** adalah sistem pengurusan operasi ladang (Farm Operations Management) yang direka khas untuk pengusaha greenhouse, fertigasi, hidroponik, kebun sayur dan ladang buah. Sistem ini menyelesaikan masalah sebenar di mana rekod manual (buku log, Excel, WhatsApp) menyebabkan kelewatan tindakan, pembaziran input, dan kerugian hasil akibat parameter persekitaran (suhu, pH, EC) yang tidak terkawal.

Dengan pendekatan **digital-first** dan **real-time monitoring**, SmartFarm Manager membantu pengusaha:
- Mencegah kerosakan tanaman melalui amaran awal.
- Mengoptimumkan jadual siraman, pembajaan, dan racun.
- Menjejak stok inventory, hasil tuaian, jualan, dan keuntungan.
- Meningkatkan akauntabiliti pekerja melalui rekod kehadiran dan tugasan.

---

## 2. Latar Belakang & Masalah

| Masalah | Kesan |
|---------|-------|
| Rekod suhu, pH, EC secara manual | Tindakan lambat → Tanaman rosak, hasil kurang |
| Tiada sistem tugasan berpusat | Pekerja terlepas jadual siraman/pembajaan |
| Stok baja/benih/racun tidak dipantau | Kehabisan stok di saat kritikal |
| Rekod hasil dan jualan berselerak | Sukar tahu lot mana paling untung |
| Kos operasi tidak ditracking | Margin keuntungan tidak jelas |

**Pelanggan sanggup bayar** kerana sistem ini memberi kesan langsung kepada hasil dan mengelakkan kerugian ribuan ringgit.

---

## 3. Penyelesaian & Modul Utama (MoSCoW)

### Must Have (Fasa 1)
- **Dashboard & Monitoring** – Paparan suhu, pH, EC, amaran.
- **Crop Management** – Rekod jenis tanaman, tarikh semai, pindah, tuaian.
- **Task Management** – Tugasan siraman, pembajaan, racun, pemeriksaan.
- **Inventory** – Stok baja, benih, racun, media tanam dengan amaran minimum.
- **Harvest Tracking** – Berat hasil, kualiti, harga jualan.
- **Worker Attendance** – Check-in/out melalui QR code.

### Should Have (Fasa 2)
- **Sales Tracking** – Rekod transaksi jualan dan invois.
- **Profit & Loss Ringkas** – Kos input vs hasil jualan.
- **Notifikasi WhatsApp/Email** – Peringatan automatik.

### Could Have (Fasa 3)
- **Expense Tracking** – Perbelanjaan elektrik, air, pembaikan, gaji.
- **Integrasi Sensor IoT** – Auto-log suhu, pH, EC dari peranti.
- **Export Laporan PDF/Excel** – Bulanan, stok, kehadiran, P&L.

### Won't Have (Fasa ini)
- AI diagnosis penyakit (ditangguh ke fasa 4).

---

## 4. Seni Bina Teknikal

### 4.1 Platform
- **Google Apps Script** (backend dan hosting web app)
- **Google Sheets** sebagai pangkalan data (sesuai untuk MVP dan skala kecil)
- **Frontend**: HTML5, Tailwind CSS, Font Awesome, JavaScript vanilla

### 4.2 Struktur Fail (GAS)
```

Project/
├── Code.gs                 # doGet(), CRUD, modul utama
├── index.html              # UI shell dengan sidebar & router
├── sheets.gs               # Inisialisasi & utility spreadsheet
├── sensors.gs              # Terima data IoT, sempadan amaran
├── notifications.gs        # Hantar WhatsApp/email
└── config.gs               # API key, ID spreadsheet (rahasia)

```

### 4.3 Skema Pangkalan Data (Google Sheets)

| Sheet Name | Kegunaan |
|------------|----------|
| `CropLots` | Lot tanaman (jenis, varieti, tarikh, status) |
| `Tasks` | Tugasan (jenis, due date, assigned worker, status) |
| `Inventory` | Item stok (nama, kategori, kuantiti, threshold) |
| `InventoryUsage` | Penggunaan stok oleh tugasan |
| `Harvests` | Rekod tuai (berat, kualiti, harga, pendapatan) |
| `Sales` | Transaksi jualan (pelanggan, kuantiti, invois) |
| `Attendance` | Kehadiran pekerja (check-in, check-out, greenhouse) |
| `Expenses` | Perbelanjaan operasi (kategori, jumlah, tarikh) |
| `SensorReadings` | Data IoT (suhu, pH, EC, kelembapan) |

### 4.4 Endpoint API (dalam GAS)

| Fungsi google.script.run | Keterangan |
|--------------------------|-------------|
| `getCropLots()` | Ambil semua lot tanaman |
| `addCropLot(data)` | Tambah lot baru |
| `getTasks()` | Senarai tugasan |
| `completeTask(id, usage)` | Selesai tugasan + rekod penggunaan stok |
| `getInventory()` | Senarai stok |
| `updateStock(itemId, qty)` | Kemaskini kuantiti stok |
| `addHarvest(data)` | Rekod tuai baru |
| `addSale(data)` | Rekod jualan |
| `checkIn(userId, ghId)` | Pekerja check-in |
| `checkOut(attendanceId)` | Check-out |
| `getProfitLoss(start, end)` | Kira P&L |
| `exportReport(type, params)` | Hasilkan CSV/PDF |

> **Nota:** Setiap panggilan google.script.run adalah asynchronous dan mengembalikan objek `{ success, data, error }`.

### 4.5 Keselamatan
- **Token sementara** disimpan di `CacheService` (6 jam).
- **API key untuk IoT** disimpan dalam `config.gs` (jangan kongsi).
- **JWT** tidak digunakan kerana GAS; gunakan token rawak + cache.

---

## 5. Mockup Antara Muka (Panduan untuk Developer/Designer)

### 5.1 Dashboard
- **Kiri**: Kad metrik (bilangan tanaman, tugasan tertunggak, stok kritikal, pendapatan bulan ini).
- **Kanan**: Amaran parameter (suhu tinggi, pH rendah) dan tugasan akan datang.
- **Bawah**: Graf trend P&L dan hasil tuaian.

### 5.2 Halaman Crop Management
- Jadual dengan kolom: Jenis, Varieti, Tarikh Semai, Anggaran Tuai, Status.
- Butang **+ Tanaman Baru** (modal popup).
- Klik pada baris → ke halaman butiran (paparkan tugasan berkaitan).

### 5.3 Halaman Task Management
- Paparan kalendar atau senarai tugasan mengikut tarikh.
- Setiap tugasan ada butang **Selesai** yang membuka popup untuk memasukkan kuantiti baja/racun yang digunakan.

### 5.4 Halaman Inventory
- Tab mengikut kategori (Baja, Benih, Racun, Media).
- Setiap baris tunjuk stok semasa, unit, threshold. Warna merah jika stok < threshold.
- Butang **Guna Stok** dan **Tambah Stok**.

### 5.5 Halaman Harvest & Sales
- Borang di atas untuk merekod tuaian/jualan.
- Senarai rekod lepas di bawah, dengan jumlah pendapatan.

### 5.6 Halaman Attendance
- Senarai pekerja dengan butang besar **Check-in / Check-out** (sesuai untuk tablet di greenhouse).
- Rekod masa, greenhouse, dan eksport ke CSV.

### 5.7 Halaman Reports
- Butang untuk eksport: Laporan Bulanan (PDF), Stok (Excel), Kehadiran (CSV), P&L (PDF).

---

## 6. Aliran Data Utama

### 6.1 Rekod Tuai
1. Pengguna isi borang di halaman Harvest.
2. Frontend panggil `google.script.run.addHarvest(data)`.
3. Backend tulis ke sheet `Harvests`.
4. Dashboard kemas kini automatik (boleh guna `setInterval` atau reload manual).

### 6.2 Selesai Tugasan dengan Penggunaan Stok
1. Pekerja klik **Selesai** pada tugasan.
2. Popup minta masukkan kuantiti baja/racun yang digunakan.
3. Frontend hantar `completeTask(taskId, { itemId, quantity })`.
4. Backend:
   - Tandakan tugasan sebagai 'done'.
   - Kurangkan stok item di sheet `Inventory`.
   - Catat penggunaan di `InventoryUsage`.
5. Beri maklum balas ke frontend.

### 6.3 Integrasi Sensor IoT
- Peranti hantar data ke endpoint web app (contoh: `https://script.google.com/macros/s/.../exec?action=sensor`).
- Guna `doPost(e)` dalam `Code.gs` untuk terima data JSON.
- Sahkan API key dari header `X-API-Key`.
- Simpan data ke `SensorReadings` dan periksa ambang (threshold).
- Jika luar julat, panggil `sendAlert()`.

---

## 7. Panduan Pelaksanaan & Deployment

### Langkah 1: Sediakan Google Sheet
- Buka sheet baru, catat ID (dari URL).
- Jalankan fungsi `initializeSheets()` dalam GAS untuk cipta semua sheet.

### Langkah 2: Konfigurasi
- Buka `config.gs` dan masukkan `SPREADSHEET_ID` yang betul.
- (Pilihan) Masukkan `WHATSAPP_TOKEN` jika guna notifikasi WhatsApp.

### Langkah 3: Deployment
- Di editor Apps Script, klik **Deploy > New deployment**.
- Pilih **Web app**, Execute as: **Me**, Access: **Anyone** (atau Anyone with link jika mahu private).
- Salin URL web app.

### Langkah 4: Penggunaan
- Buka URL dari mana-mana peranti.
- Login dengan demo: `demo@smartfarm.com` / `demo123` (boleh diubah di fungsi `login`).

### Langkah 5: Integrasi IoT (Opsional)
- Peranti perlu hantar POST ke URL web app dengan parameter `?action=sensor`.
- Sertakan header `X-API-Key: sk_production_...` (dari `CONFIG.API_KEY`).

---

## 8. Kelebihan Berbanding Penyelesaian Lain

| Penyelesaian | Kelemahan | SmartFarm Manager |
|--------------|-----------|---------------------|
| Buku log / Excel | Manual, lambat, tiada amaran | Digital, amaran masa nyata |
| Aplikasi "nice to have" | Tidak kritikal, pengguna malas guna | Menyelamatkan hasil, ROI jelas |
| Sistem ERP mahal (RM10k+) | Tidak mampu untuk kebun kecil | Percuma (GAS) hingga skala tertentu |

---

## 9. Rancangan Pengembangan (Roadmap)

| Fasa | Bulan | Modul |
|------|-------|-------|
| 1 | 1 | MVP (Dashboard, Crop, Task, Inventory, Harvest, Attendance) |
| 2 | 2 | Sales Tracking, P&L, Notifikasi WA, Export CSV |
| 3 | 3 | Integrasi sensor IoT, Expense Tracking, Multi-tenant |
| 4 | 4-6 | Mobile App (PWA), AI diagnosis penyakit, Forecasting hasil |

---

## 10. Kesimpulan

SmartFarm Manager bukan sekadar "nice to have" tetapi **alat kritikal** yang memberi impak langsung ke atas hasil pertanian. Dengan menggunakan Google Apps Script dan Google Sheets, kos pembangunan dan operasi adalah rendah, namun fungsi yang disediakan setara dengan sistem enterprise bernilai ribuan ringgit.

Pasukan pembangunan boleh menggunakan dokumen ini sebagai rujukan tunggal untuk:
- Skema pangkalan data
- Senarai API
- Mockup UI
- Aliran data
- Langkah deployment

**Sedia untuk dibangunkan.** 🚀
```