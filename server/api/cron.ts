import prisma from "~~/server/db/prisma"
import { WhatsAppService } from "./services/whatsapp.service"
import { BorrowStatus } from "@prisma/client"

const whatsappService = new WhatsAppService()

/**
 * Cron Job untuk kirim reminder 1 JAM sebelum deadline
 * Jalankan setiap 30 menit
 */
export async function sendReminderNotifications() {
    try {
        console.log('🔔 Running reminder cron job...')

        const now = new Date()
        
        // Cari peminjaman yang:
        // 1. Status BORROWED (belum dikembalikan)
        // 2. Deadline dalam 1 jam ke depan (antara sekarang dan 1 jam lagi)
        // 3. Belum pernah dikirimi reminder
        
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)
        const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000)

        const borrowsNeedingReminder = await prisma.borrow.findMany({
            where: {
                status: BorrowStatus.BORROWED,
                return_date: {
                    gte: thirtyMinutesFromNow, // minimal 30 menit lagi
                    lte: oneHourFromNow,        // maksimal 1 jam lagi
                },
                // Bisa tambah field reminder_sent: false jika mau track
            },
            include: {
                teacher: {
                    select: {
                        name: true,
                        class: true
                    }
                },
                item: {
                    select: {
                        name: true
                    }
                }
            }
        })

        console.log(`Found ${borrowsNeedingReminder.length} borrows needing reminder`)

        if (borrowsNeedingReminder.length === 0) {
            console.log('No reminders to send')
            return
        }

        // Kirim notifikasi ke semua admin
        const adminPhones = await whatsappService.getAllAdminPhones()

        for (const borrow of borrowsNeedingReminder) {
            console.log(`Sending reminder for borrow ${borrow.id}`)

            for (const phone of adminPhones) {
                await whatsappService.notifyReminder(phone, {
                    teacherName: borrow.teacher.name,
                    teacherClass: borrow.teacher.class || 'Tidak ada kelas',
                    itemName: borrow.item.name,
                    quantity: borrow.quantity,
                    deadline: borrow.return_date
                })
            }

            // Optional: Update database bahwa reminder sudah dikirim
            // await prisma.borrow.update({
            //     where: { id: borrow.id },
            //     data: { reminder_sent: true }
            // })
        }

        console.log('✅ Reminder notifications sent successfully')
    } catch (error) {
        console.error('❌ Error sending reminder notifications:', error)
    }
}

/**
 * Cron Job untuk kirim notifikasi telat
 * Jalankan setiap 1 jam
 */
export async function sendOverdueNotifications() {
    try {
        console.log('🚨 Running overdue cron job...')

        const now = new Date()

        // Cari peminjaman yang:
        // 1. Status BORROWED (belum dikembalikan)
        // 2. Sudah lewat deadline
        
        const overdueborrows = await prisma.borrow.findMany({
            where: {
                status: BorrowStatus.BORROWED,
                return_date: {
                    lt: now // deadline sudah lewat
                }
            },
            include: {
                teacher: {
                    select: {
                        name: true,
                        class: true
                    }
                },
                item: {
                    select: {
                        name: true
                    }
                }
            }
        })

        console.log(`Found ${overdueborrows.length} overdue borrows`)

        if (overdueborrows.length === 0) {
            console.log('No overdue borrows')
            return
        }

        // Kirim notifikasi ke semua admin
        const adminPhones = await whatsappService.getAllAdminPhones()

        for (const borrow of overdueborrows) {
            // Hitung berapa jam terlambat
            const overdueMs = now.getTime() - borrow.return_date.getTime()
            const overdueHours = Math.floor(overdueMs / (60 * 60 * 1000))

            console.log(`Sending overdue notification for borrow ${borrow.id} (${overdueHours} hours late)`)

            for (const phone of adminPhones) {
                await whatsappService.notifyOverdue(phone, {
                    teacherName: borrow.teacher.name,
                    teacherClass: borrow.teacher.class || 'Tidak ada kelas',
                    itemName: borrow.item.name,
                    quantity: borrow.quantity,
                    deadline: borrow.return_date,
                    overdueHours: overdueHours
                })
            }
        }

        console.log('✅ Overdue notifications sent successfully')
    } catch (error) {
        console.error('❌ Error sending overdue notifications:', error)
    }
}

/**
 * Setup cron jobs
 * Panggil fungsi ini di server startup
 */
export function setupCronJobs() {
    console.log('⏰ Setting up WhatsApp notification cron jobs...')

    // Reminder: setiap 30 menit (untuk catch window 1 jam sebelum deadline)
    setInterval(async () => {
        await sendReminderNotifications()
    }, 30 * 60 * 1000) // 30 menit

    // Overdue: setiap 1 jam
    setInterval(async () => {
        await sendOverdueNotifications()
    }, 60 * 60 * 1000) // 1 jam

    console.log('✅ Cron jobs configured:')
    console.log('   - Reminder: every 30 minutes')
    console.log('   - Overdue: every 1 hour')

    // Jalankan sekali saat startup (optional)
    setTimeout(async () => {
        console.log('Running initial cron check...')
        await sendReminderNotifications()
        await sendOverdueNotifications()
    }, 5000) // 5 detik setelah startup
}