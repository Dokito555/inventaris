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
  password: '',
  password_confirmation: ''
})

const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  if (form.password !== form.password_confirmation) {
    error.value = 'Password dan konfirmasi tidak sama.'
    loading.value = false
    return
  }

  try {
    // TODO: panggil API register Laravel di sini
    // await $fetch('http://localhost:8000/api/register', { method:'POST', body: form })
    router.push('/auth/login')
  } catch (e) {
    error.value = 'Registrasi gagal. Coba lagi.'
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
      <div style="margin-bottom:1rem;">
        <label class="auth-form-label">Nama lengkap</label>
        <input
          v-model="form.name"
          type="text"
          required
          class="auth-input"
          placeholder="Nama lengkap"
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
        />
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
        />
      </div>

      <div style="margin-bottom:0.5rem;">
        <label class="auth-form-label">Konfirmasi password</label>
        <input
          v-model="form.password_confirmation"
          type="password"
          required
          class="auth-input"
          placeholder="********"
        />
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="auth-submit"
      >
        {{ loading ? 'Signing up...' : 'Sign up' }}
      </button>

      <p class="auth-bottom-text">
        Already have an account?
        <NuxtLink to="/auth/login" style="color:#264631;font-weight:500;">
          Sign in here
        </NuxtLink>
      </p>

      <p
        v-if="error"
        style="font-size:0.85rem;color:#dc2626;text-align:center;margin-top:6px;"
      >
        {{ error }}
      </p>
    </form>
  </div>
</template>
