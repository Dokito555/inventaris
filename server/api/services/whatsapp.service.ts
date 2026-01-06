import prisma from "~~/server/db/prisma"

export class WhatsAppService {
    private apiURL = 'https://api.fonnte.com/send'
    private apiToken: string
    private lastSentTime = 0
    private minDelay = 3000 // 3 detik minimum delay antar pesan

    constructor() {
        this.apiToken = process.env.FONNTE_TOKEN || ''
        
        if (!this.apiToken) {
            console.warn('⚠️ FONNTE_TOKEN not set. WhatsApp notifications disabled.')
        } else {
            console.log('✅ WhatsApp Service initialized (Fonnte)')
        }
    }

    /**
     * Anti-spam delay: tunggu minimal 3 detik sebelum kirim pesan berikutnya
     */
    private async waitForDelay() {
        const now = Date.now()
        const timeSinceLastSent = now - this.lastSentTime
        
        if (timeSinceLastSent < this.minDelay) {
            const waitTime = this.minDelay - timeSinceLastSent
            console.log(`⏳ Anti-spam delay: waiting ${waitTime}ms`)
            await new Promise(resolve => setTimeout(resolve, waitTime))
        }
        
        this.lastSentTime = Date.now()
    }

    /**
     * Format nomor telepon ke format WhatsApp
     * Contoh: 08123456789 -> 628123456789
     */
    private formatPhone(phone: string): string {
        let cleaned = phone.replace(/\D/g, '')
        
        if (cleaned.startsWith('0')) {
            cleaned = '62' + cleaned.substring(1)
        } else if (!cleaned.startsWith('62')) {
            cleaned = '62' + cleaned
        }
        
        return cleaned
    }

    /**
     * Kirim pesan WhatsApp dengan anti-spam delay
     */
    async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
        if (!this.apiToken) {
            console.log('❌ Fonnte token not configured')
            return false
        }

        try {
            // Anti-spam delay
            await this.waitForDelay()
            
            const target = this.formatPhone(phoneNumber)
            
            console.log('📤 Sending WhatsApp:', {
                to: target,
                preview: message.substring(0, 50) + '...'
            })

            const response = await fetch(this.apiURL, {
                method: 'POST',
                headers: {
                    'Authorization': this.apiToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    target,
                    message,
                    countryCode: '62'
                })
            })

            const data = await response.json()
            
            if (data.status === false) {
                console.error('❌ Fonnte error:', data)
                return false
            }

            console.log('✅ WhatsApp sent successfully')
            return true
            
        } catch (error) {
            console.error('❌ Failed to send WhatsApp:', error)
            return false
        }
    }

    /**
     * Notifikasi saat admin register
     */
    async notifyRegistration(phoneNumber: string, name: string, email: string): Promise<boolean> {
        const message = `🎉 *Registrasi Berhasil!*

Selamat datang *${name}*!

📧 Email: ${email}
✅ Akun Anda telah berhasil terdaftar di Sistem Inventaris.

Anda sekarang dapat login dan mengelola peminjaman barang.

Terima kasih! 🙏`

        return await this.sendMessage(phoneNumber, message)
    }

    /**
     * Notifikasi saat peminjaman barang baru
     */
    async notifyNewBorrow(
        adminPhone: string,
        borrowData: {
            teacherName: string,
            teacherClass: string,
            itemName: string,
            quantityBorrowed: number,
            remainingStock: number,
            deadline: Date,
            notes?: string
        }
    ): Promise<boolean> {
        const deadlineFormatted = borrowData.deadline.toLocaleString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })

        const notesText = borrowData.notes ? `\n📝 Catatan: ${borrowData.notes}` : ''

        const message = `📦 *PEMINJAMAN BARANG BARU*

👤 Peminjam: *${borrowData.teacherName}*
🏫 Kelas: ${borrowData.teacherClass}

📌 Barang: *${borrowData.itemName}*
📊 Jumlah Dipinjam: ${borrowData.quantityBorrowed}
📦 Sisa Stok: ${borrowData.remainingStock}

⏰ Deadline Pengembalian:
${deadlineFormatted}${notesText}

⚠️ Harap dikembalikan tepat waktu!`

        return await this.sendMessage(adminPhone, message)
    }

    /**
     * Notifikasi reminder 1 jam sebelum deadline
     */
    async notifyReminder(
        adminPhone: string,
        borrowData: {
            teacherName: string,
            teacherClass: string,
            itemName: string,
            quantity: number,
            deadline: Date
        }
    ): Promise<boolean> {
        const deadlineFormatted = borrowData.deadline.toLocaleString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        })

        const message = `⏰ *REMINDER PENGEMBALIAN*

*1 JAM LAGI!*

👤 Peminjam: ${borrowData.teacherName}
🏫 Kelas: ${borrowData.teacherClass}
📌 Barang: *${borrowData.itemName}*
📊 Jumlah: ${borrowData.quantity}

⏰ Deadline: Hari ini jam ${deadlineFormatted}

⚠️ Segera hubungi peminjam untuk mengembalikan barang!`

        return await this.sendMessage(adminPhone, message)
    }

    /**
     * Notifikasi saat barang telat dikembalikan
     */
    async notifyOverdue(
        adminPhone: string,
        borrowData: {
            teacherName: string,
            teacherClass: string,
            itemName: string,
            quantity: number,
            deadline: Date,
            overdueHours: number
        }
    ): Promise<boolean> {
        const deadlineFormatted = borrowData.deadline.toLocaleString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        })

        const message = `🚨 *BARANG TERLAMBAT!*

⚠️ Sudah ${borrowData.overdueHours} jam terlambat!

👤 Peminjam: ${borrowData.teacherName}
🏫 Kelas: ${borrowData.teacherClass}
📌 Barang: *${borrowData.itemName}*
📊 Jumlah: ${borrowData.quantity}

⏰ Seharusnya dikembalikan:
${deadlineFormatted}

🔴 SEGERA HUBUNGI PEMINJAM!`

        return await this.sendMessage(adminPhone, message)
    }

    /**
     * Notifikasi saat barang dikembalikan
     */
    async notifyReturn(
        adminPhone: string,
        returnData: {
            teacherName: string,
            teacherClass: string,
            itemName: string,
            quantity: number,
            borrowedAt: Date,
            returnedAt: Date,
            isLate: boolean
        }
    ): Promise<boolean> {
        const statusEmoji = returnData.isLate ? '⚠️' : '✅'
        const statusText = returnData.isLate ? 'TERLAMBAT' : 'TEPAT WAKTU'
        
        const borrowedFormatted = returnData.borrowedAt.toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        })
        
        const returnedFormatted = returnData.returnedAt.toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        })

        const message = `${statusEmoji} *BARANG DIKEMBALIKAN* - ${statusText}

👤 Peminjam: ${returnData.teacherName}
🏫 Kelas: ${returnData.teacherClass}
📌 Barang: *${returnData.itemName}*
📊 Jumlah: ${returnData.quantity}

📅 Dipinjam: ${borrowedFormatted}
✅ Dikembalikan: ${returnedFormatted}

Terima kasih! 🙏`

        return await this.sendMessage(adminPhone, message)
    }

    /**
     * Dapatkan semua admin yang akan menerima notifikasi
     */
    async getAllAdminPhones(): Promise<string[]> {
        try {
            const admins = await prisma.admin.findMany({
                select: {
                    phoneNumber: true
                },
                where: {
                    phoneNumber: {
                        not: ""
                    }
                }
            })

            const phones = admins
                .map(admin => admin.phoneNumber)
                .filter(phone => phone !== null) as string[]
            
            console.log(`📋 Found ${phones.length} admin phone numbers`)
            return phones
            
        } catch (error) {
            console.error("Failed to get admin phones:", error)
            return []
        }
    }

    /**
     * Test koneksi Fonnte
     */
    async testConnection(): Promise<boolean> {
        if (!this.apiToken) {
            console.error('❌ Fonnte token not configured')
            return false
        }

        try {
            console.log('🔍 Testing Fonnte connection...')
            
            const response = await fetch('https://api.fonnte.com/validate', {
                method: 'POST',
                headers: {
                    'Authorization': this.apiToken
                }
            })

            const data = await response.json()
            
            if (data.status === false) {
                console.error('❌ Fonnte validation failed:', data)
                return false
            }

            console.log('✅ Fonnte connection successful')
            console.log('📊 Device info:', data)
            return true
            
        } catch (error) {
            console.error('❌ Failed to connect to Fonnte:', error)
            return false
        }
    }
}