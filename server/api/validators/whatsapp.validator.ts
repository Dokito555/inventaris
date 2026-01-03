import { t } from 'elysia'

// Validator untuk webhook WAHA
export const waWebhook = t.Object({
    event: t.Optional(t.String()),
    session: t.Optional(t.String()),
    payload: t.Optional(t.Any()),
})

// Validator untuk test kirim pesan
export const waTestMessage = t.Object({
    phoneNumber: t.String({
        minLength: 10,
        error: 'Invalid phone number'
    }),
    message: t.String({
        minLength: 1,
        error: 'Message cannot be empty'
    })
})