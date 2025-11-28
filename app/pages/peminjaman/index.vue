<template>
  <!-- {{-- Search and Add Button --}} -->
    <div class="top-actions">
        <div class="search-box">
            <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search">
        </div>
        <button class="add-button">
            <svg class="add-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
        </button>
    </div>

    <!-- {{-- Table Section --}} -->
    <div class="table-section">
        <div class="table-wrapper">
            <!-- {{-- Table Header --}} -->
            <div class="table-header">
                <div class="table-header-row">
                    <span>No.</span>
                    <span>Nama Barang</span>
                    <span>Status Barang</span>
                    <span>Tanggal Meminjam</span>
                    <span>Tanggal Pengembalian</span>
                    <span>Nama Peminjam</span>
                    <span>Kelas</span>
                </div>
            </div>

            <!-- {{-- Table Body --}} -->
            <div class="table-body">
                <div class="table-row">
                    <span>1</span>
                    <span>NVIDIA HGX H100</span>
                    <span><span class="status-badge status-dipinjam">Dipinjam</span></span>
                    <span>Oct 8, 2025</span>
                    <span>Oct 15, 2025</span>
                    <span>John Doe</span>
                    <span>10 TKJ</span>
                </div>

                <div class="table-row">
                    <span>2</span>
                    <span>NVIDIA HGX H100</span>
                    <span><span class="status-badge status-available">Available</span></span>
                    <span>Oct 8, 2025</span>
                    <span>Oct 15, 2025</span>
                    <span>John Doe</span>
                    <span>11 TKJ 2</span>
                </div>

                <div class="table-row">
                    <span>3</span>
                    <span>Fiber Optic 2m</span>
                    <span><span class="status-badge status-available">Available</span></span>
                    <span>Oct 8, 2025</span>
                    <span>Oct 15, 2025</span>
                    <span>John Doe</span>
                    <span>12</span>
                </div>

                <div class="table-row">
                    <span>4</span>
                    <span>Firewall A</span>
                    <span><span class="status-badge status-dipinjam">Dipinjam</span></span>
                    <span>Oct 8, 2025</span>
                    <span>Oct 15, 2025</span>
                    <span>John Doe</span>
                    <span>12</span>
                </div>

                <div class="table-row">
                    <span>5</span>
                    <span>Fiber Optic 2m</span>
                    <span><span class="status-badge status-telat">Telat</span></span>
                    <span>Oct 8, 2025</span>
                    <span>Oct 15, 2025</span>
                    <span>John Doe</span>
                    <span>11</span>
                </div>

                <div class="table-row">
                    <span>6</span>
                    <span>Monitor 14inch</span>
                    <span><span class="status-badge status-telat">Telat</span></span>
                    <span>Oct 8, 2025</span>
                    <span>Oct 15, 2025</span>
                    <span>John Doe</span>
                    <span>10</span>
                </div>

                <div class="table-row">
                    <span>7</span>
                    <span>Monitor 14inch</span>
                    <span><span class="status-badge status-available">Available</span></span>
                    <span>Oct 8, 2025</span>
                    <span>Oct 15, 2025</span>
                    <span>John Doe</span>
                    <span>12</span>
                </div>

                <div class="table-row">
                    <span>8</span>
                    <span>Monitor 14inch</span>
                    <span><span class="status-badge status-rusak">Rusak</span></span>
                    <span>Oct 8, 2025</span>
                    <span>Oct 15, 2025</span>
                    <span>John Doe</span>
                    <span>10</span>
                </div>

                <div class="table-row">
                    <span>9</span>
                    <span>Monitor 14inch</span>
                    <span><span class="status-badge status-dipinjam">Dipinjam</span></span>
                    <span>Oct 8, 2025</span>
                    <span>Oct 15, 2025</span>
                    <span>John Doe</span>
                    <span>11</span>
                </div>

                <div class="table-row">
                    <span>10</span>
                    <span>Fiber Optic 2m</span>
                    <span><span class="status-badge status-dipinjam">Dipinjam</span></span>
                    <span>Oct 8, 2025</span>
                    <span>Oct 15, 2025</span>
                    <span>John Doe</span>
                    <span>11</span>
                </div>

                <div class="table-row">
                    <span>11</span>
                    <span>Fiber Optic 2m</span>
                    <span><span class="status-badge status-available">Available</span></span>
                    <span>Oct 8, 2025</span>
                    <span>Oct 15, 2025</span>
                    <span>John Doe</span>
                    <span>12</span>
                </div>

                <div class="table-row">
                    <span>12</span>
                    <span>NVIDIA HGX H100</span>
                    <span><span class="status-badge status-dipinjam">Dipinjam</span></span>
                    <span>Oct 8, 2025</span>
                    <span>Oct 15, 2025</span>
                    <span>John Doe</span>
                    <span>11</span>
                </div>

                <div class="table-row">
                    <span>13</span>
                    <span>Firewall A</span>
                    <span><span class="status-badge status-dipinjam">Dipinjam</span></span>
                    <span>Oct 8, 2025</span>
                    <span>Oct 15, 2025</span>
                    <span>John Doe</span>
                    <span>10</span>
                </div>

                <div class="table-row">
                    <span>14</span>
                    <span>Firewall A</span>
                    <span><span class="status-badge status-available">Available</span></span>
                    <span>Oct 8, 2025</span>
                    <span>Oct 15, 2025</span>
                    <span>John Doe</span>
                    <span>10</span>
                </div>

                <div class="table-row">
                    <span>15</span>
                    <span>Firewall A</span>
                    <span><span class="status-badge status-available">Available</span></span>
                    <span>Oct 8, 2025</span>
                    <span>Oct 15, 2025</span>
                    <span>John Doe</span>
                    <span>10</span>
                </div>

                <div class="table-row">
                    <span>16</span>
                    <span>Firewall A</span>
                    <span><span class="status-badge status-telat">Telat</span></span>
                    <span>Oct 8, 2025</span>
                    <span>Oct 15, 2025</span>
                    <span>John Doe</span>
                    <span>11</span>
                </div>
            </div>
        </div>

        <!-- {{-- Pagination --}} -->
        <div class="pagination-wrapper">
            <button class="pagination-btn disabled">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                    viewBox="0 0 16 16">
                    <path fill-rule="evenodd"
                        d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
                </svg>
            </button>

            <button class="pagination-btn active">1</button>
            <button class="pagination-btn">2</button>
            <button class="pagination-btn">3</button>
            <button class="pagination-btn">4</button>
            <span class="pagination-dots">...</span>
            <button class="pagination-btn">10</button>

            <button class="pagination-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                    viewBox="0 0 16 16">
                    <path fill-rule="evenodd"
                        d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
                </svg>
            </button>
        </div>
    </div>
</template>

<script setup>
definePageMeta({
// middleware: ['auth'],
  layout: 'default',
  title: 'List Peminjaman Barang'
})
</script>

<style>
@import "~/assets/css/list-peminjaman.css";
</style>