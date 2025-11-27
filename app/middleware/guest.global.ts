export default defineNuxtRouteMiddleware((to) => {
    const token = useCookie('token')

    if (token.value) {
        return navigateTo('/dashboard')
    }
})