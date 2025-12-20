<template>
  <div class="riwayat-page">
    <!-- Search Box -->
    <div class="top-actions">
      <div class="search-box">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          type="text" 
          placeholder="Cari nama barang, peminjam..." 
          v-model="searchQuery"
          @input="handleSearch"
        >
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Memuat data...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-message">
      <span>⚠️ {{ error }}</span>
      <button @click="loadHistory">Coba Lagi</button>
    </div>

    <!-- Table Section -->
    <div v-if="!loading && !error" class="table-section">
      <div class="table-wrapper">
        <!-- Table Header -->
        <div class="table-header">
          <div class="table-header-row">
            <span>No.</span>
            <span>Nama Barang</span>
            <span>Jumlah</span>
            <span>Status</span>
            <span>Tanggal Meminjam</span>
            <span>Tanggal Pengembalian</span>
            <span>Nama Peminjam</span>
            <span>Kelas</span> 
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredHistory.length === 0" class="no-data">
          <p>{{ searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada riwayat peminjaman' }}</p>
        </div>

        <!-- Table Body -->
        <div v-else class="table-body">
          <div 
            v-for="(item, index) in paginatedHistory" 
            :key="item.id" 
            class="table-row"
          >
            <span>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</span>
            <span>{{ item.item?.name || '-' }}</span>
            <span>{{ item.quantity }}</span>
            <span>
              <span class="status-badge status-returned">
                Dikembalikan
              </span>
            </span>
            <span>{{ formatDate(item.borrowed_at) }}</span>
            <span>{{ formatDate(item.actual_return_time) }}</span>
            <span>{{ item.teacher?.name || '-' }}</span>
            <span>{{ item.teacher?.class || '-' }}</span> 
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages => 1" class="pagination-wrapper">
        <button 
          class="pagination-btn" 
          :class="{ disabled: currentPage === 1 }"
          @click="prevPage"
          :disabled="currentPage === 1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
          </svg>
        </button>

        <button 
          v-for="page in visiblePages" 
          :key="page"
          class="pagination-btn" 
          :class="{ active: currentPage === page }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>

        <button 
          class="pagination-btn"
          :class="{ disabled: currentPage === totalPages }"
          @click="nextPage"
          :disabled="currentPage === totalPages"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

definePageMeta({
  layout: 'default',
  title: 'Riwayat Peminjaman'
})

// State
const loading = ref(true)
const error = ref(null)
const history = ref([])
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 15

// ✅ Load data dari API (filter RETURNED saja)
async function loadHistory() {
  loading.value = true
  error.value = null

  try {
    // Fetch semua borrows
    const response = await $fetch('/api/borrows?page=1&limit=1000')
    
    console.log('Borrows Response:', response) // Debug
    
    if (response.success) {
      const allBorrows = response.data.borrows || []
      
      // ✅ Filter hanya yang sudah RETURNED
      history.value = allBorrows.filter(item => item.status === 'RETURNED')
      
      console.log('Filtered History:', history.value) // Debug
    } else {
      error.value = 'Gagal memuat data riwayat'
    }
    
  } catch (err) {
    console.error('Error loading history:', err)
    error.value = 'Gagal memuat data. Periksa koneksi ke server.'
  } finally {
    loading.value = false
  }
}

// Filter berdasarkan search
const filteredHistory = computed(() => {
  if (!searchQuery.value) return history.value

  const query = searchQuery.value.toLowerCase()
  return history.value.filter(item => {
    const itemName = item.item?.name?.toLowerCase() || ''
    const teacherName = item.teacher?.name?.toLowerCase() || ''
    
    return itemName.includes(query) || teacherName.includes(query)
  })
})

// Pagination
const totalPages = computed(() => {
  return Math.ceil(filteredHistory.value.length / itemsPerPage)
})

const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredHistory.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  
  let startPage = Math.max(1, currentPage.value - 2)
  let endPage = Math.min(totalPages.value, startPage + maxVisible - 1)
  
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1)
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }
  
  return pages
})

// Pagination functions
function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

function goToPage(page) {
  currentPage.value = page
}

function handleSearch() {
  currentPage.value = 1
}

// Format date
function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

onMounted(() => {
  loadHistory()
})
</script>

<style scoped>
@import "~/assets/css/list-peminjaman.css";
/* .riwayat-page {
  padding: 0;
}

.top-actions {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 24px;
  max-width: 1112px;
}

.search-box {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border-radius: 10px;
  padding: 13px 18px;
  width: 100%;
  max-width: 971px;
  gap: 10px;
}

.search-icon {
  width: 24px;
  height: 24px;
  color: #264631;
  flex-shrink: 0;
}

.search-box input {
  border: none;
  outline: none;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: #264631;
  background: transparent;
  flex: 1;
}

.search-box input::placeholder {
  color: #9CA3AF;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #E5E7EB;
  border-top-color: #264631;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading p {
  color: #6B7280;
  font-size: 16px;
}

.error-message {
  background: #FEE2E2;
  border: 1px solid #FCA5A5;
  border-radius: 10px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  max-width: 1112px;
}

.error-message span {
  color: #991B1B;
  font-size: 14px;
}

.error-message button {
  background: #DC2626;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s ease;
}

.error-message button:hover {
  background: #B91C1C;
}

.no-data {
  background: #FFFFFF;
  padding: 40px 20px;
  text-align: center;
}

.no-data p {
  color: #6B7280;
  font-size: 16px;
  margin: 0;
}

.table-section {
  max-width: 1112px;
  width: 100%;
}

.table-wrapper {
  background: #FFFFFF;
  border-radius: 10px;
}

.table-header {
  background: #F7F7F7;
  padding: 8px 23px;
}

.riwayat-page .table-header-row {
  display: grid;
  grid-template-columns: 0.4fr 2fr 0.8fr 1.5fr 2fr 2fr 2fr;
  gap: 12px;
}

.table-header-row span {
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: #1F2937;
}

.table-body {
  background: #FFFFFF;
}

.riwayat-page .table-row {
  display: grid;
  grid-template-columns: 0.4fr 2fr 0.8fr 1.5fr 2fr 2fr 2fr;
  gap: 12px;
  padding: 13px 23px;
  border-bottom: 0.5px solid #E5E7EB;
  align-items: center;
  transition: background 0.2s ease;
}

.table-row:hover {
  background: #F9FAFB;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row span {
  font-weight: 400;
  font-size: 14px;
  line-height: 24px;
  color: #1F2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-returned {
  background: #d1fae5;
  color: #065f46;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
  padding: 20px 0;
}

.pagination-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #E5E7EB;
  background: #FFFFFF;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: 400;
  font-size: 14px;
  color: #374151;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(.disabled) {
  background: #F9FAFB;
  border-color: #264631;
}

.pagination-btn.active {
  background: #264631;
  color: #FFFFFF;
  border-color: #264631;
}

.pagination-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 1400px) {
  .riwayat-page .table-header-row,
  .riwayat-page .table-row {
    grid-template-columns: 0.3fr 1.8fr 0.7fr 1.3fr 1.8fr 1.8fr 1.8fr;
  }
}

@media (max-width: 768px) {
  .top-actions {
    width: 100%;
  }

  .search-box {
    max-width: 100%;
  }

  .riwayat-page .table-header-row,
  .riwayat-page .table-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .table-row span {
    white-space: normal;
  }
} */
</style>