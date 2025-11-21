import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { title, description } = await request.json();

        const campaign = await prisma.campaign.create({
            data: {
                userId: (session.user as any).id,
                title,
                description,
            },
        });

        return NextResponse.json(campaign);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
    }
}
