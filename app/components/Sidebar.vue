<template>
  <div class="sidebar">
    <div class="logo-section">
      <img src="/logo_sekolah.png" alt="Logo" class="logo-image" />
      <div class="logo-text">
        <h5>BookingSystem</h5>
        <p>Web Peminjaman</p>
      </div>
    </div>

    <ul class="sidebar-menu">

  <li :class="{ active: isExact('/dashboard') }">
    <NuxtLink to="/dashboard">Dashboard</NuxtLink>
  </li>

  <li :class="{ active: route.path.startsWith('/peminjaman') && route.path !== '/peminjaman/history' }">
    <NuxtLink to="/peminjaman">Peminjaman Barang</NuxtLink>
  </li>

  <li :class="{ active: isExact('/peminjaman/history') }">
    <NuxtLink to="/peminjaman/history">Riwayat Peminjaman</NuxtLink>
  </li>

  <li :class="{ active: route.path.startsWith('/barang') }">
    <NuxtLink to="/barang">Manajemen Barang</NuxtLink>
  </li>

  <li :class="{ active: isExact('/kelas') }">
    <NuxtLink to="/kelas">Data Guru</NuxtLink>
  </li>

</ul>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()

const isExact = (path) => route.path === path

// Untuk CRUD Barang: create + detail
const isBarangCrudActive = () => {
  return (
    route.path === '/barang/create' ||
    /^\/barang\/[^/]+$/.test(route.path)
  )
}
</script>

<style scoped>
@import '~/assets/css/app.css';
</style>