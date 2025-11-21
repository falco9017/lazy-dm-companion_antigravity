import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || "" });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    await params; // Extract params even if we don't use id in this handler
    const body = await request.json();
    const { recap, campaignId, title, transcription } = body;

    // 1. Create the Session Record
    let session;
    try {
        session = await prisma.gameSession.create({
            data: {
                campaignId: campaignId,
                title: title || `Session - ${new Date().toLocaleDateString()}`,
                recapText: recap,
                transcriptionText: transcription || "",
            },
        });
    } catch (error) {
        console.error("Failed to create session:", error);
        return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
    }

    // 2. Extract Entities and Cross-References using Gemini
    let extractedEntities: any[] = [];
    try {
        if (process.env.GOOGLE_API_KEY) {
            const prompt = `Extract key entities from the following D&D session recap and identify relationships between them.
Return a JSON array of objects with:
- 'type' (NPC, Location, Item, Event)
- 'title': The name of the entity
- 'content': Brief description
- 'icon': Single appropriate emoji
- 'relatedTo': Array of other entity titles that this one is related to (e.g., NPCs met at locations, items found in events)

IMPORTANT: Keep all entity names and descriptions in the SAME LANGUAGE as the recap below. Do not translate.

Example:
[
  {
    "type": "NPC", 
    "title": "Griznak", 
    "content": "A goblin shaman who guards the dark cave", 
    "icon": "🧙",
    "relatedTo": ["Dark Cave", "Ancient Amulet"]
  },
  {
    "type": "Location", 
    "title": "Dark Cave", 
    "content": "A mysterious cavern in the northern mountains", 
    "icon": "🏔️",
    "relatedTo": ["Griznak"]
  }
]

Recap:
"${recap}"`;

            const result = await genAI.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [{ role: "user", parts: [{ text: prompt }] }]
            });

            const text = result.text || "";
            const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
            extractedEntities = JSON.parse(jsonStr);
        }
    } catch (error) {
        console.error("Entity extraction failed:", error);
    }

    // 3. Create/Update Wiki Entries
    try {
        const createdEntries = new Map<string, string>(); // title -> id mapping

        // First pass: Create or update all entities
        for (const entity of extractedEntities) {
            if (!entity.title || !entity.type) continue;

            const existing = await prisma.wikiEntry.findFirst({
                where: {
                    campaignId,
                    title: entity.title,
                    parentId: null
                }
            });

            if (existing) {
                // Update existing entry
                const updated = await prisma.wikiEntry.update({
                    where: { id: existing.id },
                    data: {
                        content: (existing.content || "") + "\n\n**Session Update (" + title + "):**\n" + entity.content,
                        relatedPages: JSON.stringify([
                            ...(existing.relatedPages ? JSON.parse(existing.relatedPages) : []),
                            ...(entity.relatedTo || [])
                        ].filter((v, i, a) => a.indexOf(v) === i)) // Remove duplicates
                    }
                });
                createdEntries.set(entity.title, existing.id);
            } else {
                // Create new entry
                const newEntry = await prisma.wikiEntry.create({
                    data: {
                        campaignId,
                        sessionId: session.id,
                        title: entity.title,
                        content: entity.content || "",
                        icon: entity.icon || "📄",
                        relatedPages: JSON.stringify(entity.relatedTo || []),
                        parentId: null
                    }
                });
                createdEntries.set(entity.title, newEntry.id);
            }
        }

        return NextResponse.json({
            message: "Session saved and wiki updated",
            entities: extractedEntities,
            sessionId: session.id
        });
    } catch (error) {
        console.error("Wiki update failed:", error);
        return NextResponse.json({ error: "Failed to update wiki" }, { status: 500 });
    }
}
