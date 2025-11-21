import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadTempAudio } from "@/lib/supabase";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    try {
        // Upload to Supabase Storage
        // We use the user's email or ID as a folder prefix
        const userId = session.user.email; // Using email as ID for now since we have it
        const storagePath = await uploadTempAudio(file, userId);

        return NextResponse.json({
            message: "File uploaded successfully",
            tempId: storagePath
        });
    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({
            error: "Failed to upload file",
            details: error.message
        }, { status: 500 });
    }
}
