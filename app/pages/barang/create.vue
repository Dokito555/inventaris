<template>
  <div class="crud-barang-page">
    <!-- Form Section -->
    <div class="form-container">
      <div class="form-header">
        <h2>Tambah Barang Baru</h2>
        <p>Isi form di bawah untuk menambah barang ke inventaris</p>
      </div>

      <form @submit.prevent="submitForm">
        <!-- Nama Barang -->
        <div class="form-group">
          <label for="name">
            Nama Barang 
            <span class="required">*</span>
          </label>
          <input
            id="name"
            type="text"
            v-model="form.name"
            placeholder="Contoh: Proyektor LCD"
            required
            :disabled="loading"
          >
        </div>

        <!-- Deskripsi Barang -->
        <div class="form-group">
          <label for="description">Deskripsi Barang</label>
          <textarea
            id="description"
            v-model="form.description"
            placeholder="Masukkan deskripsi barang (opsional)"
            rows="5"
            :disabled="loading"
          ></textarea>
          <p class="help-text">Deskripsikan kondisi, spesifikasi, atau catatan penting lainnya</p>
        </div>

        <!-- Kuantitas Barang -->
        <div class="form-group">
          <label for="quantity">
            Kuantitas Barang 
            <span class="required">*</span>
          </label>
          <div class="quantity-control">
            <button 
              type="button" 
              class="qty-btn"
              @click="decrementQuantity"
              :disabled="form.quantity <= 1 || loading"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/>
              </svg>
            </button>
            <input
              id="quantity"
              type="number"
              v-model.number="form.quantity"
              min="1"
              readonly
            >
            <button 
              type="button" 
              class="qty-btn"
              @click="incrementQuantity"
              :disabled="loading"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
              </svg>
            </button>
          </div>
          <p class="help-text">Jumlah barang yang tersedia</p>
        </div>

        <!-- Upload Gambar -->
        <div class="form-group">
          <label for="image">Upload Gambar</label>
          <div 
            class="upload-area" 
            @click="triggerFileInput" 
            :class="{ disabled: loading }"
          >
            <input
              ref="fileInput"
              type="file"
              id="image"
              accept="image/png,image/jpeg,image/jpg"
              @change="handleFileUpload"
              :disabled="loading"
              hidden
            >
            
            <!-- Upload Placeholder -->
            <div v-if="!imagePreview" class="upload-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
              </svg>
              <p>Klik untuk upload gambar</p>
              <span>PNG, JPG, JPEG (max 1MB)</span>
            </div>
            
            <!-- Image Preview -->
            <div v-else class="image-preview">
              <img :src="imagePreview" alt="Preview">
              <button 
                type="button" 
                class="remove-image" 
                @click.stop="removeImage" 
                :disabled="loading"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
                </svg>
              </button>
            </div>
          </div>
          <p class="help-text">Upload gambar barang untuk memudahkan identifikasi (opsional)</p>
        </div>

        <!-- Form Actions -->
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
            :disabled="loading || !form.name.trim()"
          >
            <span v-if="loading" class="loading-content">
              <svg class="spinner-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menyimpan...
            </span>
            <span v-else>Simpan Barang</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Success/Error Message -->
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
import { ref, reactive } from 'vue'

definePageMeta({
  layout: 'default',
  title: 'Tambah Barang'
})

// State
const loading = ref(false)
const fileInput = ref(null)
const imagePreview = ref(null)
const message = reactive({
  show: false,
  type: 'success',
  text: ''
})

const form = reactive({
  name: '',
  description: '',
  quantity: 1,
  image: null,
  imageBase64: null
})

// Quantity controls
function incrementQuantity() {
  form.quantity++
}

function decrementQuantity() {
  if (form.quantity > 1) {
    form.quantity--
  }
}

// File upload
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
    showMessage('error', 'Format file tidak didukung. Gunakan PNG, JPG, atau JPEG')
    event.target.value = ''
    return
  }

  if (file.size > maxSize) {
    showMessage('error', 'Ukuran file terlalu besar. Maksimal 1MB')
    event.target.value = ''
    return
  }

  try {
    // Convert to base64
    const base64 = await convertImageToBase64(file)
    
    form.image = file
    form.imageBase64 = base64
    imagePreview.value = base64
  } catch (error) {
    console.error('Error reading file:', error)
    showMessage('error', 'Gagal membaca file gambar')
  }
}

function removeImage() {
  if (loading.value) return
  
  form.image = null
  form.imageBase64 = null
  imagePreview.value = null
  
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Convert image to base64
function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

// Submit form
async function submitForm() {
  // Validasi
  if (!form.name || form.name.trim() === '') {
    showMessage('error', 'Nama barang harus diisi')
    return
  }

  if (form.quantity < 1) {
    showMessage('error', 'Kuantitas minimal 1')
    return
  }

  loading.value = true

  try {
    console.log('Submitting form...') // Debug

    // Prepare request body
    const body = {
      name: form.name.trim(),
      description: form.description?.trim() || '',
      quantity: form.quantity,
      image: form.imageBase64 || null // Base64 string atau empty string
    }

    console.log('Request body:', {
      ...body,
      image: body.image ? '[BASE64_DATA]' : '' // Don't log full base64
    })

    // API call
    const response = await $fetch('/api/items', {
      method: 'POST',
      body: body
    })

    console.log('Response:', response)

    if (response.success) {
      showMessage('success', 'Barang berhasil ditambahkan!')
      
      // Reset form
      resetForm()
      
      // Redirect setelah 2 detik
      setTimeout(() => {
        navigateTo('/barang')
      }, 2000)
    } else {
      showMessage('error', response.message || 'Gagal menambah barang')
    }
  } catch (error) {
    console.error('Error creating item:', error)
    
    // Handle error
    let errorMessage = 'Gagal menambah barang'
    
    if (error.data?.message) {
      errorMessage = error.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    
    // Handle unauthorized
    if (error.status === 401 || error.statusCode === 401) {
      errorMessage = 'Anda harus login terlebih dahulu'
      
      setTimeout(() => {
        navigateTo('/auth/login')
      }, 2000)
    }
    
    showMessage('error', errorMessage)
  } finally {
    loading.value = false
  }
}

// Reset form
function resetForm() {
  form.name = ''
  form.description = ''
  form.quantity = 1
  removeImage()
}

// Handle cancel
function handleCancel() {
  if (loading.value) return
  
  const hasData = form.name || form.description || form.imageBase64
  
  if (hasData) {
    if (confirm('Data yang Anda masukkan akan hilang. Yakin ingin membatalkan?')) {
      navigateTo('/barang')
    }
  } else {
    navigateTo('/barang')
  }
}

// Show message
function showMessage(type, text) {
  message.type = type
  message.text = text
  message.show = true

  setTimeout(() => {
    message.show = false
  }, 4000)
}
</script>

<style scoped>
/* Main Container */
.crud-barang-page {
  padding: 0;
  max-width: 1112px;
}

/* Form Container */
.form-container {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #E5E7EB;
}

.form-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 8px 0;
}

.form-header p {
  font-size: 14px;
  color: #6B7280;
  margin: 0;
}

/* Form Group */
.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #374151;
  margin-bottom: 8px;
}

.required {
  color: #EF4444;
  margin-left: 2px;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  line-height: 20px;
  color: #1F2937;
  background: #FFFFFF;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  outline: none;
  transition: all 0.3s ease;
}

.form-group input[type="text"]:focus,
.form-group input[type="number"]:focus,
.form-group textarea:focus {
  border-color: #264631;
  box-shadow: 0 0 0 3px rgba(38, 70, 49, 0.1);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #9CA3AF;
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.help-text {
  font-size: 12px;
  color: #6B7280;
  margin-top: 6px;
  display: block;
}

/* Quantity Control */
.quantity-control {
  display: inline-flex;
  align-items: center;
  gap: 0;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  overflow: hidden;
}

.qty-btn {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F9FAFB;
  border: none;
  cursor: pointer;
  color: #374151;
  transition: all 0.2s ease;
}

.qty-btn:hover:not(:disabled) {
  background: #E5E7EB;
  color: #264631;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-control input[type="number"] {
  width: 80px;
  height: 48px;
  text-align: center;
  border: none;
  border-left: 1px solid #D1D5DB;
  border-right: 1px solid #D1D5DB;
  border-radius: 0;
  padding: 0;
  margin: 0;
  -moz-appearance: textfield;
}

.quantity-control input[type="number"]::-webkit-outer-spin-button,
.quantity-control input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.quantity-control input[type="number"]:focus {
  box-shadow: none;
  border-color: #D1D5DB;
}

/* Upload Area */
.upload-area {
  border: 2px dashed #D1D5DB;
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F9FAFB;
}

.upload-area:hover:not(.disabled) {
  border-color: #264631;
  background: #F3F4F6;
}

.upload-area.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-placeholder svg {
  color: #9CA3AF;
}

.upload-placeholder p {
  font-size: 16px;
  font-weight: 500;
  color: #1F2937;
  margin: 0;
}

.upload-placeholder span {
  font-size: 13px;
  color: #6B7280;
}

/* Image Preview */
.image-preview {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.image-preview img {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: contain;
  border-radius: 8px;
}

.remove-image {
  position: absolute;
  top: -12px;
  right: -12px;
  width: 36px;
  height: 36px;
  background: #EF4444;
  border: 2px solid #FFFFFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #FFFFFF;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.remove-image:hover:not(:disabled) {
  background: #DC2626;
  transform: scale(1.1);
}

.remove-image:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #E5E7EB;
}

.btn-cancel,
.btn-submit {
  padding: 12px 24px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-cancel {
  background: #FFFFFF;
  color: #374151;
  border: 1px solid #D1D5DB;
}

.btn-cancel:hover:not(:disabled) {
  background: #F9FAFB;
  border-color: #9CA3AF;
}

.btn-submit {
  background: #264631;
  color: #FFFFFF;
  min-width: 140px;
}

.btn-submit:hover:not(:disabled) {
  background: #1a3322;
}

.btn-submit:disabled,
.btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-content {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.spinner-icon {
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Message */
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
  max-width: 400px;
}

.message-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.message-text {
  flex: 1;
}

.message.success {
  background: #D1FAE5;
  color: #065F46;
  border: 1px solid #6EE7B7;
}

.message.error {
  background: #FEE2E2;
  color: #991B1B;
  border: 1px solid #FCA5A5;
}

/* Transition */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Responsive */
@media (max-width: 768px) {
  .form-container {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
  }

  .message {
    left: 16px;
    right: 16px;
    top: 16px;
  }
}
</style>