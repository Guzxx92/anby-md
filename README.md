![BUEGER](preview.jpeg)
<div align="center">

**Anby Multi Device**

anby md adalah script bot WhatsApp berbasis **ESM (ECMAScript Modules)** dengan arsitektur **Plugin RxJS**. Dirancang ringan, reaktif, dan mudah dikembangkan.
</div>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-21%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js 21+" />
  <img src="https://img.shields.io/badge/Baileys-7.0.0--rc13-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="Baileys" />
  <img src="https://img.shields.io/badge/Module-ESM-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="ESM" />
  <img src="https://img.shields.io/badge/Architecture-Plugin%20RxJS-B7178C?style=for-the-badge&logo=reactivex&logoColor=white" alt="RxJS" />
</p>

---

## ✨ Fitur Utama

Saat ini **Anby MD** masih dalam tahap awal pengembangan dan berfokus pada fungsionalitas dasar yang esensial:
* 🛡️ **Group Tools:** Fitur-fitur utilitas dasar untuk membantu pengelolaan dan moderasi grup WhatsApp.
* 👑 **Owner Tools:** Perintah khusus untuk kontrol penuh dan manajemen bot oleh pemilik.
* 🚀 **Berkembang Aktif:** Fitur-fitur baru akan terus ditambahkan secara berkala seiring pembaruan script.

---

## 🛠️ Tech Stack & Persyaratan Sistem

* **Runtime:** Node.js `v21` ke atas (mendukung penuh format **ESM**) atau [Bun](https://bun.sh/).
* **Library WhatsApp:** `@rexxhayanasi/elaina-baileys` (`v7.0.0-rc13`)
* **Arsitektur:** Sistem Plugin berbasis **RxJS**
* **Dependensi Eksternal:** `git`, `ffmpeg`

---

## 🚀 Cara Instalasi & Menjalankan

### 📱 1. Termux (Android)
Jalankan perintah berikut secara berurutan di aplikasi Termux:

```bash
cd ~
pkg update && pkg upgrade
pkg install git nodejs ffmpeg bun -y
cd /sdcard/.anby #zip wajib sudah di ekstrak dengan nama folder .anby
bun install
```

**Versi git clone**
```bash
cd ~
pkg update && pkg upgrade
pkg install git nodejs ffmpeg bun -y
git clone https://github.com/Guzxx92/Anby-MD
cd /Anby-MD
bun install
```

**Menjalankan Bot:**
```bash
npm start
# atau menggunakan Bun
bun run start.js
```

---

### 💻 2. Linux (Ubuntu/Debian) & Windows
Pastikan **Node.js (v21+)**, **Git**, **FFmpeg**, dan **Bun** sudah terinstal di sistem kamu.

```bash
cd .anby

# Install dependensi
bun install
# atau menggunakan npm
npm install

# Jalankan bot
npm start
# atau
bun run start.js
```

**Versi git clone**
```bash
git clone https://github.com/Guzxx92/Anby-MD
cd /Anby-MD

# Install dependensi
bun install
# atau menggunakan npm
npm install

# Jalankan bot
npm start
# atau
bun run start.js
```

---

### 🌐 3. Pterodactyl Panel
1. Upload file script ke dalam server panel kamu dan ekstrak file nya.
2. Pastikan Docker Image yang digunakan mendukung **Node.js 21+**.
3. Langsung klik tombol **Start** pada panel — instalasi dependensi dan proses menjalankan bot akan berjalan otomatis.

---

## 🧩 Panduan Membuat Plugin

Simpan file plugin baru kamu di dalam folder `./function/plugins/` dengan ekstensi `.js`. Berikut adalah kerangka lengkap beserta seluruh opsi yang didukung:

```javascript
// Kamu bisa mengimpor library eksternal atau modul lokal di bagian paling atas
// import axios from 'axios';

export default {
  // 1. Identitas Command
  command: 'ex', // Bisa string tunggal ('ex') atau array (['ex', 'test'])
  aliases: ['example', 'contoh'], // Command alternatif (opsional)

  // 2. Pembatasan & Antrean (Opsional)
  expire: '2027-12-31', // Batas waktu aktif plugin (Format: YYYY-MM-DD). Cocok untuk event/trial.
  queue: 2, // Maksimal antrean eksekusi bersamaan. Jika penuh, user ke-3 akan ditolak sementara.
  limit: -1, // Pengurangan limit user saat memakai command (contoh: -1 mengurangi 1 limit).
  cooldown: 4000, // Jeda waktu penggunaan per user dalam milidetik (4000 = 4 detik).
  media: ['image', 'video'], // Wajib menyertakan media tertentu ('image', 'video', 'audio', 'sticker', 'document').

  // 3. Metadata & Validasi Input Otomatis
  meta: {
    category: 'owner', // Kategori yang akan muncul di daftar menu/help
    description: 'Contoh command untuk pengujian', // Deskripsi singkat fitur
    usage: '<nama:text#Masukkan teks nama> <jumlah:number#Harus berupa angka>', // Validasi argumen otomatis
    target: 'reply' // Opsi target pesan: 'reply', 'tag', atau 'both' (hapus jika tidak perlu)
  },

  // 4. Hak Akses (Permission)
  // Bisa dikustomisasi lebih lanjut di file 'handler.js'
  permission: {
    owner: false, // Bisa diisi boolean (true/false) atau string ('access' / 'real'). true & 'access' untuk owner biasa, 'real' untuk owner asli
    premium: false, // Khusus pengguna premium
    group: true, // Hanya bisa dijalankan di dalam grup
    admin: false, // Hanya untuk admin grup
    botadmin: false, // Bot harus menjadi admin grup
    private: false // Hanya bisa dijalankan di private chat (PC)
  },

  // 5. Fungsi Utama yang Dieksekusi
  run: async ({ m, meta, args, client, command, userdb }) => {
    // Mengambil hasil parsing otomatis dari meta.usage
    const input = meta.input;

    // Mengirim balasan ke pengguna
    await m.reply(
      `*✨ Hasil Input:*\n` +
      `• Argumen 1 (nama): ${input.nama}\n` +
      `• Argumen 2 (jumlah): ${input.jumlah}\n` +
      `• Command dipakai: .${command}\n` +
      `• Sisa limit kamu: ${userdb.limit}`
    );
  }
};
```

---

## ⚙️ Penjelasan Detail Konfigurasi

### 1. Validasi Argumen Otomatis (`meta.usage`)
Kamu tidak perlu lagi menulis pengecekan manual seperti `if (!args[0])` di dalam fungsi `run`. Gunakan format `<nama_variabel:tipe#pesan_error>` di dalam `meta.usage`, lalu ambil nilainya melalui `meta.input.nama_variabel`.

| Tipe Validasi | Keterangan | Contoh Penggunaan |
| :--- | :--- | :--- |
| `<var:text>` | Input harus berupa teks / string | `<judul:text#Masukkan judulnya!>` |
| `<var:number>` | Input harus berupa angka (`0-9`) | `<jumlah:number#Jumlah harus angka!>` |
| `<var:user>` atau `<var:tag>` | Input harus berupa mention/tag user (`@user`) | `<target:tag#Tag orang yang dituju!>` |
| `<var:link>` | Input harus berupa tautan/URL yang valid | `<url:link#Kirimkan link yang valid!>` |
| `<var>` | Menerima input bebas apa saja | `<catatan#Tulis catatan kamu>` |

* **Contoh:** Jika `usage` diatur ke `'<nama:text#Isi nama> <umur:number#Isi angka>'` dan user mengetik `.ex Agus 15`, maka:
  * `meta.input.nama` bernilai `'Agus'`
  * `meta.input.umur` bernilai `'15'`
* Bagian setelah tanda `#` adalah pesan bantuan kustom yang otomatis dikirim jika user salah memasukkan format.

---

### 2. Sistem Antrean (`queue`) & Batas Waktu (`expire`)
* **`queue`:** Membatasi jumlah pengguna yang dapat menjalankan perintah secara bersamaan. Misalnya jika `queue: 2` dan ada 3 orang mengetik perintah yang sama di waktu bersamaan, orang ke-1 dan ke-2 akan diproses berurutan, sedangkan orang ke-3 akan mendapat pesan bahwa antrean sedang penuh hingga salah satu selesai.
* **`expire`:** Sangat berguna untuk fitur musiman atau *event* (seperti klaim trial premium). Setelah melewati tanggal `YYYY-MM-DD` yang ditentukan, plugin otomatis tidak dapat digunakan lagi.

---

### 3. Target Pesan (`meta.target`)
Menentukan apakah perintah membutuhkan interaksi ke pesan/pengguna lain:
* `'reply'` — Pengguna wajib me-reply sebuah pesan untuk menjalankan command.
* `'tag'` — Pengguna wajib men-tag seseorang.
* `'both'` — Pengguna bisa memilih antara me-reply pesan atau men-tag seseorang.
* *(Kosongkan / hapus properti `target` jika command bisa langsung dijalankan tanpa reply/tag).*

---

## 📦 Daftar Parameter `run` (`global.payload`)

Parameter yang diterima di dalam `run: async ({ ... }) => {}` berasal dari `global.payload` (didefinisikan di `messages-upsert.js`). Kamu cukup memanggil properti yang dibutuhkan saja, ini opsional:

| Parameter | Deskripsi |
| :--- | :--- |
| `client` | Instance koneksi socket Baileys utama |
| `m` | Objek pesan masuk yang sudah diserialisasi (mendukung `m.reply()`, `m.sender`, dll.) |
| `meta` | Objek metadata plugin, termasuk hasil parsing input (`meta.input`) |
| `args` | Array argumen mentah setelah command |
| `command` | Nama command yang diketik oleh pengguna |
| `quoted` | Objek pesan yang di-reply (jika ada) |
| `qmsg` | Detail pesan dari `quoted` atau pesan saat ini |
| `isMedia` | Status apakah pesan mengandung media |
| `mime` | Tipe MIME dari media yang dikirim/di-reply |
| `userdb` | Data database milik pengguna yang menjalankan command (limit, premium, dll.) |
| `chatdb` | Data database milik grup/chat tempat command dijalankan |
| `settingdb` | Data konfigurasi/pengaturan global bot |
| `itsMe` | Boolean yang menandakan apakah pengirim pesan adalah nomor bot sendiri |
| `username` | Nama profil (pushName) nama pengirim pesan |
| `botLid` | LID (Local Identifier) milik bot |
| `runtime` | Durasi waktu aktif bot sejak dijalankan |

**Contoh penggunaan parameter tambahan:**
```javascript
run: async ({ m, client, quoted, mime, username }) => {
  m.reply('Nama mu adalah ' + username + '?')
  // Lanjutkan proses media...
}
```

---

## 📞 Kontak & Komunitas

Punya pertanyaan, menemukan bug, atau ingin ikut berdiskusi seputar update **Anby MD**? Hubungi atau bergabung melalui tautan berikut:

* 💬 **WhatsApp Owner:** [Chat via WhatsApp](https://wa.me/6283123448708)
* 👥 **Grup Support:** [Gabung Grup WhatsApp](https://chat.whatsapp.com/JMaahFAhNrJ6vWNZFiGlbp)

---

## 🙏 Credits & Terima Kasih

* **Guzxx92** — *Developer (GWE)*
* **rexxhayanasi** — *Baileys*
* **reina** — *Ai girlfriend*
