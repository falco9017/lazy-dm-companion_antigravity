import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/dictionary";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    const campaigns = await prisma.campaign.findMany({
        where: { userId: (session.user as any).id },
        orderBy: { createdAt: "desc" },
    });

    const lang = (session.user as any).language || "en";
    const t = getDictionary(lang);

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1>{t.dashboard.title}</h1>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <Link href="/settings" className="btn btn-secondary">
                        ⚙️ {t.settings.title}
                    </Link>
                    <Link href="/campaigns/new" className="btn btn-primary">
                        + {t.dashboard.newCampaign}
                    </Link>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
                {campaigns.map((campaign) => (
                    <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                        <div className="card" style={{ height: "100%", cursor: "pointer", transition: "transform 0.2s" }}>
                            <h3 style={{ marginBottom: "0.5rem" }}>{campaign.title}</h3>
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                                {campaign.description || "No description"}
                            </p>
                        </div>
                    </Link>
                ))}

                {campaigns.length === 0 && (
                    <p style={{ color: "var(--text-secondary)" }}>{t.dashboard.noCampaigns}</p>
                )}
            </div>
        </div>
    );
}
