<template>
  <div class="dashboard-page">
    <div class="stats-container">
      <div class="stats-grid">
        <div class="stat-card blue">
          <h2 class="stat-number">112</h2>
          <p class="stat-label">Total Barang</p>
        </div>

        <div class="stat-card yellow">
          <h2 class="stat-number">22</h2>
          <p class="stat-label">Barang Dipinjam</p>
        </div>

        <div class="stat-card green">
          <h2 class="stat-number">89</h2>
          <p class="stat-label">Barang Tersedia</p>
        </div>

        <div class="stat-card pink">
          <h2 class="stat-number">1</h2>
          <p class="stat-label">Barang Telat</p>
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <div class="table-section">
      <h5 class="table-title">Daftar Peminjam Terbaru</h5>

      <div class="table-wrapper">
        <div class="table-header">
          <div class="table-header-row">
            <span>No.</span>
            <span>Nama Peminjam</span>
            <span>Nama Barang</span>
            <span>Tanggal Meminjam</span>
            <span>Tanggal Pengembalian</span>
            <span>Kelas</span>
          </div>
        </div>

        <div class="table-body">
          <div class="table-row">
            <span>1</span>
            <span>Muhammad Azz...</span>
            <span>NVIDIA HGX H100</span>
            <span>Oct 8, 2025</span>
            <span>Oct 15, 2025</span>
            <span>10 TKJ</span>
          </div>

          <div class="table-row">
            <span>2</span>
            <span>Afrizal</span>
            <span>Kabel USB C</span>
            <span>Oct 9, 2025</span>
            <span>Oct 16, 2025</span>
            <span>11 TKJ 2</span>
          </div>

          <div class="table-row">
            <span>3</span>
            <span>Meisya</span>
            <span>Fiber Optic 2m</span>
            <span>Oct 9, 2025</span>
            <span>Oct 16, 2025</span>
            <span>10</span>
          </div>

          <div class="table-row">
            <span>4</span>
            <span>Timmi</span>
            <span>Server Instance</span>
            <span>Oct 10, 2025</span>
            <span>Oct 17, 2025</span>
            <span>12</span>
          </div>

          <div class="table-row">
            <span>5</span>
            <span>Nana</span>
            <span>Monitor 14inch</span>
            <span>Oct 11, 2025</span>
            <span>Oct 15, 2025</span>
            <span>11</span>
          </div>

          <div class="table-row">
            <span>6</span>
            <span>Daffa</span>
            <span>10T SDD</span>
            <span>Oct 12, 2025</span>
            <span>Oct 19, 2025</span>
            <span>12</span>
          </div>

          <div class="table-row">
            <span>7</span>
            <span>Ahmad</span>
            <span>Firewall A</span>
            <span>Oct 12, 2025</span>
            <span>Oct 19, 2025</span>
            <span>12</span>
          </div>

          <div class="table-row">
            <span>8</span>
            <span>John Doe</span>
            <span>Router</span>
            <span>Oct 12, 2025</span>
            <span>Oct 19, 2025</span>
            <span>12</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
    definePageMeta({
        // middleware: ['auth'],
        layout: 'default',
        title: 'Dashboard'
    })
</script>

<style>
@import "~/assets/css/dashboard.css";
</style>
