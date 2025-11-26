export default defineEventHandler(async (event) => {
    try {
        return {
            message: "health"
        }
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message || "unhealthy"
        })
    }
})