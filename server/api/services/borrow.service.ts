import prisma from "~~/server/db/prisma";
import { CreateBorrowDTO } from "../models/borrow.model";
import { BorrowStatus } from "@prisma/client";

export async function createBorrow(data: CreateBorrowDTO) {
    console.log("create borrow received: ", data);
    const item = await prisma.item.findUnique({
        where: {
            id: data.itemId,
        },
    });

    if (!item) {
        throw new Error("item not found");
    }

    if (item.quantity < data.quantity) {
        throw new Error("not enough item available");
    }

    const now = new Date();
    const returnDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const borrow = await prisma.$transaction(async (txt) => {
        await txt.item.update({
        where: {
            id: data.itemId,
        },
        data: {
            quantity: {
                decrement: data.quantity,
            },
            available: item.quantity - data.quantity > 0,
        },
    });

    return await txt.borrow.create({
        data: {
            teacherId: data.teacherId,
            itemId: data.itemId,
            quantity: data.quantity,
            borrowed_at: now,
            return_date: returnDate,
            notes: data.notes,
            status: BorrowStatus.BORROWED,
        },
        });
    });

  return borrow;
}

export async function returnItem(id: string) {
    console.log("return item received: ", id);
    const exist = await prisma.borrow.findUnique({
        where: {
            id: id,
        },
    });

    if (!exist) {
        throw new Error("borrow not found");
    }

    const updated = await prisma.borrow.update({
        where: {
            id: id,
        },
        data: {
            status: BorrowStatus.RETURNED,
            actual_return_time: new Date(),
        },
    });

    return updated;
}

export async function getAllBorrows(limit: number, page: number) {
    console.log("get all borrows received: ", { limit, page });
     const skip = (page - 1) * limit;

    const [borrows, total] = [
        await prisma.borrow.findMany({
            skip,
            take: limit,
            orderBy: {
                borrowed_at: "desc",
            },
            include: {
                teacher: {
                select: {
                    name: true,
                    class: true,
                },
                },
                item: {
                select: {
                    name: true,
                },
                },
            },
        }),
        await prisma.borrow.count()
    ];

    return {
        borrows,
        total,
        page,
        limit,
        totalPages: Math.ceil(total/limit)
    }
}
