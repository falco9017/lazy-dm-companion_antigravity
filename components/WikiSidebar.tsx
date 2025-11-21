"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface WikiEntry {
    id: string;
    title: string;
    icon: string;
    content: string | null;
    children?: WikiEntry[];
    isExpanded?: boolean;
}

export default function WikiSidebar({
    entries,
    campaignId,
    currentEntryId,
    t
}: {
    entries: WikiEntry[];
    campaignId: string;
    currentEntryId?: string;
    t: any;
}) {
    const [expanded, setExpanded] = useState<Set<string>>(new Set(entries.filter(e => e.isExpanded).map(e => e.id)));
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expanded);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpanded(newExpanded);
    };

    const createNewPage = async (parentId?: string) => {
        const title = prompt(t.wiki.newPageTitle || "New Page Title:");
        if (!title) return;

        try {
            const res = await fetch(`/api/campaigns/${campaignId}/wiki`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, parentId })
            });

            if (res.ok) {
                const newPage = await res.json();
                router.push(`/campaigns/${campaignId}/wiki/${newPage.id}`);
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to create page:", error);
        }
    };

    // Flatten tree for search
    const flattenEntries = (entries: WikiEntry[]): WikiEntry[] => {
        let flat: WikiEntry[] = [];
        entries.forEach(entry => {
            flat.push(entry);
            if (entry.children) {
                flat = flat.concat(flattenEntries(entry.children));
            }
        });
        return flat;
    };

    const filteredEntries = useMemo(() => {
        if (!searchQuery.trim()) return entries;

        const query = searchQuery.toLowerCase();
        const allEntries = flattenEntries(entries);

        return allEntries.filter(entry =>
            entry.title.toLowerCase().includes(query) ||
            (entry.content && entry.content.toLowerCase().includes(query))
        );
    }, [entries, searchQuery]);

    const renderEntry = (entry: WikiEntry, level: number = 0, isSearchResult = false) => {
        const hasChildren = entry.children && entry.children.length > 0;
        const isExpanded = expanded.has(entry.id);
        const isActive = entry.id === currentEntryId;

        return (
            <div key={entry.id} style={{ marginLeft: isSearchResult ? 0 : `${level * 1.5}rem` }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "0.5rem 0.75rem",
                        backgroundColor: isActive ? "var(--card-bg)" : "transparent",
                        borderRadius: "var(--radius-sm)",
                        marginBottom: "0.25rem",
                        cursor: "pointer",
                        transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
                    }}
                    onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                >
                    {hasChildren && !isSearchResult && (
                        <button
                            onClick={() => toggleExpand(entry.id)}
                            style={{
                                background: "none",
                                border: "none",
                                color: "var(--text-secondary)",
                                cursor: "pointer",
                                marginRight: "0.5rem",
                                fontSize: "0.8rem"
                            }}
                        >
                            {isExpanded ? "▼" : "▶"}
                        </button>
                    )}
                    <Link
                        href={`/campaigns/${campaignId}/wiki/${entry.id}`}
                        style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            textDecoration: "none",
                            color: isActive ? "var(--primary-color)" : "var(--text-color)"
                        }}
                    >
                        <span style={{ marginRight: "0.5rem" }}>{entry.icon}</span>
                        <span style={{ fontSize: "0.9rem" }}>{entry.title}</span>
                    </Link>
                    {!isSearchResult && (
                        <button
                            onClick={() => createNewPage(entry.id)}
                            style={{
                                background: "none",
                                border: "none",
                                color: "var(--text-secondary)",
                                cursor: "pointer",
                                fontSize: "1rem",
                                opacity: 0.5
                            }}
                            title="Add sub-page"
                        >
                            +
                        </button>
                    )}
                </div>
                {hasChildren && isExpanded && !isSearchResult && entry.children!.map(child => renderEntry(child, level + 1))}
            </div>
        );
    };

    return (
        <div style={{ width: "280px", height: "100vh", backgroundColor: "var(--bg-secondary)", borderRight: "1px solid var(--border-color)", padding: "1rem", position: "fixed", overflowY: "auto" }}>
            <div style={{ marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <Link href={`/campaigns/${campaignId}`} style={{ color: "var(--text-secondary)", fontSize: "0.9rem", textDecoration: "none" }}>
                    ← {t.common.back}
                </Link>
                <h2 style={{ fontSize: "1.2rem", margin: 0 }}>{t.wiki.title}</h2>
            </div>

            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input"
                placeholder={t.wiki.searchPlaceholder || "Search wiki..."}
                style={{ width: "100%", marginBottom: "1rem", fontSize: "0.85rem" }}
            />

            <button
                onClick={() => createNewPage()}
                className="btn btn-primary"
                style={{ width: "100%", marginBottom: "1rem", fontSize: "0.9rem" }}
            >
                + {t.wiki.newPage}
            </button>

            <div>
                {searchQuery.trim() ? (
                    filteredEntries.length > 0 ? (
                        filteredEntries.map(entry => renderEntry(entry, 0, true))
                    ) : (
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", textAlign: "center", padding: "1rem" }}>
                            No pages found
                        </p>
                    )
                ) : (
                    entries.map(entry => renderEntry(entry))
                )}
            </div>
        </div>
    );
}
