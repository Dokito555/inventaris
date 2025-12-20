<template>
  <div class="kelas-page">
    <div class="top-actions">
      <div class="search-box">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search"
          @input="debouncedSearch"
        >
      </div>
    </div>

    <div class="table-section">
      <div v-if="loading" class="loading-state">
        Loading...
      </div>

      <div v-else-if="error" class="error-state">
        {{ error }}
      </div>

      <div v-else class="table-wrapper">
        <div class="table-header">
          <div class="table-header-row guru-grid">
            <span>No.</span>
            <span>Nama Guru</span>
            <span>Kelas</span>
            <span>Aksi</span>
          </div>
        </div>

        <div class="table-body">
          <div v-if="filteredTeachers.length === 0" class="empty-state">
            Tidak ada data guru
          </div>
          <div v-else v-for="(guru, index) in filteredTeachers" :key="guru.id" class="table-row guru-grid">
            <span>{{ (currentPage - 1) * limit + index + 1 }}</span>
            <span>{{ guru.name }}</span>
            <span>{{ guru.class || '-' }}</span>
            <span class="action-buttons">
              <button @click="editTeacher(guru)" class="btn-edit">Edit</button>
              <button @click="deleteTeacherConfirm(guru.id)" class="btn-delete">Hapus</button>
            </span>
          </div>
        </div>
      </div>

      <div v-if="!loading && !error" class="pagination-wrapper">
        <button 
          class="pagination-btn" 
          :class="{ disabled: currentPage === 1 }"
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fill-rule="evenodd"
              d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
          </svg>
        </button>

        <button 
          v-for="page in visiblePages" 
          :key="page"
          class="pagination-btn" 
          :class="{ active: currentPage === page }"
          @click="changePage(page)"
        >
          {{ page }}
        </button>

        <span v-if="totalPages > 5" class="pagination-dots">...</span>

        <button 
          class="pagination-btn"
          :class="{ disabled: currentPage === totalPages }"
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fill-rule="evenodd"
              d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
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
  title: 'Daftar Guru'
})

// State
const teachers = ref([])
const loading = ref(false)
const error = ref(null)
const currentPage = ref(1)
const limit = ref(10)
const totalPages = ref(1)
const total = ref(0)
const searchQuery = ref('')
let searchTimeout = null

// Computed
const filteredTeachers = computed(() => {
  if (!searchQuery.value) return teachers.value
  
  const query = searchQuery.value.toLowerCase()
  return teachers.value.filter(teacher => 
    teacher.name.toLowerCase().includes(query) ||
    (teacher.class && teacher.class.toLowerCase().includes(query))
  )
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  
  if (totalPages.value <= maxVisible) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    if (currentPage.value <= 3) {
      for (let i = 1; i <= 4; i++) {
        pages.push(i)
      }
    } else if (currentPage.value >= totalPages.value - 2) {
      for (let i = totalPages.value - 3; i <= totalPages.value; i++) {
        pages.push(i)
      }
    } else {
      for (let i = currentPage.value - 1; i <= currentPage.value + 1; i++) {
        pages.push(i)
      }
    }
  }
  
  return pages
})

// Methods
async function fetchTeachers() {
  loading.value = true
  error.value = null
  
  try {
    const response = await $fetch('/api/teachers', {
      params: {
        page: currentPage.value,
        limit: limit.value
      }
    })
    
    teachers.value = response.teachers
    total.value = response.total
    totalPages.value = response.totalPages
  } catch (e) {
    error.value = 'Gagal memuat data guru. Silakan coba lagi.'
    console.error('Fetch teachers error:', e)
  } finally {
    loading.value = false
  }
}

function changePage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchTeachers()
}

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    // Search is done client-side on filtered data
    // If you want server-side search, modify the API and add search param
  }, 300)
}

function editTeacher(teacher) {
  // Implement edit functionality
  console.log('Edit teacher:', teacher)
  // You can navigate to edit page or open modal
  // navigateTo(`/guru/edit/${teacher.id}`)
}

async function deleteTeacherConfirm(teacherId) {
  if (!confirm('Apakah Anda yakin ingin menghapus guru ini?')) return
  
  loading.value = true
  try {
    await $fetch(`/api/teachers/${teacherId}`, {
      method: 'DELETE'
    })
    
    // Refresh data after delete
    await fetchTeachers()
    alert('Guru berhasil dihapus')
  } catch (e) {
    error.value = 'Gagal menghapus guru. Silakan coba lagi.'
    console.error('Delete teacher error:', e)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchTeachers()
})

// Watch for page changes
watch(currentPage, () => {
  fetchTeachers()
})
</script>

<style scoped>
@import "~/assets/css/list-peminjaman.css";

.guru-grid {
  display: grid;
  grid-template-columns: 60px 2fr 1fr 1fr;
  align-items: center;
  gap: 1rem;
}

.guru-grid span {
  width: auto;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-edit,
.btn-delete {
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.btn-edit {
  background-color: #3b82f6;
  color: white;
}

.btn-edit:hover {
  background-color: #2563eb;
}

.btn-delete {
  background-color: #ef4444;
  color: white;
}

.btn-delete:hover {
  background-color: #dc2626;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.error-state {
  color: #ef4444;
}

.pagination-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>