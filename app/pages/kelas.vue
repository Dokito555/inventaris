
<template>
  <div class="kelas-page">
    <div class="top-actions">
      <div class="search-box">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" placeholder="Search">
      </div>
      </div>

    <div class="table-section">
      <div class="table-wrapper">
        <div class="table-header">
          <div class="table-header-row guru-grid">
            <span>No.</span>
            <span>Nama Guru</span>
            <span>Kelas</span>
            <span>Jumlah Peminjaman</span>
          </div>
        </div>

        <div class="table-body">
          <div v-for="(guru, index) in listGuru" :key="index" class="table-row guru-grid">
            <span>{{ index + 1 }}</span>
            <span>{{ guru.nama }}</span>
            <span>{{ guru.kelas }}</span>
            <span>{{ guru.jumlahPeminjaman }}</span>
          </div>
        </div>
      </div>

      <div class="pagination-wrapper">
        <button class="pagination-btn disabled">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fill-rule="evenodd"
              d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
          </svg>
        </button>

        <button class="pagination-btn active">1</button>
        <button class="pagination-btn">2</button>
        <button class="pagination-btn">3</button>
        <span class="pagination-dots">...</span>

        <button class="pagination-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fill-rule="evenodd"
              d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Definisikan metadata halaman
definePageMeta({
  // middleware: ['auth'],
  layout: 'default',
  title: 'List Guru'
})

// Data Dummy List Guru (sesuai data yang ada di gambar)
const listGuru = [
  { nama: 'Ahmad', kelas: '10 TKJ', jumlahPeminjaman: 5 },
  { nama: 'Roni', kelas: '11 TKJ 2', jumlahPeminjaman: 8 },
  { nama: 'Budi', kelas: '12 TKJ 1', jumlahPeminjaman: 3 },
]
</script>

<style scoped>
/* Import CSS eksisting */
@import "~/assets/css/list-peminjaman.css";

.guru-grid {
  display: grid;
  grid-template-columns: 60px 2fr 1fr 1fr;
  align-items: center;
}

.guru-grid span {
  width: auto;
}
</style>