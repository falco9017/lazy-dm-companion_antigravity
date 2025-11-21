import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API
const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || "" });

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { transcription } = body;

        if (!process.env.GOOGLE_API_KEY) {
            return NextResponse.json({ error: "GOOGLE_API_KEY is not set" }, { status: 500 });
        }

        if (!transcription) {
            return NextResponse.json({ error: "Transcription text is missing" }, { status: 400 });
        }

        const prompt = `Create a structured recap of this D&D session in the SAME LANGUAGE as the transcription.

Use this format (plain text, no asterisks or icons):

# [Session Title]

## Key Events
- [Event 1]
- [Event 2]

## Loot & Rewards
- [Item 1]
- [Item 2]

## NPCs
- [NPC Name]: [Brief description]

## Notable Quotes
- [Quote 1]

Transcription:
${transcription.substring(0, 30000)}`;

        // Use Gemini 2.5 Flash for summarization
        const result = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        });

        const recap = result.text || "";

        return NextResponse.json({
            recap: recap
        });

    } catch (error: any) {
        console.error("Recap generation error:", error);
        return NextResponse.json({
            error: "Failed to generate recap",
            details: error.message || String(error)
        }, { status: 500 });
    }
}
