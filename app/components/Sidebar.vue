<template>
  <div class="sidebar">
    <div class="logo-section">
      <div class="logo-image"></div>
      <div class="logo-text">
        <h5>BookingSystem</h5>
        <p>Web Peminjaman</p>
      </div>
    </div>

    <ul class="sidebar-menu">

      <li :class="{ active: isActive('/dashboard') }">
        <NuxtLink to="/dashboard">Dashboard</NuxtLink>
      </li>

      <li :class="{ active: isActive('/peminjaman') }">
        <NuxtLink to="/peminjaman">List Peminjaman Barang</NuxtLink>
      </li>

      <li :class="{ active: isActive('/barang') }">
        <NuxtLink to="/barang">Daftar Barang</NuxtLink>
      </li>

      <li :class="{ active: isActive('/barang/create') }">
        <NuxtLink to="/barang/create">CRUD Barang</NuxtLink>
      </li>

      <li :class="{ active: isActive('/peminjaman/history') }">
        <NuxtLink to="/peminjaman/history">Riwayat Peminjaman</NuxtLink>
      </li>

      <li :class="{ active: isActive('/kelas') }">
        <NuxtLink to="/kelas">List Guru</NuxtLink>
      </li>

    </ul>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()

const isActive = (path) => route.path === path
</script>

<style scoped>
@import '~/assets/css/app.css';
</style>