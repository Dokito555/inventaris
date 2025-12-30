<script setup>
import { reactive, ref } from 'vue'
import { useRouter, definePageMeta } from '#imports'

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

  try {
    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: form.email,
        password: form.password
      },
      credentials: 'include'
    })

    // successful login should return user data
    if (res && (res.status === 'success' || res.success)) {
      router.push('/dashboard')
      return
    }

    error.value = res.message || 'Email atau password salah.'
  } catch (e) {
    if (e instanceof Error) {
      error.value = e.message
    } else if (typeof e === 'object' && e !== null && 'data' in e && e.data && typeof e.data === 'object' && 'message' in e.data && typeof e.data.message === 'string') {
      error.value = e.data.message
    } else {
      error.value = 'Email atau password salah.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <!-- Judul -->
    <h1 style="font-size:2.25rem;font-weight:600;color:#111827;margin-bottom:0.25rem;">
      Sign in
    </h1>
    <p style="font-size:0.9rem;color:#4b5563;">
      Masuk BookingSystem dengan akun yang sudah terdaftar.
    </p>

    <!-- Form -->
    <form style="margin-top:2rem;" @submit.prevent="handleSubmit">
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

      <div style="margin-bottom:0.2rem;">
        <label class="auth-form-label">Password</label>
        <div class="auth-password-wrapper">
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            type="password"
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
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="auth-submit"
      >
        {{ loading ? 'Signing in...' : 'Sign in' }}
      </button>

      <p class="auth-bottom-text">
        Don’t have an account?
        <NuxtLink to="/auth/register" style="color:#264631;font-weight:500;">
          Sign up here
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


