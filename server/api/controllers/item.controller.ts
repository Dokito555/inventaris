import { Elysia } from 'elysia'
import { errorResponse, successResponse } from '../utils/response';
import { createItem, deleteItem, getAllItems, getItemByID, updateItem } from '../services/item.service';
import { createItemRequest, itemIdRequest, itemPagination, updateItemRequest } from '../validators/item.validator';
import { error } from 'console';

export const itemController = (app: Elysia) => {
    return app.group('/items', (app) => 
        app
        .post('/', async ({body, set}) => {
            try {
                const item = await createItem({
                    name: body.name,
                    description: body.description,
                    image: body.image,
                    quantity: body.quantity
                })

                return successResponse(item, 'item created successfully')
            } catch(error) {
                console.log('create item error: ', error)
                set.status = 500
                return errorResponse(
                    error instanceof Error
                    ? error.message
                    : 'create item error'
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
                console.log('get all items error: ', error)
                set.status = 500
                return errorResponse(
                    error instanceof Error
                    ? error.message
                    : 'get all items error'
                )
            } 
        }, {
            query: itemPagination
        })
        .get('/:id', async ({params, set}) => {
            try {
                const item = await getItemByID(params.id)

                if (!item) {
                    return errorResponse(
                        'item not found',
                        set.status = 404
                    )
                }

                return successResponse(item)
            } catch(error) {
                console.log('get item error: ', error)
                set.status = 500
                return errorResponse(
                    error instanceof Error
                    ? error.message
                    : 'get item error'
                )
            }
        }, {
            params: itemIdRequest
        })
        .put('/:id', async ({params, body, set}) => {
            try {
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
                console.log('update item error: ', error)
                set.status = 500
                return errorResponse(
                    error instanceof Error
                    ? error.message
                    : 'update item error'
                )
            }
        }, {
            params: itemIdRequest,
            body: updateItemRequest
        })
        .delete('/:id', async ({params, set}) => {
            try {
                const deleted = await deleteItem(params.id)
                return successResponse(deleted)
            } catch(error) {
                console.log('delete item error: ', error)
                set.status = 500
                return errorResponse(
                    error instanceof Error
                    ? error.message
                    : 'delete item error'
                )
            }
        }, {
            params: itemIdRequest
        })
    )
}