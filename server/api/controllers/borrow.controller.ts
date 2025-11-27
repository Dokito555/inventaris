import Elysia from "elysia";
import { createBorrow } from "../services/borrow.service";
import { createBorrowRequest } from "../validators/borrow.validator";
import { errorResponse, successResponse } from "../utils/response";

export const borrowController = (app: Elysia) => {
    return app.group('/borrows', (app) => 
        app
        .post('/', async ({body, set}) => {
            try {
                const result = await createBorrow({
                    teacherId: body.teacher_id,
                    itemId: body.item_id,
                    quantity: body.quantity,
                    notes: body.notes
                })

                return successResponse(result)
            } catch (error) {
                console.log("failed to create borrow: ", error)
                return errorResponse(
                    "failed to create borrow",
                    set.status = 500,
                    error
                )
            }
        }, {
            body: createBorrowRequest
        })
    )
}