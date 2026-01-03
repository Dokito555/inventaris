import prisma from "~~/server/db/prisma"

export class WhatsAppService {
    private wahaURL: string
    private sessionName: string
    private apiKey: string
    

    constructor() {
        this.wahaURL = process.env.WAHA_URL || "http://localhost:3000"
        this.sessionName = process.env.WAHA_SESSION || "default"
        this.apiKey = process.env.WAHA_API_KEY || ""

        if (!this.apiKey) {
            throw new Error("WAHA_API_KEY is missing. Set it in .env")
        }

        console.log("WhatsApp Service initialized:", {
        wahaURL: this.wahaURL,
        sessionName: this.sessionName,
        hasApiKey: !!this.apiKey
        })
    }

    private wahaHeaders(extra: Record<string, string> = {}) {
    return {
      "X-Api-Key": this.apiKey,          // <-- penting
      ...extra,
        }
    }

    /**
     * Format nomor telepon ke format WhatsApp
     * Contoh: 08123456789 -> 628123456789@c.us
     */
    private formatPhoneNumber(phoneNumber: string): string {
        // Hapus semua karakter non-digit
        let cleaned = phoneNumber.replace(/\D/g, '')
        
        // Jika diawali 0, ganti dengan 62
        if (cleaned.startsWith('0')) {
            cleaned = '62' + cleaned.substring(1)
        }
        
        // Jika belum ada 62, tambahkan
        if (!cleaned.startsWith('62')) {
            cleaned = '62' + cleaned
        }
        
        // Tambahkan suffix WhatsApp
        return `${cleaned}@c.us`
    }

    /**
     * Kirim pesan WhatsApp
     */
    async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
        try {
            const chatId = this.formatPhoneNumber(phoneNumber)
            
            console.log("Sending WhatsApp message:", {
                phoneNumber,
                chatId,
                messagePreview: message.substring(0, 50)
            })

            const response = await fetch(`${this.wahaURL}/api/sendText`, {
                method: "POST",
                headers: this.wahaHeaders({
                    "Content-Type": "application/json",
                }),
                body: JSON.stringify({
                    session: this.sessionName,
                    chatId,
                    text: message,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                console.error("WAHA API error:", data)
                return false
            }

            console.log("WhatsApp message sent successfully:", data)
            return true
        } catch (error) {
            console.error("Failed to send WhatsApp message:", error)
            return false
        }
    }

    /**
     * Notifikasi saat admin register
     */
    async notifyRegistration(phoneNumber: string, name: string, email: string): Promise<boolean> {
        const message = `🎉 *Selamat Datang di Sistem Inventaris!*

Halo *${name}*,

Akun Anda berhasil terdaftar! ✅

📧 Email: ${email}
📱 No. HP: ${phoneNumber}

Anda sekarang dapat mengelola peminjaman barang melalui sistem kami.

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
     * Test koneksi WAHA
     */
    async testConnection(): Promise<boolean> {
    try {
        const response = await fetch(`${this.wahaURL}/api/sessions/`, {
        method: "GET",
        headers: this.wahaHeaders(),
        })

        if (!response.ok) {
        const text = await response.text().catch(() => "")
        console.error("WAHA connection failed:", response.status, text)
        return false
        }

        const sessions = await response.json()
        console.log("WAHA sessions:", sessions)
        return true
    } catch (error) {
        console.error("Failed to connect to WAHA:", error)
        return false
    }
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

            return admins.map(admin => admin.phoneNumber).filter(phone => phone !== null) as string[]
        } catch (error) {
            console.error("Failed to get admin phones:", error)
            return []
        }
    }
}