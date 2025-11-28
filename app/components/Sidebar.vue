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

      <li :class="{ active: isActive('/list-peminjaman') }">
        <NuxtLink to="/list-peminjaman">List Peminjaman Barang</NuxtLink>
      </li>

      <li :class="{ active: isActive('/daftar-barang') }">
        <NuxtLink to="/daftar-barang">Daftar Barang</NuxtLink>
      </li>

      <li :class="{ active: isActive('/crud-barang') }">
        <NuxtLink to="/crud-barang">CRUD Barang</NuxtLink>
      </li>

      <li :class="{ active: isActive('/riwayat') }">
        <NuxtLink to="/riwayat">Riwayat Peminjaman</NuxtLink>
      </li>

      <li :class="{ active: isActive('/guru') }">
        <NuxtLink to="/guru">List Guru</NuxtLink>
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