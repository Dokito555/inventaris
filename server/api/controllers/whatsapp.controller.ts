import { Elysia } from 'elysia'
import { WhatsAppService } from '../services/whatsapp.service'
import { errorResponse, successResponse } from '../utils/response'
import { waTestMessage, waWebhook } from '../validators/whatsapp.validator'

export const whatsappController = (app: Elysia) => {
    const whatsappService = new WhatsAppService()

    return app.group('/whatsapp', (app) => 
        app
        // Webhook endpoint untuk menerima pesan dari WAHA
        .post('/webhook', async ({body, set}) => {
            try {
                console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2))
                
                // WAHA akan kirim webhook setiap ada event (pesan masuk, status, dll)
                // Untuk sekarang kita hanya log, nanti bisa diperluas untuk handle commands
                
                return successResponse({received: true}, 'Webhook processed')
            } catch(error) {
                console.error('WhatsApp webhook error:', error)
                set.status = 500
                return errorResponse(
                    error instanceof Error
                    ? error.message
                    : 'webhook error'
                )
            }
        }, {
            body: waWebhook
        })
        
        // Test endpoint untuk kirim pesan WhatsApp
        .post('/test-message', async ({body, set}) => {
            try {
                console.log('Testing WhatsApp message:', body)
                
                const success = await whatsappService.sendMessage(
                    body.phoneNumber,
                    body.message
                )

                if (!success) {
                    set.status = 500
                    return errorResponse('Failed to send WhatsApp message')
                }

                return successResponse({sent: true}, 'Message sent successfully')
            } catch(error) {
                console.error('Test message error:', error)
                set.status = 500
                return errorResponse(
                    error instanceof Error
                    ? error.message
                    : 'test message error'
                )
            }
        }, {
            body: waTestMessage
        })
        
        // Test koneksi ke WAHA
        .get('/test-connection', async ({set}) => {
            try {
                const isConnected = await whatsappService.testConnection()

                if (!isConnected) {
                    set.status = 500
                    return errorResponse('Failed to connect to WAHA')
                }

                return successResponse(
                    {connected: true}, 
                    'WAHA connection successful'
                )
            } catch(error) {
                console.error('Connection test error:', error)
                set.status = 500
                return errorResponse(
                    error instanceof Error
                    ? error.message
                    : 'connection test error'
                )
            }
        })
        
        // Get all admin phones (untuk debugging)
        .get('/admin-phones', async ({set}) => {
            try {
                const phones = await whatsappService.getAllAdminPhones()
                
                return successResponse(
                    {phones, count: phones.length},
                    'Admin phones retrieved'
                )
            } catch(error) {
                console.error('Get admin phones error:', error)
                set.status = 500
                return errorResponse(
                    error instanceof Error
                    ? error.message
                    : 'get admin phones error'
                )
            }
        })
    )
}