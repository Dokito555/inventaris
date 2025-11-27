import { t } from 'elysia'

export const teleWebhook = t.Object({
    update_id: t.Number(),
    message: t.Optional(
        t.Any(),
    )
})

export const teleLink = t.Object({
    chatId: t.String(),
    phoneNumber: t.String()
})

export const teleTest = t.Object({
    chatId: t.String(),
    message: t.Optional(
        t.Any(),
    )
})

export const teleSetupWebhook = t.Object({
    webhookUrl: t.String()
})