import { t } from "elysia";

export const createBorrowRequest = t.Object({
    // name: t.String({
    //     minLength: 1,
    //     error: 'invalid name'
    // }),
    teacher_id: t.String({
        format: "uuid",
        error: 'invalid teacher id'
    }),
    item_id: t.String({
        format: "uuid",
        error: 'invalid item id'
    }),
    quantity: t.Number({
        minimum: 1,
        error: 'borrow minimal 1 item'
    }),
    // unless borrow duration >1 day
    // borrow_at: t.String({
    //     format: 'date-time',
    //     error: 'invalid borrow at date time format'
    // }),
    // return_date: t.String({
    //     format: 'date-time',
    //     error: 'invalid return date date time format'
    // }),
    notes: t.Optional(
        t.String()
    ),
    // move to logic
    // status: t.String()
})

export const updateBorrowRequest = t.Object({
    name: t.String({
        minLength: 1,
        error: 'invalid name'
    }),
    teacher_id: t.String({
        format: "uuid",
        error: 'invalid teacher id'
    }),
    item_id: t.String({
        format: "uuid",
        error: 'invalid item id'
    }),
    quantity: t.Number({
        minimum: 1,
        error: 'borrow minimal 1 item'
    }),
    borrow_at: t.String({
        format: 'date-time',
        error: 'invalid borrow at date time format'
    }),
    return_date: t.String({
        format: 'date-time',
        error: 'invalid return date date time format'
    }),
    notes: t.String(),
    status: t.String()
})

export const updateBorrowStatusRequest = t.Object({
    status: t.String()
})

export const borrowIdRequest = t.Object({
    id: t.String({
        format: "uuid",
        error: 'invalid borrow id'
    })
})