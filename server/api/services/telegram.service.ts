import prisma from "~~/server/db/prisma"
import 'dotenv/config';

export class TelegramService {
    private botToken: string
    private apiURL: string

    constructor() {
        // TODO: FOR SOME REASON TOKEN DOESNT CALL ENV SO I HAD TO MANUALLY TYPE IT
        // please hide this inside env later
        const token = "8461680962:AAEj6lpjiGONDN0h3tmHkiydPi-mdyVJico"
        console.log("token: ", token)
        if (!token) {
            throw new Error("TELEGRAM_BOT_TOKEN is not found")
        }
        this.botToken = token
        this.apiURL = `https://api.telegram.org/bot${this.botToken}`   
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
                    parse_mode: "HTML",
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
        const message = 'your account has been successfully registered'
        return await this.sendMessage(chatId, message);
    }

    async notifyLogin(chatId: string, name: string, email: string): Promise<boolean> {
        const message = `successfully logged in as ${name} with ${email}`
        return await this.sendMessage(chatId, message)
    }

    async notifyBorrow(): Promise<boolean> {return true}

    async notifyReturn(): Promise<boolean> {return true}

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