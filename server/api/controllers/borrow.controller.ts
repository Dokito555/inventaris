import Elysia, { status } from "elysia";
import { createBorrow, getAllBorrows, returnItem } from "../services/borrow.service";
import { borrowIdRequest, borrowQuery, createBorrowRequest } from "../validators/borrow.validator";
import { errorResponse, successResponse } from "../utils/response";

export const borrowController = (app: Elysia) => {
    return app.group('/borrows', (app) => {
        return app.post('/',async ({ body, set }) => {
                try {
                    const res = await createBorrow({
                        teacherId: body.teacher_id,
                        itemId: body.item_id,
                        quantity: body.quantity,
                        notes: body.notes
                    })

                    return successResponse(res)
                } catch (error) {
                    console.log('borrow error: ', error)
                    set.status = 500
                    return errorResponse(
                        error instanceof Error
                        ? error.message
                        : 'borrow error'
                    )
                }
            },
            { body: createBorrowRequest }
        )
        .get('/', async ({query, set}) => {
            try {
                const limit = Number(query?.limit) || 10
                const page = Number(query?.page) || 1
                
                const res = await getAllBorrows(limit, page)
                return successResponse(res)
            } catch (error) {
                console.log('get all borrows error: ', error)
                set.status = 500
                return errorResponse(
                    error instanceof Error
                    ? error.message
                    : 'get all borrows error'
                )
            }
        }, {
            query: borrowQuery
        })
        .patch('/:id/return', async ({ params, set }) => {
            try {
                const res = await returnItem(params.id)
                return successResponse(res)
            } catch (error) {
                console.log('return item error: ', error)
                set.status = 500
                return errorResponse(
                    error instanceof Error
                    ? error.message
                    : 'return item error'
                )
            }
        }, {
            params: borrowIdRequest
        })

    })
}
