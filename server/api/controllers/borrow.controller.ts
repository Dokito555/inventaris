import Elysia, { status } from "elysia";
import { createBorrow } from "../services/borrow.service";
import { createBorrowRequest } from "../validators/borrow.validator";
import { errorResponse, successResponse } from "../utils/response";

export const borrowController = (app: Elysia) => {
    return app.group('/borrow', (app) => {
        return app.post('/',async ({ body, set }) => {
                try {
                    const res = await createBorrow({
                        teacherId: body.teacher_id,
                        itemId: body.item_id,
                        quantity: body.quantity,
                        notes: body.notes
                    })

                    if (!res) {
                        return errorResponse(
                            'borrow is undefined',
                            set.status = 500,
                        )
                    }

                    return successResponse(res)
                } catch (error) {
                    console.error("Borrow error:", error)
                    return errorResponse(
                        'failed to borrow item',
                        (set.status = 500),
                    )
                }
            },
            { body: createBorrowRequest }
        )
    })
}
