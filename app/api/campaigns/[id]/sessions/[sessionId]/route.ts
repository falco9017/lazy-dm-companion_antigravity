import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
    request: Request,
    { params }: { params: { id: string; sessionId: string } }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Verify the session belongs to a campaign owned by the user
        const gameSession = await prisma.gameSession.findUnique({
            where: { id: params.sessionId },
            include: {
                campaign: true
            }
        });

        if (!gameSession) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        if (gameSession.campaign.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Delete the session
        await prisma.gameSession.delete({
            where: { id: params.sessionId }
        });

        return NextResponse.json({ message: "Session deleted successfully" });
    } catch (error) {
        console.error("Delete session error:", error);
        return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
    }
}
