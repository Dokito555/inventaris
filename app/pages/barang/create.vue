<template>
  <div class="crud-barang-page">
    <!-- Form Section -->
    <div class="form-container">
      <div class="form-header">
        <h2>Tambah Barang Baru</h2>
      </div>

      <form @submit.prevent="submitForm">
        <!-- Nama Barang -->
        <div class="form-group">
          <label for="name">Nama Barang</label>
          <input
            id="name"
            type="text"
            v-model="form.name"
            placeholder="Isi Nama Barang"
            required
          >
        </div>

        <!-- Deskripsi Barang -->
        <div class="form-group">
          <label for="description">Deskripsi Barang</label>
          <textarea
            id="description"
            v-model="form.description"
            placeholder="Lorem ipsum"
            rows="5"
          ></textarea>
        </div>

        <!-- Kuantitas Barang -->
        <div class="form-group">
          <label for="quantity">Kuantitas Barang</label>
          <div class="quantity-control">
            <button 
              type="button" 
              class="qty-btn"
              @click="decrementQuantity"
              :disabled="form.quantity <= 1"
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
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Upload Gambar -->
        <div class="form-group">
          <label for="image">Upload Gambar</label>
          <div class="upload-area" @click="triggerFileInput">
            <input
              ref="fileInput"
              type="file"
              id="image"
              accept="image/*"
              @change="handleFileUpload"
              hidden
            >
            <div v-if="!imagePreview" class="upload-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
              </svg>
              <p>Klik untuk upload gambar</p>
              <span>PNG, JPG, JPEG (max 5MB)</span>
            </div>
            <div v-else class="image-preview">
              <img :src="imagePreview" alt="Preview">
              <button type="button" class="remove-image" @click.stop="removeImage">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button 
            type="button" 
            class="btn-cancel"
            @click="navigateTo('/barang')"
          >
            Batal
          </button>
          <button 
            type="submit" 
            class="btn-submit"
            :disabled="loading"
          >
            {{ loading ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Success/Error Message -->
    <div v-if="message.show" :class="['message', message.type]">
      {{ message.text }}
    </div>
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
  status: 'available'
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
  fileInput.value.click()
}

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  // Validasi file
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg']

  if (!allowedTypes.includes(file.type)) {
    showMessage('error', 'Format file tidak didukung. Gunakan PNG, JPG, atau JPEG')
    return
  }

  if (file.size > maxSize) {
    showMessage('error', 'Ukuran file terlalu besar. Maksimal 5MB')
    return
  }

  // Preview image
  form.image = file
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

function removeImage() {
  form.image = null
  imagePreview.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Submit form
async function submitForm() {
  loading.value = true

  try {
    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('description', form.description)
    formData.append('quantity', form.quantity)
    formData.append('status', form.status)
    
    if (form.image) {
      formData.append('image', form.image)
    }

    // API call
    const response = await $fetch('/api/items', {
      method: 'POST',
      body: formData
    })

    if (response.success) {
      showMessage('success', 'Barang berhasil ditambahkan!')
      
      // Redirect setelah 2 detik
      setTimeout(() => {
        navigateTo('/barang')
      }, 2000)
    }
  } catch (error) {
    console.error('Error creating item:', error)
    showMessage('error', error.data?.message || 'Gagal menambah barang')
  } finally {
    loading.value = false
  }
}

// Show message
function showMessage(type, text) {
  message.type = type
  message.text = text
  message.show = true

  setTimeout(() => {
    message.show = false
  }, 3000)
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
  border-radius: 10px;
  padding: 32px;
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
  margin: 0;
}

/* Form Group */
.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: #1F2937;
  margin-bottom: 8px;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  line-height: 24px;
  color: #1F2937;
  background: #FFFFFF;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s ease;
}

.form-group input[type="text"]:focus,
.form-group input[type="number"]:focus,
.form-group textarea:focus {
  border-color: #264631;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #9CA3AF;
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
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
  transition: all 0.3s ease;
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
  -moz-appearance: textfield;
}

.quantity-control input[type="number"]::-webkit-outer-spin-button,
.quantity-control input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
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
}

.upload-area:hover {
  border-color: #264631;
  background: #F9FAFB;
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
  font-size: 14px;
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
  transition: all 0.3s ease;
}

.remove-image:hover {
  background: #DC2626;
  transform: scale(1.1);
}

/* Status Buttons */
.status-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.status-btn {
  padding: 12px 24px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 400;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #FFFFFF;
  color: #374151;
  border: 1px solid #E5E7EB;
}

.status-btn:hover {
  border-color: #264631;
}

.status-btn.active {
  font-weight: 500;
  border-width: 1px;
}

.status-btn.active:nth-child(1) {
  background: #264631;
  color: #FFFFFF;
  border-color: #264631;
}

.status-btn.active:nth-child(2) {
  background: #FEF3C7;
  color: #92400E;
  border-color: #FEF3C7;
}

.status-btn.active:nth-child(3) {
  background: #FEE2E2;
  color: #991B1B;
  border-color: #FEE2E2;
}

.status-btn.active:nth-child(4) {
  background: #E5E7EB;
  color: #374151;
  border-color: #E5E7EB;
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
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-cancel {
  background: #FFFFFF;
  color: #374151;
  border: 1px solid #D1D5DB;
}

.btn-cancel:hover {
  background: #F9FAFB;
  border-color: #9CA3AF;
}

.btn-submit {
  background: #264631;
  color: #FFFFFF;
  min-width: 120px;
}

.btn-submit:hover:not(:disabled) {
  background: #1a3322;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Message */
.message {
  position: fixed;
  top: 24px;
  right: 24px;
  padding: 16px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 9999;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
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
  
  .status-buttons {
    gap: 8px;
  }
  
  .status-btn {
    flex: 1;
    min-width: calc(50% - 4px);
  }
}
</style>