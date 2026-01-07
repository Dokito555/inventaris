<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from '#imports'

definePageMeta({
  layout: 'auth'
})

const router = useRouter()

const form = reactive({
  name: '',
  email: '',
  phone_number: '',
  teleId: '',
  password: '',
  password_confirmation: ''
})

const loading = ref(false)
const error = ref('')
const success = ref(false)
const showPassword = ref(false)
const showPasswordConfirmation = ref(false)

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  success.value = false

  // Validasi form di frontend
  if (!form.name || !form.email || !form.phone_number || !form.password) {
    error.value = 'Semua field harus diisi.'
    loading.value = false
    return
  }

  if (form.password !== form.password_confirmation) {
    error.value = 'Password dan konfirmasi tidak sama.'
    loading.value = false
    return
  }

  if (form.password.length < 8) {
    error.value = 'Password minimal 8 karakter.'
    loading.value = false
    return
  }

  // Validasi format nomor telepon
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/
  if (!phoneRegex.test(form.phone_number)) {
    error.value = 'Format nomor telepon tidak valid. Gunakan format 08xxxxxxxxxx'
    loading.value = false
    return
  }

  try {
    console.log('Sending register request...')
    
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        phone_number: form.phone_number,
        teleId: form.teleId?.trim() || undefined,
        password: form.password
      })
    })

    const data = await response.json()
    
    console.log('Response status:', response.status)
    console.log('Response data:', data)
    console.log('Response data.status:', data.status) // ✅ Tambah log ini
    console.log('Response data.message:', data.message) // ✅ Tambah log ini
    console.log('Full data structure:', JSON.stringify(data, null, 2)) // ✅ Tambah log ini

    // Cek status response
    if (response.ok) {
      // Status 2xx (success)
      if (data.status === 'success') {
        success.value = true
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      } else {
        error.value = data.message || 'Registrasi gagal.'
      }
    } else {
      // Status 4xx atau 5xx (error)
      const errorMsg = data.error || data.message || 'Registrasi gagal.'
      console.log('Setting error message to:', errorMsg)
      error.value = errorMsg
    }

  } catch (e) {
    console.error('Register error:', e)
    error.value = 'Terjadi kesalahan. Silakan coba lagi.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <!-- Template sama seperti sebelumnya -->
  <div>
    <h1 style="padding-top: 1rem;font-size:2.25rem;font-weight:600;color:#111827;margin-bottom:0.25rem;">
      Sign up
    </h1>
    <p style="font-size:0.9rem;color:#4b5563;">
      Daftar akun baru untuk menggunakan BookingSystem.
    </p>

    <form style="margin-top:1rem;" @submit.prevent="handleSubmit">
      <!-- Success Message -->
      <div
        v-if="success"
        style="background:#d1fae5;border:1px solid #10b981;color:#065f46;padding:0.75rem;border-radius:0.5rem;margin-bottom:1rem;font-size:0.875rem;"
      >
        ✓ Registrasi berhasil! Mengalihkan ke halaman login...
      </div>

      <!-- Error Message -->
      <div
        v-if="error"
        style="background:#fee2e2;border:1px solid #ef4444;color:#991b1b;padding:0.75rem;border-radius:0.5rem;margin-bottom:1rem;font-size:0.875rem;"
      >
        ⚠️ {{ error }}
      </div>

      <!-- Nama -->
      <div style="margin-bottom:1rem;">
        <label class="auth-form-label">Nama lengkap</label>
        <input
          v-model="form.name"
          type="text"
          required
          class="auth-input"
          placeholder="John Doe"
          :disabled="loading || success"
        />
      </div>

      <!-- Email -->
      <div style="margin-bottom:1rem;">
        <label class="auth-form-label">Email</label>
        <input
          v-model="form.email"
          type="email"
          required
          class="auth-input"
          placeholder="example@gmail.com"
          autocomplete="email"
          :disabled="loading || success"
        />
      </div>

      <!-- Phone -->
      <div style="margin-bottom:1rem;">
        <label class="auth-form-label">Nomor Telepon (WhatsApp)</label>
        <input
          v-model="form.phone_number"
          type="tel"
          required
          class="auth-input"
          placeholder="081234567890"
          autocomplete="tel"
          :disabled="loading || success"
        />
        <p style="font-size:0.75rem;color:#6b7280;margin-top:0.25rem;">
          Format: 08xxxxxxxxxx
        </p>
      </div>

      <!-- TeleId -->
      <div style="margin-bottom:1rem;">
        <label class="auth-form-label">ID Telegram (Opsional)</label>
        <input
          v-model="form.teleId"
          type="text"
          class="auth-input"
          placeholder="Contoh: 123456789"
          :disabled="loading || success"
        />
        <p style="font-size:0.75rem;color:#6b7280;margin-top:0.25rem;">
          1. Chat <a href="https://t.me/userinfobot" target="_blank" style="color:#264631;text-decoration:underline;">@userinfobot</a> → START → Copy ID<br>
          2. Chat bot <a href="https://t.me/AlatnotifBot" target="_blank" style="color:#264631;text-decoration:underline;">@inventaris_bot</a> → START (WAJIB!)
        </p>
      </div>

      <!-- Password -->
      <div style="margin-bottom:1rem;">
        <label class="auth-form-label">Password</label>
        <div style="position:relative;">
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            required
            class="auth-input"
            placeholder="********"
            autocomplete="new-password"
            :disabled="loading || success"
            style="padding-right:2.5rem;"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            style="position:absolute;right:0.75rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:0.25rem;color:#6b7280;"
            :disabled="loading || success"
          >
            <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
              <line x1="2" x2="22" y1="2" y2="22"/>
            </svg>
          </button>
        </div>
        <p style="font-size:0.75rem;color:#6b7280;margin-top:0.25rem;">
          Minimal 8 karakter
        </p>
      </div>

      <!-- Confirm Password -->
      <div style="margin-bottom:0.2rem;">
        <label class="auth-form-label">Konfirmasi password</label>
        <div style="position:relative;">
          <input
            v-model="form.password_confirmation"
            :type="showPasswordConfirmation ? 'text' : 'password'"
            required
            class="auth-input"
            placeholder="********"
            :disabled="loading || success"
            style="padding-right:2.5rem;"
          />
          <button
            type="button"
            @click="showPasswordConfirmation = !showPasswordConfirmation"
            style="position:absolute;right:0.75rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:0.25rem;color:#6b7280;"
            :disabled="loading || success"
          >
            <svg v-if="showPasswordConfirmation" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
              <line x1="2" x2="22" y1="2" y2="22"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="loading || success"
        class="auth-submit"
        :style="(loading || success) ? 'opacity:0.6;cursor:not-allowed;' : ''"
      >
        {{ loading ? 'Mendaftar...' : success ? 'Berhasil!' : 'Sign up' }}
      </button>

      <!-- Login Link -->
      <p class="auth-bottom-text">
        Sudah punya akun?
        <NuxtLink to="/auth/login" style="color:#264631;font-weight:500;">
          Login di sini
        </NuxtLink>
      </p>
    </form>
  </div>
</template>