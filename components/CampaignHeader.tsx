"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CampaignHeader({
    campaign,
    t
}: {
    campaign: { id: string; title: string; description: string | null };
    t: any;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(campaign.title);
    const [description, setDescription] = useState(campaign.description || "");
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/campaigns/${campaign.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description })
            });

            if (res.ok) {
                setIsEditing(false);
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to update campaign:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(t.campaign.confirmDelete || "Delete this campaign and all its data?")) {
            return;
        }

        try {
            const res = await fetch(`/api/campaigns/${campaign.id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                router.push("/dashboard");
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to delete campaign:", error);
        }
    };

    if (isEditing) {
        return (
            <div style={{ marginBottom: "2rem" }}>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input"
                    style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem", width: "100%" }}
                    placeholder="Campaign Title"
                />
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input"
                    style={{ minHeight: "100px", marginBottom: "1rem", width: "100%" }}
                    placeholder="Campaign Description"
                />
                <div style={{ display: "flex", gap: "1rem" }}>
                    <button onClick={handleSave} className="btn btn-primary" disabled={isSaving}>
                        {isSaving ? t.common.saving : t.common.save}
                    </button>
                    <button onClick={() => setIsEditing(false)} className="btn btn-secondary">
                        {t.common.cancel}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div style={{ flex: 1 }}>
                    <h1>{campaign.title}</h1>
                    {campaign.description && (
                        <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                            {campaign.description}
                        </p>
                    )}
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => setIsEditing(true)} className="btn btn-secondary">
                        ✏️ {t.common.edit}
                    </button>
                    <button onClick={handleDelete} className="btn btn-secondary" style={{ backgroundColor: "var(--accent-red)" }}>
                        🗑️ {t.common.delete}
                    </button>
                </div>
            </div>
        </div>
    );
}
