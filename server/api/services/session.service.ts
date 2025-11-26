import prisma from "~~/server/db/prisma";
import { randomBytes } from "crypto";

const SESSION_DURATION = 3 * 24 * 60 * 60 * 1000;

export async function createSession(userId: string) {
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_DURATION);

    const session = await prisma.session.create({
        data: {
        userId,
        token,
        expiresAt,
        },
        include: {
        user: {
            select: {
            id: true,
            email: true,
            },
        },
        },
    });

    return session;
}

export async function getSessionByToken(token: string) {
    const session = await prisma.session.findUnique({
        where: { token },
        include: {
        user: {
            select: {
            id: true,
            email: true,
            },
        },
        },
    });

    if (!session || session.expiresAt < new Date()) {
        if (session) {
        await prisma.session.delete({ where: { id: session.id } });
        }
        return null;
    }

    return session;
}

export async function deleteSession(token: string) {
    await prisma.session.deleteMany({
        where: { token },
    });
}

export async function deleteUserSessions(userId: string) {
    await prisma.session.deleteMany({
        where: { userId },
    });
}

export async function cleanExpiredSessions() {
    await prisma.session.deleteMany({
        where: {
        expiresAt: {
            lt: new Date(),
        },
        },
    });
}
