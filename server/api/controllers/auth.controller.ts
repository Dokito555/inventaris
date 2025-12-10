import { Elysia, t } from 'elysia'
import { register, login } from '../services/auth.service'
import { errorResponse, successResponse } from '../utils/response'
import { createSession, deleteSession } from '../services/session.service'
import { loginRequest, registerRequest } from '../validators/auth.validator'
import { error } from 'console'

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
                console.log('register error: ', error)
                set.status = 500
                return errorResponse(
                    error instanceof Error
                    ? error.message
                    : 'failed to register'
                )
            }
        }, {
            body: registerRequest
        })
        .post('/login', async ({body, cookie: {session}, set}) => {
            try {
                const user = await login(body.email, body.password)

                if (!user) {
                    console.log('user doesnt exist')
                    set.status = 400
                    return errorResponse(
                        error instanceof Error
                        ? error.message
                        : 'user doesnt exist'
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
                console.log('login error: ', error)
                set.status = 500
                return errorResponse(
                    error instanceof Error
                    ? error.message
                    : 'failed to login'
                )
            }
        }, {
            body: loginRequest
        })
        .delete('/logout', async ({cookie: {session}, set}) => {
            try {
                const token = session.value as string || undefined

                if (token == undefined) {
                    console.log('token undefined %d: ', token)
                    set.status = 400
                    return errorResponse(
                        error instanceof Error
                        ? error.message
                        : 'token undefined'
                    )
                }

                if (token) {
                    await deleteSession(token)
                }

                session.remove()

                return successResponse()
            } catch(error) {
                console.log('failed to logout: ', error)
                set.status = 500
                return errorResponse(
                    error instanceof Error
                    ? error.message
                    : 'failed to logout'
                )
            }
        }, {
            body: t.Any()
        })
    )
}