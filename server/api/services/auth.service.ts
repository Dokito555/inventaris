import prisma from "~~/server/db/prisma";
import { hashPassword, verifyPassword } from "../utils/password";
import {
  validateEmail,
  validatePassword,
  validatePhoneNumber,
} from '../validators/validation'
import { TelegramService } from "./telegram.service";

const telegramService = new TelegramService()

export async function register(
    email: string,
    password: string,
    name: string,
    phoneNumber: string
) {

    // maybe i should skip service validation since elysia provided validation at controller level
    if (!validateEmail(email)) {
        throw new Error("invalid email format");
    }

    if (!validatePhoneNumber(phoneNumber)){
        throw new Error("invalid phone number format")
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        throw new Error(passwordValidation.message);
    }

    const existingUser = await prisma.admin.findFirst({
        where: {
            email: email
        },
    });

    if (existingUser) {
        if (existingUser.email === email) {
            throw new Error("email already registered");
        }
    }

    const hashedPassword = await hashPassword(password);
    console.log("DEBUG PRISMA DATA:", { email, name, phoneNumber });
    const user = await prisma.admin.create({
        data: {
            email,
            password: String(hashedPassword),
            phoneNumber: phoneNumber,
            name,
        },
        select: {
            id: true,
            email: true,
            name: true,
            phoneNumber: true
        },
    })

    try {
        const chatId = await telegramService.getChatIdByPhone(phoneNumber)
        if (chatId) {
            await telegramService.notifyRegistration(chatId, name, email)
        } else {
            console.log(`no telegram chat id found for phone: ${phoneNumber}`)
        }
    } catch(error) {
        console.log('failed to send telegram regustration notification: ', error)
    }

    return user;
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
        throw new Error("Invalid credentials");
    }

    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
        throw new Error("Invalid credentials");
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
        },
    });

    return user;
}