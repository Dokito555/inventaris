<template>
  <div class="crud-peminjaman-page">
    <!-- Form Section -->
    <div class="form-container">
      <div class="form-header">
        <h2>{{ isEditMode ? 'Edit Peminjaman' : 'Tambah Peminjaman Baru' }}</h2>
      </div>

      <form @submit.prevent="submitForm">
        <!-- Nama Peminjam -->
        <div class="form-group">
          <label for="peminjam">Nama Peminjam</label>
          <select
            id="peminjam"
            v-model="form.user_id"
            required
            :disabled="isEditMode"
          >
            <option value="" disabled>Pilih Peminjam</option>
            <option 
              v-for="user in users" 
              :key="user.id" 
              :value="user.id"
            >
              {{ user.name }} - {{ user.role }}
            </option>
          </select>
        </div>

        <!-- Barang yang Dipinjam -->
        <div class="form-group">
          <label for="barang">Barang yang Dipinjam</label>
          <select
            id="barang"
            v-model="form.item_id"
            required
            :disabled="isEditMode"
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
        </div>

        <!-- Jumlah Dipinjam -->
        <div class="form-group">
          <label for="quantity">Jumlah Dipinjam</label>
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
              :max="maxQuantity"
              min="1"
              required
            >
            <button 
              type="button" 
              class="qty-btn"
              @click="incrementQuantity"
              :disabled="form.quantity >= maxQuantity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
              </svg>
            </button>
          </div>
          <small class="hint-text">
            Maksimal: {{ maxQuantity }} barang
          </small>
        </div>

        <!-- Tanggal Peminjaman -->
        <div class="form-group">
          <label for="borrow_date">Tanggal Peminjaman</label>
          <input
            id="borrow_date"
            type="date"
            v-model="form.borrow_date"
            required
            :disabled="isEditMode"
          >
        </div>

        <!-- Tanggal Pengembalian -->
        <div class="form-group">
          <label for="return_date">Tanggal Pengembalian</label>
          <input
            id="return_date"
            type="date"
            v-model="form.return_date"
            required
            :min="form.borrow_date"
          >
        </div>

        <!-- Status Peminjaman -->
        <div class="form-group">
          <label>Status Peminjaman</label>
          <div class="status-buttons">
            <button 
              type="button"
              class="status-btn"
              :class="{ active: form.status === 'pending' }"
              @click="form.status = 'pending'"
            >
              Menunggu
            </button>
            <button 
              type="button"
              class="status-btn"
              :class="{ active: form.status === 'approved' }"
              @click="form.status = 'approved'"
            >
              Disetujui
            </button>
            <button 
              type="button"
              class="status-btn"
              :class="{ active: form.status === 'borrowed' }"
              @click="form.status = 'borrowed'"
            >
              Dipinjam
            </button>
            <button 
              type="button"
              class="status-btn"
              :class="{ active: form.status === 'returned' }"
              @click="form.status = 'returned'"
            >
              Dikembalikan
            </button>
            <button 
              type="button"
              class="status-btn"
              :class="{ active: form.status === 'rejected' }"
              @click="form.status = 'rejected'"
            >
              Ditolak
            </button>
          </div>
        </div>

        <!-- Keterangan -->
        <div class="form-group">
          <label for="notes">Keterangan (Opsional)</label>
          <textarea
            id="notes"
            v-model="form.notes"
            placeholder="Tambahkan catatan jika diperlukan..."
            rows="4"
          ></textarea>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button 
            type="button" 
            class="btn-cancel"
            @click="navigateTo('/peminjaman')"
          >
            Batal
          </button>
          <button 
            v-if="isEditMode && form.status === 'pending'"
            type="button" 
            class="btn-delete"
            @click="confirmDelete"
          >
            Hapus
          </button>
          <button 
            type="submit" 
            class="btn-submit"
            :disabled="loading"
          >
            {{ loading ? 'Menyimpan...' : (isEditMode ? 'Update' : 'Simpan') }}
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

definePageMeta({
  layout: 'default',
  title: 'Peminjaman Barang'
})

// State
const loading = ref(false)
const users = ref([])
const items = ref([])
const isEditMode = ref(false)
const message = reactive({
  show: false,
  type: 'success',
  text: ''
})

const form = reactive({
  user_id: '',
  item_id: '',
  quantity: 1,
  borrow_date: '',
  return_date: '',
  status: 'pending',
  notes: ''
})

// Computed Properties
const maxQuantity = computed(() => {
  if (!form.item_id) return 1
  const selectedItem = items.value.find(item => item.id === form.item_id)
  return selectedItem ? selectedItem.quantity : 1
})

const availableItems = computed(() => {
  return items.value.filter(item => item.status === 'available')
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

// Fetch data
async function fetchUsers() {
  try {
    const response = await $fetch('/api/users')
    users.value = response.data || []
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

async function fetchItems() {
  try {
    const response = await $fetch('/api/items')
    items.value = response.data || []
  } catch (error) {
    console.error('Error fetching items:', error)
  }
}

async function fetchBorrowing(id) {
  try {
    const response = await $fetch(`/api/borrowings/${id}`)
    Object.assign(form, response.data)
  } catch (error) {
    console.error('Error fetching borrowing:', error)
    showMessage('error', 'Gagal memuat data peminjaman')
  }
}

// Submit form
async function submitForm() {
  loading.value = true

  try {
    const url = isEditMode.value 
      ? `/api/borrowings/${route.params.id}`
      : '/api/borrowings'
    
    const method = isEditMode.value ? 'PUT' : 'POST'

    const response = await $fetch(url, {
      method,
      body: form
    })

    if (response.success) {
      showMessage('success', 
        isEditMode.value 
          ? 'Peminjaman berhasil diupdate!' 
          : 'Peminjaman berhasil dibuat!'
      )
      
      // Redirect setelah 2 detik
      setTimeout(() => {
        navigateTo('/peminjaman')
      }, 2000)
    }
  } catch (error) {
    console.error('Error saving borrowing:', error)
    showMessage('error', error.data?.message || 
      (isEditMode.value ? 'Gagal update peminjaman' : 'Gagal membuat peminjaman')
    )
  } finally {
    loading.value = false
  }
}

// Delete borrowing
async function deleteBorrowing() {
  try {
    const response = await $fetch(`/api/borrowings/${route.params.id}`, {
      method: 'DELETE'
    })

    if (response.success) {
      showMessage('success', 'Peminjaman berhasil dihapus!')
      setTimeout(() => {
        navigateTo('/peminjaman')
      }, 2000)
    }
  } catch (error) {
    console.error('Error deleting borrowing:', error)
    showMessage('error', 'Gagal menghapus peminjaman')
  }
}

function confirmDelete() {
  if (confirm('Apakah Anda yakin ingin menghapus peminjaman ini?')) {
    deleteBorrowing()
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

// Initialize
onMounted(async () => {
  await Promise.all([fetchUsers(), fetchItems()])
  
  // Set default dates
  const today = new Date().toISOString().split('T')[0]
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0]
  
  form.borrow_date = today
  form.return_date = nextWeek

  // Check if edit mode
  if (route.params.id) {
    isEditMode.value = true
    await fetchBorrowing(route.params.id)
  }
})
</script>

<style scoped>
/* Main Container */
.crud-peminjaman-page {
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

.form-group select,
.form-group input[type="text"],
.form-group input[type="date"],
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

.form-group select:focus,
.form-group input[type="text"]:focus,
.form-group input[type="date"]:focus,
.form-group input[type="number"]:focus,
.form-group textarea:focus {
  border-color: #264631;
}

.form-group select:disabled,
.form-group input:disabled {
  background: #F9FAFB;
  cursor: not-allowed;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.hint-text {
  display: block;
  margin-top: 4px;
  color: #6B7280;
  font-size: 14px;
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
  padding: 0;
  -moz-appearance: textfield;
}

.quantity-control input[type="number"]::-webkit-outer-spin-button,
.quantity-control input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
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

/* Status colors */
.status-btn.active:nth-child(1) { /* pending */
  background: #FEF3C7;
  color: #92400E;
  border-color: #FEF3C7;
}

.status-btn.active:nth-child(2) { /* approved */
  background: #264631;
  color: #FFFFFF;
  border-color: #264631;
}

.status-btn.active:nth-child(3) { /* borrowed */
  background: #DBEAFE;
  color: #1E40AF;
  border-color: #DBEAFE;
}

.status-btn.active:nth-child(4) { /* returned */
  background: #D1FAE5;
  color: #065F46;
  border-color: #D1FAE5;
}

.status-btn.active:nth-child(5) { /* rejected */
  background: #FEE2E2;
  color: #991B1B;
  border-color: #FEE2E2;
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

.btn-delete {
  background: #FEE2E2;
  color: #DC2626;
  border: 1px solid #FCA5A5;
}

.btn-delete:hover {
  background: #FECACA;
  border-color: #F87171;
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
}
</style>