import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getDictionary } from "@/lib/dictionary";
import WikiSidebar from "@/components/WikiSidebar";

// Helper function to build hierarchical tree
function buildTree(entries: any[]): any[] {
    const map = new Map();
    const roots: any[] = [];

    // Create map of all entries
    entries.forEach(entry => {
        map.set(entry.id, { ...entry, children: [] });
    });

    // Build tree structure
    entries.forEach(entry => {
        const node = map.get(entry.id);
        if (entry.parentId) {
            const parent = map.get(entry.parentId);
            if (parent) {
                parent.children.push(node);
            }
        } else {
            roots.push(node);
        }
    });

    // Sort by order
    const sortByOrder = (nodes: any[]) => {
        nodes.sort((a, b) => (a.order || 0) - (b.order || 0));
        nodes.forEach(node => {
            if (node.children.length > 0) {
                sortByOrder(node.children);
            }
        });
    };

    sortByOrder(roots);
    return roots;
}

export default async function WikiIndexPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    const campaign = await prisma.campaign.findUnique({
        where: { id },
        include: {
            wikiEntries: {
                orderBy: { order: "asc" }
            }
        }
    });

    if (!campaign || campaign.userId !== session.user.id) {
        notFound();
    }

    const lang = (session.user as any).language || "en";
    const t = getDictionary(lang);

    const tree = buildTree(campaign.wikiEntries);

    return (
        <div style={{ display: "flex" }}>
            <WikiSidebar entries={tree} campaignId={campaign.id} t={t} />

            <div style={{ marginLeft: "280px", padding: "3rem", flex: 1, maxWidth: "900px" }}>
                <h1>{campaign.title} - {t.wiki.title}</h1>
                <p style={{ color: "var(--text-secondary)", marginTop: "1rem" }}>
                    Select a page from the sidebar or create a new one to get started.
                </p>
            </div>
        </div>
    );
}
