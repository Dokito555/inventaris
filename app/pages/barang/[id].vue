<template>
  <div class="crud-barang-page">
    <!-- Loading State -->
    <div v-if="loadingData" class="loading-container">
      <div class="spinner"></div>
      <p>Memuat data barang...</p>
    </div>

    <!-- Form Section -->
    <div v-else class="form-container">
      <div class="form-header">
        <h2>Edit Barang</h2>
        <p>Isi form di bawah untuk edit barang</p>
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
              :disabled="form.quantity <= 1  || loading"
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
              accept="image/*"
              @change="handleFileUpload"
              :disabled="loading"
              hidden
            >
            <div v-if="!imagePreview" class="upload-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
              </svg>
              <p>Klik untuk upload gambar</p>
              <span>PNG, JPG, JPEG (max 1MB)</span>
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
          <p class="help-text">Upload gambar barang untuk memudahkan identifikasi (opsional)</p>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button 
            type="button" 
            class="btn-cancel"
            @click="navigateTo('/barang')"
            :disabled="loading"
          >
            Batal
          </button>
          <button 
            type="button" 
            class="btn-delete"
            @click="confirmDelete"
            :disabled="loading"
          >
            Hapus
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

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Konfirmasi Hapus</h3>
        </div>

        <div class="modal-body">
          <p>
            Apakah kamu yakin ingin menghapus barang
            <strong>"{{ form.name || '-' }}"</strong>?
          </p>
          <p class="warning-text">
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>

        <div class="modal-actions">
          <button 
            type="button" 
            class="btn-cancel"
            @click="showDeleteModal = false"
            :disabled="loading"
          >
            Batal
          </button>

          <button 
            type="button" 
            class="btn-danger"
            @click="deleteItem"
            :disabled="loading"
          >
            {{ loading ? 'Menghapus...' : 'Ya, Hapus' }}
          </button>
        </div>
      </div>
    </div>


    <!-- Success/Error Message -->
    <div v-if="message.show" :class="['message', message.type]">
      {{ message.text }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'

definePageMeta({
  layout: 'default',
  title: 'Edit Barang'
})

const route = useRoute()
const itemId = route.params.id

const loading = ref(false)
const loadingData = ref(true)
const imagePreview = ref(null)
const fileInput = ref(null)
const showDeleteModal = ref(false)

const message = reactive({
  show: false,
  type: 'success',
  text: ''
})

const form = reactive({
  name: '',
  description: '',
  quantity: 1,
  available: true,
  image: null // base64
})

/* ================= LOAD DATA ================= */
onMounted(loadItem)

async function loadItem() {
  try {
    const res = await $fetch(`/api/items/${itemId}`)
    if (!res.success) throw new Error()

    const item = res.data
    form.name = item.name
    form.description = item.description
    form.quantity = item.quantity
    form.available = item.available
    form.image = item.image

    imagePreview.value = item.image
  } catch (e) {
    showMessage('error', 'Gagal memuat data barang')
    setTimeout(() => navigateTo('/barang'), 2000)
  } finally {
    loadingData.value = false
  }
}

/* ================= IMAGE ================= */
function triggerFileInput() {
  fileInput.value.click()
}

function handleFileUpload(e) {
  const file = e.target.files[0]
  if (!file) return

  if (!['image/png', 'image/jpeg'].includes(file.type)) {
    return showMessage('error', 'Format gambar tidak valid')
  }

  if (file.size > 1 * 1024 * 1024) {
    return showMessage('error', 'Ukuran gambar maksimal 1MB')
  }

  const reader = new FileReader()
  reader.onload = () => {
    form.image = reader.result
    imagePreview.value = reader.result
  }
  reader.readAsDataURL(file)
}

function removeImage() {
  form.image = null
  imagePreview.value = null
  fileInput.value.value = ''
}

// kuantitas
function incrementQuantity() {
  form.quantity++
}

function decrementQuantity() {
  if (form.quantity > 1) {
    form.quantity--
  }
}

/* ================= SUBMIT ================= */
async function submitForm() {
  loading.value = true
  try {
    const payload = {
      name: form.name,
      description: form.description,
      quantity: form.quantity,
      available: form.available,
      image: form.image
    }

    const res = await $fetch(`/api/items/${itemId}`, {
      method: 'PUT',
      body: payload
    })

    if (!res.success) throw new Error()
    showMessage('success', 'Barang berhasil diupdate')
    setTimeout(() => navigateTo('/barang'), 1500)
  } catch (e) {
    showMessage('error', 'Gagal menyimpan perubahan')
  } finally {
    loading.value = false
  }
}

/* ================= DELETE ================= */
async function deleteItem() {
  loading.value = true
  try {
    const res = await $fetch(`/api/items/${itemId}`, {
      method: 'DELETE'
    })

    if (!res.success) throw new Error()
    showMessage('success', 'Barang berhasil dihapus')
    setTimeout(() => navigateTo('/barang'), 1500)
  } catch (e) {
    showMessage('error', 'Gagal menghapus barang')
  } finally {
    loading.value = false
    showDeleteModal.value = false
  }
}

function confirmDelete() {
  showDeleteModal.value = true
}

/* ================= HELPERS ================= */
function showMessage(type, text) {
  message.type = type
  message.text = text
  message.show = true
  setTimeout(() => (message.show = false), 3000)
}
</script>

<style scoped>
/* Main Container */
.crud-barang-page {
  padding: 0;
  max-width: 1112px;
}

/* Loading Container */
.loading-container {
  background: #FFFFFF;
  border-radius: 10px;
  padding: 80px 32px;
  text-align: center;
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

.spinner {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  border: 4px solid #E5E7EB;
  border-top-color: #264631;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-container p {
  font-size: 16px;
  color: #6B7280;
  margin: 0;
}

/* Form Container */
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

.form-container {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Form Group */
.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: #374151;
  margin-bottom: 8px;
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
.btn-delete,
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

.btn-cancel:hover {
  background: #F9FAFB;
  border-color: #9CA3AF;
}

.btn-delete {
  background: #EF4444;
  color: #FFFFFF;
  min-width: 100px;
}

.btn-delete:hover:not(:disabled) {
  background: #DC2626;
}

.btn-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

/* Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  animation: fadeIn 0.2s ease;
}

/* Card */
.modal-card {
  background: #ffffff;
  width: 100%;
  max-width: 420px;
  border-radius: 14px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: scaleIn 0.2s ease;
}

/* Header */
.modal-header {
  padding: 18px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

/* Body */
.modal-body {
  padding: 20px 24px;
}

.modal-body p {
  margin: 0 0 10px;
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
}

.warning-text {
  color: #b91c1c;
  font-size: 13px;
}

/* Actions */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
}

/* Buttons */
.modal-actions .btn-cancel {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-danger {
  background: #dc2626;
  color: #ffffff;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-danger:hover {
  background: #b91c1c;
}

.btn-danger:disabled,
.btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
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
  .btn-delete,
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

  .modal-content {
    padding: 24px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn-modal-cancel,
  .btn-modal-delete {
    width: 100%;
  }
}
</style>