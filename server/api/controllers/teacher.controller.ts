import { Elysia, t } from 'elysia'
import { errorResponse, successResponse } from '../utils/response'
import { addTeacher, deleteTeacher, getAllTeacher, getTeacherById, updateTeacher } from '../services/teacher.service'
import { addTeacherRequest, teacherIdRequest, teacherPagination, teacherUpdateREquest as teacherUpdateRequest } from '../validators/teacher.validator'
import { error } from 'console'

export const teacherController = (app: Elysia) => {
    return app.group('/teachers', (app) => 
        app
        .post('/', async ({body, set}) => {
            try {
                const teacher = await addTeacher({
                    name: body.name,
                    class: body.class!
                })

                return successResponse(teacher, 'teacher added successfully')
            } catch(error) {
                console.log('create teacher error: ', error)
                set.status = 500
                return errorResponse(
                    error instanceof Error
                    ? error.message
                    : 'create teacher error'
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
                console.log('get teachers error: ', error)
                set.status = 500
                return errorResponse(
                    error instanceof Error
                    ? error.message
                    : 'get teachers error'
                )
            }
        }, {
            query:teacherPagination
        })
        .get('/:id', async ({params, set}) => {
            try {
                const teacher = await getTeacherById(params.id)

                return successResponse(teacher)
            } catch (error) {
                console.log('get teacher error: ', error)
                set.status = 500
                return errorResponse(
                    error instanceof Error
                    ? error.message
                    : 'get teacher error'
                )
            }
        }, {
            params: teacherIdRequest
        })
        .put('/:id', async ({params, body, set}) => {
            try {
                const teacher = updateTeacher(params.id, {
                    name: body.name,
                    class: body.class!
                })

                return successResponse(teacher, 'teacher updated successfully')
            } catch (error) {
                 console.log('update teacher error: ', error)
                set.status = 500
                return errorResponse(
                    error instanceof Error
                    ? error.message
                    : 'update teacher error'
                )
            }
        }, {
            params: teacherIdRequest,
            body: teacherUpdateRequest
        })
        .delete('/:id', async ({params, set}) => {
            try {
                const deleted = await deleteTeacher(params.id)

                return successResponse(deleted)
            } catch (error) {
                console.log('delete teacher error: ', error)
                set.status = 500
                return errorResponse(
                    error instanceof Error
                    ? error.message
                    : 'delete teacher error'
                )
            }
        }, {
            params: teacherIdRequest
        })
    )
}