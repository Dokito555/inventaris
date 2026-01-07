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
                console.log('Register request body:', body)
                
                // Convert phone_number ke string
                const phoneNumStr = body.phone_number.toString()
                
                // Register user
                const user = await register(
                    body.email,
                    body.password,
                    body.name,
                    phoneNumStr,
                    body.teleId?.trim() || undefined
                )

                console.log('User registered:', user)

                return successResponse(user, 'Registrasi berhasil')
            } catch(error: any) {
                console.error('Register error:', error)
                
                // ✅ DEBUG: Print semua properti error
                console.log('Error code:', error.code)
                console.log('Error message:', error.message)
                console.log('Error meta:', error.meta)
                console.log('Error type:', typeof error)
                console.log('Is Error instance:', error instanceof Error)
                
                set.status = 400
                
                let errorMessage = 'Gagal mendaftar'
                
                // ✅ CEK PRISMA ERROR DULU SEBELUM CEK ERROR MESSAGE
                if (error.code === 'P2002') {
                    console.log('✅ Detected Prisma unique constraint error')
                    const target = error.meta?.target
                    console.log('Target fields:', target)
                    
                    if (target && Array.isArray(target)) {
                        if (target.includes('email')) {
                            errorMessage = 'Email sudah terdaftar'
                        }
                        else if (target.includes('phoneNumber')) {
                            errorMessage = 'Nomor telepon sudah terdaftar'
                        }
                        else if (target.includes('teleId')) {
                            errorMessage = 'ID Telegram sudah terdaftar'
                        }
                    } else {
                        errorMessage = 'Data yang Anda masukkan sudah terdaftar'
                    }
                }
                // Baru cek error message dari service
                else if (error instanceof Error) {
                    const msg = error.message.toLowerCase()
                    
                    if (msg.includes('email') && msg.includes('terdaftar')) {
                        errorMessage = 'Email sudah terdaftar'
                    }
                    else if (msg.includes('nomor telepon') && msg.includes('terdaftar')) {
                        errorMessage = 'Nomor telepon sudah terdaftar'
                    }
                    else if (msg.includes('telegram') && msg.includes('terdaftar')) {
                        errorMessage = 'ID Telegram sudah terdaftar'
                    }
                    else if (msg.includes('invalid email')) {
                        errorMessage = 'Format email tidak valid'
                    }
                    else if (msg.includes('invalid phone')) {
                        errorMessage = 'Format nomor telepon tidak valid'
                    }
                    else if (msg.includes('password')) {
                        errorMessage = error.message
                    }
                    else {
                        errorMessage = error.message
                    }
                }
                
                console.log('✅ Final error message:', errorMessage)
                
                return errorResponse(errorMessage)
            }
        }, {
            body: registerRequest
        })
        
        .post('/login', async ({body, cookie: {session}, set}) => {
            try {
                console.log('Login attempt:', body.email)
                
                const user = await login(body.email, body.password)

                if (!user) {
                    console.log('User not found or invalid password')
                    set.status = 401
                    return errorResponse('Email atau password salah')
                }

                const s = await createSession(user.id)

                session.value = s.token
                session.httpOnly = true
                session.maxAge = 3 * 24 * 60 * 60
                session.sameSite = 'lax'
                session.path = '/'

                console.log('Session created:', session.value)
                
                return successResponse(user, 'Login berhasil')
            } catch(error) {
                console.error('Login error:', error)
                set.status = 401
                
                let errorMessage = 'Email atau password salah'
                
                if (error instanceof Error) {
                    if (error.message.includes('credentials')) {
                        errorMessage = 'Email atau password salah'
                    } else {
                        errorMessage = error.message
                    }
                }
                
                return errorResponse(errorMessage)
            }
        }, {
            body: loginRequest
        })

        .get('/me', async (ctx) => {
            const { user, set } = ctx as any

            if (!user) {
                set.status = 401
                return errorResponse('Unauthorized')
            }

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
            } catch (error: any) {
                console.error('Update error:', error)
                set.status = 400
                
                let errorMessage = 'Gagal memperbarui profile'
                
                if (error instanceof Error) {
                    const msg = error.message.toLowerCase()
                    
                    if (msg.includes('email') && msg.includes('digunakan')) {
                        errorMessage = 'Email sudah digunakan'
                    } else {
                        errorMessage = error.message
                    }
                }
                
                // Handle Prisma error
                if (error.code === 'P2002') {
                    const target = error.meta?.target
                    
                    if (target && Array.isArray(target)) {
                        if (target.includes('email')) {
                            errorMessage = 'Email sudah digunakan'
                        }
                    }
                }
                
                return errorResponse(errorMessage)
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

                await deleteSession(token)
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