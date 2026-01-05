import { Elysia, t } from 'elysia'
import { register, login, getUserById, updateUser } from '../services/auth.service'
import { errorResponse, successResponse } from '../utils/response'
import { createSession, deleteSession } from '../services/session.service'
import { loginRequest, registerRequest, updateRequest } from '../validators/auth.validator'

export const authController = (app: Elysia) => {
    return app.group('/auth', (app) => 
        app
        .post('/register', async ({body, set}) => {
            try {
                console.log('Register request body:', body) // ✅ Debug log
                
                // ✅ Validasi input
                if (!body.email || !body.password || !body.name || !body.phone_number) {
                    set.status = 400
                    return errorResponse('Semua field harus diisi')
                }

                // ✅ Convert phone_number ke string
                const phoneNumStr = body.phone_number.toString()
                
                // ✅ Register user
                const user = await register(
                    body.email,
                    body.password,
                    body.name,
                    phoneNumStr,
                    body.teleId?.trim() || undefined
                )

                console.log('User registered:', user) // ✅ Debug log

                return successResponse(user, 'Registrasi berhasil')
            } catch(error) {
                console.error('Register error:', error) // ✅ Better logging
                set.status = 500
                
                // ✅ Handle error message
                let errorMessage = 'Gagal mendaftar'
                
                if (error instanceof Error) {
                    errorMessage = error.message
                    
                    // ✅ Handle duplicate email
                    if (error.message.includes('email')) {
                        errorMessage = 'Email sudah terdaftar'
                    }
                    
                    // ✅ Handle duplicate phone
                    if (error.message.includes('phone') || error.message.includes('Unique constraint')) {
                        errorMessage = 'Nomor telepon sudah terdaftar'
                    }
                }
                
                return errorResponse(errorMessage)
            }
        }, {
            body: registerRequest
        })
        
        .post('/login', async ({body, cookie: {session}, set}) => {
            try {
                console.log('Login attempt:', body.email) // ✅ Debug log
                
                const user = await login(body.email, body.password)

                if (!user) {
                    console.log('User not found or invalid password')
                    set.status = 401
                    return errorResponse('Email atau password salah')
                }

                // ✅ Create session
                const s = await createSession(user.id)

                // ✅ Set cookie
                session.value = s.token
                session.httpOnly = true
                session.maxAge = 3 * 24 * 60 * 60
                session.sameSite = 'lax'
                session.path = '/'

                console.log('Session created:', session.value)
                
                return successResponse(user, 'Login berhasil')
            } catch(error) {
                console.error('Login error:', error)
                set.status = 500
                
                return errorResponse(
                    error instanceof Error
                        ? error.message
                        : 'Gagal login'
                )
            }
        }, {
            body: loginRequest
        })

        // server/api/controllers/auth.controller.ts

.get('/me', async (ctx) => {
    const { user, set } = ctx as any

    if (!user) {
        set.status = 401
        return errorResponse('Unauthorized')
    }

    // Ambil detail lengkap dari database berdasarkan ID dari session
    const adminData = await getUserById(user.id)
    return successResponse(adminData, 'Data profile berhasil diambil')
})

.put('/me', async (ctx) => {
    const { user, set, body } = ctx as any

    if (!user) {
        set.status = 401
        return errorResponse('Unauthorized')
    }

    console.log('Update body:', body)

    try {
        const updatedUser = await updateUser(user.id, body)
        return successResponse(updatedUser, 'Profile berhasil diperbarui')
    } catch (error) {
        console.error('Update error:', error)
        set.status = 500
        return errorResponse('Gagal memperbarui profile')
    }
}, {
    body: updateRequest
})
        
        .delete('/logout', async ({cookie: {session}, set}) => {
            try {
                const token = session.value as string | undefined

                if (!token) {
                    set.status = 400
                    return errorResponse('Token tidak ditemukan')
                }

                // ✅ Delete session
                await deleteSession(token)
                
                // ✅ Remove cookie
                session.remove()

                return successResponse(null, 'Logout berhasil')
            } catch(error) {
                console.error('Logout error:', error)
                set.status = 500
                
                return errorResponse(
                    error instanceof Error
                        ? error.message
                        : 'Gagal logout'
                )
            }
        })
    )
}