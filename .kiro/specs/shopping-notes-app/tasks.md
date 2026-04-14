# Rencana Implementasi: Shopping Notes App

## Ikhtisar

Implementasi aplikasi pencatatan belanjaan menggunakan Next.js 15, React 19, TypeScript, MUI 5, Tailwind CSS 3, Zustand, GSAP, dan Lenis. Data disimpan dalam file JSON (tanpa database). Rencana ini memecah desain menjadi langkah-langkah inkremental, dimulai dari setup proyek, fungsi utilitas, API routes, state management, komponen UI, hingga integrasi akhir.

## Tasks

- [x] 1. Setup struktur proyek dan tipe data dasar
  - [x] 1.1 Buat file TypeScript interfaces dan types di `src/types/index.ts`
    - Definisikan `User`, `ShoppingNote`, `CreateNoteInput`, `UpdateNoteInput`, `LoginInput`, `ResetPasswordInput`, `DraftNote`, `ValidationResult`, `ApiResponse`
    - _Requirements: 1.4, 3.1, 4.1, 8.1, 11.1, 11.2, 11.3_
  - [x] 1.2 Buat folder `data/` dengan file JSON awal (`users.json`, `notes.json`) dan tambahkan ke `.gitignore`
    - `users.json` berisi 2 akun terdaftar, `notes.json` berisi array kosong
    - _Requirements: 1.4_
  - [x] 1.3 Setup konfigurasi Tailwind CSS dan Vitest
    - Pastikan `tailwind.config.ts` dan konfigurasi Vitest (`vitest.config.ts`) siap digunakan
    - _Requirements: 12.2_

- [ ] 2. Implementasi fungsi utilitas (lib/)
  - [x] 2.1 Implementasi `formatCurrency` di `src/lib/formatCurrency.ts`
    - Format angka ke string "Rp X.XXX.XXX" dengan pemisah titik ribuan
    - _Requirements: 6.3_
  - [ ] 2.2 Tulis property test untuk `formatCurrency`
    - **Property 7: Format mata uang Rupiah dengan pemisah ribuan**
    - **Validates: Requirements 6.3**
  - [x] 2.3 Implementasi `calculateSubtotal` di `src/lib/calculateSubtotal.ts`
    - Hitung subtotal: `quantity × unitPrice`
    - _Requirements: 3.4, 4.4_
  - [ ] 2.4 Tulis property test untuk `calculateSubtotal`
    - **Property 5: Kalkulasi subtotal adalah perkalian jumlah dan harga satuan**
    - **Validates: Requirements 3.4, 4.4**
  - [x] 2.5 Implementasi `calculateTotal` di `src/lib/calculateTotal.ts`
    - Jumlahkan seluruh `subtotal` dari array `ShoppingNote[]`
    - _Requirements: 6.1_
  - [ ] 2.6 Tulis property test untuk `calculateTotal`
    - **Property 6: Kalkulasi total adalah penjumlahan seluruh subtotal**
    - **Validates: Requirements 6.1**
  - [x] 2.7 Implementasi `validateNote` di `src/lib/validateNote.ts`
    - Validasi `itemName` tidak kosong (setelah trim), `quantity` bilangan positif, `unitPrice` bilangan positif
    - _Requirements: 3.3_
  - [ ] 2.8 Tulis property test untuk `validateNote`
    - **Property 4: Validasi catatan menolak input dengan field kosong**
    - **Validates: Requirements 3.3**
  - [x] 2.9 Implementasi `validatePassword` di `src/lib/validatePassword.ts`
    - Validasi panjang password minimal 8 karakter
    - _Requirements: 2.4_
  - [ ] 2.10 Tulis property test untuk `validatePassword`
    - **Property 3: Validasi password berdasarkan panjang minimal**
    - **Validates: Requirements 2.4**
  - [x] 2.11 Implementasi `exportToExcel` di `src/lib/exportToExcel.ts`
    - Generate file `.xlsx` dengan kolom: No, Nama Item, Jumlah, Harga Satuan, Subtotal, dan baris Total
    - Nama file: `Daftar_Belanja_YYYY-MM-DD.xlsx`
    - _Requirements: 7.2, 7.4_
  - [ ] 2.12 Tulis property test untuk `exportToExcel`
    - **Property 8: Ekspor Excel menghasilkan file dengan kolom lengkap dan nama file benar**
    - **Validates: Requirements 7.2, 7.4**

- [x] 3. Checkpoint - Pastikan semua test fungsi utilitas lolos
  - Pastikan semua test lolos, tanyakan ke pengguna jika ada pertanyaan.

- [ ] 4. Implementasi API Routes (backend)
  - [x] 4.1 Implementasi `POST /api/auth/login` di `src/app/api/auth/login/route.ts`
    - Baca `users.json`, cocokkan email dan password, kembalikan data user atau error
    - _Requirements: 1.2, 1.3_
  - [ ] 4.2 Tulis property test untuk autentikasi login
    - **Property 1: Autentikasi login hanya menerima kredensial yang cocok**
    - **Validates: Requirements 1.2, 1.3**
  - [x] 4.3 Implementasi `POST /api/auth/logout` di `src/app/api/auth/logout/route.ts`
    - Kembalikan response sukses (sesi dikelola di client)
    - _Requirements: 1.5_
  - [x] 4.4 Implementasi `POST /api/auth/reset-password` di `src/app/api/auth/reset-password/route.ts`
    - Validasi email terdaftar, validasi password baru minimal 8 karakter, update di `users.json`
    - _Requirements: 2.2, 2.3, 2.4_
  - [ ] 4.5 Tulis property test untuk reset password
    - **Property 2: Reset password hanya berhasil untuk email terdaftar dengan password valid**
    - **Validates: Requirements 2.2, 2.3**
  - [x] 4.6 Implementasi CRUD `/api/notes` di `src/app/api/notes/route.ts`
    - `GET`: Baca `notes.json`, filter berdasarkan `userId`
    - `POST`: Validasi input, hitung subtotal, simpan ke `notes.json`
    - `PUT`: Cari catatan berdasarkan ID, update data, hitung ulang subtotal
    - `DELETE`: Hapus catatan berdasarkan ID
    - _Requirements: 3.2, 3.4, 4.2, 4.4, 5.2_
  - [x] 4.7 Implementasi `src/lib/api.ts` sebagai HTTP client functions
    - Buat fungsi wrapper untuk semua API calls (login, logout, resetPassword, getNotes, addNote, updateNote, deleteNote)
    - _Requirements: 1.2, 2.2, 3.2, 4.2, 5.2_

- [x] 5. Checkpoint - Pastikan semua API routes berfungsi
  - Pastikan semua test lolos, tanyakan ke pengguna jika ada pertanyaan.

- [ ] 6. Implementasi Zustand Stores
  - [x] 6.1 Implementasi `authStore` di `src/store/authStore.ts`
    - State: `isLoggedIn`, `user`; Actions: `login`, `logout`
    - _Requirements: 1.2, 1.5, 11.1_
  - [x] 6.2 Implementasi `notesStore` di `src/store/notesStore.ts`
    - State: `notes`, `totalPrice`; Actions: `fetchNotes`, `addNote`, `updateNote`, `deleteNote`
    - Hitung ulang `totalPrice` setiap kali `notes` berubah menggunakan `calculateTotal`
    - _Requirements: 3.5, 6.1, 6.2, 11.2_
  - [x] 6.3 Implementasi `formStore` di `src/store/formStore.ts` dengan persist middleware
    - State: `draft`, `editingId`; Actions: `setDraft`, `clearDraft`, `setEditingId`
    - Gunakan Zustand persist middleware untuk sinkronisasi ke Local Storage
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 11.3, 11.4_
  - [ ] 6.4 Tulis property test untuk formStore (round-trip draft)
    - **Property 9: Round-trip persistensi draft di Local Storage**
    - **Validates: Requirements 8.1, 8.2, 8.3**

- [ ] 7. Implementasi Animasi dan Smooth Scrolling
  - [x] 7.1 Implementasi konfigurasi GSAP di `src/animations/gsapAnimations.ts`
    - Definisikan animasi fade-in/slide-up (masuk) dan fade-out/slide-down (keluar) dengan durasi 300ms-600ms
    - _Requirements: 9.2, 9.3, 9.4, 9.5_
  - [ ] 7.2 Tulis property test untuk durasi animasi GSAP
    - **Property 10: Durasi animasi GSAP dalam rentang yang konsisten**
    - **Validates: Requirements 9.5**
  - [x] 7.3 Implementasi setup Lenis di `src/animations/lenisSetup.ts`
    - Inisialisasi Lenis untuk smooth scrolling pada seluruh halaman
    - _Requirements: 9.1_

- [ ] 8. Implementasi Komponen UI
  - [x] 8.1 Buat `SweetAlertProvider` di `src/components/SweetAlertProvider.tsx`
    - Wrapper untuk konfigurasi SweetAlert2 global
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  - [x] 8.2 Implementasi `NoteForm` di `src/components/NoteForm.tsx`
    - Form tambah/edit catatan dengan field nama item, jumlah, harga satuan
    - Integrasi dengan `formStore` untuk draft persistence
    - Validasi input menggunakan `validateNote`, tampilkan error via SweetAlert
    - _Requirements: 3.1, 3.3, 4.1, 4.3, 8.1, 12.1_
  - [x] 8.3 Implementasi `NoteCard` di `src/components/NoteCard.tsx`
    - Card menampilkan satu item catatan dengan tombol edit dan hapus (ikon MUI)
    - Format harga menggunakan `formatCurrency`
    - _Requirements: 4.1, 5.1, 6.3, 12.1, 12.4_
  - [x] 8.4 Implementasi `NoteList` di `src/components/NoteList.tsx`
    - Daftar semua catatan belanja, integrasi animasi GSAP untuk masuk/keluar elemen
    - _Requirements: 9.2, 9.3, 12.1_
  - [x] 8.5 Implementasi `TotalPrice` di `src/components/TotalPrice.tsx`
    - Tampilkan total harga dalam format Rupiah
    - _Requirements: 6.1, 6.3_
  - [x] 8.6 Implementasi `ExportButton` di `src/components/ExportButton.tsx`
    - Tombol ekspor ke Excel, disabled jika daftar kosong
    - Tampilkan SweetAlert info jika daftar kosong saat ditekan
    - _Requirements: 7.1, 7.3, 12.4_
  - [ ] 8.7 Tulis unit test untuk komponen UI (NoteForm, NoteCard, NoteList, ExportButton)
    - Test render, interaksi, dan edge cases
    - _Requirements: 3.1, 4.1, 5.1, 7.1, 12.1_

- [ ] 9. Implementasi Halaman (Pages) dan Routing
  - [x] 9.1 Implementasi root layout di `src/app/layout.tsx`
    - Setup provider (Lenis init, SweetAlertProvider), Error Boundary
    - _Requirements: 9.1, 12.1_
  - [x] 9.2 Implementasi halaman login di `src/app/login/page.tsx`
    - Form login dengan email dan password, integrasi `authStore`
    - Notifikasi SweetAlert untuk sukses/error login
    - _Requirements: 1.1, 1.2, 1.3, 10.4_
  - [x] 9.3 Implementasi halaman forgot password di `src/app/forgot-password/page.tsx`
    - Form reset password dengan validasi email dan password baru
    - Notifikasi SweetAlert untuk sukses/error
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [x] 9.4 Implementasi halaman dashboard di `src/app/dashboard/page.tsx`
    - Integrasi NoteForm, NoteList, TotalPrice, ExportButton
    - Fetch notes dari API saat mount, integrasi `notesStore`
    - Tombol logout, dialog konfirmasi hapus via SweetAlert
    - _Requirements: 3.1, 3.2, 3.5, 4.1, 4.2, 5.1, 5.2, 5.3, 6.1, 6.2, 7.1, 10.1, 10.2, 10.3_
  - [x] 9.5 Implementasi redirect di `src/app/page.tsx`
    - Redirect ke `/login` jika belum login, ke `/dashboard` jika sudah login
    - _Requirements: 1.1_

- [ ] 10. Integrasi dan Responsivitas
  - [x] 10.1 Wiring seluruh komponen dan pastikan alur data end-to-end berfungsi
    - Login → Dashboard → CRUD catatan → Ekspor Excel → Logout
    - Pastikan animasi GSAP dan transisi halaman berjalan
    - _Requirements: 1.2, 1.5, 3.2, 4.2, 5.2, 7.2, 9.4, 11.5_
  - [x] 10.2 Implementasi layout responsif (desktop 1024px dan mobile 360px)
    - Gunakan Tailwind CSS breakpoints dan MUI responsive props
    - _Requirements: 12.2, 12.3_
  - [ ] 10.3 Tulis integration test untuk alur utama
    - Test alur login → CRUD catatan → logout
    - Test alur reset password
    - _Requirements: 1.2, 2.2, 3.2, 4.2, 5.2_

- [x] 11. Checkpoint akhir - Pastikan semua test lolos
  - Pastikan semua test lolos, tanyakan ke pengguna jika ada pertanyaan.

## Catatan

- Task bertanda `*` bersifat opsional dan dapat dilewati untuk MVP lebih cepat
- Setiap task mereferensikan persyaratan spesifik untuk traceability
- Checkpoint memastikan validasi inkremental di setiap tahap
- Property test memvalidasi properti kebenaran universal dari desain
- Unit test memvalidasi contoh spesifik dan edge case
