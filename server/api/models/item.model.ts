export interface CreateItemDTO {
    name: string
    description?: string
    image?: string
    quantity: number
}

export interface UpdateItemDTO {
    name: string
    description?: string
    image?: string
    quantity: number
    available: boolean
}