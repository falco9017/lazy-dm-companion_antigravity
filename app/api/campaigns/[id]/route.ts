import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const { title, description } = body;

        const campaign = await prisma.campaign.findUnique({
            where: { id }
        });

        if (!campaign || campaign.userId !== (session.user as any).id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updatedCampaign = await prisma.campaign.update({
            where: { id },
            data: { title, description }
        });

        return NextResponse.json(updatedCampaign);
    } catch (error) {
        console.error("Update campaign error:", error);
        return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const campaign = await prisma.campaign.findUnique({
            where: { id }
        });

        if (!campaign || campaign.userId !== (session.user as any).id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // This will cascade delete all sessions and wiki entries
        await prisma.campaign.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Campaign deleted successfully" });
    } catch (error) {
        console.error("Delete campaign error:", error);
        return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
    }
}
