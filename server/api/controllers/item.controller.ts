import { Elysia, t } from 'elysia'
import { errorResponse, successResponse } from '../utils/response';
import { createItem, deleteItem, getAllItems, getItemByID, updateItem } from '../services/item.service';
import { createItemRequest, itemIdRequest, itemPagination, updateItemRequest } from '../validators/item.validator';
import { error } from 'console';

export const itemController = (app: Elysia) => {
    return app.group('/items', (app) => 
        app
        .post('/', async ({body, request, set}) => {
            try {
                const user = (request as any).user

                if (!user) {
                    return errorResponse(
                        'unauthorized',
                        set.status = 401,
                        error
                    )
                }

                const item = await createItem({
                    name: body.name,
                    description: body.description,
                    image: body.image,
                    quantity: body.quantity
                })

                return successResponse(item, 'item created successfully')
            } catch(error) {
                console.error('create item error: ', error)
                return errorResponse(
                    'failed to create item',
                    set.status = 500,
                    error
                )
            }
        }, {
            body: createItemRequest
        })
        .get('/', async ({query, set}) => {
            try {
                const page = Number(query.page) || 1
                const limit = Number(query.limit) || 10

                const [items, total] = await getAllItems(page, limit)

                return {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(Number(total)/limit),
                    items
                }
            } catch(error) {
                console.error('failed to get all items')
                return errorResponse(
                    'failed to get all items',
                    set.status = 500,
                    error
                )
            } 
        }, {
            query: itemPagination
        })
        .get('/:id', async ({params, request, set}) => {
            try {
                const user = (request as any).user

                if (!user) {
                    return errorResponse(
                        'unauthorized',
                        set.status = 401,
                    )
                }

                const item = await getItemByID(params.id)

                if (!item) {
                    return errorResponse(
                        'item not found',
                        set.status = 404
                    )
                }

                return successResponse(item)
            } catch(error) {
                console.error('get item error: ', error)
                return errorResponse(
                    'failed to get item',
                    set.status = 500,
                    error
                )
            }
        }, {
            params: itemIdRequest
        })
        .put('/:id', async ({params, body, request, set}) => {
            try {
                const user = (request as any).user

                if (!user) {
                    return errorResponse(
                        'unauthorized',
                        set.status = 401,
                    )
                }

                const item = await updateItem(
                    params.id,
                    {
                        name: body.name,
                        description: body.description,
                        image: body.image,
                        quantity: body.quantity,
                        available: body.available
                    }
                )

                if (!item) {
                    return errorResponse(
                        'item not found or unauthorized',
                        set.status = 404,
                    )
                }

                return successResponse(item, 'item updated successfully')
            } catch(error) {
                console.error('update item error: ', error)
                return errorResponse(
                    'failed to update item',
                    set.status = 500,
                    error
                )
            }
        }, {
            params: itemIdRequest,
            body: updateItemRequest
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

                const deleted = await deleteItem(params.id)

                if (!deleted) {
                    return errorResponse(
                        'item not found or unauthorized',
                        set.status = 404
                    )
                }

                return successResponse()
            } catch(error) {
                console.error('delete item error: ', error)
                return errorResponse(
                    'failed to delete item',
                    set.status = 500,
                    error
                )
            }
        }, {
            params: itemIdRequest
        })
    )
}