<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from '#imports'

definePageMeta({
  layout: 'auth'
})

const router = useRouter()

const form = reactive({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  // Validasi frontend
  if (!form.email || !form.password) {
    error.value = 'Email dan password harus diisi.'
    loading.value = false
    return
  }

  if (form.password.length < 8) {
    error.value = 'Password minimal 8 karakter.'
    loading.value = false
    return
  }

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: form.email,
        password: form.password
      }),
      credentials: 'include' // ✅ Penting untuk cookie
    })

    const data = await response.json()
    
    console.log('Login response:', data)

    if (response.ok) {
      // Login berhasil
      if (data.status === 'success' || data.success === true) {
        router.push('/dashboard')
        return
      }
    }
    
    // Login gagal - ambil error message
    // ✅ Cek 'error' dulu, baru 'message' (konsisten dengan register)
    error.value = data.error || data.message || 'Email atau password salah.'

  } catch (e) {
    console.error('Login error:', e)
    error.value = 'Terjadi kesalahan. Silakan coba lagi.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h1 style="padding-top: 1rem;font-size:2.25rem;font-weight:600;color:#111827;margin-bottom:0.25rem;">
      Login
    </h1>
    <p style="font-size:0.9rem;color:#4b5563;">
      Masuk ke akun BookingSystem Anda.
    </p>

    <form style="margin-top:1rem;" @submit.prevent="handleSubmit">
      <!-- Error Message -->
      <div
        v-if="error"
        style="background:#fee2e2;border:1px solid #ef4444;color:#991b1b;padding:0.75rem;border-radius:0.5rem;margin-bottom:1rem;font-size:0.875rem;"
      >
        ⚠️ {{ error }}
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
          :disabled="loading"
        />
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
            autocomplete="current-password"
            :disabled="loading"
            style="padding-right:2.5rem;"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            style="position:absolute;right:0.75rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:0.25rem;color:#6b7280;"
            :disabled="loading"
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
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="loading"
        class="auth-submit"
        :style="loading ? 'opacity:0.6;cursor:not-allowed;' : ''"
      >
        {{ loading ? 'Login...' : 'Login' }}
      </button>

      <!-- Register Link -->
      <p class="auth-bottom-text">
        Belum punya akun?
        <NuxtLink to="/auth/register" style="color:#264631;font-weight:500;">
          Daftar di sini
        </NuxtLink>
      </p>
    </form>
  </div>
</template>