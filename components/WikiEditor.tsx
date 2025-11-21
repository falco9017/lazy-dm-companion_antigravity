"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface RelatedPage {
    id: string;
    title: string;
    icon: string;
    content: string | null;
}

export default function WikiEditor({
    entry,
    campaignId,
    allPages,
    t
}: {
    entry: {
        id: string;
        title: string;
        content: string | null;
        icon: string;
        relatedPages: string | null;
    };
    campaignId: string;
    allPages: RelatedPage[];
    t: any;
}) {
    const [title, setTitle] = useState(entry.title);
    const [content, setContent] = useState(entry.content || "");
    const [icon, setIcon] = useState(entry.icon);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const router = useRouter();

    // Parse related pages from stored JSON
    const relatedPageTitles = entry.relatedPages ? JSON.parse(entry.relatedPages) : [];
    const relatedPages = allPages.filter(p => relatedPageTitles.includes(p.title));

    // Auto-save after 2 seconds of inactivity
    useEffect(() => {
        const timer = setTimeout(() => {
            if (title !== entry.title || content !== (entry.content || "") || icon !== entry.icon) {
                handleSave();
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [title, content, icon]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/campaigns/${campaignId}/wiki/${entry.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content, icon })
            });

            if (res.ok) {
                setLastSaved(new Date());
                router.refresh();
            }
        } catch (error) {
            console.error("Save failed:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(t.wiki.confirmDelete || "Delete this page and all sub-pages?")) {
            return;
        }

        try {
            const res = await fetch(`/api/campaigns/${campaignId}/wiki/${entry.id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                router.push(`/campaigns/${campaignId}/wiki`);
                router.refresh();
            }
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    const insertLink = (pageTitle: string) => {
        const linkText = `[[${pageTitle}]]`;
        setContent(content + (content ? "\n\n" : "") + linkText);
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
                    <input
                        type="text"
                        value={icon}
                        onChange={(e) => setIcon(e.target.value)}
                        style={{
                            width: "3rem",
                            fontSize: "2rem",
                            border: "none",
                            background: "transparent",
                            textAlign: "center"
                        }}
                        maxLength={2}
                    />
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="input"
                        style={{
                            fontSize: "2rem",
                            fontWeight: "bold",
                            border: "none",
                            background: "transparent",
                            padding: "0.25rem 0",
                            flex: 1
                        }}
                        placeholder="Untitled"
                    />
                </div>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    {lastSaved && (
                        <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                            {t.wiki.saved || "Saved"} {lastSaved.toLocaleTimeString()}
                        </span>
                    )}
                    {isSaving && <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Saving...</span>}
                    <button onClick={handleDelete} className="btn btn-secondary" style={{ backgroundColor: "var(--accent-red)" }}>
                        🗑️ {t.wiki.delete || "Delete"}
                    </button>
                </div>
            </div>

            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="input"
                style={{
                    minHeight: "500px",
                    fontFamily: "inherit",
                    lineHeight: "1.6",
                    fontSize: "1rem",
                    resize: "vertical",
                    marginBottom: "2rem"
                }}
                placeholder={t.wiki.contentPlaceholder || "Start writing... Use [[Page Name]] to link to other pages."}
            />

            {/* Related pages from database */}
            {relatedPages.length > 0 && (
                <div className="card" style={{ padding: "1.5rem", backgroundColor: "var(--bg-secondary)" }}>
                    <h3 style={{ margin: 0, marginBottom: "1rem", fontSize: "1.1rem" }}>
                        🔗 {t.wiki.relatedPages || "Related Pages"}
                    </h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {relatedPages.map(page => (
                            <div
                                key={page.id}
                                className="card"
                                style={{
                                    padding: "1rem",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    backgroundColor: "var(--card-bg)"
                                }}
                            >
                                <Link
                                    href={`/campaigns/${campaignId}/wiki/${page.id}`}
                                    style={{
                                        flex: 1,
                                        textDecoration: "none",
                                        color: "var(--text-color)",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.5rem"
                                    }}
                                >
                                    <span style={{ fontSize: "1.2rem" }}>{page.icon}</span>
                                    <div>
                                        <div style={{ fontWeight: "500" }}>{page.title}</div>
                                        {page.content && (
                                            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                                                {page.content.substring(0, 100)}...
                                            </div>
                                        )}
                                    </div>
                                </Link>
                                <button
                                    onClick={() => insertLink(page.title)}
                                    className="btn btn-secondary"
                                    style={{ fontSize: "0.85rem", marginLeft: "1rem" }}
                                    title="Insert link"
                                >
                                    + Add Link
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
