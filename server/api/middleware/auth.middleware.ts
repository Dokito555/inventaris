import { getSessionByToken } from "../services/session.service";

export const authMiddleware = async ({cookie, set}: any) => {
    const token = cookie?.session?.value

    if (!token) {
        throw createError({
            statusCode: 401,
            statusMessage: 'unauthorized, no token'
        })
    }

    const session = await getSessionByToken(token);

    if (!session) {
        throw createError({
            statusCode: 401,
            statusMessage: 'unauthorized, no token'
        })
    }

    return {user: session.user}
}
   
