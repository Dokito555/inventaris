import { AddTeacherDTO, UpdateTeacherDTO } from "../models/teacher.model";
import prisma from "~~/server/db/prisma";

export async function addTeacher(data: AddTeacherDTO) {
    const teacher = await prisma.teacher.create({
        data: {
            name: data.name,
            class: data.class,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        select: {
            id: true,
            name: true,
            class: true,
            createdAt: true,
            updatedAt: true
        }
    })

    return teacher
}

export async function getTeacherById(teacherId: string) {
    const teacher = await prisma.teacher.findUnique({
        where: {
            id: teacherId
        },
        select: {
            id: true,
            name: true,
            class: true,
            createdAt: true,
            updatedAt: true
        }
    })

    return teacher
}

export async function updateTeacher(teacherId: string, data: UpdateTeacherDTO) {
    const existingTeacher = await prisma.teacher.findUnique({
        where: {
            id: teacherId
        },
    })

    if (!existingTeacher) {
        throw new Error("teacher not found")
    }

    const teacher = await prisma.teacher.update({
        where: {
            id: teacherId
        },
        data: {
            name: data.name,
            class: data.class,
        }
    })

    return teacher
}

export async function deleteTeacher(teacherId: string) {
    const existingTeacher = await prisma.teacher.findUnique({
        where: {
            id: teacherId
        },
    })

    if (!existingTeacher) {
        throw new Error("teacher not found")
    }

    await prisma.teacher.delete({
        where: {
            id: teacherId
        }
    })

    return {deleted: true}
}

export async function getAllTeacher(page: number, limit: number) {
    const skip = (page - 1) * limit

    const [teachers, total] = await Promise.all([
        prisma.teacher.findMany({
            skip,
            take: limit,
            orderBy: {
                createdAt: 'desc'
            }
        }),
        prisma.teacher.count({})
    ])

    return [teachers, total]
}