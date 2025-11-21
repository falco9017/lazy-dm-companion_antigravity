import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || "" });

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string; entryId: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id, entryId } = await params;
        const entry = await prisma.wikiEntry.findUnique({
            where: { id: entryId },
            include: { campaign: true }
        });

        if (!entry || entry.campaign.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Get all other pages in the campaign
        const allPages = await prisma.wikiEntry.findMany({
            where: {
                campaignId: id,
                id: { not: entryId }
            },
            select: {
                id: true,
                title: true,
                content: true,
                icon: true
            }
        });

        if (!process.env.GOOGLE_API_KEY || allPages.length === 0) {
            return NextResponse.json({ suggestions: [] });
        }

        // Build prompt for AI
        const pagesList = allPages.map(p => `- "${p.title}": ${p.content?.substring(0, 150) || 'No content'}`).join('\n');

        const prompt = `You are helping organize a D&D campaign wiki. Given the current page and a list of other pages, suggest which pages would be relevant to link from this page.

Current Page:
Title: "${entry.title}"
Content: ${entry.content || 'No content yet'}

Other Available Pages:
${pagesList}

Return a JSON array of page titles that would be relevant to cross-reference from the current page. Only suggest pages that have clear thematic or narrative connections. Maximum 5 suggestions.

Format: ["Page Title 1", "Page Title 2", ...]`;

        const result = await genAI.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        });

        const text = result.text || "";
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const suggestedTitles = JSON.parse(jsonStr);

        // Map titles back to page objects
        const suggestions = allPages.filter(p => suggestedTitles.includes(p.title));

        return NextResponse.json({ suggestions });
    } catch (error) {
        console.error("Cross-reference suggestion error:", error);
        return NextResponse.json({ suggestions: [] });
    }
}
