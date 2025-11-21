import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, parentId, icon } = body;

        // Verify campaign ownership
        const campaign = await prisma.campaign.findUnique({
            where: { id: params.id }
        });

        if (!campaign || campaign.userId !== (session.user as any).id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Get the next order number
        const lastEntry = await prisma.wikiEntry.findFirst({
            where: { campaignId: params.id, parentId: parentId || null },
            orderBy: { order: "desc" }
        });

        const newEntry = await prisma.wikiEntry.create({
            data: {
                campaignId: params.id,
                parentId: parentId || null,
                title: title || "Untitled",
                content: "",
                icon: icon || "📄",
                order: (lastEntry?.order || 0) + 1
            }
        });

        return NextResponse.json(newEntry);
    } catch (error) {
        console.error("Create wiki entry error:", error);
        return NextResponse.json({ error: "Failed to create entry" }, { status: 500 });
    }
}
