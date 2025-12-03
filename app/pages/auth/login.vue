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

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    // TODO: ganti dengan request ke API login kamu
    await new Promise(resolve => setTimeout(resolve, 800))
    router.push('/dashboard')
  } catch (e) {
    error.value = 'Email atau password salah.'
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
          placeholder=" "
        />
      </div>

      <div style="margin-bottom:0.5rem;">
        <label class="auth-form-label">Password</label>
        <div class="auth-password-wrapper">
          <input
            v-model="form.password"
            type="password"
            required
            class="auth-input"
            placeholder=""
          />
          <span class="auth-eye-icon">👁</span>
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


