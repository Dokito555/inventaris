<template>
  <div class="auth-layout">
    <!-- Kiri: form -->
    <div class="auth-left">
      <div class="auth-left-inner">
        <slot />
      </div>
    </div>

    <!-- Kanan: panel hijau -->
    <div class="auth-right">
      <div>
        <div class="auth-brand">
          <div class="auth-brand-logo">BS</div>
          <div class="auth-title">BookingSystem</div>
        </div>

        <p class="auth-subtitle">
          Website Peminjaman<br />Barang
        </p>
      </div>

      <div class="auth-footer">
        Experiencing issues?<br />
        Get assistance via akmazzura@upi.edu
      </div>
    </div>
  </div>
</template>

<style>
@import "~/assets/css/auth.css";
</style>



