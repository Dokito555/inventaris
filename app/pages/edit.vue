<template>
  <div class="edit-profile-page">
    <div class="form-container">
      <div class="form-header">
        <h2>Edit Profile Admin</h2>
        <p>Perbarui informasi akun administrator Anda</p>
      </div>

      <form @submit.prevent="submitForm">
        
        <div class="form-group">
          <label>Foto Profil</label>
          <div class="profile-upload-wrapper">
             <div class="avatar-preview-container" @click="triggerFileInput">
                <img 
                  v-if="imagePreview" 
                  :src="imagePreview" 
                  alt="Avatar Preview" 
                  class="avatar-img"
                >
                <div v-else class="avatar-placeholder">
                  <span>Inisial</span>
                </div>
                
                <div class="avatar-overlay">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M10.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                    <path d="M2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2zm.5 2a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zm9 2.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z"/>
                  </svg>
                </div>
             </div>
             
             <div class="upload-info">
               <p class="upload-label">Klik foto untuk mengganti</p>
               <p class="help-text">JPG, JPEG atau PNG. Maksimal 1MB.</p>
               <button 
                  v-if="imagePreview && imagePreview !== '/admin.png'" 
                  type="button" 
                  class="btn-reset-photo"
                  @click="resetPhoto"
               >
                 Hapus Foto
               </button>
             </div>

             <input
              ref="fileInput"
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              @change="handleFileUpload"
              :disabled="loading"
              hidden
            >
          </div>
        </div>

        <div class="form-group">
          <label for="name">
            Nama Lengkap
            <span class="required">*</span>
          </label>
          <input
            id="name"
            type="text"
            v-model="form.name"
            placeholder="Masukkan nama lengkap"
            required
            :disabled="loading"
          >
        </div>

        <div class="form-group">
          <label for="email">
            Email Address
            <span class="required">*</span>
          </label>
          <input
            id="email"
            type="email"
            v-model="form.email"
            placeholder="nama@email.com"
            required
            :disabled="loading"
          >
        </div>

        <div class="form-group">
          <label for="password">Password Baru</label>
          <input
            id="password"
            type="password"
            v-model="form.password"
            placeholder="Kosongkan jika tidak ingin mengubah password"
            :disabled="loading"
            autocomplete="new-password"
          >
          <p class="help-text">Minimal 6 karakter jika ingin mengganti.</p>
        </div>

        <div class="form-actions">
          <button 
            type="button" 
            class="btn-cancel"
            @click="handleCancel"
            :disabled="loading"
          >
            Batal
          </button>
          
          <button 
            type="submit" 
            class="btn-submit"
            :disabled="loading || !isFormValid"
          >
            <span v-if="loading" class="loading-content">
              <svg class="spinner-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menyimpan...
            </span>
            <span v-else>Simpan Perubahan</span>
          </button>
        </div>
      </form>
    </div>

    <Transition name="fade">
      <div v-if="message.show" :class="['message', message.type]">
        <span class="message-icon">
          {{ message.type === 'success' ? '✓' : '⚠️' }}
        </span>
        <span class="message-text">{{ message.text }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  layout: 'default',
  title: 'Edit Profile'
})

const router = useRouter()

// State
const loading = ref(false)
const fileInput = ref(null)
const imagePreview = ref(null) // URL untuk ditampilkan
const initialData = reactive({}) // Untuk mengecek perubahan

const message = reactive({
  show: false,
  type: 'success',
  text: ''
})

const form = reactive({
  name: '',
  email: '',
  password: '',
  imageBase64: null
})

// Lifecycle: Ambil data user saat ini
onMounted(async () => {
  try {
    const res = await $fetch('/api/auth/me', { credentials: 'include' })
    const data = res?.data ?? res
    if (!data) {
      router.push('/auth/login')
      return
    }

    // Populate Form
    form.name = data.name || ''
    form.email = data.email || ''
    imagePreview.value = data.image || '/admin.png'
    
    // Simpan initial state
    Object.assign(initialData, {
        name: data.name || '',
        email: data.email || '',
        avatarUrl: data.image || '/admin.png'
    })
  } catch (e) {
    console.error('Failed to fetch profile', e)
    router.push('/auth/login')
  }
})

// Computed Validation
const isFormValid = computed(() => {
  if (!form.name.trim() || !form.email.trim()) return false
  // Jika password diisi, harus minimal 6 karakter
  if (form.password && form.password.length < 6) return false
  return true
})

// File upload Logic
function triggerFileInput() {
  if (!loading.value) {
    fileInput.value?.click()
  }
}

async function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  // Validasi file
  const maxSize = 1 * 1024 * 1024 // 1MB
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg']

  if (!allowedTypes.includes(file.type)) {
    showMessage('error', 'Format file harus PNG atau JPG')
    return
  }

  if (file.size > maxSize) {
    showMessage('error', 'Ukuran file maksimal 1MB')
    return
  }

  try {
    const base64 = await convertImageToBase64(file)
    form.imageBase64 = base64
    imagePreview.value = base64
  } catch (error) {
    showMessage('error', 'Gagal membaca file gambar')
  }
}

function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

function resetPhoto() {
    form.imageBase64 = null
    imagePreview.value = initialData.avatarUrl
    if (fileInput.value) fileInput.value.value = ''
}

// Submit Logic
async function submitForm() {
  if (!isFormValid.value) return

  loading.value = true

  try {
    const updateData = {}
    if (form.name !== initialData.name) updateData.name = form.name
    if (form.email !== initialData.email) updateData.email = form.email
    if (form.password) updateData.password = form.password
    if (form.imageBase64) {
        updateData.image = form.imageBase64
    }

    console.log('Updating profile...', updateData)

    const res = await $fetch('/api/auth/me', {
      method: 'PUT',
      body: updateData,
      credentials: 'include'
    })

    console.log('Update response:', res)

    showMessage('success', 'Profile berhasil diperbarui!')
    setTimeout(() => {
      router.push('/profile')
    }, 2000)
  } catch (error) {
    console.error('Update failed', error)
    showMessage('error', 'Gagal memperbarui profil.')
  } finally {
    loading.value = false
  }
}

function handleCancel() {
    router.back() // Kembali ke halaman sebelumnya
}

function showMessage(type, text) {
  message.type = type
  message.text = text
  message.show = true
  setTimeout(() => { message.show = false }, 3000)
}
</script>

<style scoped>
/* Gunakan base style dari referensi Anda, dengan penyesuaian */

.edit-profile-page {
  padding: 0;
  max-width: 800px; /* Lebih kecil dari form barang agar fokus */
  margin: 0 auto; 
}

.form-container {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-header {
  margin-bottom: 24px;
  border-bottom: 1px solid #E5E7EB;
  padding-bottom: 16px;
}

.form-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

.form-header p {
  color: #6B7280;
  font-size: 14px;
  margin-top: 4px;
}

/* Form Groups */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 500;
  font-size: 14px;
  color: #374151;
  margin-bottom: 8px;
}

.required {
  color: #EF4444;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  outline: none;
  font-size: 14px;
  transition: border 0.3s;
}

.form-group input:focus {
  border-color: #264631;
  box-shadow: 0 0 0 3px rgba(38, 70, 49, 0.1);
}

/* PROFILE SPECIFIC STYLES */
.profile-upload-wrapper {
    display: flex;
    align-items: center;
    gap: 20px;
}

.avatar-preview-container {
    width: 100px;
    height: 100px;
    border-radius: 50%; /* Membuat lingkaran */
    overflow: hidden;
    position: relative;
    cursor: pointer;
    border: 2px solid #E5E7EB;
}

.avatar-preview-container:hover .avatar-overlay {
    opacity: 1;
}

.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-placeholder {
    width: 100%;
    height: 100%;
    background: #F3F4F6;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9CA3AF;
}

/* Overlay Camera Icon */
.avatar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    opacity: 0;
    transition: opacity 0.2s;
}

.upload-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.upload-label {
    font-weight: 600;
    font-size: 14px;
    margin: 0 0 4px 0;
    color: #374151;
}

.btn-reset-photo {
    background: none;
    border: none;
    color: #EF4444;
    font-size: 12px;
    padding: 0;
    cursor: pointer;
    text-align: left;
    margin-top: 8px;
    text-decoration: underline;
}

.help-text {
  font-size: 12px;
  color: #6B7280;
  margin-top: 4px;
}

/* Action Buttons (Copy from reference) */
.form-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #E5E7EB;
}

.btn-cancel {
  background: white;
  border: 1px solid #D1D5DB;
  color: #374151;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.btn-submit {
  background: #264631;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  min-width: 120px;
}

.btn-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Toast Message (Same as reference) */
.message {
  position: fixed;
  top: 24px;
  right: 24px;
  padding: 16px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.message.success { background: #D1FAE5; color: #065F46; border: 1px solid #6EE7B7; }
.message.error { background: #FEE2E2; color: #991B1B; border: 1px solid #FCA5A5; }

/* Animation */
.fade-enter-active, .fade-leave-active { transition: all 0.3s ease; }
.fade-enter-from { opacity: 0; transform: translateX(100px); }
.fade-leave-to { opacity: 0; transform: translateY(-20px); }

/* Loading Spinner */
.loading-content { display: flex; align-items: center; gap: 8px; }
.spinner-icon { width: 16px; height: 16px; animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

</style>