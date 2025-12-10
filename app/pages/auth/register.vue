<script setup>

import { reactive, ref } from 'vue'

import { useRouter, definePageMeta } from '#imports'

definePageMeta({

  layout: 'auth'

})

const router = useRouter()

const form = reactive({

  name: '',

  email: '',

  phone_number: '',

  password: '',

  password_confirmation: ''

})

const loading = ref(false)

const error = ref('')

const success = ref(false)

const handleSubmit = async () => {

  loading.value = true

  error.value = ''

  success.value = false

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

  try {

    const response = await $fetch('/api/auth/register', {

      method: 'POST',

      credentials: 'include', // TAMBAHKAN INI untuk cookies

      body: {

        name: form.name,

        email: form.email,

        phone_number: form.phone_number,

        password: form.password

      }

    })

    console.log('Response:', response)

    if (response.success) {

      success.value = true

      setTimeout(() => {

        router.push('/auth/login')

      }, 1500)

    } else {

      error.value = response.message || 'Registrasi gagal.'

    }

  } catch (e) {

    console.error('Error:', e)

    

    if (e.data?.message) {

      error.value = e.data.message

    } else if (e.message) {

      error.value = e.message

    } else {

      error.value = 'Terjadi kesalahan. Coba lagi.'

    }

  } finally {

    loading.value = false

  }

}

</script>

<template>
  <div>
    <h1 style="font-size:2.25rem;font-weight:600;color:#111827;margin-bottom:0.25rem;">
      Sign up
    </h1>
    <p style="font-size:0.9rem;color:#4b5563;">
      Daftar akun baru untuk menggunakan BookingSystem.
    </p>

    <form style="margin-top:2rem;" @submit.prevent="handleSubmit">
      <div
        v-if="success"
        style="background:#d1fae5;border:1px solid #10b981;color:#065f46;padding:0.75rem;border-radius:0.5rem;margin-bottom:1rem;font-size:0.875rem;"
      >
        ✓ Registrasi berhasil! Mengalihkan ke halaman login...
      </div>

      <div
        v-if="error"
        style="background:#fee2e2;border:1px solid #ef4444;color:#991b1b;padding:0.75rem;border-radius:0.5rem;margin-bottom:1rem;font-size:0.875rem;"
      >
        {{ error }}
      </div>

      <div style="margin-bottom:1rem;">
        <label class="auth-form-label">Nama lengkap</label>
        <input
          v-model="form.name"
          type="text"
          required
          class="auth-input"
          placeholder="Nama lengkap"
          :disabled="loading"
        />
      </div>

      <div style="margin-bottom:1rem;">
        <label class="auth-form-label">Email</label>
        <input
          v-model="form.email"
          type="email"
          required
          class="auth-input"
          placeholder="akmazzura@upi.edu"
          autocomplete="email"
          :disabled="loading"
        />
      </div>

      <div style="margin-bottom:1rem;">
        <label class="auth-form-label">Nomor Telepon</label>
        <input
          v-model="form.phone_number"
          type="tel"
          required
          class="auth-input"
          placeholder="081234567890"
          autocomplete="tel"
          :disabled="loading"
        />
        <p style="font-size:0.75rem;color:#6b7280;margin-top:0.25rem;">
          Format: 08xxxxxxxxxx atau +628xxxxxxxxxx
        </p>
      </div>

      <div style="margin-bottom:1rem;">
        <label class="auth-form-label">Password</label>
        <input
          v-model="form.password"
          type="password"
          required
          class="auth-input"
          placeholder="********"
          autocomplete="new-password"
          :disabled="loading"
        />
        <p style="font-size:0.75rem;color:#6b7280;margin-top:0.25rem;">
          Minimal 8 karakter
        </p>
      </div>

      <div style="margin-bottom:1.5rem;">
        <label class="auth-form-label">Konfirmasi password</label>
        <input
          v-model="form.password_confirmation"
          type="password"
          required
          class="auth-input"
          placeholder="********"
          :disabled="loading"
        />
      </div>

      <button
        type="submit"
        :disabled="loading || success"
        class="auth-submit"
        :style="loading ? 'opacity:0.6;cursor:not-allowed;' : ''"
      >
        {{ loading ? 'Signing up...' : success ? 'Success!' : 'Sign up' }}
      </button>

      <p class="auth-bottom-text">
        Already have an account?
        <NuxtLink to="/auth/login" style="color:#264631;font-weight:500;">
          Sign in here
        </NuxtLink>
      </p>
    </form>
  </div>
</template>