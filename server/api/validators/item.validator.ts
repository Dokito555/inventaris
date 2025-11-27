import { t } from 'elysia'

export const createItemRequest = t.Object({
    name: t.String({
        minLength: 1,
        error: 'invalid name'
    }),
     description: t.Optional(
        t.String()
    ),
    image: t.Optional(
        t.String()
    ),
    quantity: t.Number({
        minimum: 1,
        error: 'item minimum quantity 1'
    }),
})

export const itemIdRequest = t.Object({
    id: t.String({
        format: "uuid",
        error: 'invalid id'
    })
})

export const updateItemRequest = t.Object({
    name: t.String({
        minLength: 1,
        error: 'invalid name'
    }),
    description: t.Optional(
        t.String()
    ),
    image: t.Optional(
        t.String()
    ),
    quantity: t.Number(),
    available: t.Boolean()
})

export const itemPagination = t.Object({
    page: t.Optional(
        t.Numeric({
            default: 1
        })
    ),
    limit: t.Optional(
        t.Numeric({
            default: 10
        })
    )
})