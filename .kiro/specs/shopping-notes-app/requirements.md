# Dokumen Persyaratan (Requirements Document)

## Pendahuluan

Aplikasi web Shopping Notes adalah aplikasi pencatatan belanjaan yang memungkinkan pengguna untuk mencatat, mengedit, dan mengelola daftar belanjaan mereka. Aplikasi ini dilengkapi dengan sistem login sederhana (berbasis JSON), kalkulasi harga otomatis, ekspor ke Excel, notifikasi SweetAlert, animasi smooth menggunakan GSAP dan Lenis, serta penyimpanan sementara di local storage. State management menggunakan Zustand. Dibangun dengan Next.js 15, React 19, MUI 5, dan Tailwind CSS 3.

## Glosarium

- **Aplikasi**: Aplikasi web Notes yang dibangun dengan Next.js 15 dan React 19
- **Pengguna**: Orang yang mengakses dan menggunakan Aplikasi melalui browser
- **Catatan_Belanja**: Satu entri catatan belanjaan yang berisi nama item, jumlah, harga satuan, dan subtotal
- **Daftar_Belanja**: Kumpulan Catatan_Belanja yang dimiliki oleh satu Pengguna
- **Sistem_Autentikasi**: Modul yang menangani login, logout, dan forgot password menggunakan data JSON
- **Penyimpanan_JSON**: File JSON yang disimpan di server (di-gitignore) sebagai pengganti database
- **Local_Storage**: Penyimpanan browser (Web Storage API) untuk menyimpan draft catatan sementara
- **Zustand_Store**: State management store menggunakan library Zustand untuk mengelola state aplikasi
- **SweetAlert**: Library notifikasi untuk menampilkan dialog konfirmasi dan pesan kepada Pengguna
- **Modul_Ekspor**: Modul yang mengonversi Daftar_Belanja menjadi file Excel (.xlsx)
- **GSAP**: Library animasi (GreenSock Animation Platform) untuk animasi elemen UI
- **Lenis**: Library smooth scrolling untuk pengalaman scroll yang halus
- **Halaman_Login**: Halaman tempat Pengguna memasukkan kredensial untuk mengakses Aplikasi
- **Halaman_Utama**: Halaman utama yang menampilkan Daftar_Belanja milik Pengguna yang sedang login

## Persyaratan (Requirements)

### Persyaratan 1: Autentikasi Pengguna

**User Story:** Sebagai pengguna, saya ingin login ke aplikasi dengan email dan password, sehingga saya dapat mengakses catatan belanjaan saya secara pribadi.

#### Kriteria Penerimaan (Acceptance Criteria)

1. WHEN Pengguna membuka Aplikasi tanpa sesi aktif, THE Sistem_Autentikasi SHALL menampilkan Halaman_Login
2. WHEN Pengguna memasukkan email dan password yang valid lalu menekan tombol login, THE Sistem_Autentikasi SHALL mengautentikasi Pengguna dan mengarahkan ke Halaman_Utama
3. WHEN Pengguna memasukkan email atau password yang tidak valid, THE Sistem_Autentikasi SHALL menampilkan pesan error melalui SweetAlert yang menyatakan kredensial tidak valid
4. THE Penyimpanan_JSON SHALL menyimpan data akun pengguna dalam file JSON yang terdaftar di .gitignore
5. WHEN Pengguna menekan tombol logout, THE Sistem_Autentikasi SHALL mengakhiri sesi dan mengarahkan Pengguna kembali ke Halaman_Login

### Persyaratan 2: Forgot Password

**User Story:** Sebagai pengguna, saya ingin bisa mengganti password jika lupa, sehingga saya tetap dapat mengakses akun saya.

#### Kriteria Penerimaan (Acceptance Criteria)

1. WHEN Pengguna menekan tautan "Lupa Password" di Halaman_Login, THE Sistem_Autentikasi SHALL menampilkan form reset password
2. WHEN Pengguna memasukkan email yang terdaftar dan password baru lalu mengonfirmasi, THE Sistem_Autentikasi SHALL memperbarui password di Penyimpanan_JSON dan menampilkan notifikasi sukses melalui SweetAlert
3. WHEN Pengguna memasukkan email yang tidak terdaftar pada form reset password, THE Sistem_Autentikasi SHALL menampilkan pesan error melalui SweetAlert yang menyatakan email tidak ditemukan
4. THE Sistem_Autentikasi SHALL memvalidasi bahwa password baru memiliki panjang minimal 8 karakter

### Persyaratan 3: Membuat Catatan Belanja

**User Story:** Sebagai pengguna, saya ingin membuat catatan belanjaan baru dengan nama item, jumlah, dan harga, sehingga saya dapat mencatat kebutuhan belanja saya.

#### Kriteria Penerimaan (Acceptance Criteria)

1. WHILE Pengguna berada di Halaman_Utama, THE Aplikasi SHALL menampilkan form untuk menambahkan Catatan_Belanja baru dengan field: nama item, jumlah, dan harga satuan
2. WHEN Pengguna mengisi form dan menekan tombol simpan, THE Aplikasi SHALL menyimpan Catatan_Belanja ke Penyimpanan_JSON dan menampilkan notifikasi sukses melalui SweetAlert
3. WHEN Pengguna mengisi form dengan field yang kosong lalu menekan tombol simpan, THE Aplikasi SHALL menampilkan pesan validasi melalui SweetAlert yang menyatakan semua field wajib diisi
4. THE Aplikasi SHALL menghitung subtotal secara otomatis dari jumlah dikalikan harga satuan untuk setiap Catatan_Belanja
5. WHEN Pengguna menambahkan Catatan_Belanja baru, THE Zustand_Store SHALL memperbarui state Daftar_Belanja secara reaktif

### Persyaratan 4: Edit Catatan Belanja

**User Story:** Sebagai pengguna, saya ingin mengedit catatan belanjaan yang sudah ada, sehingga saya dapat memperbarui informasi jika ada perubahan.

#### Kriteria Penerimaan (Acceptance Criteria)

1. WHEN Pengguna menekan tombol edit pada sebuah Catatan_Belanja, THE Aplikasi SHALL menampilkan form edit yang terisi dengan data Catatan_Belanja tersebut
2. WHEN Pengguna memperbarui data pada form edit dan menekan tombol simpan, THE Aplikasi SHALL memperbarui Catatan_Belanja di Penyimpanan_JSON dan menampilkan notifikasi sukses melalui SweetAlert
3. WHEN Pengguna menekan tombol batal pada form edit, THE Aplikasi SHALL menutup form edit tanpa menyimpan perubahan
4. THE Aplikasi SHALL menghitung ulang subtotal secara otomatis setelah Catatan_Belanja diperbarui

### Persyaratan 5: Hapus Catatan Belanja

**User Story:** Sebagai pengguna, saya ingin menghapus catatan belanjaan yang tidak diperlukan, sehingga daftar belanja saya tetap rapi.

#### Kriteria Penerimaan (Acceptance Criteria)

1. WHEN Pengguna menekan tombol hapus pada sebuah Catatan_Belanja, THE Aplikasi SHALL menampilkan dialog konfirmasi melalui SweetAlert
2. WHEN Pengguna mengonfirmasi penghapusan pada dialog SweetAlert, THE Aplikasi SHALL menghapus Catatan_Belanja dari Penyimpanan_JSON dan memperbarui Daftar_Belanja
3. WHEN Pengguna membatalkan penghapusan pada dialog SweetAlert, THE Aplikasi SHALL menutup dialog tanpa menghapus Catatan_Belanja

### Persyaratan 6: Kalkulasi Total Harga

**User Story:** Sebagai pengguna, saya ingin melihat total harga dari semua catatan belanjaan, sehingga saya dapat mengetahui estimasi total pengeluaran.

#### Kriteria Penerimaan (Acceptance Criteria)

1. THE Aplikasi SHALL menampilkan total harga dari seluruh Catatan_Belanja di Daftar_Belanja pada Halaman_Utama
2. WHEN Catatan_Belanja ditambahkan, diperbarui, atau dihapus, THE Aplikasi SHALL menghitung ulang dan menampilkan total harga yang diperbarui
3. THE Aplikasi SHALL menampilkan harga dalam format mata uang Rupiah (Rp) dengan pemisah ribuan

### Persyaratan 7: Ekspor ke Excel

**User Story:** Sebagai pengguna, saya ingin mengekspor daftar belanjaan ke file Excel, sehingga saya dapat menyimpan atau membagikan catatan belanja dalam format spreadsheet.

#### Kriteria Penerimaan (Acceptance Criteria)

1. WHILE Pengguna memiliki minimal satu Catatan_Belanja di Daftar_Belanja, THE Aplikasi SHALL menampilkan tombol ekspor ke Excel
2. WHEN Pengguna menekan tombol ekspor, THE Modul_Ekspor SHALL menghasilkan file Excel (.xlsx) yang berisi seluruh Catatan_Belanja beserta kolom nama item, jumlah, harga satuan, subtotal, dan total keseluruhan
3. WHEN Pengguna menekan tombol ekspor dan Daftar_Belanja kosong, THE Aplikasi SHALL menampilkan pesan melalui SweetAlert yang menyatakan tidak ada data untuk diekspor
4. THE Modul*Ekspor SHALL menamai file hasil ekspor dengan format "Daftar_Belanja*[tanggal].xlsx"

### Persyaratan 8: Penyimpanan Local Storage

**User Story:** Sebagai pengguna, saya ingin draft catatan belanjaan tersimpan di browser, sehingga data tidak hilang jika halaman di-refresh sebelum disimpan.

#### Kriteria Penerimaan (Acceptance Criteria)

1. WHEN Pengguna mengisi form Catatan_Belanja, THE Zustand_Store SHALL menyimpan data form ke Local_Storage secara otomatis
2. WHEN Pengguna membuka kembali Aplikasi atau me-refresh halaman, THE Zustand_Store SHALL memuat data draft dari Local_Storage dan menampilkannya di form
3. WHEN Catatan_Belanja berhasil disimpan ke Penyimpanan_JSON, THE Zustand_Store SHALL menghapus data draft dari Local_Storage
4. THE Zustand_Store SHALL menggunakan middleware persist dari Zustand untuk sinkronisasi state dengan Local_Storage

### Persyaratan 9: Animasi dan Smooth Scrolling

**User Story:** Sebagai pengguna, saya ingin pengalaman menggunakan aplikasi terasa halus dan modern, sehingga interaksi dengan aplikasi menjadi nyaman.

#### Kriteria Penerimaan (Acceptance Criteria)

1. THE Aplikasi SHALL menggunakan Lenis untuk smooth scrolling pada seluruh halaman
2. WHEN elemen Catatan_Belanja ditambahkan ke Daftar_Belanja, THE Aplikasi SHALL menampilkan animasi masuk (fade-in dan slide-up) menggunakan GSAP
3. WHEN elemen Catatan_Belanja dihapus dari Daftar_Belanja, THE Aplikasi SHALL menampilkan animasi keluar (fade-out dan slide-down) menggunakan GSAP
4. WHEN Pengguna berpindah antar halaman, THE Aplikasi SHALL menampilkan transisi halaman yang halus menggunakan GSAP
5. THE Aplikasi SHALL menjalankan semua animasi dengan durasi yang konsisten antara 300ms hingga 600ms

### Persyaratan 10: Notifikasi SweetAlert

**User Story:** Sebagai pengguna, saya ingin mendapatkan notifikasi visual yang jelas untuk setiap aksi, sehingga saya mengetahui hasil dari tindakan yang saya lakukan.

#### Kriteria Penerimaan (Acceptance Criteria)

1. WHEN operasi simpan, edit, atau hapus Catatan_Belanja berhasil, THE Aplikasi SHALL menampilkan notifikasi sukses menggunakan SweetAlert dengan ikon sukses
2. WHEN terjadi error pada operasi simpan, edit, hapus, atau login, THE Aplikasi SHALL menampilkan notifikasi error menggunakan SweetAlert dengan ikon error dan pesan yang deskriptif
3. WHEN Pengguna akan menghapus Catatan_Belanja, THE Aplikasi SHALL menampilkan dialog konfirmasi menggunakan SweetAlert dengan opsi konfirmasi dan batal
4. WHEN Pengguna berhasil login atau logout, THE Aplikasi SHALL menampilkan notifikasi menggunakan SweetAlert

### Persyaratan 11: State Management dengan Zustand

**User Story:** Sebagai developer, saya ingin state aplikasi dikelola secara terpusat menggunakan Zustand, sehingga data konsisten di seluruh komponen.

#### Kriteria Penerimaan (Acceptance Criteria)

1. THE Zustand_Store SHALL mengelola state autentikasi (status login, data pengguna aktif)
2. THE Zustand_Store SHALL mengelola state Daftar_Belanja (daftar catatan, total harga)
3. THE Zustand_Store SHALL mengelola state form (draft catatan, mode edit)
4. THE Zustand_Store SHALL menggunakan middleware persist untuk menyinkronkan state yang relevan dengan Local_Storage
5. WHEN state di Zustand_Store berubah, THE Aplikasi SHALL merender ulang komponen yang terpengaruh secara reaktif

### Persyaratan 12: Tampilan UI dengan MUI dan Tailwind CSS

**User Story:** Sebagai pengguna, saya ingin tampilan aplikasi yang modern dan responsif, sehingga aplikasi nyaman digunakan di berbagai ukuran layar.

#### Kriteria Penerimaan (Acceptance Criteria)

1. THE Aplikasi SHALL menggunakan komponen MUI (Material UI) untuk elemen form, tombol, card, dan layout
2. THE Aplikasi SHALL menggunakan Tailwind CSS untuk utility styling dan penyesuaian responsif
3. THE Aplikasi SHALL menampilkan layout yang responsif dan dapat digunakan pada layar desktop (lebar minimal 1024px) dan mobile (lebar minimal 360px)
4. THE Aplikasi SHALL menampilkan ikon dari @mui/icons-material untuk aksi edit, hapus, ekspor, dan navigasi
