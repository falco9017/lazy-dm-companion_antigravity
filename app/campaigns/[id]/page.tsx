import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getDictionary } from "@/lib/dictionary";
import DeleteSessionButton from "@/components/DeleteSessionButton";
import CampaignHeader from "@/components/CampaignHeader";

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    const campaign = await prisma.campaign.findUnique({
        where: { id },
        include: {
            sessions: {
                orderBy: { createdAt: "desc" },
            },
        },
    });

    if (!campaign || campaign.userId !== session.user.id) {
        notFound();
    }

    const lang = (session.user as any).language || "en";
    const t = getDictionary(lang);

    return (
        <div className="container">
            <div style={{ marginBottom: "2rem" }}>
                <Link href="/dashboard" style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    ← {t.common.back}
                </Link>
            </div>

            <CampaignHeader campaign={campaign} t={t} />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginBottom: "2rem" }}>
                <Link href={`/campaigns/${campaign.id}/wiki`} className="btn btn-secondary">
                    {t.campaign.viewWiki}
                </Link>
                <Link href={`/campaigns/${campaign.id}/sessions/new`} className="btn btn-primary">
                    + {t.campaign.newSession}
                </Link>
            </div>

            <h2 style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", marginBottom: "1.5rem" }}>
                {t.campaign.sessions}
            </h2>

            <div style={{ display: "grid", gap: "1rem" }}>
                {campaign.sessions.map((gameSession) => (
                    <div key={gameSession.id} className="card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ marginBottom: "0.5rem" }}>{gameSession.title}</h3>
                                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1rem" }}>
                                    {new Date(gameSession.createdAt).toLocaleDateString()}
                                </p>
                                <p style={{ lineHeight: "1.6" }}>
                                    {gameSession.recapText ? gameSession.recapText.substring(0, 200) + "..." : "No recap available."}
                                </p>
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <Link href={`/campaigns/${campaign.id}/sessions/${gameSession.id}`} className="btn btn-secondary" style={{ fontSize: "0.8rem" }}>
                                    {t.wiki.readMore}
                                </Link>
                                <DeleteSessionButton campaignId={campaign.id} sessionId={gameSession.id} t={t} />
                            </div>
                        </div>
                    </div>
                ))}

                {campaign.sessions.length === 0 && (
                    <p style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>
                        {t.campaign.noSessions}
                    </p>
                )}
            </div>
        </div>
    );
}
