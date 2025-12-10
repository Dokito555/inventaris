import { Elysia } from 'elysia'
import { TelegramService  } from '../services/telegram.service'
import { errorResponse, successResponse } from '../utils/response'
import { teleLink, teleSetupWebhook, teleTest, teleWebhook } from '../validators/telegram.validator'

export const telegramController = (app: Elysia) => {
    const telegramService = new TelegramService()

    return app.group('/telegram', (app) => 
        app
        // webhook endpoint
        .post('/webhook', async ({body, set}) => {
            try {
                await telegramService.processWebhookUpdate(body);
                return successResponse({received: true})
            } catch(error) {
                console.log('webhook error: ', error)
                set.status = 500
                return errorResponse(
                    error instanceof Error
                    ? error.message
                    : 'webhook error'
                )
            }
        }, {
            body: teleWebhook
        })
        // manual link phone number endpoint
        .post('/link', async({body, set}) => {
            try {
                const success = await telegramService.storeChatId(
                    body.phoneNumber,
                    body.chatId
                )

                if (!success) {
                    return errorResponse(
                        'failed to link account',
                        set.status = 500
                    )
                }

                return successResponse({
                    linked: true
                })
            } catch(error) {
                console.log('linking account error: ', error)
                set.status = 500
                return errorResponse(
                    error instanceof Error
                    ? error.message
                    : 'linking account error'
                )
            }
        }, {
            body: teleLink
        })
        // test tele send message
        .post('/test-message', async ({body, set}) => {
            try {
                const success = await telegramService.sendMessage(
                    body.chatId,
                    body.message
                )

                if (!success) {
                    return errorResponse(
                        'failed to send message',
                        set.status = 500
                    )
                }

                return successResponse({sent: true})
            } catch(error) {
                console.log('test message error: ', error)
                set.status = 500
                return errorResponse(
                    error instanceof Error
                    ? error.message
                    : 'test message error'
                )
            }
        }, {
            body: teleTest
        })
        // setup webhook endpoint
        .post('/setup-webhook', async ({body, set}) => {
            try {
                const success = await telegramService.setWebhook(body.webhookUrl)

                if (!success) {
                    return errorResponse(
                        'failed to setup webhook',
                        set.status = 500
                    )
                }

                return successResponse({webhook: 'configured'})
            } catch(error) {
                console.log('webhook setup error: ', error)
                set.status = 500
                return errorResponse(
                    error instanceof Error
                    ? error.message
                    : 'webhook setup error'
                )
            }
        }, {
            body: teleSetupWebhook
        })
    )
}