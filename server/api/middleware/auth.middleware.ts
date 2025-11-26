import { getSessionByToken } from "../services/session.service";

export default defineEventHandler(async (event) => {
    const path = event.path

    if (
        path.startsWith('/api/auth/register') ||
        path.startsWith('/api/auth/login') ||
        !path.startsWith('/api/')
    ) {
        return
    }

    const token = getCookie(event, 'auth_token')

    if (!token) {
        throw createError({
            statusCode: 401,
            statusMessage: 'unauthorized, no token provided',
        })
    }

    const session = await getSessionByToken(token)

    if (!session) {
        throw createError({
            statusCode: 401,
            statusMessage: 'unauthorized, invalid or expired token'
        })
    }

    event.context.user = session.user
})