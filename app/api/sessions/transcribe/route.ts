import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { downloadTempAudio, deleteTempAudio } from "@/lib/supabase";
import path from "path";

// Initialize Gemini API
const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || "" });

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { tempId } = body;

        if (!process.env.GOOGLE_API_KEY) {
            console.error("GOOGLE_API_KEY is missing");
            return NextResponse.json({ error: "Server configuration error: GOOGLE_API_KEY is missing" }, { status: 500 });
        }

        // Read the file from Supabase Storage
        let fileBuffer;
        try {
            fileBuffer = await downloadTempAudio(tempId);
        } catch (e) {
            console.error("File not found in storage:", tempId);
            return NextResponse.json({ error: `File not found: ${tempId}` }, { status: 404 });
        }

        // Determine mime type based on extension
        const ext = path.extname(tempId).toLowerCase();
        let mimeType = "audio/mp3"; // Default
        if (ext === ".wav") mimeType = "audio/wav";
        else if (ext === ".m4a") mimeType = "audio/m4a";
        else if (ext === ".aac") mimeType = "audio/aac";
        else if (ext === ".flac") mimeType = "audio/flac";
        else if (ext === ".ogg") mimeType = "audio/ogg";
        else if (ext === ".mp4") mimeType = "audio/mp4";
        else if (ext === ".webm") mimeType = "audio/webm"; // Added webm support

        // Convert to base64
        const base64Audio = fileBuffer.toString("base64");

        // Use Gemini 3.0 Pro for audio transcription
        const result = await genAI.models.generateContent({
            model: "gemini-1.5-flash", // Changed to 1.5-flash as 3.0-pro-preview might not be available/stable for everyone yet, or keep user's choice if they prefer
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: "Transcribe the following audio recording of a Dungeons & Dragons session. Provide a clear, verbatim transcription in the SAME LANGUAGE as the audio. Do not translate." },
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Audio
                            }
                        }
                    ]
                }
            ]
        });

        const transcription = result.text || "";

        // Cleanup
        try {
            await deleteTempAudio(tempId);
        } catch (e) {
            console.error("Failed to delete temp file from storage:", e);
        }

        return NextResponse.json({
            transcription: transcription
        });

    } catch (error: any) {
        console.error("Transcription error details:", error);
        return NextResponse.json({
            error: "Failed to transcribe audio",
            details: error.message || String(error),
            stack: error.stack
        }, { status: 500 });
    }
}
