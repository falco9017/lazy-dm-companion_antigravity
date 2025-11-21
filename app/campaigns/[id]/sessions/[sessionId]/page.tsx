import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function SessionDetailPage({
    params,
}: {
    params: { id: string; sessionId: string };
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    const gameSession = await prisma.gameSession.findUnique({
        where: { id: params.sessionId },
        include: { campaign: true },
    });

    if (!gameSession || gameSession.campaign.userId !== (session.user as any).id) {
        notFound();
    }

    return (
        <div className="container" style={{ maxWidth: "800px" }}>
            <div style={{ marginBottom: "2rem" }}>
                <Link href={`/campaigns/${params.id}`} style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    ← Back to Campaign
                </Link>
            </div>

            <div className="card">
                <div style={{ marginBottom: "1rem", color: "var(--text-secondary)" }}>
                    {new Date(gameSession.createdAt).toLocaleDateString()}
                </div>

                <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
                    {gameSession.title}
                </h1>

                <div style={{ marginBottom: "2rem" }}>
                    <h3 style={{ color: "var(--accent-gold)", marginBottom: "1rem" }}>Session Recap</h3>
                    <div style={{ lineHeight: "1.8", fontSize: "1.1rem", whiteSpace: "pre-wrap" }}>
                        {gameSession.recapText || "No recap available."}
                    </div>
                </div>

                {gameSession.transcriptionText && (
                    <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--border-color)" }}>
                        <details>
                            <summary style={{ cursor: "pointer", color: "var(--text-secondary)" }}>View Full Transcription</summary>
                            <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "var(--bg-secondary)", borderRadius: "4px", fontSize: "0.9rem", maxHeight: "300px", overflowY: "auto" }}>
                                {gameSession.transcriptionText}
                            </div>
                        </details>
                    </div>
                )}
            </div>
        </div>
    );
}
