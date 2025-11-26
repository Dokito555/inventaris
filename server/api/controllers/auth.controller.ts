import { Elysia, t } from 'elysia'
import { register, login } from '../services/auth.service'
import { errorResponse, successResponse } from '../utils/response'
import { createSession, deleteSession } from '../services/session.service'
import { loginRequest, registerRequest } from '../validators/auth.validator'

export const authController = (app: Elysia) => {
    return app.group('/auth', (app) => 
        app
        .post('/register', async ({body, set}) => {
            try {
                const phoneNumStr = body.phone_number.toString()
                const user = await register(
                    body.email,
                    body.password,
                    body.name,
                    phoneNumStr,
                )

                return successResponse(user)
            } catch(error) {
                return errorResponse(
                    'registration failed',
                    set.status = 500
                )
            }
        }, {
            body: registerRequest
        })
        .post('/login', async ({body, cookie: {session}, set}) => {
            try {
                const user = await login(body.email, body.password)

                if (!user) {
                    return errorResponse(
                        'invalid credentials',
                        set.status = 401
                    )
                }

                const s = await createSession(user.id)

                session.value = s.token
                session.httpOnly = true
                session.maxAge = 3 * 24 * 60 * 60
                session.sameSite = 'lax'

                console.log('session token: ', session.value)
                return successResponse(user)
            } catch(error) {
                return errorResponse(
                    'login failed',
                    set.status = 500
                )
            }
        }, {
            body: loginRequest
        })
        .post('/logout', async ({cookie: {session}, set}) => {
            try {
                const token = session.value as string || undefined

                if (token == undefined) {
                    console.log("token undefined: %d", token)
                    return errorResponse(
                        'token is undefined',
                        set.status = 401
                    )
                }

                if (token) {
                    await deleteSession(token)
                }

                session.remove()

                return successResponse()
            } catch(error) {
                return errorResponse(
                    'logout failed',
                    set.status = 500
                )
            }
        })
    )
}