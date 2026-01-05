import prisma from "~~/server/db/prisma";
import { CreateBorrowDTO } from "../models/borrow.model";
import { BorrowStatus } from "@prisma/client";
import { WhatsAppService } from "./whatsapp.service";
import { TelegramService } from "./telegram.service";

const whatsappService = new WhatsAppService()
const telegramService = new TelegramService()

export async function createBorrow(data: CreateBorrowDTO) {
    console.log("create borrow received: ", data);
    const item = await prisma.item.findUnique({
        where: {
            id: data.itemId,
        },
    });

    if (!item) {
        throw new Error("item not found");
    }

    if (item.quantity < data.quantity) {
        throw new Error("not enough item available");
    }

    // ✅ Ambil data teacher untuk notifikasi
    const teacher = await prisma.teacher.findUnique({
        where: {
            id: data.teacherId
        },
        select: {
            name: true,
            class: true
        }
    })

    if (!teacher) {
        throw new Error("teacher not found");
    }

    const now = new Date();
    const returnDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const borrow = await prisma.$transaction(async (txt) => {
        await txt.item.update({
            where: {
                id: data.itemId,
            },
            data: {
                quantity: {
                    decrement: data.quantity,
                },
                available: item.quantity - data.quantity > 0,
            },
        });

        return await txt.borrow.create({
            data: {
                teacherId: data.teacherId,
                itemId: data.itemId,
                quantity: data.quantity,
                borrowed_at: now,
                return_date: returnDate,
                notes: data.notes,
                status: BorrowStatus.BORROWED,
            },
        });
    });

    // ✅ Kirim notifikasi WhatsApp ke SEMUA ADMIN
    try {
        const adminPhones = await whatsappService.getAllAdminPhones()
        
        console.log(`Sending borrow notification to ${adminPhones.length} admins`)

        // Hitung sisa stok setelah dipinjam
        const remainingStock = item.quantity - data.quantity

        for (const phone of adminPhones) {
            await whatsappService.notifyNewBorrow(phone, {
                teacherName: teacher.name,
                teacherClass: teacher.class || 'Tidak ada kelas',
                itemName: item.name,
                quantityBorrowed: data.quantity,
                remainingStock: remainingStock,
                deadline: returnDate,
                notes: data.notes
            })
        }

        console.log('WhatsApp borrow notifications sent successfully')
    } catch(error) {
        console.error('Failed to send WhatsApp borrow notification:', error)
        // Jangan throw error, biar peminjaman tetap berhasil meski notif gagal
    }

    // ✅ Kirim notifikasi Telegram ke SEMUA ADMIN
    try {
        const adminChatIds = await telegramService.getAllAdminChatIds()
        
        console.log(`Sending borrow notification to ${adminChatIds.length} admins via Telegram`)

        // Hitung sisa stok setelah dipinjam
        const remainingStock = item.quantity - data.quantity

        for (const chatId of adminChatIds) {
            await telegramService.notifyNewBorrow(chatId, {
                teacherName: teacher.name,
                teacherClass: teacher.class || 'Tidak ada kelas',
                itemName: item.name,
                quantityBorrowed: data.quantity,
                remainingStock: remainingStock,
                deadline: returnDate,
                notes: data.notes
            })
        }

        console.log('Telegram borrow notifications sent successfully')
    } catch(error) {
        console.error('Failed to send Telegram borrow notification:', error)
        // Jangan throw error, biar peminjaman tetap berhasil meski notif gagal
    }

    return borrow;
}

export async function returnItem(id: string) {
    console.log("return item received: ", id);

    return await prisma.$transaction(async (tx) => {
        const borrow = await tx.borrow.findUnique({
            where: { id },
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
        });

        if (!borrow) {
            throw new Error("borrow not found");
        }

        if (borrow.status === BorrowStatus.RETURNED) {
            throw new Error("item already returned");
        }

        const returnTime = new Date()

        // ✅ 1. Tambah stok item
        await tx.item.update({
            where: {
                id: borrow.itemId,
            },
            data: {
                quantity: {
                    increment: borrow.quantity,
                },
                available: true,
            },
        });

        // ✅ 2. Update status borrow
        const updatedBorrow = await tx.borrow.update({
            where: { id },
            data: {
                status: BorrowStatus.RETURNED,
                actual_return_time: returnTime,
            },
        });

        // ✅ 3. Kirim notifikasi WhatsApp ke SEMUA ADMIN
        try {
            const adminPhones = await whatsappService.getAllAdminPhones()
            
            console.log(`Sending return notification to ${adminPhones.length} admins`)

            // Cek apakah terlambat
            const isLate = returnTime > borrow.return_date

            for (const phone of adminPhones) {
                await whatsappService.notifyReturn(phone, {
                    teacherName: borrow.teacher.name,
                    teacherClass: borrow.teacher.class || 'Tidak ada kelas',
                    itemName: borrow.item.name,
                    quantity: borrow.quantity,
                    borrowedAt: borrow.borrowed_at,
                    returnedAt: returnTime,
                    isLate: isLate
                })
            }

            console.log('WhatsApp return notifications sent successfully')
        } catch(error) {
            console.error('Failed to send WhatsApp return notification:', error)
            // Jangan throw error, biar pengembalian tetap berhasil meski notif gagal
        }

        // ✅ 4. Kirim notifikasi Telegram ke SEMUA ADMIN
        try {
            const adminChatIds = await telegramService.getAllAdminChatIds()
            
            console.log(`Sending return notification to ${adminChatIds.length} admins via Telegram`)

            // Cek apakah terlambat
            const isLate = returnTime > borrow.return_date

            for (const chatId of adminChatIds) {
                await telegramService.notifyReturn(chatId, {
                    teacherName: borrow.teacher.name,
                    teacherClass: borrow.teacher.class || 'Tidak ada kelas',
                    itemName: borrow.item.name,
                    quantity: borrow.quantity,
                    borrowedAt: borrow.borrowed_at,
                    returnedAt: returnTime,
                    isLate: isLate
                })
            }

            console.log('Telegram return notifications sent successfully')
        } catch(error) {
            console.error('Failed to send Telegram return notification:', error)
            // Jangan throw error, biar pengembalian tetap berhasil meski notif gagal
        }

        return updatedBorrow;
    });
}

export async function getAllBorrows(limit: number, page: number) {
    console.log("get all borrows received: ", { limit, page });
    const skip = (page - 1) * limit;

    const [borrows, total] = [
        await prisma.borrow.findMany({
            skip,
            take: limit,
            orderBy: {
                borrowed_at: "desc",
            },
            include: {
                teacher: {
                    select: {
                        name: true,
                        class: true,
                    },
                },
                item: {
                    select: {
                        name: true,
                    },
                },
            },
        }),
        await prisma.borrow.count()
    ];

    return {
        borrows,
        total,
        page,
        limit,
        totalPages: Math.ceil(total/limit)
    }
}