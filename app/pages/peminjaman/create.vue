<template>
  <div class="crud-peminjaman-page">
    <!-- Form Section -->
    <div class="form-container">
      <div class="form-header">
        <h2>Tambah Peminjaman Baru</h2>
        <p>Isi form di bawah untuk membuat peminjaman barang</p>
      </div>

      <form @submit.prevent="submitForm">
        <!-- Nama Peminjam (Teacher) -->
        <div class="form-group">
          <label for="teacher">
            Nama Peminjam (Guru) 
            <span class="required">*</span>
          </label>
          <select
            id="teacher"
            v-model="form.teacherId"
            required
            :disabled="loading"
          >
            <option value="" disabled>Pilih Guru</option>
            <option 
              v-for="teacher in teachers" 
              :key="teacher.id" 
              :value="teacher.id"
            >
              {{ teacher.name }} - {{ teacher.class }}
            </option>
          </select>
          <p class="help-text">Pilih guru yang akan meminjam barang</p>
        </div>

        <!-- Barang yang Dipinjam -->
        <div class="form-group">
          <label for="item">
            Barang yang Dipinjam 
            <span class="required">*</span>
          </label>
          <select
            id="item"
            v-model="form.itemId"
            required
            :disabled="loading"
            @change="onItemChange"
          >
            <option value="" disabled>Pilih Barang</option>
            <option 
              v-for="item in availableItems" 
              :key="item.id" 
              :value="item.id"
              :disabled="item.quantity <= 0"
            >
              {{ item.name }} (Tersedia: {{ item.quantity }})
            </option>
          </select>
          <p class="help-text">Pilih barang yang tersedia</p>
        </div>

        <!-- Jumlah Dipinjam -->
        <div class="form-group">
          <label for="quantity">
            Jumlah Dipinjam 
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
              :max="maxQuantity"
              min="1"
              required
              readonly
            >
            <button 
              type="button" 
              class="qty-btn"
              @click="incrementQuantity"
              :disabled="form.quantity >= maxQuantity || loading"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
              </svg>
            </button>
          </div>
          <p class="help-text">Maksimal: {{ maxQuantity }} barang</p>
        </div>

        <!-- Catatan -->
        <div class="form-group">
          <label for="notes">Catatan (Opsional)</label>
          <textarea
            id="notes"
            v-model="form.notes"
            placeholder="Tambahkan catatan jika diperlukan..."
            rows="4"
            :disabled="loading"
          ></textarea>
          <p class="help-text">Contoh: Untuk praktikum kelas 10 TKJ</p>
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
            :disabled="loading || !isFormValid"
          >
            <span v-if="loading" class="loading-content">
              <svg class="spinner-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menyimpan...
            </span>
            <span v-else>Simpan Peminjaman</span>
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
import { ref, reactive, computed, onMounted } from 'vue'

definePageMeta({
  layout: 'default',
  title: 'Tambah Peminjaman'
})

onMounted(() => {
  fetchData()
})

// State
const loading = ref(false)
const teachers = ref([])
const items = ref([])
const message = reactive({
  show: false,
  type: 'success',
  text: ''
})

const form = reactive({
  teacherId: '',
  itemId: '',
  quantity: 1,
  notes: ''
})

// Computed Properties
const maxQuantity = computed(() => {
  if (!form.itemId) return 1
  const selectedItem = items.value.find(item => item.id === form.itemId)
  return selectedItem ? selectedItem.quantity : 1
})

const availableItems = computed(() => {
  return items.value.filter(item => item.available && item.quantity > 0)
})

const isFormValid = computed(() => {
  return form.teacherId && 
         form.itemId && 
         form.quantity >= 1
})

// Quantity controls
function incrementQuantity() {
  if (form.quantity < maxQuantity.value) {
    form.quantity++
  }
}

function decrementQuantity() {
  if (form.quantity > 1) {
    form.quantity--
  }
}

function onItemChange() {
  form.quantity = 1
}

// Fetch data
async function fetchData() {
  await Promise.all([
    fetchTeachers(),
    fetchItems()
  ])
}

async function fetchTeachers() {
  try {
    const response = await $fetch('/api/teachers')
    
    if (response.success && Array.isArray(response.data)) {
      teachers.value = response.data
    } else if (Array.isArray(response.teachers)) {
      teachers.value = response.teachers
    } else {
      showMessage('error', 'Format data guru tidak valid')
    }
  } catch (error) {
    console.error('Error fetching teachers:', error)
    showMessage('error', 'Gagal memuat data guru')
  }
}

async function fetchItems() {
  try {
    const response = await $fetch('/api/items?page=1&limit=1000')
    
    if (response.items) {
      items.value = response.items
    } else {
      showMessage('error', 'Gagal memuat data barang')
    }
  } catch (error) {
    console.error('Error fetching items:', error)
    showMessage('error', 'Gagal memuat data barang')
  }
}

// Submit form
async function submitForm() {
  // Validasi
  if (!form.teacherId || !form.itemId) {
    showMessage('error', 'Mohon lengkapi semua field yang wajib diisi')
    return
  }

  if (form.quantity < 1 || form.quantity > maxQuantity.value) {
    showMessage('error', `Jumlah harus antara 1 dan ${maxQuantity.value}`)
    return
  }

  // Validasi tanggal
  // const borrowedDate = new Date(form.borrowed_at)
  // const returnDate = new Date(form.return_date)
  
  // if (returnDate < borrowedDate) {
  //   showMessage('error', 'Waktu pengembalian tidak boleh lebih awal dari waktu peminjaman')
  //   return
  // }

  loading.value = true

  try {
    console.log('Submitting borrow...', {
      teacherId: form.teacherId,
      itemId: form.itemId,
      quantity: form.quantity,
      notes: form.notes
    })

    const response = await $fetch('/api/borrows', {
      method: 'POST',
      body: {
        teacher_id: form.teacherId,
        item_id: form.itemId,
        quantity: form.quantity,
        notes: form.notes || null
      }
    })

    console.log('Response:', response)

    if (response.success) {
      showMessage('success', 'Peminjaman berhasil dibuat!')
      
      resetForm()
      
      setTimeout(() => {
        navigateTo('/peminjaman')
      }, 2000)
    } else {
      showMessage('error', response.message || 'Gagal membuat peminjaman')
    }
  } catch (error) {
    console.error('Error creating borrow:', error)
    
    let errorMessage = 'Gagal membuat peminjaman'
    
    if (error.data?.message) {
      errorMessage = error.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    
    // Handle specific errors
    if (error.status === 422 || error.statusCode === 422) {
      errorMessage = 'Data yang dikirim tidak valid. Periksa kembali form Anda.'
    }
    
    showMessage('error', errorMessage)
  } finally {
    loading.value = false
  }
}

// Reset form
function resetForm() {  
  form.teacherId = ''
  form.itemId = ''
  form.quantity = 1
  form.notes = ''
}

// Handle cancel
function handleCancel() {
  if (loading.value) return
  
  const hasData = form.teacherId || form.itemId || form.notes
  
  if (hasData) {
    if (confirm('Data yang Anda masukkan akan hilang. Yakin ingin membatalkan?')) {
      navigateTo('/peminjaman')
    }
  } else {
    navigateTo('/peminjaman')
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
.crud-peminjaman-page {
  padding: 0;
  max-width: 1112px;
}

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

.form-group {
  margin-bottom: 24px;
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
  margin-left: 2px;
}

.form-group select,
.form-group input[type="number"],
.form-group input[type="datetime-local"],
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  color: #1F2937;
  background: #FFFFFF;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  outline: none;
  transition: all 0.3s ease;
}

.form-group select:focus,
.form-group input:focus,
.form-group textarea:focus {
  border-color: #264631;
  box-shadow: 0 0 0 3px rgba(38, 70, 49, 0.1);
}

.form-group select:disabled,
.form-group input:disabled,
.form-group textarea:disabled {
  background: #F9FAFB;
  cursor: not-allowed;
  opacity: 0.6;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.help-text {
  display: block;
  margin-top: 6px;
  color: #6B7280;
  font-size: 12px;
}

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
  min-width: 160px;
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