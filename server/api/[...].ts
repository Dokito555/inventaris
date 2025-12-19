import { eventHandler, getRequestURL, getRequestHeaders, readRawBody,  } from "h3";
import { Elysia } from 'elysia'
import { authController } from "./controllers/auth.controller";
import { telegramController } from "./controllers/telegram.controller";
import { itemController } from "./controllers/item.controller";
import { borrowController } from "./controllers/borrow.controller"
import { teacherController } from "./controllers/teacher.controller";
import { getSessionByToken } from "./services/session.service";
import { errorResponse } from "./utils/response";

const app = new Elysia({ prefix: '/api'})
    .derive(async ({cookie}) => {
        console.log("cookie: ", cookie?.session?.value)
        const token = cookie?.session?.value
        if (!token) {
            return {user: null}
        }

        const session = await getSessionByToken(token as string)
        return { user: session?.user ?? null }
    })

    .use(authController)
    .use(itemController)
    .use(borrowController)
    .use(telegramController)
    .use(teacherController)

    .onError(({code, error, set}) => {
        console.error(`Backend Error [${code}]:`, error);
        if (code === 'VALIDATION') {
            set.status = 400
            return errorResponse('validation failed', 400, error.message)
        }

        if (code === 'NOT_FOUND') {
            set.status = 404
            return errorResponse('route not found', 404, error.message)
        }

        set.status = 500
        return errorResponse('internal server error', 500, error)
    })

export default eventHandler(async (event) => {
    const url = getRequestURL(event)
    const headers = getRequestHeaders(event)
    const method = event.method || 'GET'

    const init: RequestInit = {
        method, 
        headers: new Headers(headers as HeadersInit)
    }

    if (method !== 'GET' && method !== 'HEAD') {
        const body = await readRawBody(event)
        if (body) {
            init.body = body
        }
    }

    const request = new Request(url, init)

    return app.handle(request)
})