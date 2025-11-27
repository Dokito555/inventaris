import prisma from "~~/server/db/prisma";
import { CreateItemDTO, UpdateItemDTO } from "../models/item.model";

export async function createItem(data: CreateItemDTO) {
    const item = await prisma.item.create({
        data: {
            name: data.name,
            description: data.description,
            quantity: data.quantity,
            available: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        select: {
            id: true,
            name: true,
            description: true,
            image: true,
            quantity: true,
            available: true,
            createdAt: true,
            updatedAt: true
        }
    })

    return item
}

export async function getItemByID(itemId: string) {
    const item = await prisma.item.findUnique({
        where: {
            id: itemId
        },
        select: {
            id: true,
            name: true,
            description: true,
            image: true,
            quantity: true,
            available: true,
            createdAt: true,
            updatedAt: true
        }
    })

    return item
}

export async function updateItem(itemId: string, data: UpdateItemDTO) {
    const existingItem = await prisma.item.findUnique({
        where: {
            id: itemId
        }
    })

    if (!existingItem) {
        throw new Error("item not found")
    }

    const item = await prisma.item.update({
        where: {id: itemId},
        data: {
            name: data.name,
            description: data.description,
            image: data.image,
            quantity: data.quantity,
            available: data.available
        },
        select: {
            id: true,
            name: true,
            description: true,
            image: true,
            quantity: true,
            available: true,
            createdAt: true,
            updatedAt: true
        }
    })

    return item
}

export async function deleteItem(itemId: string) {
    const existingItem = await prisma.item.findUnique({
        where: {
            id: itemId
        }
    })

    if (!existingItem) {
        throw new Error("item not found")
    } 

    await prisma.item.delete({
        where: {
            id: itemId
        }
    })

    return {deleted: true}
}

export async function getAllItems(page: number, limit: number) {
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
        prisma.item.findMany({
            skip,
            take: limit,
            orderBy: {
                createdAt: 'desc'
            }
        }),
        prisma.item.count({})
    ])

    return [items, total]
}
