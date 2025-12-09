<template>
  <div class="dashboard-page">
    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Memuat data...</p>
    </div>

    <!-- Error -->
    <div v-if="error" class="error-message">
      <span>⚠️ {{ error }}</span>
      <button @click="loadData">Coba Lagi</button>
    </div>

    <!-- Content -->
    <div v-if="!loading && !error">
      <!-- Stats Cards -->
      <div class="stats-container">
        <div class="stats-grid">
          <div class="stat-card blue">
            <h2 class="stat-number">{{ stats.totalBarang }}</h2>
            <p class="stat-label">Total Barang</p>
          </div>

          <div class="stat-card yellow">
            <h2 class="stat-number">{{ stats.barangDipinjam }}</h2>
            <p class="stat-label">Barang Dipinjam</p>
          </div>

          <div class="stat-card green">
            <h2 class="stat-number">{{ stats.barangTersedia }}</h2>
            <p class="stat-label">Barang Tersedia</p>
          </div>

          <div class="stat-card pink">
            <h2 class="stat-number">{{ stats.barangTelat }}</h2>
            <p class="stat-label">Barang Telat</p>
          </div>
        </div>
      </div>

      <!-- Table Section -->
      <div class="table-section">
        <h5 class="table-title">Peminjaman Terbaru</h5>

        <div v-if="recentBorrowers.length === 0" class="no-data">
          Belum ada data peminjaman
        </div>

        <div v-else class="table-wrapper">
          <div class="table-header">
            <div class="table-header-row">
              <span>No.</span>
              <span>Nama Guru</span>
              <span>Nama Barang</span>
              <span>Jumlah</span>
              <span>Tanggal Pinjam</span>
              <span>Tanggal Kembali</span>
              <span>Status</span>
            </div>
          </div>

          <div class="table-body">
            <div 
              v-for="(item, index) in recentBorrowers" 
              :key="item.id" 
              class="table-row"
            >
              <span>{{ index + 1 }}</span>
              <span>{{ item.teacher?.name || '-' }}</span>
              <span>{{ item.item?.name || '-' }}</span>
              <span>{{ item.quantity }}</span>
              <span>{{ formatDate(item.borrowed_at) }}</span>
              <span>{{ formatDate(item.return_date) }}</span>
              <span>
                <span class="status-badge" :class="getStatusClass(item.status)">
                  {{ formatStatus(item.status) }}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'default',
  title: 'Dashboard'
})

const loading = ref(true)
const error = ref(null)

const stats = ref({
  totalBarang: 0,
  barangDipinjam: 0,
  barangTersedia: 0,
  barangTelat: 0
})

const recentBorrowers = ref([])

async function loadData() {
  loading.value = true
  error.value = null

  try {
    // 1. Fetch items
    const itemsRes = await $fetch('/api/items?page=1&limit=1000')
    
    console.log('Items Response:', itemsRes) // ✅ DEBUG
    
    // Hitung total barang
    const totalBarang = itemsRes.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
    
    // 2. Fetch borrows
    const borrowsRes = await $fetch('/api/borrows?page=1&limit=10')
    
    console.log('Borrows Response:', borrowsRes) // ✅ DEBUG
    
    // ⚠️ PENTING: Cek apakah ada .data atau langsung .borrows
    const borrows = borrowsRes.data?.borrows || borrowsRes.borrows || []
    
    // Hitung barang dipinjam (yang statusnya BORROWED)
    const activeBorrows = borrows.filter(b => b.status === 'BORROWED')
    const barangDipinjam = activeBorrows.reduce((sum, b) => sum + (b.quantity || 0), 0)
    
    // Hitung barang telat
    const now = new Date()
    const today = new Date().toDateString()
    const overdueBorrows = activeBorrows.filter(b => {
      const borrowDate = new Date(b.borrowed_at).toDateString()
      return borrowDate !== today
    })
    const barangTelat = overdueBorrows.reduce((sum, b) => sum + b.quantity, 0)

    
    // Update stats
    stats.value = {
      totalBarang,
      barangDipinjam,
      barangTersedia: totalBarang - barangDipinjam,
      barangTelat
    }
    
    // Recent borrowers
    recentBorrowers.value = borrows

  } catch (err) {
    console.error('Error loading dashboard:', err)
    error.value = `Gagal memuat data: ${err.message || 'Unknown error'}`
  } finally {
    loading.value = false
  }
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function formatStatus(status) {
  const statusMap = {
    'BORROWED': 'Dipinjam',
    'RETURNED': 'Dikembalikan',
    'OVERDUE': 'Terlambat'
  }
  return statusMap[status] || status
}

function getStatusClass(status) {
  const classMap = {
    'BORROWED': 'status-borrowed',
    'RETURNED': 'status-returned',
    'OVERDUE': 'status-overdue'
  }
  return classMap[status] || ''
}

onMounted(() => {
  loadData()
})
</script>

<style>
@import "~/assets/css/dashboard.css";

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background: #fee;
  color: #c00;
  padding: 20px;
  border-radius: 8px;
  margin: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-message button {
  padding: 8px 16px;
  background: #c00;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #999;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-borrowed {
  background: #fef3c7;
  color: #92400e;
}

.status-returned {
  background: #d1fae5;
  color: #065f46;
}
</style>