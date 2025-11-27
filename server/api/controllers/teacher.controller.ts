import { Elysia, t } from 'elysia'
import { errorResponse, successResponse } from '../utils/response'
import { addTeacher, deleteTeacher, getAllTeacher, getTeacherById, updateTeacher } from '../services/teacher.service'
import { addTeacherRequest, teacherIdRequest, teacherPagination, teacherUpdateREquest as teacherUpdateRequest } from '../validators/teacher.validator'
import { error } from 'console'

export const teacherController = (app: Elysia) => {
    return app.group('/teachers', (app) => 
        app
        .post('/', async ({body, request, set}) => {
            try {
                const user = (request as any).teacher

                if (!user) {
                    return errorResponse(
                        'unauthorized',
                        set.status = 401,
                    )
                }

                const teacher = await addTeacher({
                    name: body.name,
                    class: body.class!
                })

                return successResponse(teacher, 'teacher added successfully')
            } catch(error) {
                console.error('failed to add teacher: ', error)
                return errorResponse(
                    'failed to add teacher',
                    set.status = 500,
                    error
                )
            }
        }, {
            body: addTeacherRequest
        })
        .get('/', async ({query, set}) => {
            try {
                const page = Number(query.page) || 1
                const limit = Number(query.limit) || 10

                const [teachers, total] = await getAllTeacher(page, limit)

                return {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(Number(total)/limit),
                    teachers
                }
            } catch(error) {
                console.error("failed to get all teachers: ", error)
                return errorResponse(
                    'failed to get all teachers',
                    set.status = 500,
                    error
                )
            }
        }, {
            query:teacherPagination
        })
        .get('/:id', async ({params, request, set}) => {
            try {
                const user = (request as any).teacher

                if (!user) {
                    return errorResponse(
                        'unauthorized',
                        set.status = 401
                    )
                }

                const teacher = await getTeacherById(params.id)

                if (!teacher) {
                    return errorResponse(
                        'teacher not found',
                        set.status = 404,
                    )
                }

                return successResponse(teacher)
            } catch (error) {
                console.error("failed to get teacher by id: ", error)
                return errorResponse(
                    'failed to get teacher by id',
                    set.status = 500,
                    error
                )
            }
        }, {
            params: teacherIdRequest
        })
        .put('/:id', async ({params, body, request, set}) => {
            try {
                const user = (request as any).user

                if (!user) {
                    return errorResponse(
                        'unauthorized',
                        set.status = 400
                    )
                }

                const teacher = updateTeacher(params.id, {
                    name: body.name,
                    class: body.class!
                })

                if (!teacher) {
                    return errorResponse(
                        'teacher not found or unauthorized',
                        set.status = 404
                    )
                }

                return successResponse(teacher, 'teacher updated successfully')
            } catch (error) {
                console.error('failed to update teacher: ', error)
                set.status = 500,
                error
            }
        }, {
            params: teacherIdRequest,
            body: teacherUpdateRequest
        })
        .delete('/:id', async ({params, request, set}) => {
            try {
                const user = (request as any).user
                if (!user) {
                    return errorResponse(
                        'unauthorized',
                        set.status = 404
                    )
                }

                const deleted = await deleteTeacher(params.id)

                if (!deleted) {
                    return errorResponse(
                        'teacher not found or unauthorized',
                        set.status = 404
                    )
                }

                return successResponse()
            } catch (error) {
                console.error('delete teacher successfully: ', error)
                return errorResponse(
                    'failed to delete teacher',
                    set.status = 500,
                    error
                )
            }
        }, {
            params: teacherIdRequest
        })
    )
}