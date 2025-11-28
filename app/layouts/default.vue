<template>
  <div id="app-layout">
    <Sidebar />

    <div class="main-wrapper">
      <TopNavbar />

      <main class="main-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import Sidebar from "~/components/Sidebar.vue";
import TopNavbar from "~/components/TopNavbar.vue";
</script>

<style>
@import "~/assets/css/app.css";
</style>
