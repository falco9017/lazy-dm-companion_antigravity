import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string; entryId: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { entryId } = await params;
        const body = await request.json();
        const { title, content, icon } = body;

        const entry = await prisma.wikiEntry.findUnique({
            where: { id: entryId },
            include: { campaign: true }
        });

        if (!entry) {
            return NextResponse.json({ error: "Entry not found" }, { status: 404 });
        }

        if (entry.campaign.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updatedEntry = await prisma.wikiEntry.update({
            where: { id: entryId },
            data: { title, content, icon }
        });

        return NextResponse.json(updatedEntry);
    } catch (error) {
        console.error("Update wiki entry error:", error);
        return NextResponse.json({ error: "Failed to update entry" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string; entryId: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { entryId } = await params;
        const entry = await prisma.wikiEntry.findUnique({
            where: { id: entryId },
            include: { campaign: true }
        });

        if (!entry) {
            return NextResponse.json({ error: "Entry not found" }, { status: 404 });
        }

        if (entry.campaign.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Deleting will cascade to children thanks to the schema
        await prisma.wikiEntry.delete({
            where: { id: entryId }
        });

        return NextResponse.json({ message: "Entry deleted successfully" });
    } catch (error) {
        console.error("Delete wiki entry error:", error);
        return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
    }
}
