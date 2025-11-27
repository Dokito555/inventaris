import { t } from 'elysia'

export const addTeacherRequest = t.Object({
    name: t.String({
        minLength: 1
    }),
    class: t.Optional(
        t.String()
    )
})

export const teacherPagination = t.Object({
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

export const teacherIdRequest = t.Object({
    id: t.String({
        format: "uuid",
        error: 'invalid id'
    })
})

export const teacherUpdateREquest = t.Object({
     name: t.String({
        minLength: 1
    }),
    class: t.Optional(
        t.String()
    )
})