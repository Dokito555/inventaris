import Elysia, { status } from "elysia";
import { createBorrow } from "../services/borrow.service";
import { createBorrowRequest } from "../validators/borrow.validator";
import { errorResponse, successResponse } from "../utils/response";
import prisma from "~~/server/db/prisma";

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
        .get('/', async ({query, set}) => {
            try {
                const limit = Number(query?.limit) || 10
                const page = Number(query?.page) || 1
                const skip = (page - 1) * limit

                const borrows = await prisma.borrow.findMany({
                    skip,
                    take: limit,
                    orderBy: {
                        borrowed_at: 'desc'
                    },
                    include: {
                        teacher: {
                            select: {
                                name: true
                            }
                        },
                        item: {
                            select: {
                                name: true
                            }
                        }
                    }
                })

                const total = await prisma.borrow.count()

                return successResponse({
                    borrows,
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                })
            } catch (error) {
                console.error("failed to get borrows: ", error)
                return errorResponse(
                    "failed to get borrows",
                    set.status = 500,
                    error
                )
            }
        })
    })
}
