import prisma from "~~/server/db/prisma";
import { hashPassword, verifyPassword } from "../utils/password";
import {
  validateEmail,
  validatePassword,
  validatePhoneNumber,
} from '../validators/validation'
import { TelegramService } from "./telegram.service";
import { WhatsAppService } from "./whatsapp.service";

const telegramService = new TelegramService()
const whatsappService = new WhatsAppService()

export async function register(
    email: string,
    password: string,
    name: string,
    phoneNumber: string,
    teleId?: string
) {
    // Validasi format
    if (!validateEmail(email)) {
        throw new Error("Format email tidak valid");
    }

    if (!validatePhoneNumber(phoneNumber)){
        throw new Error("Format nomor telepon tidak valid")
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        throw new Error(passwordValidation.message);
    }

    // ✅ Cek email sudah terdaftar
    const existingUser = await prisma.admin.findFirst({
        where: {
            email: email
        },
    });

    if (existingUser) {
        throw new Error("Email sudah terdaftar");
    }

    // ✅ Cek nomor telepon sudah terdaftar
    const existingPhone = await prisma.admin.findFirst({
        where: {
            phoneNumber: phoneNumber
        },
    });

    if (existingPhone) {
        throw new Error("Nomor telepon sudah terdaftar");
    }

    // ✅ Cek telegram ID sudah terdaftar (jika diisi)
    if (teleId) {
        const existingTeleId = await prisma.admin.findFirst({
            where: {
                teleId: teleId
            },
        });

        if (existingTeleId) {
            throw new Error("ID Telegram sudah terdaftar");
        }
    }

    const hashedPassword = await hashPassword(password);
    console.log("DEBUG PRISMA DATA:", { email, name, phoneNumber });
    
    // ✅ Wrap Prisma create dengan try-catch untuk handle unique constraint error
    try {
        const user = await prisma.admin.create({
            data: {
                email,
                password: String(hashedPassword),
                phoneNumber: phoneNumber,
                name,
                teleId: teleId || null,
            },
            select: {
                id: true,
                email: true,
                name: true,
                phoneNumber: true,
                teleId: true
            },
        })

        // ✅ Kirim notifikasi Telegram
        try {
            const chatId = await telegramService.getChatIdByPhone(phoneNumber)
            if (chatId) {
                await telegramService.notifyRegistration(chatId, name, email)
            } else {
                console.log(`no telegram chat id found for phone: ${phoneNumber}`)
            }
        } catch(error) {
            console.log('failed to send telegram registration notification: ', error)
        }

        // ✅ Kirim notifikasi WhatsApp
        try {
            await whatsappService.notifyRegistration(phoneNumber, name, email)
            console.log('WhatsApp registration notification sent successfully')
        } catch(error) {
            console.error('Failed to send WhatsApp registration notification:', error)
        }

        return user;
        
    } catch(prismaError: any) {
        // ✅ Handle Prisma unique constraint errors
        console.error('Prisma error:', prismaError)
        
        if (prismaError.code === 'P2002') {
            // Unique constraint violation
            const target = prismaError.meta?.target
            
            if (target && Array.isArray(target)) {
                if (target.includes('email')) {
                    throw new Error("Email sudah terdaftar")
                }
                if (target.includes('phoneNumber')) {
                    throw new Error("Nomor telepon sudah terdaftar")
                }
                if (target.includes('teleId')) {
                    throw new Error("ID Telegram sudah terdaftar")
                }
            }
            
            // Fallback jika target tidak terdeteksi
            throw new Error("Data yang Anda masukkan sudah terdaftar")
        }
        
        // Re-throw error lain
        throw prismaError
    }
}

export async function login(email: string, password: string) {
    const user = await prisma.admin.findUnique({
        where: { email },
        select: {
            id: true,
            email: true,
            password: true,
            name: true,
            phoneNumber: true
        }
    })

    if (!user) {
        throw new Error("Email atau password salah");
    }

    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
        throw new Error("Email atau password salah");
    }

    try {
        const chatId = await telegramService.getChatIdByPhone(user.phoneNumber)
        if (chatId) {
            await telegramService.notifyLogin(chatId, user.name, email)
        } else {
            console.log(`no telegram chat id found for phone: ${user.phoneNumber}`)
        }
    } catch(error) {
        console.error('failed to send telegram login notification: ', error)
    }

    return {
        id: user.id,
        email: user.email,
    };
}

export async function getUserById(userId: string) {
    const user = await prisma.admin.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            phoneNumber: true,
            image: true
        },
    });

    return user;
}

export async function updateUser(userId: string, data: { name?: string; email?: string; password?: string; image?: string }) {
    const updateData: any = {}

    if (data.name) updateData.name = data.name
    if (data.email) updateData.email = data.email
    if (data.image) updateData.image = data.image
    if (data.password) updateData.password = await hashPassword(data.password)

    console.log('Updating user with data:', updateData)

    try {
        const user = await prisma.admin.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                phoneNumber: true,
                image: true,
            }
        })

        console.log('Updated user:', user)

        return user
        
    } catch(prismaError: any) {
        // ✅ Handle Prisma unique constraint errors untuk update
        if (prismaError.code === 'P2002') {
            const target = prismaError.meta?.target
            
            if (target && Array.isArray(target)) {
                if (target.includes('email')) {
                    throw new Error("Email sudah digunakan")
                }
            }
            
            throw new Error("Data sudah digunakan")
        }
        
        throw prismaError
    }
}