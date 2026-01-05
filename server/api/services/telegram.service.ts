import prisma from "~~/server/db/prisma"
import 'dotenv/config';
import { TelegramMessage } from "../models/telegram.message";

export class TelegramService {
    private botToken: string
    private apiURL: string

        constructor() {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        console.log("token: ", token);
        if (!token) {
            throw new Error("TELEGRAM_BOT_TOKEN is not found");
        }
        this.botToken = token;
        this.apiURL = `https://api.telegram.org/bot${this.botToken}`;
    }

    async sendMessage(chatId: string, message: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.apiURL}/sendMessage`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: "Markdown",
                } as TelegramMessage),
            })

            const data = await response.json()

            if (!data.ok) {
                console.error("telegram API error: ", data)
                return false
            }

            return true
        } catch(error) {
            console.log("failed to send telegram message: ", error)
            return false
        }
    }

    async notifyRegistration(chatId: string, name: string, email: string): Promise<boolean> {
        const message = `🎉 *Selamat Datang di Sistem Inventaris!*

Halo *${name}*,

Akun Anda berhasil terdaftar! ✅

📧 Email: ${email}
📱 No. HP: [nomor tersembunyi]

Anda sekarang dapat mengelola peminjaman barang melalui sistem kami.

Terima kasih! 🙏`

        return await this.sendMessage(chatId, message)
    }

    async notifyLogin(chatId: string, name: string, email: string): Promise<boolean> {
        const message = `successfully logged in as ${name} with ${email}`
        return await this.sendMessage(chatId, message)
    }

    /**
     * Notifikasi saat peminjaman barang baru
     */
    async notifyNewBorrow(
        adminChatId: string,
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

        return await this.sendMessage(adminChatId, message)
    }

    /**
     * Notifikasi reminder 1 jam sebelum deadline
     */
    async notifyReminder(
        adminChatId: string,
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

        return await this.sendMessage(adminChatId, message)
    }

    /**
     * Notifikasi saat barang telat dikembalikan
     */
    async notifyOverdue(
        adminChatId: string,
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

        return await this.sendMessage(adminChatId, message)
    }

    /**
     * Notifikasi saat barang dikembalikan
     */
    async notifyReturn(
        adminChatId: string,
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

        return await this.sendMessage(adminChatId, message)
    }

    async getChatIdByPhone(phoneNumber: string): Promise<string | null> {
        try {
            const user = await prisma.admin.findFirst({
                where: {
                    phoneNumber
                },
                select: {
                    teleId: true
                },
            })

            return user?.teleId || null
        } catch(error) {
            console.log("failed to get chat id: ", error)
            return null
        }
    }

    /**
     * Dapatkan semua admin yang akan menerima notifikasi
     */
    async getAllAdminChatIds(): Promise<string[]> {
        try {
            const admins = await prisma.admin.findMany({
                select: {
                    teleId: true
                },
                where: {
                    teleId: {
                        not: null
                    }
                }
            })

            return admins.map(admin => admin.teleId).filter(id => id !== null) as string[]
        } catch (error) {
            console.error("Failed to get admin chat ids:", error)
            return []
        }
    }

    async storeChatId(phoneNumber: string, chatId: string): Promise<boolean> {
        try {
            await prisma.admin.update({
                where: {phoneNumber},
                data: { teleId: chatId}
            });

            return true
        } catch(error) {
            console.log("failed to store chat id: ", error)
            return false
        }
    }

    async setWebhook(webhookUrl: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.apiURL}/setWebhook`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({ url: webhookUrl }).toString()
            })

            const data = await response.json()
            console.log("telegram setWebhook response:", data)
            return data.ok
        } catch(error) {
            console.log("failed to set webhook: ", error)
            return false
        }
    }

    async processWebhookUpdate(update: any): Promise<void> {
        try {
            if (update.message && update.message.contact) {
                const phoneNumber = update.message.contact.phone_number;
                const chatId = update.message.chat.id.toString();

                await this.storeChatId(phoneNumber, chatId)

                await this.sendMessage(
                    chatId,
                    "your phone number has been linked successfully"
                )
            } else if (update.message && update.message.text === "/start") {
                const chatId = update.message.chat.id.toString()

                await this.sendMessage(
                    chatId,
                    "share your phone number to link your account"
                )
            }
        } catch(error) {
            console.log("failed to process webhook update: ", error)
        }
    }
}