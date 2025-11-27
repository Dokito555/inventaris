import { getSessionByToken } from "../services/session.service";
import type { Cookie } from "elysia";
import { Elysia } from 'elysia'

export const authMiddleware = (app: Elysia) => 
    app.derive(async ({ cookie }: { cookie: Record<string, any> }) => {
        const token = cookie?.session?.value;

        if (!token) {
            return { user: null };
        }

        const session = await getSessionByToken(token);

        if (!session) {
            return { user: null };
        }

        return { user: session.user };
    });

// export default defineEventHandler(async (event) => {
//     const path = event.path

//     if (
//         path.startsWith('/api/auth/register') ||
//         path.startsWith('/api/auth/login') ||
//         path.startsWith('/api/telegram/webhook') ||
//         !path.startsWith('/api/') 
//     ) {
//         return
//     }

//     const token = getCookie(event, 'session')

//     if (!token) {
//         throw createError({
//             statusCode: 401,
//             statusMessage: 'unauthorized, no token provided',
//         })
//     }

//     const session = await getSessionByToken(token)

//     if (!session) {
//         throw createError({
//             statusCode: 401,
//             statusMessage: 'unauthorized, invalid or expired token'
//         })
//     }

//     event.context.user = session.user
//     event.node.req.headers['x-user-id'] = session.user.id
//     event.node.req.headers['x-user-email'] = session.user.email
// })

// export const authMiddleware = (app: any) =>
//     app.derive(
//         async (ctx: Context) => {
//             const token = ctx.cookie?.session?.value;

//             if (!token) {
//                 return { user: null };
//             }

//             console.log("token ctx cookie: ", token)
//             const session = await getSessionByToken(token as string);

//             if (!session) {
//                 return { user: null };
//             }

//             return { user: session.user };
//         }
//     );