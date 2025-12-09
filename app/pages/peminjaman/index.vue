<template> 
  <div class="borrow-page">
    <!-- Search and Add Button -->
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
      <button class="add-button" @click="openAddModal">
        <svg class="add-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Memuat data...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-message">
      <span>⚠️ {{ error }}</span>
      <button @click="loadBorrows">Coba Lagi</button>
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
        <div v-if="filteredBorrows.length === 0" class="no-data">
          <p>{{ searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada data peminjaman' }}</p>
        </div>

        <!-- Table Body -->
        <div v-else class="table-body">
          <div 
            v-for="(item, index) in paginatedBorrows" 
            :key="item.id" 
            class="table-row"
          >
            <span>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</span>
            <span>{{ item.item?.name || '-' }}</span>
            <span>{{ item.quantity }}</span>
            <span>
              <span class="status-badge" :class="getStatusClass(item)">
                {{ getStatusText(item) }}
              </span>
            </span>
            <span>{{ formatDate(item.borrowed_at) }}</span>
            <span>{{ formatDate(item.return_date) }}</span>
            <span>{{ item.teacher?.name || '-' }}</span>
            <span>{{ item.teacher?.class || '-' }}</span> 

          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination-wrapper">
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
import { ref, computed, onMounted, watch } from 'vue'

definePageMeta({
  layout: 'default',
  title: 'List Peminjaman Barang'
})

// State
const loading = ref(true)
const error = ref(null)
const returning = ref(false)
const borrows = ref([])
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 16

// Load data
async function loadBorrows() {
  loading.value = true
  error.value = null

  try {
    const response = await $fetch(`/api/borrows?page=${currentPage.value}&limit=${itemsPerPage}`)
    
    if (response.success) {
      borrows.value = response.data.borrows || []
    } else {
      error.value = 'Gagal memuat data peminjaman'
    }
  } catch (err) {
    console.error('Error loading borrows:', err)
    error.value = 'Gagal memuat data. Periksa koneksi ke server.'
  } finally {
    loading.value = false
  }
}

// **TAMBAHKAN DI SINI**
watch(currentPage, () => {
  loadBorrows()
})

watch(searchQuery, () => {
  currentPage.value = 1
  loadBorrows()
})

// Load saat halaman dibuka
onMounted(() => {
  loadBorrows()
})

// Filter berdasarkan search
const filteredBorrows = computed(() => {
  if (!searchQuery.value) return borrows.value

  const query = searchQuery.value.toLowerCase()
  return borrows.value.filter(item => {
    const itemName = item.item?.name?.toLowerCase() || ''
    const teacherName = item.teacher?.name?.toLowerCase() || ''
    
    return itemName.includes(query) || teacherName.includes(query)
  })
})

// Pagination
const totalPages = computed(() => {
  return Math.ceil(filteredBorrows.value.length / itemsPerPage)
})

const paginatedBorrows = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredBorrows.value.slice(start, end)
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

// Status helpers
function getStatusClass(item) {
  const now = new Date()
  const returnDate = new Date(item.return_date)
  
  if (item.status === 'RETURNED') return 'status-available'
  if (item.status === 'BORROWED' && returnDate < now) return 'status-telat'
  if (item.status === 'BORROWED') return 'status-dipinjam'
  
  return 'status-rusak'
}

function getStatusText(item) {
  const now = new Date()
  const returnDate = new Date(item.return_date)
  
  if (item.status === 'RETURNED') return 'Dikembalikan'
  if (item.status === 'BORROWED' && returnDate < now) return 'Terlambat'
  if (item.status === 'BORROWED') return 'Dipinjam'
  
  return 'Rusak'
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}


</script>

<style>
@import "~/assets/css/list-peminjaman.css";

/* ... style yang sudah ada tetap ... */

.text-success {
  color: #10b981;
  font-weight: 500;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>